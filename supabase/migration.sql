-- ==========================================
-- SuaraWarga — Supabase Database Schema
-- ==========================================

create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. CREATE TABLES FIRST
-- ==========================================
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  ticket_number text unique not null,
  title text not null,
  description text not null,
  category text not null,
  city text not null,
  address text not null,
  latitude double precision not null default 0,
  longitude double precision not null default 0,
  status text not null default 'Menunggu',
  agency text not null,
  before_image_url text not null,
  after_image_url text,
  reject_reason text,
  is_anonymous boolean not null default false,
  reporter_id uuid,
  reporter_name text,
  upvote_count integer not null default 0,
  is_top_upvoted boolean not null default false,
  satisfaction_score double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_reports_city_status on public.reports (city, status);
create index if not exists idx_reports_category on public.reports (category);
create index if not exists idx_reports_upvote on public.reports (upvote_count desc);

create table if not exists public.report_timelines (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports(id) on delete cascade,
  step_title text not null,
  description text not null,
  is_done boolean not null default false,
  timestamp timestamptz not null default now()
);

create index if not exists idx_timelines_report on public.report_timelines (report_id);

create table if not exists public.upvotes (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  unique(report_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id text,
  user_name text not null default 'Warga',
  user_role text not null default 'Warga Terverifikasi',
  content text not null,
  is_official boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_report on public.comments (report_id);

create table if not exists public.satisfaction_audits (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id text not null,
  is_satisfied boolean not null,
  rating integer not null default 5,
  created_at timestamptz not null default now(),
  unique(report_id, user_id)
);

create table if not exists public.public_notices (
  id uuid primary key default uuid_generate_v4(),
  city text not null,
  title text not null,
  impact text not null,
  agency text not null,
  status text not null default 'Aktif Dikerjakan',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  report_id uuid references public.reports(id) on delete set null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 2. ROW LEVEL SECURITY & POLICIES
-- ==========================================
alter table public.reports enable row level security;
alter table public.report_timelines enable row level security;
alter table public.upvotes enable row level security;
alter table public.comments enable row level security;
alter table public.satisfaction_audits enable row level security;
alter table public.public_notices enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Allow all on reports" on public.reports;
drop policy if exists "Allow all on report_timelines" on public.report_timelines;
drop policy if exists "Allow all on upvotes" on public.upvotes;
drop policy if exists "Allow all on comments" on public.comments;
drop policy if exists "Allow all on satisfaction_audits" on public.satisfaction_audits;
drop policy if exists "Allow all on public_notices" on public.public_notices;
drop policy if exists "Allow all on notifications" on public.notifications;

create policy "Allow all on reports" on public.reports for all using (true) with check (true);
create policy "Allow all on report_timelines" on public.report_timelines for all using (true) with check (true);
create policy "Allow all on upvotes" on public.upvotes for all using (true) with check (true);
create policy "Allow all on comments" on public.comments for all using (true) with check (true);
create policy "Allow all on satisfaction_audits" on public.satisfaction_audits for all using (true) with check (true);
create policy "Allow all on public_notices" on public.public_notices for all using (true) with check (true);
create policy "Allow all on notifications" on public.notifications for all using (true) with check (true);

-- ==========================================
-- 3. SEED DATA
-- ==========================================
truncate table public.comments, public.satisfaction_audits, public.upvotes, public.report_timelines, public.reports, public.public_notices, public.notifications cascade;

-- Public Notices
insert into public.public_notices (city, title, impact, agency, status) values
  ('Jakarta Barat', 'Perbaikan Saluran Air & Gorong-gorong Jl. Daan Mogot KM 12', 'Penyempitan lajur kiri arah Cengkareng (28 Okt - 2 Nov)', 'Dinas SDA DKI Jakarta', 'Aktif Dikerjakan'),
  ('Surabaya', 'Pengaspalan Ulang & Perbaikan Marka Jl. Ahmad Yani', 'Pekerjaan malam hari pukul 22.00 - 04.00 WIB', 'Dinas Sumber Daya Air & Bina Marga', 'Terjadwal'),
  ('Bandung', 'Pemeliharaan Lampu PJU & Pemangkasan Pohon Rawan Tumbang Jl. Dago', 'Arus lalu lintas normal dengan pengawalan petugas', 'Dishub Kota Bandung', 'Aktif Dikerjakan');

-- Reports
insert into public.reports (ticket_number, title, description, category, city, address, latitude, longitude, status, agency, before_image_url, after_image_url, is_anonymous, reporter_name, upvote_count, is_top_upvoted, satisfaction_score) values
  ('LAP-2026-8821', 'Lubang Jalan Cukup Dalam & Membahayakan Pengendara Motor di Grogol', 'Terdapat lubang berdiameter sekitar 60cm dengan kedalaman hampir 15cm tepat di lajur tengah dekat halte busway Grogol. Saat hujan tertutup genangan sehingga sangat rawan membuat pengendara roda dua terjatuh.', 'Jalan Rusak', 'Jakarta Barat', 'Jl. Kyai Tapa No. 45, Grogol Petamburan, Jakarta Barat', -6.1668, 106.7903, 'On-Process', 'Dinas Bina Marga', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1584463699037-d0262272626c?auto=format&fit=crop&w=900&q=80', false, 'Budi Santoso', 248, true, 4.7),
  ('LAP-2026-8819', 'Saluran Drainase Tersumbat Sampah Menyebabkan Genangan Saat Hujan', 'Tumpukan sedimen lumpur dan sampah plastik menyumbat mulut gorong-gorong di depan pertokoan Dharmawangsa. Sudah dibersihkan oleh petugas dengan truk penyedot lumpur.', 'Banjir & Drainase', 'Surabaya', 'Jl. Dharmawangsa No. 88, Gubeng, Surabaya', -7.2654, 112.7612, 'Selesai', 'Dinas Sumber Daya Air & Bina Marga', 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80', true, 'Warga Anonim #409', 192, true, 4.9),
  ('LAP-2026-8815', 'Lampu Penerangan Jalan Umum (PJU) Padam 4 Tiang Berderet', 'Empat tiang lampu jalan padam total sejak malam Minggu. Kondisi jalan menanjak dan menikung sehingga sangat gelap pada malam hari.', 'Lampu Jalan (PJU)', 'Bandung', 'Jl. Setiabudi Atas No. 112, Sukasari, Bandung', -6.8664, 107.5945, 'On-Process', 'Dinas Perhubungan (PJU)', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80', false, 'Dinda Permata', 84, false, 4.2),
  ('LAP-2026-8802', 'Tumpukan Sampah Liar di Pinggir Trotoar Dekat Pasar Tradisional', 'Banyak warga membuang kantong sampah di luar jam angkut di atas trotoar pejalan kaki. Mohon diangkut dan dipasang spanduk larangan serta tempat sampah terpilah.', 'Sampah & Kebersihan', 'Semarang', 'Jl. Majapahit KM 5, Pedurungan, Semarang', -7.0051, 110.4682, 'Menunggu', 'Dinas Lingkungan Hidup', 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1562077772-3bd90403f7f0?auto=format&fit=crop&w=900&q=80', false, 'Agus Pratama', 45, false, 0);

-- Timeline entries
insert into public.report_timelines (report_id, step_title, description, is_done, timestamp)
select r.id, vals.step_title, vals.description, vals.is_done, vals.ts::timestamptz
from public.reports r
cross join (values
  ('Laporan Diterima', 'Laporan berhasil masuk ke sistem dan lolos filter komunitas.', true, '2026-10-28 08:30:00+07'),
  ('Verifikasi & Disposisi', 'Diverifikasi oleh Admin Gov dan diteruskan ke Satgas Bina Marga Jakbar.', true, '2026-10-28 09:15:00+07'),
  ('Sedang Dikerjakan (On-Process)', 'Tim Pasukan Kuning sudah di lokasi melakukan penambalan cold-mix sementara.', true, '2026-10-28 11:20:00+07'),
  ('Selesai & Audit Warga', 'Menunggu unggahan bukti pengaspalan permanen.', false, '2026-10-28 12:00:00+07')
) as vals(step_title, description, is_done, ts)
where r.ticket_number = 'LAP-2026-8821';

insert into public.report_timelines (report_id, step_title, description, is_done, timestamp)
select r.id, vals.step_title, vals.description, vals.is_done, vals.ts::timestamptz
from public.reports r
cross join (values
  ('Laporan Diterima', 'Laporan diterima oleh sistem.', true, '2026-10-27 14:15:00+07'),
  ('Verifikasi & Disposisi', 'Diteruskan ke Rayon Gubeng Dinas SDABM Surabaya.', true, '2026-10-27 14:40:00+07'),
  ('Sedang Dikerjakan (On-Process)', 'Pengerukan sedimen lumpur sepanjang 25 meter.', true, '2026-10-27 16:00:00+07'),
  ('Selesai & Audit Warga', 'Saluran sudah lancar kembali. Bukti foto After telah diunggah.', true, '2026-10-28 07:30:00+07')
) as vals(step_title, description, is_done, ts)
where r.ticket_number = 'LAP-2026-8819';

insert into public.report_timelines (report_id, step_title, description, is_done, timestamp)
select r.id, vals.step_title, vals.description, vals.is_done, vals.ts::timestamptz
from public.reports r
cross join (values
  ('Laporan Diterima', 'Laporan diterima.', true, '2026-10-26 20:10:00+07'),
  ('Verifikasi & Disposisi', 'Disposisi ke UPT PJU Dishub Bandung.', true, '2026-10-27 08:00:00+07'),
  ('Sedang Dikerjakan (On-Process)', 'Mobil tangga hidrolik sedang melakukan penggantian modul.', true, '2026-10-28 10:00:00+07'),
  ('Selesai & Audit Warga', 'Akan diverifikasi malam hari.', false, '2026-10-28 18:00:00+07')
) as vals(step_title, description, is_done, ts)
where r.ticket_number = 'LAP-2026-8815';

insert into public.report_timelines (report_id, step_title, description, is_done, timestamp)
select r.id, vals.step_title, vals.description, vals.is_done, vals.ts::timestamptz
from public.reports r
cross join (values
  ('Laporan Diterima', 'Laporan berhasil masuk antrean verifikasi.', true, '2026-10-28 09:45:00+07'),
  ('Verifikasi & Disposisi', 'Sedang diperiksa kelengkapan koordinat lokasi.', false, '2026-10-28 10:00:00+07'),
  ('Sedang Dikerjakan (On-Process)', 'Menunggu jadwal armada pengangkut.', false, '2026-10-28 10:00:00+07'),
  ('Selesai & Audit Warga', '-', false, '2026-10-28 10:00:00+07')
) as vals(step_title, description, is_done, ts)
where r.ticket_number = 'LAP-2026-8802';

-- Comments
insert into public.comments (report_id, user_name, user_role, content, is_official)
select r.id, vals.user_name, vals.user_role, vals.content, vals.is_official
from public.reports r
cross join (values
  ('Rina Wijaya', 'Warga Terverifikasi', 'Betul banget, tadi pagi hampir kena lubang ini. Terima kasih sudah lapor, semoga cepat rata kembali!', false),
  ('Satgas Bina Marga Jakbar', 'Instansi Resmi', 'Terima kasih laporannya Bapak/Ibu. Tim kami sudah memasang rambu kerucut oranye dan sedang proses penambalan.', true)
) as vals(user_name, user_role, content, is_official)
where r.ticket_number = 'LAP-2026-8821';

insert into public.comments (report_id, user_name, user_role, content, is_official)
select r.id, 'Hendra Kusuma', 'Warga Terverifikasi', 'Mantap gerak cepat sekali petugas Surabaya! Pagi ini sudah bersih total.', false
from public.reports r
where r.ticket_number = 'LAP-2026-8819';

-- Initial notification
insert into public.notifications (user_id, title, message, is_read)
values
  ('guest', 'Laporan #LAP-2026-8821 Sedang Dikerjakan', 'Satgas Bina Marga Jakarta Barat telah berada di lokasi Jl. Kyai Tapa.', false),
  ('guest', 'Laporan Anda Mencapai +200 Dukungan Warga!', 'Laporan Anda kini memiliki Badge "TOP UPVOTED" dan menjadi prioritas utama.', false),
  ('guest', 'Perbaikan Selesai pada Laporan yang Anda Dukung', 'Dinas SDABM Surabaya telah mengunggah foto bukti selesai (After).', true);
