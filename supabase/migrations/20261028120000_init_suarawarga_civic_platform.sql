-- SuaraWarga Jabodetabek Civic Reporting Platform
-- Initial Database Migration Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT DEFAULT 'Jakarta Barat',
  role TEXT DEFAULT 'warga',
  avatar_url TEXT,
  reputation_score INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  status TEXT DEFAULT 'Menunggu',
  upvote_count INT DEFAULT 0,
  is_top_upvoted BOOLEAN DEFAULT false,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_name TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  agency TEXT NOT NULL,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT,
  reject_reason TEXT,
  fyp_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 3. Report Timelines Table
CREATE TABLE IF NOT EXISTS public.report_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  step_title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_done BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- 4. Upvotes Table
CREATE TABLE IF NOT EXISTS public.upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(report_id, user_id)
);

-- 5. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_role TEXT DEFAULT 'Warga Terverifikasi',
  content TEXT NOT NULL,
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Satisfaction Audits Table
CREATE TABLE IF NOT EXISTS public.satisfaction_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  is_satisfied BOOLEAN NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. KPI Penalties Table
CREATE TABLE IF NOT EXISTS public.kpi_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  agency TEXT NOT NULL,
  reason TEXT NOT NULL,
  penalty_points NUMERIC DEFAULT 1.5,
  reported_by TEXT DEFAULT 'Warga',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Public Notices Table
CREATE TABLE IF NOT EXISTS public.public_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  title TEXT NOT NULL,
  impact TEXT NOT NULL,
  agency TEXT NOT NULL,
  status TEXT DEFAULT 'Aktif Dikerjakan',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
