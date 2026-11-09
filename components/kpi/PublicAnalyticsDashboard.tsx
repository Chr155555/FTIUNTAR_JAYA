'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  Filter,
  Download,
  Copy,
  Check,
  Building2,
  Truck,
  Droplets,
  Lightbulb,
  Trash2,
  HardHat,
} from 'lucide-react';

interface CityAnalyticsData {
  city: string;
  province: string;
  totalReports: number;
  resolvedRate: number;
  avgResponseHours: number;
  dominantIssue: string;
  categoryBreakdown: {
    category: string;
    percentage: number;
    count: number;
  }[];
}

const ANALYTICS_DATA: CityAnalyticsData[] = [
  {
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    totalReports: 1840,
    resolvedRate: 96,
    avgResponseHours: 2.1,
    dominantIssue: 'Lampu Jalan (PJU) & Taman',
    categoryBreakdown: [
      { category: 'Lampu Jalan (PJU)', percentage: 34, count: 625 },
      { category: 'Jalan Rusak', percentage: 29, count: 533 },
      { category: 'Sampah & Kebersihan', percentage: 21, count: 386 },
      { category: 'Banjir & Drainase', percentage: 11, count: 202 },
      { category: 'Fasilitas Umum & Faskes', percentage: 5, count: 94 },
    ],
  },
  {
    city: 'Jakarta Barat',
    province: 'DKI Jakarta',
    totalReports: 2150,
    resolvedRate: 94,
    avgResponseHours: 2.8,
    dominantIssue: 'Jalan Rusak & Aspal Amblas',
    categoryBreakdown: [
      { category: 'Jalan Rusak', percentage: 44, count: 946 },
      { category: 'Banjir & Drainase', percentage: 28, count: 602 },
      { category: 'Lampu Jalan (PJU)', percentage: 14, count: 301 },
      { category: 'Sampah & Kebersihan', percentage: 10, count: 215 },
      { category: 'Fasilitas Umum & Faskes', percentage: 4, count: 86 },
    ],
  },
  {
    city: 'Tangerang Selatan',
    province: 'Banten',
    totalReports: 1240,
    resolvedRate: 92,
    avgResponseHours: 3.4,
    dominantIssue: 'Lampu Jalan & Jalan Lingkungan',
    categoryBreakdown: [
      { category: 'Lampu Jalan (PJU)', percentage: 35, count: 434 },
      { category: 'Jalan Rusak', percentage: 31, count: 384 },
      { category: 'Sampah & Kebersihan', percentage: 19, count: 236 },
      { category: 'Banjir & Drainase', percentage: 11, count: 136 },
      { category: 'Fasilitas Umum & Faskes', percentage: 4, count: 50 },
    ],
  },
  {
    city: 'Kota Bekasi',
    province: 'Jawa Barat',
    totalReports: 1530,
    resolvedRate: 89,
    avgResponseHours: 4.2,
    dominantIssue: 'Sampah Liar & Genangan',
    categoryBreakdown: [
      { category: 'Sampah & Kebersihan', percentage: 40, count: 612 },
      { category: 'Banjir & Drainase', percentage: 31, count: 474 },
      { category: 'Jalan Rusak', percentage: 18, count: 275 },
      { category: 'Lampu Jalan (PJU)', percentage: 7, count: 107 },
      { category: 'Fasilitas Umum & Faskes', percentage: 4, count: 62 },
    ],
  },
  {
    city: 'Kota Depok',
    province: 'Jawa Barat',
    totalReports: 1380,
    resolvedRate: 86,
    avgResponseHours: 5.1,
    dominantIssue: 'Jalan Rusak & Saluran Drainase',
    categoryBreakdown: [
      { category: 'Jalan Rusak', percentage: 43, count: 593 },
      { category: 'Sampah & Kebersihan', percentage: 25, count: 345 },
      { category: 'Banjir & Drainase', percentage: 19, count: 262 },
      { category: 'Lampu Jalan (PJU)', percentage: 9, count: 124 },
      { category: 'Fasilitas Umum & Faskes', percentage: 4, count: 56 },
    ],
  },
  {
    city: 'Kota Bogor',
    province: 'Jawa Barat',
    totalReports: 980,
    resolvedRate: 85,
    avgResponseHours: 5.4,
    dominantIssue: 'Drainase Tebing & Jalan Amblas',
    categoryBreakdown: [
      { category: 'Banjir & Drainase', percentage: 41, count: 402 },
      { category: 'Jalan Rusak', percentage: 33, count: 323 },
      { category: 'Sampah & Kebersihan', percentage: 14, count: 137 },
      { category: 'Lampu Jalan (PJU)', percentage: 8, count: 78 },
      { category: 'Fasilitas Umum & Faskes', percentage: 4, count: 40 },
    ],
  },
  {
    city: 'Kota Tangerang',
    province: 'Banten',
    totalReports: 1120,
    resolvedRate: 84,
    avgResponseHours: 5.8,
    dominantIssue: 'Genangan Air & Jalan Protokol',
    categoryBreakdown: [
      { category: 'Banjir & Drainase', percentage: 38, count: 426 },
      { category: 'Jalan Rusak', percentage: 32, count: 358 },
      { category: 'Lampu Jalan (PJU)', percentage: 16, count: 179 },
      { category: 'Sampah & Kebersihan', percentage: 10, count: 112 },
      { category: 'Fasilitas Umum & Faskes', percentage: 4, count: 45 },
    ],
  },
];

const OVERALL_CATEGORIES = [
  {
    category: 'Jalan Rusak',
    icon: HardHat,
    color: '#F59E0B',
    bgColor: 'bg-amber-500',
    percentage: 36.5,
    count: 3740,
    agency: 'Dinas Bina Marga',
    slaTarget: '24 Jam',
    description: 'Lubang jalan, aspal ambles, trotoar hancur di jalan protokol dan permukiman.',
  },
  {
    category: 'Banjir & Drainase',
    icon: Droplets,
    color: '#0284C7',
    bgColor: 'bg-sky-500',
    percentage: 26.8,
    count: 2750,
    agency: 'Dinas Sumber Daya Air (SDA)',
    slaTarget: '6 Jam',
    description: 'Genangan air pasca hujan, gorong-gorong tersumbat, dan tanggul rembes.',
  },
  {
    category: 'Lampu Jalan (PJU)',
    icon: Lightbulb,
    color: '#EAB308',
    bgColor: 'bg-yellow-400',
    percentage: 17.6,
    count: 1805,
    agency: 'Dinas Perhubungan (Dishub)',
    slaTarget: '12 Jam',
    description: 'PJU mati total, kabel putus membahayakan warga, dan tiang miring.',
  },
  {
    category: 'Sampah & Kebersihan',
    icon: Trash2,
    color: '#10B981',
    bgColor: 'bg-emerald-500',
    percentage: 14.8,
    count: 1515,
    agency: 'Dinas Lingkungan Hidup (DLH)',
    slaTarget: '12 Jam',
    description: 'TPS liar menumpuk di pinggir jalan raya, bau menyengat, sampah kali.',
  },
  {
    category: 'Fasilitas Umum & Faskes',
    icon: Building2,
    color: '#8B5CF6',
    bgColor: 'bg-purple-500',
    percentage: 4.3,
    count: 440,
    agency: 'Dinas Terkait & Faskes',
    slaTarget: '48 Jam',
    description: 'Puskesmas antrean padat, halte rusak, pagar taman umum roboh.',
  },
];

export function PublicAnalyticsDashboard() {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Active city or aggregate
  const activeCityData = selectedCity === 'all'
    ? null
    : ANALYTICS_DATA.find((c) => c.city === selectedCity);

  const displayedBreakdown = activeCityData
    ? activeCityData.categoryBreakdown.map((item) => {
        const found = OVERALL_CATEGORIES.find((o) => o.category === item.category);
        return {
          ...item,
          color: found?.color || '#64748B',
          bgColor: found?.bgColor || 'bg-slate-500',
          icon: found?.icon || Building2,
          agency: found?.agency || 'Instansi Terkait',
          slaTarget: found?.slaTarget || '24 Jam',
        };
      })
    : OVERALL_CATEGORIES.map((item) => ({
        category: item.category,
        percentage: item.percentage,
        count: item.count,
        color: item.color,
        bgColor: item.bgColor,
        icon: item.icon,
        agency: item.agency,
        slaTarget: item.slaTarget,
      }));

  const handleCopySummary = () => {
    const summaryText = `[RINGKASAN EKSEKUTIF ANALITIK SUARAWARGA 2026]
Wilayah: ${selectedCity === 'all' ? 'Seluruh Jabodetabek (7 Kota)' : selectedCity}
Total Aduan: ${activeCityData ? activeCityData.totalReports : '10,250'} Laporan
Tingkat Penyelesaian: ${activeCityData ? activeCityData.resolvedRate : '89.8'}%
Respon Rata-rata: ${activeCityData ? `${activeCityData.avgResponseHours} Jam` : '4.1 Jam'}
Isu Paling Kritis: ${activeCityData ? activeCityData.dominantIssue : 'Jalan Rusak (36.5%) & Banjir (26.8%)'}

Rekomendasi Pemda:
1. Mobilisasi satgas cepat perbaikan aspal di koridor barat & selatan.
2. Siaga pompa air mobile Dinas SDA di zona rawan banjir.
3. Optimalisasi rute pengangkutan DLH di titik TPS liar.`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCSV = () => {
    const headers = 'Kota,Total Laporan,Tingkat Tuntas (%),Respon Rata-rata (Jam),Isu Dominan\n';
    const rows = ANALYTICS_DATA.map(
      (c) => `"${c.city}",${c.totalReports},${c.resolvedRate},${c.avgResponseHours},"${c.dominantIssue}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `suarawarga_analitik_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar & Quick Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-900 text-white">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Visualisasi Distribusi Isu Publik & Kebutuhan Dinas
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data analitik agregat untuk mendukung pengambilan keputusan pemerintah daerah (*Data-Driven Decision Support*).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* City selector dropdown */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">🌐 Seluruh Jabodetabek (7 Kota)</option>
              {ANALYTICS_DATA.map((c) => (
                <option key={c.city} value={c.city}>
                  📍 {c.city}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Salin ringkasan teks untuk dokumen / rapat dinas"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin Ringkasan</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Unduh dataset mentah format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            TOTAL ADUAN DIANALISIS
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {activeCityData ? activeCityData.totalReports.toLocaleString('id-ID') : '10.250'}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Geotagging Valid</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            ISU PALING DOMINAN
          </span>
          <div className="text-base sm:text-lg font-bold text-slate-900 truncate" title={activeCityData ? activeCityData.dominantIssue : 'Jalan Rusak (36.5%)'}>
            {activeCityData ? activeCityData.dominantIssue.split('&')[0] : 'Jalan Rusak'}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold">
            {activeCityData ? `${activeCityData.categoryBreakdown[0].percentage}% Aduan Masuk` : '36.5% dari Total Aduan'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            TINGKAT TUNTAS PEMDA
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {activeCityData ? `${activeCityData.resolvedRate}%` : '89.8%'}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Bukti foto &quot;After&quot; terverifikasi
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            RESPON SATGAS RATA-RATA
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {activeCityData ? `${activeCityData.avgResponseHours} Jam` : '4.1 Jam'}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Standar target SLA: &lt; 4.0 Jam
          </span>
        </div>
      </div>

      {/* Grid: Chart 1 (Category Breakdown) & Chart 2 (Cross-City Comparison) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Category Percentage Breakdown (Interactive Bars) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Proporsi Masalah Terbanyak {selectedCity !== 'all' ? `— ${selectedCity}` : 'se-Jabodetabek'}
              </h3>
              <p className="text-xs text-slate-500">
                Peringkat keluhan warga berdasarkan volume aduan dan instansi dinas berwenang.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
              {displayedBreakdown.length} Kategori
            </span>
          </div>

          {/* Interactive Stacked Progress Bar */}
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            {displayedBreakdown.map((item) => (
              <div
                key={item.category}
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                className="h-full transition-all duration-500 hover:opacity-90 cursor-pointer"
                title={`${item.category}: ${item.percentage}% (${item.count.toLocaleString('id-ID')} aduan)`}
              />
            ))}
          </div>

          {/* Detailed Category Cards with Metrics */}
          <div className="space-y-3">
            {displayedBreakdown.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.category}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span
                      style={{ backgroundColor: `${cat.color}1A`, color: cat.color }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs sm:text-sm font-bold text-slate-900">
                          {cat.category}
                        </strong>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-600">
                          {cat.agency}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Target respon dinas: <strong className="text-slate-700">{cat.slaTarget}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60 shrink-0">
                    <div className="text-sm font-extrabold text-slate-900">
                      {cat.percentage}%
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {cat.count.toLocaleString('id-ID')} Aduan
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cross-City Issue Matrix & SLA Velocity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cross City Issue Distribution */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Matriks Isu Dominan per Wilayah
              </h3>
              <p className="text-[11px] text-slate-500">
                Perbandingan masalah paling sering dilaporkan di 7 kota Jabodetabek.
              </p>
            </div>

            <div className="space-y-3">
              {ANALYTICS_DATA.map((c) => (
                <div
                  key={c.city}
                  onClick={() => setSelectedCity(c.city)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedCity === c.city
                      ? 'border-slate-900 bg-slate-900/5 shadow-2xs'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900">{c.city}</span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {c.resolvedRate}% Tuntas
                    </span>
                  </div>

                  {/* Dominant Issue Tag */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Keluhan Teratas:</span>
                    <strong className="text-slate-800 text-[11px] truncate max-w-[180px]">
                      {c.dominantIssue}
                    </strong>
                  </div>

                  {/* Mini visual ratio bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden flex mt-2">
                    {c.categoryBreakdown.map((b, i) => {
                      const colors = ['#F59E0B', '#0284C7', '#EAB308', '#10B981', '#8B5CF6'];
                      return (
                        <div
                          key={b.category}
                          style={{ width: `${b.percentage}%`, backgroundColor: colors[i % colors.length] }}
                          className="h-full"
                          title={`${b.category}: ${b.percentage}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Response Hours Benchmarking */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Kecepatan Respon vs Target SLA
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Target: &le; 4.0 Jam
              </span>
            </div>

            <div className="space-y-2.5">
              {ANALYTICS_DATA.slice(0, 5).map((c) => {
                const isUnderSLA = c.avgResponseHours <= 4.0;
                return (
                  <div key={c.city} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{c.city}</span>
                      <span
                        className={`text-[11px] font-bold ${
                          isUnderSLA ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {c.avgResponseHours} Jam {isUnderSLA ? '✓ Sesuai Target' : '⚠ Perlu Percepatan'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isUnderSLA ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, (c.avgResponseHours / 6) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Recommendation Section (Data-Driven Decision Making) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-base text-white">
                Rekomendasi Kebijakan & Alokasi Sumber Daya Berbasis Data
              </h3>
              <p className="text-xs text-slate-400">
                Insight otomatis untuk pimpinan dinas dan kepala daerah berdasarkan pola agregat pengaduan warga.
              </p>
            </div>
          </div>

          <span className="text-[11px] px-3 py-1 rounded-full bg-white/10 text-slate-300 font-semibold self-start sm:self-auto border border-white/10">
            Kuartal IV / 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Policy Card 1 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <HardHat className="w-4 h-4" />
              <span>Dinas Bina Marga</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">
              Prioritas Alat Berat di Koridor Barat & Depok
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Sebanyak <strong>44% aduan di Jakarta Barat dan 43% di Depok</strong> berupa jalan rusak/berlubang. Direkomendasikan menambah stok aspal dingin cepat kering dan penugasan regu malam.
            </p>
          </div>

          {/* Policy Card 2 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Droplets className="w-4 h-4" />
              <span>Dinas Sumber Daya Air</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">
              Kesiapsiagaan Pompa Mobile di Kota Tangerang
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Tingkat aduan genangan air di Kota Tangerang dan Bogor mencapai <strong>&gt; 38%</strong>. Perlu pembersihan sedimen berkala pada pintu air utama dan mobilisasi pompa portabel.
            </p>
          </div>

          {/* Policy Card 3 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Trash2 className="w-4 h-4" />
              <span>Dinas Lingkungan Hidup</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">
              Optimalisasi Ritase Truk Sampah di Kota Bekasi
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Volume aduan sampah liar di Kota Bekasi adalah yang tertinggi se-Jabodetabek (<strong>40%</strong>). Diperlukan penambahan jadwal pengangkutan di titik TPS perbatasan perumahan.
            </p>
          </div>

          {/* Policy Card 4 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>Dinas Perhubungan</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">
              Konversi Smart LED Hemat Energi di Tangsel
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Lampu padam menyumbang <strong>35% aduan di Tangsel</strong>. Implementasi sensor otomatisasi dan perbaikan kabel bawah tanah di jalan sekunder dapat menekan aduan hingga 60%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
