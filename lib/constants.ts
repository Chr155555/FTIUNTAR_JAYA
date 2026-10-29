// Category -> Agency auto-routing
export const AGENCY_ROUTING: Record<string, string> = {
  'Jalan Rusak': 'Dinas Bina Marga',
  'Banjir & Drainase': 'Dinas Sumber Daya Air (SDA) / PUPR',
  'Lampu Jalan (PJU)': 'Dinas Perhubungan (Dishub)',
  'Sampah & Kebersihan': 'Dinas Lingkungan Hidup (DLH)',
  'Fasilitas Umum & Taman': 'Dinas Pertamanan & Perkim',
};

export const CATEGORIES = [
  'Jalan Rusak',
  'Banjir & Drainase',
  'Lampu Jalan (PJU)',
  'Sampah & Kebersihan',
  'Fasilitas Umum & Taman',
] as const;

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
