'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { PublicNotice } from '@/lib/types';

export function AnnouncementBanner({ notices }: { notices?: PublicNotice[] }) {
  const [idx, setIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultNotices: PublicNotice[] = [
    {
      id: 'notice-1',
      city: 'Jakarta Barat',
      title: 'Perbaikan Saluran Air & Gorong-gorong Jl. Daan Mogot KM 12',
      impact: 'Penyempitan lajur kiri arah Cengkareng',
      agency: 'Dinas SDA DKI Jakarta',
      status: 'Aktif Dikerjakan',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'notice-2',
      city: 'Kota Bekasi',
      title: 'Pengaspalan Ulang & Perbaikan Marka Jl. Ahmad Yani',
      impact: 'Pekerjaan malam hari pukul 22.00 - 04.00 WIB',
      agency: 'Dinas Bina Marga Kota Bekasi',
      status: 'Terjadwal',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'notice-3',
      city: 'Kota Depok',
      title: 'Pembersihan Sedimen & Normalisasi Kali Cabang Barat Margonda',
      impact: 'Alat berat beroperasi di tepi jalan raya',
      agency: 'Dinas PUPR Kota Depok',
      status: 'Aktif Dikerjakan',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'notice-4',
      city: 'Kota Bogor',
      title: 'Pemeliharaan Lampu PJU & Pemangkasan Pohon Rawan Tumbang Jl. Pajajaran',
      impact: 'Arus lalu lintas dikawal Dishub',
      agency: 'Dishub Kota Bogor',
      status: 'Aktif Dikerjakan',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  const items = notices && notices.length > 0 ? notices : defaultNotices;
  const total = items.length;

  useEffect(() => {
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % total);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused]);

  const safeIdx = idx % total;
  const current = items[safeIdx] || items[0];

  return (
    <section
      id="pengumuman"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="space-y-2.5 scroll-mt-20"
    >
      <h2 className="text-base font-bold text-slate-900 tracking-tight">
        Pemberitahuan Pekerjaan Umum
      </h2>

      <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        {/* Left: Icon & Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl bg-yellow-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <AlertTriangle className="w-6 h-6 text-white stroke-[2.3]" />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <span className="text-[11px] font-medium text-slate-500 block">
              {current.city || 'Jabodetabek'}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
              {current.title}
            </h3>
            <p className="text-xs text-slate-600 truncate mt-0.5">
              <span className="font-semibold text-slate-800">Dampak:</span> {current.impact || 'Perhatikan rambu di lokasi.'}
              {current.agency && <span className="text-slate-400"> — {current.agency}</span>}
            </p>
          </div>
        </div>

        {/* Right: Dots indicator & Next button */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <div className="flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  safeIdx === i ? 'w-5 bg-yellow-500' : 'w-1.5 bg-yellow-200 hover:bg-yellow-300'
                }`}
                title={`Pemberitahuan ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIdx((prev) => (prev + 1) % total)}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>
    </section>
  );
}
