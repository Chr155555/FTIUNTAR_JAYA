import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.agency) updateData.agency = body.agency;
    if (body.after_image_url) updateData.after_image_url = body.after_image_url;
    if (body.status === 'Ditolak') updateData.reject_reason = body.reject_reason;
    if (body.status === 'Selesai') updateData.resolved_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create notification
    await supabase.from('notifications').insert({
      user_id: updated.reporter_id || 'guest',
      report_id: updated.id,
      title: `Update #${updated.ticket_number}: ${body.status}`,
      message: body.status === 'Ditolak'
        ? `Ditolak: ${body.reject_reason}`
        : body.field_note || `Status diperbarui oleh ${body.agency}.`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
