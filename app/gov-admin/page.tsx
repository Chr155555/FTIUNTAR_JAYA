import { createServerSupabase } from '@/lib/supabase/server';
import { GovAdminContent } from '@/components/gov/GovAdminContent';

export const dynamic = 'force-dynamic';

export default async function GovAdminPage() {
  const supabase = await createServerSupabase();

  // Run user authentication and reports query concurrently in parallel (eliminates waterfall)
  const [userRes, reportsRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  const user = userRes.data?.user;
  let userRole = 'guest';
  let agency = 'Dinas Terkait';

  if (user) {
    userRole =
      user.user_metadata?.role ||
      (user.email === 'admin@suarawarga.id' ? 'admin' : user.email?.includes('pemda') || user.email?.endsWith('.go.id') ? 'government' : 'user');
    agency = user.user_metadata?.agency || 'Dinas Pemda';

    // If role or agency is not yet present in metadata, check profiles
    if (!user.user_metadata?.role || !user.user_metadata?.agency) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, agency')
        .eq('id', user.id)
        .single();

      if (profile) {
        userRole = profile.role || userRole;
        agency = profile.agency || agency;
      }
    }
  }

  const reports = reportsRes.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <GovAdminContent
        reports={reports}
        currentUser={user}
        userRole={userRole}
        userAgency={agency}
      />
    </div>
  );
}
