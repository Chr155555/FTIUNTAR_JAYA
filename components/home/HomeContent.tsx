'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  ThumbsUp,
  ChevronRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AnnouncementBanner } from '@/components/home/AnnouncementBanner';
import { CityRanking } from '@/components/home/CityRanking';
import { JabodetabekMap } from '@/components/map/JabodetabekMap';
import { CITIES, isSameCity } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import type { Report, PublicNotice } from '@/lib/types';

export function HomeContent({
  initialReports,
  notices,
  cityRankings,
}: {
  initialReports: Report[];
  notices?: PublicNotice[];
  cityRankings?: Record<string, unknown>[];
}) {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>(initialReports);

  // Sidebar navigation: Petisi Terpopuler (default), Sedang Dikerjakan, Peta Jabodetabek
  const [activeTab, setActiveTab] = useState<'petition' | 'onprocess' | 'map'>('petition');
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  // Listen for URL params or hash to switch tab/city
  useEffect(() => {
    const checkUrl = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const c = params.get('city');
      if (c) setSelectedCity(c);
      const t = params.get('tab');
      if (t === 'onprocess' || t === 'petition' || t === 'map') {
        setActiveTab(t);
      }
      if (window.location.hash === '#peta') {
        setActiveTab('map');
        setTimeout(() => {
          const el = document.getElementById('peta');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else if (window.location.hash === '#onprocess') {
        setActiveTab('onprocess');
      } else if (window.location.hash === '#petition') {
        setActiveTab('petition');
      }
    };
    checkUrl();
    window.addEventListener('hashchange', checkUrl);
    return () => window.removeEventListener('hashchange', checkUrl);
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

  // Filter reports based on active tab, selected city, and search query
  const displayedReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (!isSameCity(r.city, selectedCity)) return false;

        // On-Process filter
        if (activeTab === 'onprocess' && r.status !== 'On-Process') return false;

        // Search query filter across all relevant fields
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
        // Petisi Terpopuler & On-Process sorted by upvote count descending
        if (activeTab === 'petition' || activeTab === 'onprocess') {
          return b.upvote_count - a.upvote_count;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [reports, activeTab, selectedCity, searchQuery]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* LEFT SIDEBAR: MENU UTAMA & WILAYAH KOTA */}
      <aside className="w-full lg:w-60 xl:w-64 shrink-0 space-y-4 lg:sticky lg:top-20">
        {/* Card 1: MENU UTAMA */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <h2 className="text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-2.5">
            MENU UTAMA
          </h2>

          <button
            type="button"
            onClick={() => setActiveTab('petition')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'petition'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Petisi Terpopuler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('onprocess')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'onprocess'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Sedang Dikerjakan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Peta Jabodetabek</span>
          </button>
        </div>

        {/* Card 2: WILAYAH KOTA */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <h2 className="text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-2.5">
            WILAYAH KOTA
          </h2>

          <div className="space-y-0.5">
            {['Semua', ...CITIES].map((city) => {
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                  }`}
                >
                  <span>{city}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white ml-2 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 space-y-4">
        {activeTab === 'map' ? (
          /* Interactive Jabodetabek Map */
          <div id="peta" className="scroll-mt-20">
            <JabodetabekMap
              reports={reports}
              selectedCity={selectedCity}
              onSelectCity={(c) => setSelectedCity(c)}
              cityRankings={cityRankings}
              searchQuery={searchQuery}
            />
          </div>
        ) : (
          <>
            {/* 1. Pemberitahuan Pekerjaan Umum Banner */}
            <AnnouncementBanner notices={notices} />

            {/* 2. Indeks Efektivitas & Kepuasan Penanganan Masalah */}
            <CityRanking rankings={cityRankings} />

            {/* 3. Search Bar */}
            <div className="relative pt-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jalan rusak, banjir, drainase, no. tiket, atau lokasi di Jabodetabek..."
                className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200/90 rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs cursor-pointer transition-colors"
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 4. Results counter & Sort status */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 px-1 pt-1">
              <strong className="font-bold text-slate-900">
                Menampilkan {displayedReports.length} laporan di Jabodetabek
              </strong>
              <strong className="font-bold text-slate-900">
                {activeTab === 'onprocess' ? 'Status: Sedang Dikerjakan' : 'Urutan: Petisi Tertinggi'}
              </strong>
            </div>

            {/* 5. Report Cards List */}
            {displayedReports.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 space-y-3">
                <p className="text-sm font-medium text-slate-600">
                  {searchQuery
                    ? `Tidak ditemukan laporan untuk "${searchQuery}".`
                    : 'Tidak ada laporan yang sesuai dengan filter wilayah ini.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity('Semua');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  Reset Filter & Pencarian
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {displayedReports.map((rep) => {
                  const isUpvoted = upvotedIds.has(rep.id);

                  return (
                    <article
                      key={rep.id}
                      className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs space-y-3"
                    >
                      {/* Top Header: City & Category pills + StatusBadge */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-medium text-slate-700 bg-slate-100 px-3 py-0.5 rounded-full">
                            {rep.city}
                          </span>
                          <span className="font-medium text-slate-600 bg-slate-100 px-3 py-0.5 rounded-full">
                            {rep.category}
                          </span>
                        </div>
                        <StatusBadge status={rep.status} />
                      </div>

                      {/* Middle Body: Thumbnail & Details */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {/* Thumbnail with Ticket Badge */}
                        <div className="relative w-full sm:w-48 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                          <img
                            src={rep.before_image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono">
                            {rep.ticket_number}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <Link href={`/laporan/${rep.ticket_number}`} className="block group">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-slate-600 group-active:text-slate-700 transition-colors leading-snug line-clamp-1">
                              {rep.title}
                            </h3>
                          </Link>

                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{rep.address}</span>
                          </p>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {rep.description}
                          </p>

                          <div className="text-xs text-slate-500 pt-1">
                            Didukung oleh <strong className="text-slate-800 font-semibold">{rep.upvote_count}</strong> warga sebagai petisi mendesak.
                          </div>
                        </div>
                      </div>

                      {/* Bottom Footer: Instansi & Actions */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-slate-400 text-[11px]">
                          Instansi: <span className="text-slate-700 font-medium">{rep.agency}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleSignPetition(e, rep)}
                            className={`border rounded-full px-3.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isUpvoted
                                ? 'bg-rose-600 border-rose-600 text-white shadow-2xs'
                                : 'border-slate-200/90 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Dukung Petisi ({rep.upvote_count})</span>
                          </button>

                          <Link
                            href={`/laporan/${rep.ticket_number}`}
                            className="text-xs text-slate-700 hover:text-slate-900 font-medium inline-flex items-center gap-0.5 ml-1"
                          >
                            <span>Detail</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
