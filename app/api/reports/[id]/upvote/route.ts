import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();

    const { data: report } = await supabase
      .from('reports')
      .select('id, upvote_count')
      .eq('ticket_number', id)
      .single();

    if (!report) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    const newCount = report.upvote_count + 1;
    const isTopUpvoted = newCount >= 150;

    const { data: updated } = await supabase
      .from('reports')
      .update({ upvote_count: newCount, is_top_upvoted: isTopUpvoted })
      .eq('id', report.id)
      .select()
      .single();

    return NextResponse.json({
      success: true,
      upvote_count: updated?.upvote_count,
      is_top_upvoted: updated?.is_top_upvoted,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
