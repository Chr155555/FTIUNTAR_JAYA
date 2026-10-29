import { createServerSupabase } from '@/lib/supabase/server';
import { AdminContent } from '@/components/admin/AdminContent';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createServerSupabase();

  // Run user auth, reports, and profiles concurrently in parallel (eliminates waterfall)
  const [userRes, reportsRes, profilesRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  const user = userRes.data?.user;
  const initialProfiles = profilesRes.data || [];

  let userRole = 'guest';
  if (user) {
    const userProfile = initialProfiles.find((p) => p.id === user.id);
    userRole =
      userProfile?.role ||
      user.user_metadata?.role ||
      (user.email === 'admin@suarawarga.id' ? 'admin' : 'user');
  }

  return (
    <AdminContent
      initialReports={reportsRes.data || []}
      initialProfiles={initialProfiles}
      currentUser={user}
      userRole={userRole}
    />
  );
}
