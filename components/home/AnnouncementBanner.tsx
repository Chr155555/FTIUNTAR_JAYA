'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ChevronRight, ChevronLeft, Pause, Play, Megaphone } from 'lucide-react';
import type { PublicNotice } from '@/lib/types';

export function AnnouncementBanner({ notices }: { notices: PublicNotice[] }) {
  const [idx, setIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = notices?.length || 0;

  // Auto-rotate running ticker every 5 seconds if not paused by hover
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % total);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused]);

  if (!notices || total === 0) return null;

  // Safe boundary access to prevent undefined crash during re-renders or filter changes
  const safeIdx = idx % total;
  const current = notices[safeIdx] || notices[0];
  if (!current) return null;

  return (
    <section
      id="pengumuman"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 transition-all shadow-2xs scroll-mt-20 relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Main Alert Info */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white text-amber-900 border border-amber-200/80 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Pemberitahuan Pekerjaan Umum
              </span>

              {current.city && (
                <span className="text-xs font-semibold text-slate-700 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/70">
                  {current.city}
                </span>
              )}

              {total > 1 && (
                <span className="text-[10px] text-amber-800 font-mono bg-amber-100/60 px-1.5 py-0.2 rounded">
                  {safeIdx + 1} / {total}
                </span>
              )}
            </div>

            {/* Smooth transition title & impact */}
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
              {current.title}
            </h2>

            <p className="text-xs text-slate-600 line-clamp-2">
              <span className="font-semibold text-slate-900">Dampak:</span> {current.impact || 'Perhatikan rambu di lokasi.'}
              {current.agency && (
                <span className="text-slate-400"> — {current.agency}</span>
              )}
            </p>
          </div>
        </div>

        {/* Controls: Dots & Navigation buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {total > 1 && (
            <div className="flex items-center gap-1 mr-1">
              {notices.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    safeIdx === i ? 'w-5 bg-amber-600' : 'w-1.5 bg-amber-200 hover:bg-amber-300'
                  }`}
                  title={`Pengumuman ${i + 1}`}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-1">
            {total > 1 && (
              <button
                type="button"
                onClick={() => setIdx((prev) => (prev - 1 + total) % total)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIdx((prev) => (prev + 1) % total)}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
