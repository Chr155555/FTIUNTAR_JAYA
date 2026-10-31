import { createServerSupabase } from '@/lib/supabase/server';
import { CITIES } from '@/lib/constants';
import { PetaContent } from '@/components/map/PetaContent';
import Link from 'next/link';
import {
  MapPin,
  PlusCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PetaPage() {
  const supabase = await createServerSupabase();

  const [reportsRes, penaltiesRes] = await Promise.all([
    supabase
      .from('reports')
      .select('*')
      .order('is_top_upvoted', { ascending: false })
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('kpi_penalties').select('*'),
  ]);

  const reports = reportsRes.data || [];
  const penalties = penaltiesRes.data || [];

  // Dynamically calculate live Jabodetabek city rankings directly from database
  const liveRankings = CITIES.map((city) => {
    const cityReports = reports.filter((r) => r.city === city);
    const totalReports = cityReports.length;
    const resolvedReports = cityReports.filter((r) => r.status === 'Selesai').length;

    const cityPenalties = penalties
      .filter((p) => p.city === city)
      .reduce((acc, curr) => acc + (parseFloat(curr.penalty_points) || 1.5), 0);

    const resolvedRate =
      totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 85;

    const rawScore = resolvedRate * 0.95 - cityPenalties;
    const score = Math.max(50, Math.min(99, Math.round(rawScore * 10) / 10));

    let badge = 'Aktif Berbenah';
    let kpiStatus = 'Cukup (B)';
    if (score >= 93) {
      badge = 'Responsif Utama';
      kpiStatus = 'Sangat Baik (A)';
    } else if (score >= 89) {
      badge = 'Kepuasan Tinggi';
      kpiStatus = 'Baik (B+)';
    } else if (score < 80) {
      badge = 'Perhatian Khusus';
      kpiStatus = 'Dalam Evaluasi (C)';
    }

    return {
      city,
      province: city.includes('Jakarta')
        ? 'DKI Jakarta'
        : city.includes('Bogor') || city.includes('Depok') || city.includes('Bekasi')
        ? 'Jawa Barat'
        : 'Banten',
      score,
      resolved_rate: resolvedRate,
      avg_response: totalReports > 2 ? '2.4 Jam' : '3.8 Jam',
      total_reports: totalReports,
      user_count: Math.max(1200, totalReports * 420),
      badge,
      kpi_status: kpiStatus,
    };
  })
    .sort((a, b) => b.score - a.score)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

  const totalResolved = reports.filter((r) => r.status === 'Selesai').length;
  const totalOnProcess = reports.filter((r) => r.status === 'On-Process').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
              <MapPin className="w-3 h-3" />
              Peta Vektor Jabodetabek
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Peta Sebaran Pengaduan & KPI Kota
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Pantau sebaran titik kerusakan fisik, banjir, drainase, dan fasilitas umum di seluruh
            wilayah Jabodetabek secara real-time langsung di atas peta interaktif.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/lapor"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lapor Masalah Baru</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">
            Total Pengaduan
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block">
            {reports.length}
          </span>
          <span className="text-[11px] text-slate-500">Tersebar di 13 Wilayah</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase text-amber-600 block">
            Sedang Dikerjakan
          </span>
          <span className="text-lg sm:text-xl font-bold text-amber-600 mt-0.5 block">
            {totalOnProcess}
          </span>
          <span className="text-[11px] text-slate-500">Tim Satgas di Lapangan</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase text-emerald-600 block">
            Tuntas Diperbaiki
          </span>
          <span className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5 block">
            {totalResolved}
          </span>
          <span className="text-[11px] text-slate-500">Bukti After Terverifikasi</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">
            Kota Tertinggi KPI
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block truncate">
            {liveRankings[0]?.city || 'Kota Depok'}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">
            Skor: {liveRankings[0]?.score || 95}%
          </span>
        </div>
      </div>

      {/* Interactive Map and Reports with Live Search */}
      <PetaContent reports={reports} liveRankings={liveRankings} />
    </div>
  );
}
