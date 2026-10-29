import { createServerSupabase } from '@/lib/supabase/server';
import { GovAdminContent } from '@/components/gov/GovAdminContent';

export const dynamic = 'force-dynamic';

export default async function GovAdminPage() {
  const supabase = await createServerSupabase();
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <GovAdminContent reports={reports || []} />
    </div>
  );
}
