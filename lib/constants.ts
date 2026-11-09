// ==========================================
// Kategori Multi-Sektor (dikelompokkan dalam kluster)
// ==========================================
export const CATEGORY_CLUSTERS = [
  {
    id: 'infrastruktur',
    label: 'Infrastruktur Fisik',
    categories: [
      { name: 'Jalan Rusak', agency: 'Dinas Bina Marga' },
      { name: 'Banjir & Drainase', agency: 'Dinas Sumber Daya Air (SDA) / PUPR' },
      { name: 'Lampu Jalan (PJU)', agency: 'Dinas Perhubungan (Dishub)' },
      { name: 'Sampah & Kebersihan', agency: 'Dinas Lingkungan Hidup (DLH)' },
      { name: 'Fasilitas Umum & Taman', agency: 'Dinas Pertamanan & Perkim' },
    ],
  },
  {
    id: 'kesehatan-sosial',
    label: 'Fasilitas Kesehatan/Sosial',
    categories: [
      { name: 'Puskesmas & Layanan Kesehatan', agency: 'Dinas Kesehatan' },
      { name: 'Sanitasi & Air Bersih', agency: 'Dinas Kesehatan & PDAM' },
      { name: 'Bantuan Sosial & Kesejahteraan', agency: 'Dinas Sosial' },
      { name: 'Sekolah & Fasilitas Pendidikan', agency: 'Dinas Pendidikan' },
    ],
  },
  {
    id: 'layanan-publik',
    label: 'Layanan Publik/Birokrasi',
    categories: [
      { name: 'Pelayanan Administrasi (KTP/KK)', agency: 'Dinas Dukcapil' },
      { name: 'Perizinan & Pungli', agency: 'Dinas Penanaman Modal & PTSP' },
      { name: 'Transportasi Umum', agency: 'Dinas Perhubungan (Dishub)' },
      { name: 'Keamanan & Ketertiban', agency: 'Satpol PP' },
    ],
  },
] as const;

export const CATEGORIES = CATEGORY_CLUSTERS.flatMap((c) => c.categories.map((x) => x.name));

// Category -> Agency auto-routing
export const AGENCY_ROUTING: Record<string, string> = Object.fromEntries(
  CATEGORY_CLUSTERS.flatMap((c) => c.categories.map((x) => [x.name, x.agency]))
);

export function getClusterOfCategory(category: string): string | null {
  const cl = CATEGORY_CLUSTERS.find((c) => c.categories.some((x) => x.name === category));
  return cl ? cl.id : null;
}

// ==========================================
// Tag Cepat
// ==========================================
export const QUICK_TAGS: { tag: string; category: string }[] = [
  { tag: 'JalanBerlubang', category: 'Jalan Rusak' },
  { tag: 'AspalAmblas', category: 'Jalan Rusak' },
  { tag: 'DrainaseMampet', category: 'Banjir & Drainase' },
  { tag: 'BanjirRob', category: 'Banjir & Drainase' },
  { tag: 'PJUMati', category: 'Lampu Jalan (PJU)' },
  { tag: 'SampahMenumpuk', category: 'Sampah & Kebersihan' },
  { tag: 'TamanRusak', category: 'Fasilitas Umum & Taman' },
  { tag: 'Puskesmas', category: 'Puskesmas & Layanan Kesehatan' },
  { tag: 'AntrianRS', category: 'Puskesmas & Layanan Kesehatan' },
  { tag: 'AirBersih', category: 'Sanitasi & Air Bersih' },
  { tag: 'BansosTidakTepat', category: 'Bantuan Sosial & Kesejahteraan' },
  { tag: 'SekolahRusak', category: 'Sekolah & Fasilitas Pendidikan' },
  { tag: 'KTPLambat', category: 'Pelayanan Administrasi (KTP/KK)' },
  { tag: 'Pungli', category: 'Perizinan & Pungli' },
  { tag: 'AngkotHalte', category: 'Transportasi Umum' },
  { tag: 'Premanisme', category: 'Keamanan & Ketertiban' },
];

/** Ekstrak hashtag (huruf kecil, tanpa #) dari teks. */
export function extractTags(text: string | null | undefined): string[] {
  if (!text) return [];
  return Array.from(text.matchAll(/#([\p{L}\p{N}_]+)/gu)).map((m) => m[1].toLowerCase());
}

/** Apakah laporan memiliki tag tertentu (di judul/deskripsi). */
export function reportHasTag(
  r: { title: string; description?: string | null },
  tag: string
): boolean {
  const t = tag.toLowerCase().replace(/^#/, '');
  return extractTags(`${r.title} ${r.description || ''}`).includes(t);
}

// ==========================================
// Aduan Serupa
// ==========================================
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const STOPWORDS = new Set(['yang', 'di', 'dan', 'ke', 'dari', 'ini', 'itu', 'untuk', 'dengan', 'sudah', 'sangat', 'jalan', 'dekat', 'depan']);

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

export interface SimilarCandidate {
  id: string;
  ticket_number: string;
  title: string;
  description?: string | null;
  category: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  upvote_count: number;
}

/** Cari aduan mirip: radius, kota, kategori, dan kemiripan teks. */
export function findSimilarReports<T extends SimilarCandidate>(
  candidates: T[],
  q: { lat: number; lng: number; city: string; category: string; text: string },
  radiusKm = 1,
  limit = 5
): (T & { distance: number; score: number })[] {
  const qt = tokenize(q.text);
  return candidates
    .filter((c) => c.status !== 'Selesai' && c.status !== 'Ditolak')
    .map((c) => {
      const distance = distanceKm(q.lat, q.lng, c.latitude, c.longitude);
      const ct = tokenize(`${c.title} ${c.address}`);
      let overlap = 0;
      qt.forEach((w) => ct.has(w) && overlap++);
      const textSim = qt.size ? overlap / qt.size : 0;
      const near = distance <= radiusKm;
      const sameCategory = c.category === q.category;
      const sameCity = isSameCity(c.city, q.city);
      let score = 0;
      if (near) score += 3 - distance / radiusKm; // 2..3
      else if (sameCity) score += 0.5;
      if (sameCategory) score += 2;
      score += textSim * 3;
      const relevant = (near && sameCategory) || (sameCity && sameCategory && textSim >= 0.3) || textSim >= 0.5 && sameCity;
      return { ...c, distance, score: relevant ? score : 0 };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
// Focused exclusively on JABODETABEK (Jakarta, Bogor, Depok, Tangerang, Bekasi)
export const CITIES = [
  'Jakarta Barat',
  'Jakarta Pusat',
  'Jakarta Selatan',
  'Jakarta Timur',
  'Jakarta Utara',
  'Kota Bogor',
  'Kota Depok',
  'Kota Tangerang',
  'Tangerang Selatan',
  'Kota Bekasi',
] as const;

export const JABODETABEK_COORDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'Jakarta Pusat': { lat: -6.1818, lng: 106.8227, zoom: 13 },
  'Jakarta Barat': { lat: -6.1668, lng: 106.7903, zoom: 13 },
  'Jakarta Selatan': { lat: -6.2615, lng: 106.8106, zoom: 13 },
  'Jakarta Timur': { lat: -6.2250, lng: 106.9004, zoom: 13 },
  'Jakarta Utara': { lat: -6.1384, lng: 106.8640, zoom: 13 },
  'Kota Bogor': { lat: -6.5971, lng: 106.8060, zoom: 13 },
  'Kota Depok': { lat: -6.4025, lng: 106.7942, zoom: 13 },
  'Kota Tangerang': { lat: -6.1783, lng: 106.6319, zoom: 13 },
  'Tangerang Selatan': { lat: -6.2887, lng: 106.7179, zoom: 13 },
  'Kota Bekasi': { lat: -6.2383, lng: 106.9756, zoom: 13 },
};

export const STATUS_OPTIONS = ['Menunggu', 'On-Process', 'Selesai', 'Ditolak'] as const;

/**
 * Normalizes and matches Jabodetabek city names reliably.
 * Supports variations like 'Kota Depok' vs 'Depok', 'Kota Bogor' vs 'Bogor', etc.
 */
export function isSameCity(
  reportCity: string | null | undefined,
  filterCity: string | null | undefined
): boolean {
  if (!filterCity || filterCity === 'Semua') return true;
  if (!reportCity) return false;

  const normalize = (c: string) =>
    c
      .toLowerCase()
      .replace(/^(kota|kabupaten|kab\.)\s+/i, '')
      .trim();

  const r = reportCity.toLowerCase().trim();
  const f = filterCity.toLowerCase().trim();

  return r === f || normalize(r) === normalize(f) || r.includes(normalize(f)) || f.includes(normalize(r));
}

export const JABODETABEK_CITY_RANKINGS = [
  {
    rank: 1,
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    score: 95.2,
    resolved_rate: 96,
    avg_response: '2.1 Jam',
    total_reports: 1840,
    user_count: 24500,
    badge: 'Kota Tercepat',
    kpi_status: 'Sangat Baik (A)',
  },
  {
    rank: 2,
    city: 'Jakarta Barat',
    province: 'DKI Jakarta',
    score: 93.4,
    resolved_rate: 94,
    avg_response: '2.8 Jam',
    total_reports: 2150,
    user_count: 28900,
    badge: 'Responsif Utama',
    kpi_status: 'Baik (A-)',
  },
  {
    rank: 3,
    city: 'Tangerang Selatan',
    province: 'Banten',
    score: 91.8,
    resolved_rate: 92,
    avg_response: '3.4 Jam',
    total_reports: 1240,
    user_count: 16800,
    badge: 'Kepuasan Tinggi',
    kpi_status: 'Baik (B+)',
  },
  {
    rank: 4,
    city: 'Kota Bekasi',
    province: 'Jawa Barat',
    score: 88.5,
    resolved_rate: 89,
    avg_response: '4.2 Jam',
    total_reports: 1530,
    user_count: 19400,
    badge: 'Aktif Berbenah',
    kpi_status: 'Cukup (B)',
  },
  {
    rank: 5,
    city: 'Kota Depok',
    province: 'Jawa Barat',
    score: 86.1,
    resolved_rate: 86,
    avg_response: '5.1 Jam',
    total_reports: 1380,
    user_count: 17200,
    badge: 'Perlu Percepatan',
    kpi_status: 'Dalam Evaluasi (C+)',
  },
  {
    rank: 6,
    city: 'Kota Bogor',
    province: 'Jawa Barat',
    score: 85.4,
    resolved_rate: 85,
    avg_response: '5.4 Jam',
    total_reports: 980,
    user_count: 12100,
    badge: 'Evaluasi Warga',
    kpi_status: 'Dalam Evaluasi (C)',
  },
  {
    rank: 7,
    city: 'Kota Tangerang',
    province: 'Banten',
    score: 84.7,
    resolved_rate: 84,
    avg_response: '5.8 Jam',
    total_reports: 1120,
    user_count: 14300,
    badge: 'Perhatian Khusus',
    kpi_status: 'Dalam Evaluasi (C)',
  },
];

// Alias for backwards compatibility
export const CITY_RANKINGS = JABODETABEK_CITY_RANKINGS;

export interface CategoryFilterState {
  cluster: string; // 'Semua' atau id kluster
  category: string; // 'Semua' atau nama kategori
  tag: string; // '' atau nama tag
}

export const EMPTY_CATEGORY_FILTER: CategoryFilterState = { cluster: 'Semua', category: 'Semua', tag: '' };

export function matchesCategoryFilter(
  r: { category: string; title: string; description?: string | null },
  f: CategoryFilterState
): boolean {
  if (f.category !== 'Semua' && r.category !== f.category) return false;
  if (f.cluster !== 'Semua' && getClusterOfCategory(r.category) !== f.cluster) return false;
  if (f.tag && !reportHasTag(r, f.tag)) return false;
  return true;
}
