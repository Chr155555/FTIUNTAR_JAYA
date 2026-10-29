'use client';

import { useState, useMemo } from 'react';
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
import { CITIES, CATEGORIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import type { Report, PublicNotice } from '@/lib/types';
import { AnnouncementBanner } from '@/components/home/AnnouncementBanner';
import { CityRanking } from '@/components/home/CityRanking';

export function HomeContent({
  initialReports,
  notices = [],
  cityRankings = [],
}: {
  initialReports: Report[];
  notices?: PublicNotice[];
  cityRankings?: any[];
}) {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>(initialReports);

  // Feed tabs: FYP (Machine Learning recommendation), Petisi (Popular), On-Process (Active), Map
  const [activeTab, setActiveTab] = useState<'petition' | 'onprocess' | 'map'>('petition');
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

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
    return calculateDailyFYP(reports, selectedCity === 'Semua' ? 'Jakarta Barat' : selectedCity);
  }, [reports, selectedCity]);

  // 2. Filter reports based on active tab and criteria
  const displayedReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (selectedCity !== 'Semua' && r.city !== selectedCity) return false;
        if (selectedCategory !== 'Semua' && r.category !== selectedCategory) return false;

        // Specific tab filter
        if (activeTab === 'onprocess' && r.status !== 'On-Process') return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (
            !r.title.toLowerCase().includes(q) &&
            !r.address.toLowerCase().includes(q) &&
            !r.ticket_number.toLowerCase().includes(q) &&
            !r.city.toLowerCase().includes(q)
          ) {
            return false;
          }
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
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* SISI KIRI: Sidebar Navigation & List Kota Jabodetabek */}
      <aside className="w-full lg:w-64 shrink-0 space-y-4 lg:sticky lg:top-20">
        {/* Menu Kategori / Tabs */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-900">
            Menu Utama
          </div>
          


          <button
            type="button"
            onClick={() => setActiveTab('petition')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'petition'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${activeTab === 'petition' ? 'text-white' : 'text-slate-700'}`} />
            <span>Petisi Terpopuler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('onprocess')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'onprocess'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'onprocess' ? 'text-white' : 'text-slate-700'}`} />
            <span>Sedang Dikerjakan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <MapPin className={`w-4 h-4 ${activeTab === 'map' ? 'text-white' : 'text-slate-700'}`} />
            <span>Peta Jabodetabek</span>
          </button>
        </div>

        {/* Daftar List Kota Jabodetabek Vertikal */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-900">
            Wilayah Kota
          </div>

          <div className="space-y-0.5 max-h-[380px] overflow-y-auto pr-1">
            {['Semua', ...CITIES].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCity(c)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                  selectedCity === c
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>{c}</span>
                {selectedCity === c && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* SISI KANAN: Header Content, Search Bar & Feed / Peta */}
      <div className="flex-1 min-w-0 space-y-6 w-full">
        {/* Pemberitahuan & KPI Kota */}
        <AnnouncementBanner notices={notices} />
        <CityRanking rankings={cityRankings} />

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari jalan rusak, banjir, drainase, no. tiket, atau lokasi di Jabodetabek..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/80 shadow-2xs rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-all"
          />
        </div>

      {/* Main Tab View Content */}
      {activeTab === 'map' ? (
        /* 1. Free Jabodetabek Map View */
        <div id="peta" className="scroll-mt-20">
          <JabodetabekMap
            reports={reports}
            selectedCity={selectedCity}
            onSelectCity={(c) => setSelectedCity(c)}
          />
        </div>
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
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900  transition-colors leading-snug">
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

                          <span className="text-xs font-semibold text-slate-700  inline-flex items-center gap-0.5">
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
    </div>
  );
}
