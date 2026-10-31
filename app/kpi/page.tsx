import { createServerSupabase } from '@/lib/supabase/server';
import { CITIES, JABODETABEK_CITY_RANKINGS } from '@/lib/constants';
import { KpiContent } from '@/components/kpi/KpiContent';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Indeks KPI Kota Jabodetabek - SuaraWarga',
  description: 'Peringkat dan efektivitas penanganan aduan infrastruktur di 7 kota Jabodetabek.',
};

export default async function KpiPage() {
  const supabase = await createServerSupabase();

  const [reportsRes, penaltiesRes] = await Promise.all([
    supabase.from('reports').select('id, city, status, created_at, resolved_at'),
    supabase.from('kpi_penalties').select('*'),
  ]);

  const reports = reportsRes.data || [];
  const penalties = penaltiesRes.data || [];

  // Compute live rankings based on database reports & penalties
  const liveRankings = JABODETABEK_CITY_RANKINGS.map((benchmark) => {
    const cityReports = reports.filter((r) => r.city === benchmark.city);
    const totalReports = cityReports.length;
    const resolvedReports = cityReports.filter((r) => r.status === 'Selesai').length;

    const cityPenalties = penalties
      .filter((p) => p.city === benchmark.city)
      .reduce((acc, curr) => acc + (parseFloat(curr.penalty_points) || 1.5), 0);

    // If city has database reports, adjust score
    const resolvedRate = totalReports > 0
      ? Math.round((resolvedReports / totalReports) * 100)
      : benchmark.resolved_rate;

    const penaltyDeduction = cityPenalties;
    const adjustedScore = Math.max(50, Math.min(99, +(benchmark.score - penaltyDeduction).toFixed(1)));

    return {
      ...benchmark,
      total_reports: benchmark.total_reports + totalReports,
      resolved_rate: resolvedRate,
      score: adjustedScore,
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <KpiContent
      initialRankings={liveRankings}
      totalReports={reports.length}
      totalPenalties={penalties.length}
    />
  );
}
