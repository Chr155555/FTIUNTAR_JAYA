'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JABODETABEK_CITY_RANKINGS } from '@/lib/constants';

export function CityRanking({ rankings }: { rankings?: typeof JABODETABEK_CITY_RANKINGS } = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section id="kpi" className="space-y-4 scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-1">
            Indeks Efektivitas & Kepuasan Penanganan Masalah
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Nav Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              aria-label="Geser kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              aria-label="Geser kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {JABODETABEK_CITY_RANKINGS.map((item) => (
          <div
            key={item.city}
            className="rounded-2xl p-4 bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs space-y-3 shrink-0 w-[220px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* Header: Rank + City */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 bg-slate-100 text-slate-900 border border-slate-200"
              >
                #{item.rank}
              </div>
              <div>
                <h3 className="font-semibold text-xs text-slate-900 leading-tight">{item.city}</h3>
                <p className="text-[10px] text-slate-900">{item.province}</p>
              </div>
            </div>

            {/* Badge */}
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-200">
              {item.badge}
            </span>

            {/* Resolved Rate Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-900 font-medium text-[11px]">Tuntas:</span>
                <span className="font-bold text-slate-900">{item.resolved_rate}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.resolved_rate >= 90
                      ? 'bg-emerald-500'
                      : item.resolved_rate >= 86
                      ? 'bg-yellow-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${item.resolved_rate}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-900 text-[10px] block font-medium">Respon Rata-rata</span>
                <strong className="text-slate-900 font-bold">{item.avg_response}</strong>
              </div>
              <div>
                <span className="text-slate-900 text-[10px] block font-medium">Pengguna Aktif</span>
                <strong className="text-slate-900 font-bold">
                  {item.user_count.toLocaleString('id-ID')}
                </strong>
              </div>
            </div>

            {/* KPI Status */}
            <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-900 font-medium">
              <span>Status KPI:</span>
              <span
                className="font-bold text-slate-900"
              >
                {item.kpi_status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
