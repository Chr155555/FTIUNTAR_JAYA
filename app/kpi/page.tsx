import { createServerSupabase } from '@/lib/supabase/server';
import { computeLiveCityRankings } from '@/lib/constants';
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

  // Compute live rankings unified across Jabodetabek
  const liveRankings = computeLiveCityRankings(reports, penalties);

  return (
    <KpiContent
      initialRankings={liveRankings}
      totalReports={reports.length}
      totalPenalties={penalties.length}
    />
  );
}
