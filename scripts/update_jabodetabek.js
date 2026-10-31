/* eslint-disable */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Auto-load environment variables from .env or .env.local
try {
  if (typeof process.loadEnvFile === 'function') {
    const envLocal = path.resolve(__dirname, '../.env.local');
    const envRoot = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envLocal)) process.loadEnvFile(envLocal);
    else if (fs.existsSync(envRoot)) process.loadEnvFile(envRoot);
  }
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is missing.');
  console.error('Please configure DATABASE_URL in your .env or .env.local file.');
  process.exit(1);
}

const client = new Client({ connectionString });

async function main() {
  await client.connect();
  console.log('Connected to Postgres');

  // Check if kpi_penalties table exists, create if not
  await client.query(`
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
  `);
  console.log('Checked kpi_penalties table');

  // Check if reports has reject_reason
  await client.query(`
    ALTER TABLE public.reports 
    ADD COLUMN IF NOT EXISTS reject_reason TEXT,
    ADD COLUMN IF NOT EXISTS fyp_score NUMERIC DEFAULT 0;
  `);

  // Update existing reports to Jabodetabek
  await client.query(`
    UPDATE public.reports
    SET city = 'Jakarta Barat',
        address = 'Jl. Kyai Tapa No. 45, Grogol Petamburan, Jakarta Barat',
        latitude = -6.1668,
        longitude = 106.7903,
        agency = 'Dinas Bina Marga DKI'
    WHERE ticket_number = 'LAP-2026-8821';

    UPDATE public.reports
    SET city = 'Kota Depok',
        title = 'Saluran Drainase Margonda Tersumbat Sedimen Membanjiri Lajur Lambat',
        address = 'Jl. Margonda Raya No. 120, Beji, Depok',
        latitude = -6.3725,
        longitude = 106.8322,
        agency = 'Dinas PUPR Kota Depok'
    WHERE ticket_number = 'LAP-2026-8819';

    UPDATE public.reports
    SET city = 'Kota Bogor',
        title = 'Lampu Penerangan Jalan Umum (PJU) Padam 4 Tiang di Jl. Pajajaran',
        address = 'Jl. Pajajaran No. 88, Baranangsiang, Bogor Tengah',
        latitude = -6.5982,
        longitude = 106.8095,
        agency = 'Dishub Kota Bogor'
    WHERE ticket_number = 'LAP-2026-8815';

    UPDATE public.reports
    SET city = 'Kota Bekasi',
        title = 'Tumpukan Sampah Liar Menutupi Separator Jalan Raya Ahmad Yani',
        address = 'Jl. Ahmad Yani No. 15, Bekasi Selatan, Kota Bekasi',
        latitude = -6.2383,
        longitude = 106.9856,
        agency = 'Dinas Lingkungan Hidup Kota Bekasi'
    WHERE ticket_number = 'LAP-2026-8802';
  `);

  // Add more Jabodetabek reports if needed (Tangerang, Jakarta Selatan, Jakarta Timur, Tangerang Selatan)
  const additionalJabodetabek = [
    {
      ticket: 'LAP-2026-8805',
      title: 'Tutup Saluran Besi Hilang Rawan Kecelakaan di Duren Sawit',
      category: 'Fasilitas Umum & Taman',
      city: 'Jakarta Timur',
      address: 'Jl. Kolonel Sugiono No. 8, Duren Sawit, Jakarta Timur',
      lat: -6.2341,
      lng: 106.9152,
      status: 'On-Process',
      upvotes: 112,
      isTop: false,
      agency: 'Dinas Bina Marga DKI',
      desc: 'Penutup manhole besi dicuri oknum tidak bertanggung jawab. Sangat berbahaya bagi pejalan kaki dan pesepeda motor.',
      before: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80',
      after: null,
      reporter: 'Rian Firdaus'
    },
    {
      ticket: 'LAP-2026-8806',
      title: 'Pohon Rindang Condong ke Kabel PLN Menjelang Musim Hujan di BSD',
      category: 'Fasilitas Umum & Taman',
      city: 'Tangerang Selatan',
      address: 'Jl. Pahlawan Seribu No. 22, Serpong, Tangerang Selatan',
      lat: -6.2954,
      lng: 106.6688,
      status: 'Selesai',
      upvotes: 178,
      isTop: true,
      agency: 'Disperkimta Tangerang Selatan',
      desc: 'Dahan pohon trembesi tua sudah bersentuhan langsung dengan kabel trafo tegangan tinggi. Berhasil dipangkas tuntas oleh tim satgas.',
      before: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80',
      after: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80',
      reporter: 'Warga BSD'
    },
    {
      ticket: 'LAP-2026-8807',
      title: 'Genangan Air Akibat Saluran Liar Tersumbat di Poris Plawad',
      category: 'Banjir & Drainase',
      city: 'Kota Tangerang',
      address: 'Jl. Benteng Betawi, Poris Plawad, Cipondoh, Tangerang',
      lat: -6.1751,
      lng: 106.6578,
      status: 'Menunggu',
      upvotes: 64,
      isTop: false,
      agency: 'Dinas PUPR Kota Tangerang',
      desc: 'Air menggenang setinggi 20cm setiap kali hujan deras lebih dari 30 menit. Mohon normalisasi crossing saluran.',
      before: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80',
      after: null,
      reporter: 'Siti Aminah'
    },
    {
      ticket: 'LAP-2026-8808',
      title: 'Jalan Amblas Mendekati Jembatan Pasar Minggu',
      category: 'Jalan Rusak',
      city: 'Jakarta Selatan',
      address: 'Jl. Raya Ragunan No. 18, Pasar Minggu, Jakarta Selatan',
      lat: -6.2845,
      lng: 106.8432,
      status: 'On-Process',
      upvotes: 215,
      isTop: true,
      agency: 'Dinas Bina Marga DKI',
      desc: 'Aspal amblas sekitar 25cm di dekat oprit jembatan penghubung rel kereta. Sudah dipasang cone oleh Dishub & Bina Marga.',
      before: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80',
      after: null,
      reporter: 'Ahmad Syahrir'
    }
  ];

  for (const item of additionalJabodetabek) {
    const check = await client.query('SELECT id FROM public.reports WHERE ticket_number = $1', [item.ticket]);
    if (check.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO public.reports (
          ticket_number, title, category, city, address, latitude, longitude,
          status, upvote_count, is_top_upvoted, agency, description,
          before_image_url, after_image_url, reporter_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `, [
        item.ticket, item.title, item.category, item.city, item.address, item.lat, item.lng,
        item.status, item.upvotes, item.isTop, item.agency, item.desc,
        item.before, item.after, item.reporter
      ]);

      const repId = ins.rows[0].id;
      await client.query(`
        INSERT INTO public.report_timelines (report_id, step_title, description, is_done)
        VALUES 
          ($1, 'Laporan Diterima', 'Laporan masuk antrean verifikasi warga.', true),
          ($1, 'Verifikasi & Disposisi', 'Diteruskan ke instansi kota setempat.', true),
          ($1, 'Sedang Dikerjakan (On-Process)', 'Petugas dan peralatan sudah dikerahkan.', $2),
          ($1, 'Selesai & Audit Warga', 'Penyelesaian dan audit kepuasan.', $3)
      `, [repId, item.status === 'On-Process' || item.status === 'Selesai', item.status === 'Selesai']);
    }
  }

  // Update public notices to Jabodetabek
  await client.query(`
    DELETE FROM public.public_notices;
    INSERT INTO public.public_notices (city, title, impact, agency, status) VALUES
    ('Jakarta Barat', 'Perbaikan Saluran Air & Gorong-gorong Jl. Daan Mogot KM 12', 'Penyempitan lajur kiri arah Cengkareng', 'Dinas SDA DKI Jakarta', 'Aktif Dikerjakan'),
    ('Kota Bekasi', 'Pengaspalan Ulang & Perbaikan Marka Jl. Ahmad Yani', 'Pekerjaan malam hari pukul 22.00 - 04.00 WIB', 'Dinas Bina Marga Kota Bekasi', 'Terjadwal'),
    ('Kota Depok', 'Pembersihan Sedimen & Normalisasi Kali Cabang Barat Margonda', 'Alat berat beroperasi di tepi jalan raya', 'Dinas PUPR Kota Depok', 'Aktif Dikerjakan'),
    ('Kota Bogor', 'Pemeliharaan Lampu PJU & Pemangkasan Pohon Rawan Tumbang Jl. Pajajaran', 'Arus lalu lintas dikawal Dishub', 'Dishub Kota Bogor', 'Aktif Dikerjakan'),
    ('Tangerang Selatan', 'Perbaikan Rekahan Aspal & Saluran Bintaro Utama Sektor 7', 'Lajur dialihkan bergantian', 'Disperkimta Tangsel', 'Terjadwal');
  `);

  console.log('Successfully updated Jabodetabek reports, timelines, notices, and schema!');
  await client.end();
}

main().catch(console.error);
