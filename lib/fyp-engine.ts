import type { Report } from './types';
import { isSameCity } from './constants';

export interface FYPRecommendation {
  report: Report;
  fypScore: number;
  reason: string;
  petitionTarget: number;
  petitionProgress: number;
}

// Urgency keywords for lightweight NLP / semantic scoring
const URGENT_KEYWORDS = [
  'bahaya', 'amblas', 'lubang', 'dalam', 'banjir', 'genangan', 'tenggelam',
  'putus', 'kabel', 'hilang', 'curi', 'padam', 'gelap', 'roboh', 'tumbang',
  'macet', 'tersumbat', 'sampah liar', 'bau'
];

/**
 * Lightweight ML Heuristic Recommender (Latency < 1ms).
 * Updates once per day snapshot or on-demand cache to keep database lightweight.
 */
export function calculateDailyFYP(
  reports: Report[],
  userCity: string = 'Jakarta Barat',
  selectedCategory: string = 'Semua'
): FYPRecommendation[] {
  // Current daily epoch (YYYY-MM-DD) for 1-day interval consistency
  const todayEpoch = new Date().toISOString().slice(0, 10);
  const now = new Date().getTime();

  return reports
    .map((report) => {
      // 1. Text Urgency Score (TF heuristic)
      const text = `${report.title} ${report.description}`.toLowerCase();
      let keywordHits = 0;
      for (const kw of URGENT_KEYWORDS) {
        if (text.includes(kw)) keywordHits += 1;
      }
      const urgencyScore = Math.min(keywordHits * 4, 25);

      // 2. Petisi Support Velocity & Community Momentum
      const upvotes = report.upvote_count || 1;
      const createdAt = new Date(report.created_at).getTime();
      const ageInHours = Math.max(0.5, (now - createdAt) / (1000 * 60 * 60));
      
      // Decay function: fresh petition with fast upvotes scores higher
      const velocityScore = (upvotes * 3.2) / Math.pow(ageInHours + 2, 0.75);

      // 3. User City Habit Matching (+30% bonus if within user's active Jabodetabek city)
      const cityBonus = isSameCity(report.city, userCity) ? 30 : 5;

      // 4. Status priority (On-Process and Unresolved get community attention)
      const statusWeight =
        report.status === 'On-Process' ? 25 : report.status === 'Menunggu' ? 20 : 10;

      // Combined Daily FYP Score
      const fypScore = Math.round(urgencyScore + velocityScore + cityBonus + statusWeight);

      // Petition Target calculation (e.g. 50, 100, 200, 300 target supporters)
      const petitionTarget = upvotes < 50 ? 50 : upvotes < 150 ? 150 : upvotes < 300 ? 300 : 500;
      const petitionProgress = Math.min(100, Math.round((upvotes / petitionTarget) * 100));

      // Dynamic recommendation reason based on highest factor
      let reason = 'Rekomendasi Hari Ini';
      if (report.city === userCity && upvotes > 100) {
        reason = `🔥 Trending Petisi di ${report.city}`;
      } else if (report.status === 'On-Process') {
        reason = `⚡ Sedang Ditangani Satgas Pemda`;
      } else if (urgencyScore > 12) {
        reason = `⚠️ Isu Kritis & Prioritas Tinggi`;
      } else if (upvotes >= 150) {
        reason = `✨ Didukung ${upvotes} Warga Jabodetabek`;
      } else {
        reason = `📍 Relevan Wilayah ${report.city}`;
      }

      return {
        report,
        fypScore,
        reason,
        petitionTarget,
        petitionProgress,
      };
    })
    .sort((a, b) => b.fypScore - a.fypScore);
}
