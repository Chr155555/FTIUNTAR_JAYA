import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();

    // Verify session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Harap masuk terlebih dahulu' },
        { status: 401 }
      );
    }

    // Verify admin role in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin =
      profile?.role === 'admin' ||
      user.user_metadata?.role === 'admin' ||
      user.email === 'admin@suarawarga.id';

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Super Admin yang berhak menghapus laporan' },
        { status: 403 }
      );
    }

    // Delete associated timelines, comments, audits, upvotes, and report
    await supabase.from('report_timelines').delete().eq('report_id', id);
    await supabase.from('comments').delete().eq('report_id', id);
    await supabase.from('satisfaction_audits').delete().eq('report_id', id);
    await supabase.from('kpi_penalties').delete().eq('report_id', id);
    await supabase.from('upvotes').delete().eq('report_id', id);

    const { error } = await supabase.from('reports').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil dihapus secara permanen dari sistem.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
