'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  MapPin,
  ChevronRight,
  TrendingUp,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { JABODETABEK_COORDS, JABODETABEK_CITY_RANKINGS, isSameCity } from '@/lib/constants';
import type { Report } from '@/lib/types';

interface Props {
  reports: Report[];
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  height?: string;
  interactiveSelect?: boolean;
  onCoordinatePicked?: (lat: number, lng: number) => void;
  cityRankings?: any[];
  searchQuery?: string;
}

export function JabodetabekMap({
  reports,
  selectedCity = 'Semua',
  onSelectCity,
  height = '520px',
  interactiveSelect = false,
  onCoordinatePicked,
  cityRankings,
  searchQuery,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const reportMarkersRef = useRef<any[]>([]);
  const comparisonMarkersRef = useRef<any[]>([]);
  const pickerMarkerRef = useRef<any>(null);

  const [mode, setMode] = useState<'reports' | 'comparison'>('reports');
  const [activeReport, setActiveReport] = useState<Report | null>(reports[0] || null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initMaplibre() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const maplibreglMod = await import('maplibre-gl');
      const maplibregl: any = (maplibreglMod as any).default || maplibreglMod;

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize MapLibre with OpenFreeMap Bright mode style
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/bright',
        center: [106.8272, -6.2], // [lng, lat] for Jabodetabek center
        zoom: 10.8,
        minZoom: 8,
        maxZoom: 18,
        attributionControl: false,
      });

      // Controls
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        }),
        'bottom-left'
      );

      map.on('error', (e: any) => {
        console.warn('MapLibre notice:', e);
      });

      map.on('load', () => {
        if (!isMounted) return;
        mapInstanceRef.current = map;
        setMapLoaded(true);
        map.resize();
        renderAllMarkers(maplibregl, map);

        // Second resize tick to guarantee container calculation
        setTimeout(() => {
          if (isMounted && map) {
            map.resize();
          }
        }, 150);
      });

      // Coordinate picker for /lapor page
      if (interactiveSelect) {
        map.on('click', (e: any) => {
          const { lng, lat } = e.lngLat;

          if (pickerMarkerRef.current) {
            pickerMarkerRef.current.remove();
          }

          const el = document.createElement('div');
          el.className = 'custom-pin-picker animate-bounce';
          el.style.cursor = 'pointer';
          el.innerHTML = `
            <div style="background-color: #e11d48; width: 30px; height: 30px; border-radius: 9999px; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; cursor: pointer;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          `;

          el.addEventListener('mousedown', (ev) => ev.stopPropagation());
          el.addEventListener('touchstart', (ev) => ev.stopPropagation(), { passive: true });
          el.addEventListener('click', (ev) => ev.stopPropagation());

          const newPicker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([lng, lat])
            .addTo(map);

          pickerMarkerRef.current = newPicker;

          if (onCoordinatePicked) {
            onCoordinatePicked(parseFloat(lat.toFixed(4)), parseFloat(lng.toFixed(4)));
          }
        });
      }
    }

    initMaplibre();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [interactiveSelect]);

  // Render report markers and comparison markers
  const renderAllMarkers = (maplibregl: any, map: any) => {
    // Clear existing
    reportMarkersRef.current.forEach((m) => m.remove());
    comparisonMarkersRef.current.forEach((m) => m.remove());
    reportMarkersRef.current = [];
    comparisonMarkersRef.current = [];

    // 1. Report pins
    reports.forEach((rep) => {
      if (!isSameCity(rep.city, selectedCity)) return;

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          rep.title.toLowerCase().includes(q) ||
          rep.address.toLowerCase().includes(q) ||
          rep.ticket_number.toLowerCase().includes(q) ||
          rep.city.toLowerCase().includes(q) ||
          rep.category.toLowerCase().includes(q) ||
          (rep.description && rep.description.toLowerCase().includes(q));
        if (!matches) return;
      }

      const color =
        rep.status === 'Selesai'
          ? '#10b981' // Emerald
          : rep.status === 'On-Process'
          ? '#f59e0b' // Amber
          : rep.status === 'Ditolak'
          ? '#94a3b8' // Slate
          : '#e11d48'; // Rose (Menunggu / Prioritas)

      const el = document.createElement('div');
      el.className = 'openfreemap-report-pin';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="
          background-color: ${color};
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.28);
          display: flex;
          align-items: center;
          gap: 3px;
          white-space: nowrap;
          cursor: pointer;
          user-select: none;
          pointer-events: auto;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        " onmouseover="this.style.transform='scale(1.15)'; this.style.zIndex='9999';" onmouseout="this.style.transform='scale(1)'; this.style.zIndex='auto';">
          <span>${rep.status === 'Selesai' ? '✓' : rep.upvote_count}</span>
        </div>
      `;

      const popupHtml = `
        <div style="width: 240px; font-family: system-ui, sans-serif;">
          <div style="position: relative; height: 110px; background-color: #f1f5f9; overflow: hidden;">
            <img src="${rep.before_image_url}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 8px; left: 8px; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: rgba(15, 23, 42, 0.85); color: white;">
              ${rep.city}
            </span>
          </div>
          <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;">
            <div style="font-size: 11px; font-weight: 700; color: #0f172a; line-height: 1.3;">
              ${rep.title}
            </div>
            <div style="font-size: 10px; color: #64748b;">
              ${rep.address}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid #f1f5f9;">
              <span style="font-size: 10px; font-weight: 600; color: ${color};">
                ● ${rep.status}
              </span>
              <a href="/laporan/${rep.ticket_number}" style="font-size: 10px; font-weight: 600; color: #e11d48; text-decoration: none;">
                Buka Detail →
              </a>
            </div>
          </div>
        </div>
      `;

      const lng = parseFloat(String(rep.longitude));
      const lat = parseFloat(String(rep.latitude));
      if (isNaN(lng) || isNaN(lat)) return;

      const popup = new maplibregl.Popup({ offset: 12, closeButton: true }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      // Stop mousedown and touchstart propagation so clicking pin NEVER drags the map
      el.addEventListener('mousedown', (ev) => {
        ev.stopPropagation();
      });
      el.addEventListener('touchstart', (ev) => {
        ev.stopPropagation();
      }, { passive: true });

      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        setActiveReport(rep);
        marker.togglePopup();
        map.flyTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), 13),
          duration: 600,
        });
      });

      reportMarkersRef.current.push(marker);
    });

    // 2. Comparison Mode Markers (Dynamic live from database)
    const activeRankings =
      cityRankings && cityRankings.length > 0 ? cityRankings : JABODETABEK_CITY_RANKINGS;

    activeRankings.forEach((rank: any) => {
      const coord = JABODETABEK_COORDS[rank.city];
      if (!coord) return;

      const compEl = document.createElement('div');
      compEl.className = 'city-comparison-bubble cursor-pointer';
      compEl.style.cursor = 'pointer';
      compEl.innerHTML = `
        <div style="
          background: white;
          padding: 6px 10px;
          border-radius: 14px;
          border: 1.5px solid #fda4af;
          box-shadow: 0 4px 14px rgba(225, 29, 72, 0.18);
          text-align: center;
          font-family: system-ui;
          cursor: pointer;
          user-select: none;
          pointer-events: auto;
          transition: transform 0.15s ease;
        " onmouseover="this.style.transform='scale(1.08)';" onmouseout="this.style.transform='scale(1)';">
          <div style="font-size: 11px; font-weight: 700; color: #0f172a;">${rank.city}</div>
          <div style="font-size: 10px; color: #10b981; font-weight: 700;">Tuntas: ${rank.resolved_rate}%</div>
          <div style="font-size: 9px; color: #64748b;">${rank.total_reports} Pengaduan</div>
        </div>
      `;

      compEl.addEventListener('mousedown', (ev) => {
        ev.stopPropagation();
      });
      compEl.addEventListener('touchstart', (ev) => {
        ev.stopPropagation();
      }, { passive: true });

      compEl.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (onSelectCity) onSelectCity(rank.city);
        map.flyTo({ center: [coord.lng, coord.lat], zoom: 12.5, duration: 600 });
      });

      const compMarker = new maplibregl.Marker({ element: compEl })
        .setLngLat([coord.lng, coord.lat])
        .addTo(map);

      // Hide initially if mode === 'reports'
      if (mode === 'reports') {
        compEl.style.display = 'none';
      }

      comparisonMarkersRef.current.push(compMarker);
    });
  };

  // Re-render when reports, selectedCity or searchQuery changes and map is ready
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      import('maplibre-gl').then((mod: any) => {
        const lib = mod.default || mod;
        renderAllMarkers(lib, mapInstanceRef.current);
      });
    }
  }, [reports, selectedCity, cityRankings, mapLoaded, searchQuery]);

  // Synchronize active report and smoothly fly to city on filter change
  useEffect(() => {
    if (selectedCity && selectedCity !== 'Semua') {
      const match = reports.find((r) => isSameCity(r.city, selectedCity));
      if (match) {
        setActiveReport(match);
      }
    }

    if (mapLoaded && mapInstanceRef.current) {
      if (selectedCity === 'Semua') {
        mapInstanceRef.current.flyTo({
          center: [106.82, -6.24],
          zoom: 11,
          duration: 900,
        });
      } else {
        const coord =
          JABODETABEK_COORDS[selectedCity] ||
          Object.entries(JABODETABEK_COORDS).find(([k]) => isSameCity(k, selectedCity))?.[1];

        if (coord) {
          mapInstanceRef.current.flyTo({
            center: [coord.lng, coord.lat],
            zoom: coord.zoom || 13,
            duration: 900,
          });
        }
      }
    }
  }, [selectedCity, mapLoaded, reports]);

  // Handle City flyTo
  const handleCityClick = (city: string) => {
    if (onSelectCity) onSelectCity(city);

    if (mapInstanceRef.current) {
      if (city === 'Semua') {
        mapInstanceRef.current.flyTo({
          center: [106.82, -6.24],
          zoom: 11,
          duration: 1200,
        });
      } else if (JABODETABEK_COORDS[city]) {
        const { lat, lng, zoom } = JABODETABEK_COORDS[city];
        mapInstanceRef.current.flyTo({
          center: [lng, lat],
          zoom: zoom || 13,
          duration: 1200,
        });
      }
    }
  };

  // Toggle mode: reports vs comparison
  const handleToggleMode = (newMode: 'reports' | 'comparison') => {
    setMode(newMode);

    reportMarkersRef.current.forEach((m) => {
      const el = m.getElement();
      if (el) el.style.display = newMode === 'reports' ? 'block' : 'none';
    });

    comparisonMarkersRef.current.forEach((m) => {
      const el = m.getElement();
      if (el) el.style.display = newMode === 'comparison' ? 'block' : 'none';
    });

    if (mapInstanceRef.current && newMode === 'comparison') {
      mapInstanceRef.current.flyTo({
        center: [106.84, -6.25],
        zoom: 11,
        duration: 1000,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-0">
      {/* Top Map Control Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span>Peta Sebaran Pengaduan Warga Jabodetabek</span>
              <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                OpenFreeMaps • Bright Mode
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Vektor peta terang, tajam, dan cepat berbasis OpenFreeMap.
            </p>
          </div>
        </div>

        {/* View mode toggle: Reports vs Comparison */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/60 text-xs">
          <button
            type="button"
            onClick={() => handleToggleMode('reports')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
              mode === 'reports'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Titik Masalah
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('comparison')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
              mode === 'comparison'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Perbandingan Kota
          </button>
        </div>
      </div>

      {/* City quick filter pills */}
      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
          Wilayah:
        </span>
        {['Semua', ...Object.keys(JABODETABEK_COORDS)].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleCityClick(c)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition-colors cursor-pointer ${
              selectedCity === c
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Map Canvas + Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 relative">
        <div className="lg:col-span-3 relative" style={{ height }}>
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Map Legend Floating */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" /> Selesai
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" /> Sedang Dikerjakan
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-200" /> Prioritas Petisi
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Ditolak
            </span>
          </div>
        </div>

        {/* Side Panel: Active Selected Pin or Comparison Summary */}
        <div className="p-4 bg-white border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-between space-y-4">
          {mode === 'reports' ? (
            activeReport ? (
              <div className="space-y-3">
                <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80">
                  <img
                    src={activeReport.before_image_url}
                    alt={activeReport.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-xs">
                      {activeReport.city}
                    </span>
                  </div>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/70 text-white">
                    {activeReport.ticket_number}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {activeReport.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mt-1.5 line-clamp-2 leading-snug">
                    {activeReport.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-start gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{activeReport.address}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Dukungan:</span>
                  <strong className="text-slate-900">{activeReport.upvote_count} Petisi</strong>
                </div>

                <Link
                  href={`/laporan/${activeReport.ticket_number}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Buka Detail & Ikut Petisi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                Pilih salah satu pin pada peta Jabodetabek untuk melihat detail masalah.
              </div>
            )
          ) : (
            /* Comparison Mode Summary */
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                  Dashboard Perbandingan
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  KPI Kota Se-Jabodetabek
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rasio tuntas masalah berbanding populasi pengguna terdaftar.
                </p>
              </div>

              <div className="space-y-2 pt-1 max-h-[340px] overflow-y-auto pr-1">
                {(cityRankings && cityRankings.length > 0 ? cityRankings : JABODETABEK_CITY_RANKINGS)
                  .slice(0, 4)
                  .map((r: any) => (
                    <div
                      key={r.city}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-slate-900 font-semibold">{r.city}</strong>
                        <span className="text-emerald-700 font-bold">{r.resolved_rate}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${r.resolved_rate}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>{r.total_reports} Pengaduan</span>
                        <span>User: {(r.user_count || 1200).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span>
                      </div>
                    </div>
                  ))}
              </div>

              <Link
                href="/gov-admin"
                className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Lihat Tabel KPI Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
