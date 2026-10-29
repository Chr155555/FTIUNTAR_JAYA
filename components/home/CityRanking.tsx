'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JABODETABEK_CITY_RANKINGS } from '@/lib/constants';

export function CityRanking({ rankings }: { rankings?: any[] } = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = rankings && rankings.length > 0 ? rankings : JABODETABEK_CITY_RANKINGS;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="kpi" className="space-y-3 scroll-mt-20">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Indeks Efektivitas & Kepuasan Penanganan Masalah
        </h2>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-6 h-6 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs shadow-2xs transition-colors cursor-pointer"
            title="Sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-6 h-6 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs shadow-2xs transition-colors cursor-pointer"
            title="Selanjutnya"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1 scroll-smooth"
      >
        {items.map((item) => (
          <div
            key={item.city}
            className="min-w-[215px] sm:min-w-[225px] flex-1 max-w-[240px] shrink-0 bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-2xs hover:border-slate-300 transition-all"
          >
            {/* Top row: Rank, City, Province */}
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                #{item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs text-slate-900 leading-tight truncate">
                  {item.city}
                </h3>
                <p className="text-[10px] text-slate-400">{item.province}</p>
              </div>
            </div>

            {/* Badge */}
            <div>
              <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                {item.badge}
              </span>
            </div>

            {/* Tuntas Rate Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Tuntas:</span>
                <span className="font-bold text-slate-900">{item.resolved_rate}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${item.resolved_rate}%` }}
                />
              </div>
            </div>

            {/* Stats: Respon & Pengguna Aktif */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400 block">Respon Rata-rata</span>
                <strong className="text-slate-800 font-bold text-xs">{item.avg_response}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Pengguna Aktif</span>
                <strong className="text-slate-800 font-bold text-xs">
                  {(item.user_count || 1200).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                </strong>
              </div>
            </div>

            {/* KPI Status */}
            <div className="pt-1 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Status KPI:</span>
              <span
                className={`font-semibold ${
                  item.kpi_status.includes('A')
                    ? 'text-emerald-700'
                    : item.kpi_status.includes('B')
                    ? 'text-amber-700'
                    : 'text-rose-600'
                }`}
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
