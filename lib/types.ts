// ==========================================
// Database Types — mirrors Supabase tables
// ==========================================

export type ReportStatus = 'Menunggu' | 'On-Process' | 'Selesai' | 'Ditolak';

export interface Profile {
  id: string;
  name: string;
  email: string | null;
  city: string;
  role: 'CITIZEN' | 'GOV_ADMIN' | 'SUPER_ADMIN';
  points: number;
  badge: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  agency: string;
  before_image_url: string;
  after_image_url: string | null;
  reject_reason: string | null;
  is_anonymous: boolean;
  upvote_count: number;
  is_top_upvoted: boolean;
  satisfaction_score: number;
  reporter_id: string | null;
  reporter_name: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ReportTimeline {
  id: string;
  report_id: string;
  step_title: string;
  description: string;
  is_done: boolean;
  timestamp: string;
}

export interface Upvote {
  id: string;
  report_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  report_id: string;
  user_id: string | null;
  user_name: string;
  user_role: string;
  content: string;
  is_official: boolean;
  created_at: string;
}

export interface SatisfactionAudit {
  id: string;
  report_id: string;
  user_id: string;
  is_satisfied: boolean;
  rating: number;
  created_at: string;
}

export interface PublicNotice {
  id: string;
  city: string;
  title: string;
  impact: string;
  agency: string;
  status: string;
  is_active: boolean;
  created_at: string;
}

export interface CityRanking {
  rank: number;
  city: string;
  province: string;
  score: number;
  resolved_rate: number;
  avg_response: string;
  total_reports: number;
  badge: string;
}

export interface Notification {
  id: string;
  user_id: string;
  report_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
