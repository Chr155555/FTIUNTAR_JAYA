import { createServerSupabase } from '@/lib/supabase/server';
import { ProfileContent } from '@/components/profile/ProfileContent';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createServerSupabase();

  const [reportsRes, notificationsRes] = await Promise.all([
    supabase.from('reports').select('*').order('created_at', { ascending: false }),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      <ProfileContent
        reports={reportsRes.data || []}
        notifications={notificationsRes.data || []}
      />
    </div>
  );
}
