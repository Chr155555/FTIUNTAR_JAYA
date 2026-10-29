import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

const AGENCY_ROUTING: Record<string, string> = {
  'Jalan Rusak': 'Dinas Bina Marga',
  'Banjir & Drainase': 'Dinas Sumber Daya Air (SDA)',
  'Lampu Jalan (PJU)': 'Dinas Perhubungan (Dishub)',
  'Sampah & Kebersihan': 'Dinas Lingkungan Hidup (DLH)',
  'Fasilitas Umum & Taman': 'Dinas Pertamanan & Hutan Kota',
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const q = searchParams.get('q');

    let query = supabase
      .from('reports')
      .select('*')
      .order('is_top_upvoted', { ascending: false })
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (city && city !== 'Semua') query = query.eq('city', city);
    if (category && category !== 'Semua') query = query.eq('category', category);
    if (status && status !== 'Semua') query = query.eq('status', status);
    if (q) query = query.or(`title.ilike.%${q}%,address.ilike.%${q}%,ticket_number.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const body = await req.json();

    const ticketNumber = `LAP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetAgency = AGENCY_ROUTING[body.category] || 'Dinas Pekerjaan Umum';

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        ticket_number: ticketNumber,
        title: body.title,
        description: body.description,
        category: body.category,
        city: body.city,
        address: body.address,
        latitude: body.latitude || 0,
        longitude: body.longitude || 0,
        before_image_url: body.before_image_url,
        is_anonymous: body.is_anonymous || false,
        agency: targetAgency,
        reporter_name: body.reporter_name || 'Warga',
        upvote_count: 1,
      })
      .select()
      .single();

    if (error) throw error;

    // Create timeline entries
    await supabase.from('report_timelines').insert([
      { report_id: report.id, step_title: 'Laporan Diterima', description: 'Laporan berhasil masuk ke sistem.', is_done: true },
      { report_id: report.id, step_title: 'Verifikasi & Disposisi', description: `Menunggu disposisi ke ${targetAgency}.`, is_done: false },
      { report_id: report.id, step_title: 'Sedang Dikerjakan (On-Process)', description: 'Menunggu jadwal tim teknis lapangan.', is_done: false },
      { report_id: report.id, step_title: 'Selesai & Audit Warga', description: 'Menunggu bukti foto After.', is_done: false },
    ]);

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
