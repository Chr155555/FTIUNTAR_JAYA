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

    const { data, error } = await supabase
      .from('comments')
      .insert({
        report_id: report.id,
        user_name: body.user_name || 'Warga',
        user_role: body.user_role || 'Warga Terverifikasi',
        content: body.content,
        is_official: body.is_official || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
