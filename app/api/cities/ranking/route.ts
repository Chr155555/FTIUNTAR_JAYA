import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { computeLiveCityRankings } from '@/lib/constants';

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const [reportsRes, penaltiesRes] = await Promise.all([
      supabase.from('reports').select('city, status, satisfaction_score, created_at, resolved_at'),
      supabase.from('kpi_penalties').select('*'),
    ]);

    const reports = reportsRes.data || [];
    const penalties = penaltiesRes.data || [];

    const rankings = computeLiveCityRankings(reports, penalties);
    return NextResponse.json({ success: true, data: rankings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
