'use client';

import { Award, TrendingUp, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { JABODETABEK_CITY_RANKINGS } from '@/lib/constants';

export function CityRanking({ rankings }: { rankings?: any[] } = {}) {
  return (
    <section id="kpi" className="space-y-4 scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/70">
            <Award className="w-3.5 h-3.5" />
            <span>Dashboard Perbandingan Kota Jabodetabek</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-1">
            Indeks Efektivitas & Kepuasan Penanganan Masalah
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-sm">
          Perbandingan rasio tuntas masalah dan kepuasan warga terhadap proporsi pengguna aktif tiap wilayah.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {JABODETABEK_CITY_RANKINGS.map((item) => (
          <div
            key={item.city}
            className="rounded-2xl p-4 bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs space-y-3"
          >
            {/* Header: Rank + City + Badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center ${
                    item.rank === 1
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : item.rank <= 3
                      ? 'bg-slate-100 text-slate-800 border border-slate-200'
                      : 'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}
                >
                  #{item.rank}
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900">{item.city}</h3>
                  <p className="text-[10px] text-slate-400">{item.province}</p>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200/70">
                {item.badge}
              </span>
            </div>

            {/* Resolved Rate Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Tuntas:</span>
                <span className="font-bold text-slate-900">{item.resolved_rate}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.resolved_rate >= 90
                      ? 'bg-emerald-500'
                      : item.resolved_rate >= 86
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${item.resolved_rate}%` }}
                />
              </div>
            </div>

            {/* Stats: Response, User count & KPI status */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block">Respon Rata-rata</span>
                <strong className="text-slate-800 font-semibold">{item.avg_response}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Pengguna Aktif</span>
                <strong className="text-slate-800 font-semibold">
                  {item.user_count.toLocaleString('id-ID')}
                </strong>
              </div>
            </div>

            <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-500">
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
