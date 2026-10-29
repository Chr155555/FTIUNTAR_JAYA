'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { PublicNotice } from '@/lib/types';

export function AnnouncementBanner({ notices }: { notices: PublicNotice[] }) {
  const [idx, setIdx] = useState(0);

  if (!notices.length) return null;
  const current = notices[idx];

  return (
    <section id="pengumuman" className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 sm:p-5 transition-all scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white text-amber-900 border border-amber-200/80 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Pemberitahuan Pekerjaan Umum
              </span>
              <span className="text-xs font-medium text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/60">
                {current.city}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              {current.title}
            </h2>
            <p className="text-xs text-slate-600">
              <span className="font-medium text-slate-900">Dampak:</span> {current.impact}
              <span className="text-slate-400"> — {current.agency}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <div className="flex items-center gap-1 mr-1">
            {notices.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? 'w-4 bg-amber-600' : 'w-1.5 bg-amber-200 hover:bg-amber-300'
                }`}
                title={`Pengumuman ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setIdx((prev) => (prev + 1) % notices.length)}
            className="text-xs font-medium text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>
    </section>
  );
}
