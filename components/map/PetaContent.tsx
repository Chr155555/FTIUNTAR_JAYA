'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Filter, Sparkles } from 'lucide-react';
import { CITIES, CATEGORIES, isSameCity } from '@/lib/constants';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { JabodetabekMap } from '@/components/map/JabodetabekMap';
import type { Report } from '@/lib/types';

interface PetaContentProps {
  reports: Report[];
  liveRankings: any[];
}

export function PetaContent({ reports, liveRankings }: PetaContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Filter reports according to search query, city, and category
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      if (!isSameCity(rep.city, selectedCity)) return false;
      if (selectedCategory !== 'Semua' && rep.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          rep.title.toLowerCase().includes(q) ||
          rep.address.toLowerCase().includes(q) ||
          rep.ticket_number.toLowerCase().includes(q) ||
          rep.city.toLowerCase().includes(q) ||
          rep.category.toLowerCase().includes(q) ||
          (rep.description && rep.description.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [reports, selectedCity, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Interactive Search & Filter Card */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari titik lokasi, kategori, nomor tiket, atau jalan di peta Jabodetabek..."
            className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
              title="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>

        {searchQuery.trim() && (
          <div className="flex items-center justify-between text-xs px-1 text-slate-500">
            <span>
              Menemukan <strong className="text-slate-900 font-semibold">{filteredReports.length}</strong> titik pada peta untuk &quot;{searchQuery}&quot;
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
            >
              Reset Pencarian
            </button>
          </div>
        )}

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Wilayah:
          </span>
          {['Semua', ...CITIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCity(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCity === c
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Active Filters Bar */}
        {(selectedCity !== 'Semua' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Filter Aktif:</span>
            {selectedCity !== 'Semua' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-medium shadow-2xs">
                <span>Kota: <strong>{selectedCity}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedCity('Semua')}
                  className="hover:text-rose-300 ml-0.5 cursor-pointer"
                  title="Hapus filter kota"
                >
                  ✕
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium shadow-2xs">
                <span>Cari: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-amber-950 ml-0.5 cursor-pointer"
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedCity('Semua');
                setSearchQuery('');
              }}
              className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold underline underline-offset-2 ml-auto cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>

      {/* Main MapLibre Map Container */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <JabodetabekMap
          reports={reports}
          selectedCity={selectedCity}
          onSelectCity={(c) => setSelectedCity(c)}
          cityRankings={liveRankings}
          searchQuery={searchQuery}
          height="620px"
        />
      </section>

      {/* Quick Report Grid Under Map */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Pengaduan Terpetakan ({filteredReports.length})
            </h2>
            <p className="text-xs text-slate-500">
              Klik kartu pengaduan untuk melihat kronologi penanganan atau menandatangani petisi.
            </p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>Lihat FYP Beranda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 space-y-3">
            <p className="text-sm font-medium text-slate-600">
              {searchQuery ? `Tidak ada pengaduan di peta untuk pencarian "${searchQuery}".` : 'Tidak ada pengaduan untuk wilayah terpilih.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCity('Semua');
                setSelectedCategory('Semua');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium cursor-pointer hover:bg-slate-800 transition-colors"
            >
              Reset Filter & Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.slice(0, 12).map((rep) => (
              <Link
                key={rep.id}
                href={`/laporan/${rep.ticket_number}`}
                className="group block bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-all space-y-3"
              >
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                  <img
                    src={rep.before_image_url}
                    alt={rep.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/85 text-white backdrop-blur-xs">
                    {rep.city}
                  </span>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/70 text-white">
                    {rep.ticket_number}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {rep.category}
                    </span>
                    <StatusBadge status={rep.status} />
                  </div>

                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                    {rep.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{rep.address}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {rep.upvote_count} Petisi Warga
                  </span>
                  <span className="text-rose-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Detail →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
