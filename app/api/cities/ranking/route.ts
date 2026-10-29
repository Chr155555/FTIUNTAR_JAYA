import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const { data: reports } = await supabase
      .from('reports')
      .select('city, status, satisfaction_score, created_at, resolved_at');

    if (!reports) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Group by city and calculate metrics
    const cityMap = new Map<string, { total: number; resolved: number; avgScore: number; scores: number[] }>();

    for (const r of reports) {
      const entry = cityMap.get(r.city) || { total: 0, resolved: 0, avgScore: 0, scores: [] };
      entry.total++;
      if (r.status === 'Selesai') entry.resolved++;
      if (r.satisfaction_score > 0) entry.scores.push(r.satisfaction_score);
      cityMap.set(r.city, entry);
    }

    const rankings = Array.from(cityMap.entries())
      .map(([city, data]) => ({
        city,
        total_reports: data.total,
        resolved_rate: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0,
        avg_satisfaction: data.scores.length > 0
          ? +(data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
          : 0,
      }))
      .sort((a, b) => b.resolved_rate - a.resolved_rate);

    return NextResponse.json({ success: true, data: rankings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
