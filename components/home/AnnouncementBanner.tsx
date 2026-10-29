'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { PublicNotice } from '@/lib/types';

export function AnnouncementBanner({ notices }: { notices: PublicNotice[] }) {
  const [idx, setIdx] = useState(0);

  if (!notices.length) return null;
  const current = notices[idx];

  return (
    <section id="pengumuman" className="space-y-3 scroll-mt-20">
      {/* Section Heading */}
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight capitalize">
        Pemberitahuan Pekerjaan Umum
      </h2>

      {/* Card */}
      <div className="bg-slate-100 rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-7 h-7 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-800 mb-0.5">{current.city}</p>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {current.title}
          </h3>
          <p className="text-xs text-slate-800 mt-1">
            <span className="font-semibold text-slate-800">Dampak:</span>{' '}
            {current.impact}
            <span className="text-slate-800"> — {current.agency}</span>
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dots */}
          <div className="flex items-center gap-1">
            {notices.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? 'w-4 bg-amber-500' : 'w-1.5 bg-amber-300 hover:bg-amber-400'
                }`}
                title={`Pengumuman ${i + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
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
