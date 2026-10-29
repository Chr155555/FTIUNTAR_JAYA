import { createServerSupabase } from '@/lib/supabase/server';
import { GovAdminContent } from '@/components/gov/GovAdminContent';

export const dynamic = 'force-dynamic';

export default async function GovAdminPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = 'guest';
  let agency = 'Dinas Terkait';

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, agency')
      .eq('id', user.id)
      .single();

    userRole = profile?.role || user.user_metadata?.role || (user.email?.includes('pemda') ? 'government' : 'user');
    agency = profile?.agency || user.user_metadata?.agency || 'Dinas Pemda';
  }

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <GovAdminContent
        reports={reports || []}
        currentUser={user}
        userRole={userRole}
        userAgency={agency}
      />
    </div>
  );
}
