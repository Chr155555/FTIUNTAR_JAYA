import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const body = await req.json();

    const { data: report } = await supabase
      .from('reports')
      .select('id')
      .eq('ticket_number', id)
      .single();

    if (!report) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    await supabase.from('satisfaction_audits').insert({
      report_id: report.id,
      user_id: body.user_id || 'guest',
      is_satisfied: body.is_satisfied,
      rating: body.rating || 5,
    });

    // Recalculate avg satisfaction
    const { data: stats } = await supabase
      .from('satisfaction_audits')
      .select('rating')
      .eq('report_id', report.id);

    if (stats && stats.length > 0) {
      const avg = stats.reduce((sum, s) => sum + s.rating, 0) / stats.length;
      await supabase.from('reports').update({ satisfaction_score: avg }).eq('id', report.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
