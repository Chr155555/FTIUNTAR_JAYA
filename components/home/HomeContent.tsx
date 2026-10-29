'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  ThumbsUp,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Layers,
  Filter,
  ArrowUpRight,
  Share2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { JabodetabekMap } from '@/components/map/JabodetabekMap';
import { calculateDailyFYP } from '@/lib/fyp-engine';
import { CITIES, CATEGORIES, isSameCity } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import type { Report } from '@/lib/types';

export function HomeContent({
  initialReports,
  cityRankings,
}: {
  initialReports: Report[];
  cityRankings?: any[];
}) {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>(initialReports);

  // Feed tabs: FYP (Machine Learning recommendation), Petisi (Popular), On-Process (Active), Map
  const [activeTab, setActiveTab] = useState<'fyp' | 'petition' | 'onprocess' | 'map'>('fyp');
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  // Listen for #peta in URL to instantly switch to map tab and scroll
  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#peta') {
        setActiveTab('map');
        setTimeout(() => {
          const el = document.getElementById('peta');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Handle instant petition sign / upvote
  const handleSignPetition = async (e: React.MouseEvent, report: Report) => {
    e.preventDefault();
    e.stopPropagation();

    const isUpvoted = upvotedIds.has(report.id);
    const newCount = isUpvoted ? report.upvote_count - 1 : report.upvote_count + 1;

    setUpvotedIds((prev) => {
      const next = new Set(prev);
      if (isUpvoted) next.delete(report.id);
      else next.add(report.id);
      return next;
    });

    setReports((prev) =>
      prev.map((r) =>
        r.id === report.id
          ? { ...r, upvote_count: newCount, is_top_upvoted: newCount >= 150 }
          : r
      )
    );

    await supabase
      .from('reports')
      .update({
        upvote_count: newCount,
        is_top_upvoted: newCount >= 150,
      })
      .eq('id', report.id);
  };

  // 1. Calculate Daily FYP recommendations with lightweight ML engine
  const fypRecommendations = useMemo(() => {
    let list = calculateDailyFYP(
      reports,
      selectedCity === 'Semua' ? 'Jakarta Barat' : selectedCity,
      selectedCategory
    );

    // If a specific city is selected, strictly filter to that city
    if (selectedCity !== 'Semua') {
      list = list.filter((item) => isSameCity(item.report.city, selectedCity));
    }

    // If a specific category is selected, strictly filter to that category
    if (selectedCategory !== 'Semua') {
      list = list.filter((item) => item.report.category === selectedCategory);
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((item) => {
      const r = item.report;
      return (
        r.title.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.ticket_number.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    });
  }, [reports, selectedCity, selectedCategory, searchQuery]);

  // 2. Filter reports based on active tab and criteria
  const displayedReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (!isSameCity(r.city, selectedCity)) return false;
        if (selectedCategory !== 'Semua' && r.category !== selectedCategory) return false;

        // Specific tab filter
        if (activeTab === 'onprocess' && r.status !== 'On-Process') return false;

        // Search query filter across all fields
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            r.title.toLowerCase().includes(q) ||
            r.address.toLowerCase().includes(q) ||
            r.ticket_number.toLowerCase().includes(q) ||
            r.city.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q) ||
            (r.description && r.description.toLowerCase().includes(q));
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (activeTab === 'petition') return b.upvote_count - a.upvote_count;
        if (activeTab === 'onprocess') return b.upvote_count - a.upvote_count;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [reports, activeTab, selectedCity, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search & Jabodetabek Region Filter Card (Google Minimalist Style) */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari jalan rusak, banjir, drainase, no. tiket, atau lokasi di Jabodetabek..."
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
              Menemukan <strong className="text-slate-900 font-semibold">{activeTab === 'fyp' ? fypRecommendations.length : displayedReports.length}</strong> laporan untuk pencarian &quot;{searchQuery}&quot;
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

        {/* Feed Mode Segmented Tabs (FYP, Petisi Populer, On-Process, Peta Jabodetabek) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60 overflow-x-auto scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('fyp')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'fyp'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Untuk Anda (FYP Harian)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('petition')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'petition'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              <span>Petisi Terpopuler</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('onprocess')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'onprocess'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Sedang Dikerjakan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Peta Jabodetabek (Free OSM)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Target: <strong>Jabodetabek</strong></span>
          </div>
        </div>

        {/* Jabodetabek City Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Kota:
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

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Kategori:
          </span>
          {['Semua', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Filters Bar */}
        {(selectedCity !== 'Semua' || selectedCategory !== 'Semua' || searchQuery) && (
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
            {selectedCategory !== 'Semua' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-medium shadow-2xs">
                <span>Kategori: <strong>{selectedCategory}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Semua')}
                  className="hover:text-rose-900 ml-0.5 cursor-pointer"
                  title="Hapus filter kategori"
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
                setSelectedCategory('Semua');
                setSearchQuery('');
              }}
              className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold underline underline-offset-2 ml-auto cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </section>

      {/* Main Tab View Content */}
      {activeTab === 'map' ? (
        /* 1. Free Jabodetabek Map View */
        <div id="peta" className="scroll-mt-20">
          <JabodetabekMap
            reports={reports}
            selectedCity={selectedCity}
            onSelectCity={(c) => setSelectedCity(c)}
            cityRankings={cityRankings}
            searchQuery={searchQuery}
          />
        </div>
      ) : activeTab === 'fyp' ? (
        /* 2. FYP (For You Page) Machine Learning Daily Recommendations */
        <section className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Algoritma FYP (Rekomendasi Warga Harian)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Model heuristic ringan di-update 1 hari sekali untuk meminimalkan beban latensi. Menyorot isu kritis, petisi warga terdekat, dan respon satgas pemda.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 self-start sm:self-center">
              Latency: &lt;1ms
            </span>
          </div>

          <div className="space-y-3.5">
            {fypRecommendations.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 space-y-3">
                <p className="text-sm font-medium text-slate-600">
                  {searchQuery ? `Tidak ditemukan laporan rekomendasi untuk "${searchQuery}".` : 'Tidak ada rekomendasi laporan yang sesuai.'}
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
              fypRecommendations.map((item, idx) => {
              const rep = item.report;
              const isUpvoted = upvotedIds.has(rep.id);

              return (
                <div key={rep.id}>
                  <Link href={`/laporan/${rep.ticket_number}`} className="block group">
                    <article className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs space-y-3">
                      {/* Badge Banner & FYP Reason */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/70">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {item.reason}
                          </span>
                          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {rep.city}
                          </span>
                        </div>
                        <StatusBadge status={rep.status} />
                      </div>

                      {/* Main Content Layout */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Thumbnail */}
                        <div className="relative w-full sm:w-48 h-40 sm:h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                          <img
                            src={rep.before_image_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/60 text-white backdrop-blur-xs">
                            {rep.ticket_number}
                          </span>
                        </div>

                        {/* Text & Petition bar */}
                        <div className="flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                              {rep.title}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{rep.address}</span>
                            </p>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {rep.description}
                            </p>
                          </div>

                          {/* Petition support progress bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-medium text-slate-700">
                                Dukungan Petisi: <strong>{rep.upvote_count}</strong> warga
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                Target: {item.petitionTarget} dukungan
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full transition-all duration-300"
                                style={{ width: `${item.petitionProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <span>Pelapor: <strong className="text-slate-700 font-medium">{rep.reporter_name || 'Warga'}</strong></span>
                          <span>•</span>
                          <span>Instansi: <strong className="text-slate-700 font-medium">{rep.agency}</strong></span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Sign petition button */}
                          <button
                            type="button"
                            onClick={(e) => handleSignPetition(e, rep)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                              isUpvoted
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{isUpvoted ? 'Didukung' : 'Dukung Petisi'} ({rep.upvote_count})</span>
                          </button>

                          <span className="text-xs font-semibold text-slate-700 group-hover:text-rose-600 inline-flex items-center gap-0.5">
                            Detail <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              );
            }))}
          </div>
        </section>
      ) : (
        /* 3. Feed (Petisi Populer / On-Process Filter) */
        <section className="space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Menampilkan <strong className="text-slate-900 font-semibold">{displayedReports.length}</strong> laporan di Jabodetabek
            </span>
            <span>
              {activeTab === 'onprocess'
                ? 'Status: Sedang Ditangani Pemda'
                : 'Urutan: Petisi Tertinggi'}
            </span>
          </div>

          {displayedReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 space-y-3">
              <p className="text-sm font-medium text-slate-600">
                Tidak ada laporan yang sesuai dengan filter di wilayah ini.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCity('Semua');
                  setSelectedCategory('Semua');
                  setSearchQuery('');
                  setActiveTab('fyp');
                }}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium cursor-pointer"
              >
                Reset Filter ke FYP
              </button>
            </div>
          ) : (
            displayedReports.map((rep) => {
              const isUpvoted = upvotedIds.has(rep.id);
              return (
                <div key={rep.id}>
                  <Link href={`/laporan/${rep.ticket_number}`} className="block group">
                    <article className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {rep.city}
                          </span>
                          <span className="font-medium text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                            {rep.category}
                          </span>
                        </div>
                        <StatusBadge status={rep.status} />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-48 h-36 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={rep.before_image_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/60 text-white backdrop-blur-xs">
                            {rep.ticket_number}
                          </span>
                        </div>

                        <div className="flex-1 flex flex-col justify-between space-y-1.5">
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                              {rep.title}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{rep.address}</span>
                            </p>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {rep.description}
                            </p>
                          </div>

                          <div className="text-[11px] text-slate-500">
                            Didukung oleh <strong>{rep.upvote_count}</strong> warga sebagai petisi mendesak.
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-slate-400 text-[11px]">
                          Instansi: <strong className="text-slate-700 font-medium">{rep.agency}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleSignPetition(e, rep)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                              isUpvoted
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{isUpvoted ? 'Didukung' : 'Dukung Petisi'} ({rep.upvote_count})</span>
                          </button>

                          <span className="text-xs font-semibold text-slate-700 group-hover:text-rose-600 inline-flex items-center gap-0.5">
                            Detail <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}
