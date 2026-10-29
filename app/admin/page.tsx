import { createServerSupabase } from '@/lib/supabase/server';
import { AdminContent } from '@/components/admin/AdminContent';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = 'guest';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    userRole = profile?.role || user.user_metadata?.role || (user.email === 'admin@suarawarga.id' ? 'admin' : 'user');
  }

  const [reportsRes, profilesRes] = await Promise.all([
    supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  return (
    <AdminContent
      initialReports={reportsRes.data || []}
      initialProfiles={profilesRes.data || []}
      currentUser={user}
      userRole={userRole}
    />
  );
}
