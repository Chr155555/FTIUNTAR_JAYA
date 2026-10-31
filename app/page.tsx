import { createServerSupabase } from '@/lib/supabase/server';
import { JABODETABEK_CITY_RANKINGS } from '@/lib/constants';
import { HomeContent } from '@/components/home/HomeContent';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createServerSupabase();

  const [reportsRes, noticesRes] = await Promise.all([
    supabase
      .from('reports')
      .select('*')
      .order('is_top_upvoted', { ascending: false })
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('public_notices')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const reports = reportsRes.data || [];
  const notices = noticesRes.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <HomeContent
        initialReports={reports}
        notices={notices}
        cityRankings={JABODETABEK_CITY_RANKINGS}
      />
    </div>
  );
}
