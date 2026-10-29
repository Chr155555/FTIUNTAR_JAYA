import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();

    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('ticket_number', id)
      .single();

    if (error || !report) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    const [timelinesRes, commentsRes] = await Promise.all([
      supabase.from('report_timelines').select('*').eq('report_id', report.id).order('timestamp'),
      supabase.from('comments').select('*').eq('report_id', report.id).order('created_at'),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        timelines: timelinesRes.data || [],
        comments: commentsRes.data || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
