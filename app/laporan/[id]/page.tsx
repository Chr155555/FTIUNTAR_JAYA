import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ReportDetail } from '@/components/detail/ReportDetail';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('ticket_number', id)
    .single();

  if (!report) return notFound();

  const [timelinesRes, commentsRes] = await Promise.all([
    supabase
      .from('report_timelines')
      .select('*')
      .eq('report_id', report.id)
      .order('timestamp', { ascending: true }),
    supabase
      .from('comments')
      .select('*')
      .eq('report_id', report.id)
      .order('created_at', { ascending: true }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ReportDetail
        report={report}
        timelines={timelinesRes.data || []}
        comments={commentsRes.data || []}
      />
    </div>
  );
}
