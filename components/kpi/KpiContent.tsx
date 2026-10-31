'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  TrendingUp,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  BarChart3,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { JABODETABEK_CITY_RANKINGS } from '@/lib/constants';

interface Props {
  initialRankings?: any[];
  totalReports?: number;
  totalPenalties?: number;
}

export function KpiContent({ initialRankings, totalReports = 9, totalPenalties = 0 }: Props) {
  const [selectedProvince, setSelectedProvince] = useState<'all' | 'DKI Jakarta' | 'Jawa Barat' | 'Banten'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'score' | 'resolved' | 'reports'>('score');

  const baseItems = initialRankings && initialRankings.length > 0 ? initialRankings : JABODETABEK_CITY_RANKINGS;

  const filteredItems = baseItems
    .filter((item) => {
      if (selectedProvince !== 'all' && item.province !== selectedProvince) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.city.toLowerCase().includes(q) || item.province.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortKey === 'score') return b.score - a.score;
      if (sortKey === 'resolved') return b.resolved_rate - a.resolved_rate;
      if (sortKey === 'reports') return b.total_reports - a.total_reports;
      return 0;
    });

  const top3 = baseItems.slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
              TRANSPARANSI KINERJA PEMDA
            </span>
            <span className="text-xs text-slate-400">Akuntabilitas Publik Jabodetabek</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Indeks Efektivitas & Kepuasan Penanganan Masalah
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Peringkat berkala kecepatan penanganan aduan infrastruktur di 7 wilayah kota/kabupaten Jabodetabek berdasarkan kecepatan respon lapangan, persentase tuntas, dan audit warga.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 shrink-0">
          <div className="bg-white/10 p-3 rounded-xl text-center border border-white/10">
            <div className="text-lg font-bold text-white">7</div>
            <div className="text-[10px] text-slate-300">Kota Dipantau</div>
          </div>
          <div className="bg-white/10 p-3 rounded-xl text-center border border-white/10">
            <div className="text-lg font-bold text-emerald-400">90.8%</div>
            <div className="text-[10px] text-slate-300">Rata-rata Tuntas</div>
          </div>
          <div className="bg-white/10 p-3 rounded-xl text-center border border-white/10">
            <div className="text-lg font-bold text-white">3.8 Jam</div>
            <div className="text-[10px] text-slate-300">Kecepatan Respon</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT SIDEBAR: FILTER WILAYAH & METRIK */}
        <aside className="w-full lg:w-60 xl:w-64 shrink-0 space-y-4 lg:sticky lg:top-20">
          {/* Card 1: Filter Provinsi */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
            <h2 className="text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-2.5">
              WILAYAH PROVINSI
            </h2>

            {[
              { id: 'all', label: 'Semua Wilayah', count: baseItems.length },
              { id: 'DKI Jakarta', label: 'DKI Jakarta', count: baseItems.filter((i) => i.province === 'DKI Jakarta').length },
              { id: 'Jawa Barat', label: 'Jawa Barat', count: baseItems.filter((i) => i.province === 'Jawa Barat').length },
              { id: 'Banten', label: 'Banten', count: baseItems.filter((i) => i.province === 'Banten').length },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProvince(p.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedProvince === p.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{p.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedProvince === p.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {p.count}
                </span>
              </button>
            ))}
          </div>

          {/* Card 2: Standar Penilaian KPI */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <h2 className="text-[11px] font-bold text-slate-900 tracking-wider uppercase">
              STANDAR STATUS KPI
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-green-700 block font-semibold">Grade A (Skor &gt; 92)</strong>
                  <span className="text-[11px] text-slate-500">Respon sangat cepat &lt; 3 jam, penyelesaian tuntas &gt; 93%.</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-yellow-600 block font-semibold">Grade B (Skor 86 - 92)</strong>
                  <span className="text-[11px] text-slate-500">Respon stabil 3 - 5 jam, aktif menangani aduan lapangan.</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-red-600 block font-semibold">Grade C (Skor &lt; 86)</strong>
                  <span className="text-[11px] text-slate-500">Perlu evaluasi, respon melebihi batas standar SLA warga.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Link ke Peta */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-slate-900">Lihat Titik Sebaran Aduan</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Pantau koordinat GPS langsung masalah jalan rusak, banjir, dan fasilitas umum di peta interaktif.
            </p>
            <Link
              href="/peta"
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Buka Peta Jabodetabek</span>
            </Link>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Top 3 Podium Highlights */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
              TIGA KOTA TERBAIK BULAN INI
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {top3.map((city, idx) => (
                <div
                  key={city.city}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-200">
                      {city.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {city.city}
                    </h3>
                    <p className="text-[11px] text-slate-400">{city.province}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tingkat Tuntas</span>
                      <strong className="font-bold text-slate-900">{city.resolved_rate}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Respon Rata-rata</span>
                      <strong className="font-bold text-slate-900">{city.avg_response}</strong>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Skor Evaluasi:</span>
                    <strong className="text-emerald-700 font-bold">{city.score} / 100</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full City Comparison Section */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Tabel Akuntabilitas & Kinerja 7 Kota
                </h2>
                <p className="text-xs text-slate-500">
                  Data diperbarui otomatis berdasarkan laporan warga dan audit penyelesaian pemda.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama kota..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full shrink-0">
                  <button
                    type="button"
                    onClick={() => setSortKey('score')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                      sortKey === 'score' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Skor
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortKey('resolved')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                      sortKey === 'resolved' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Tuntas
                  </button>
                </div>
              </div>
            </div>

            {/* Comparison Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-700">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Kota / Kabupaten</th>
                      <th className="py-3 px-4">Badge Predikat</th>
                      <th className="py-3 px-4">Penyelesaian</th>
                      <th className="py-3 px-4">Respon Rata-rata</th>
                      <th className="py-3 px-4">Aduan Masuk</th>
                      <th className="py-3 px-4">Pengguna Aktif</th>
                      <th className="py-3 px-4 text-center">Status KPI</th>
                      <th className="py-3 px-4 text-right">Skor Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item, idx) => (
                      <tr key={item.city} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-500 text-center text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <strong className="font-bold text-slate-900 block">{item.city}</strong>
                          <span className="text-[10px] text-slate-400">{item.province}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-200">
                            {item.badge}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 min-w-[130px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-slate-900">{item.resolved_rate}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-yellow-400"
                              style={{ width: `${item.resolved_rate}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {item.avg_response}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {item.total_reports?.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {item.user_count?.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200/80 w-[130px] text-center whitespace-nowrap">
                            {item.kpi_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-sm font-bold text-slate-900">{item.score}</span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </td>
                      </tr>
                    ))}

                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                          Tidak ada kota yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Citizen Accountability Explainer Card */}
          <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900">
              <ShieldCheck className="w-4 h-4 text-slate-800" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Mekanisme Penalti KPI oleh Warga
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Setiap warga memiliki hak untuk melayangkan <strong>Komplain Penalti KPI</strong> pada laporan pengaduan yang tidak ditangani sesuai janji atau diklaim tuntas secara sepihak. Setiap komplain terverifikasi langsung mengurangi skor efektivitas kota sebesar <strong>1.5 poin penalti</strong> secara real-time pada sistem audit SuaraWarga.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
