'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Layers,
  ChevronRight,
  TrendingUp,
  Maximize2,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { JABODETABEK_COORDS, JABODETABEK_CITY_RANKINGS } from '@/lib/constants';
import type { Report } from '@/lib/types';

interface Props {
  reports: Report[];
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  height?: string;
  interactiveSelect?: boolean;
  onCoordinatePicked?: (lat: number, lng: number) => void;
}

export function JabodetabekMap({
  reports,
  selectedCity = 'Semua',
  onSelectCity,
  height = '520px',
  interactiveSelect = false,
  onCoordinatePicked,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const comparisonLayerRef = useRef<any>(null);

  const [mode, setMode] = useState<'reports' | 'comparison'>('reports');
  const [activeReport, setActiveReport] = useState<Report | null>(reports[0] || null);

  useEffect(() => {
    let isMounted = true;

    // Dynamically import Leaflet in browser only
    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Prevent re-initialization if already created
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center of Jabodetabek (Jakarta - Depok - Tangerang - Bekasi)
      const map = L.map(mapContainerRef.current, {
        center: [-6.24, 106.82],
        zoom: 11,
        minZoom: 9,
        maxZoom: 18,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Pale minimalist CartoDB Positron tiles (Google / Apple Maps minimal aesthetic)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      const comparisonGroup = L.layerGroup();

      markersLayerRef.current = markersGroup;
      comparisonLayerRef.current = comparisonGroup;
      mapInstanceRef.current = map;

      // Click event for interactive picking (e.g. in /lapor page)
      if (interactiveSelect) {
        let tempMarker: any = null;
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          if (tempMarker) map.removeLayer(tempMarker);
          tempMarker = L.marker([lat, lng], {
            icon: L.divIcon({
              className: 'custom-pin-picker',
              html: `
                <div style="background-color: #e11d48; width: 26px; height: 26px; border-radius: 9999px; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
              `,
              iconSize: [26, 26],
              iconAnchor: [13, 26],
            }),
          }).addTo(map);

          if (onCoordinatePicked) {
            onCoordinatePicked(parseFloat(lat.toFixed(4)), parseFloat(lng.toFixed(4)));
          }
        });
      }

      renderMarkers(L, map, markersGroup, comparisonGroup);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [interactiveSelect]);

  // Re-render markers when reports or selectedCity changes
  const renderMarkers = (L: any, map: any, markersGroup: any, comparisonGroup: any) => {
    markersGroup.clearLayers();
    comparisonGroup.clearLayers();

    // 1. Report Pins
    reports.forEach((rep) => {
      if (selectedCity !== 'Semua' && rep.city !== selectedCity) return;

      const color =
        rep.status === 'Selesai'
          ? '#10b981' // Emerald
          : rep.status === 'On-Process'
          ? '#f59e0b' // Amber
          : rep.status === 'Ditolak'
          ? '#94a3b8' // Slate
          : '#e11d48'; // Rose (Menunggu / Prioritas)

      const pinIcon = L.divIcon({
        className: 'jabodetabek-report-marker',
        html: `
          <div style="
            background-color: ${color};
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 9999px;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.18);
            display: flex;
            align-items: center;
            gap: 3px;
            cursor: pointer;
            white-space: nowrap;
          ">
            <span>${rep.status === 'Selesai' ? '✓' : rep.upvote_count}</span>
          </div>
        `,
        iconSize: [36, 22],
        iconAnchor: [18, 11],
      });

      const marker = L.marker([rep.latitude, rep.longitude], { icon: pinIcon });

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

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setActiveReport(rep);
      });

      markersGroup.addLayer(marker);
    });

    // 2. City Comparison Circles (Comparative Dashboard Mode)
    JABODETABEK_CITY_RANKINGS.forEach((rank) => {
      const coord = JABODETABEK_COORDS[rank.city];
      if (!coord) return;

      const circle = L.circle([coord.lat, coord.lng], {
        color: '#e11d48',
        fillColor: '#fda4af',
        fillOpacity: 0.25,
        radius: 2800,
        weight: 1.5,
      });

      const labelMarker = L.marker([coord.lat, coord.lng], {
        icon: L.divIcon({
          className: 'city-stat-bubble',
          html: `
            <div style="
              background: white;
              padding: 5px 8px;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
              text-align: center;
              font-family: system-ui;
              cursor: pointer;
            ">
              <div style="font-size: 11px; font-weight: 700; color: #0f172a;">${rank.city}</div>
              <div style="font-size: 9px; color: #10b981; font-weight: 600;">Tuntas: ${rank.resolved_rate}%</div>
              <div style="font-size: 9px; color: #64748b;">${rank.total_reports} Pengaduan</div>
            </div>
          `,
          iconSize: [110, 48],
          iconAnchor: [55, 24],
        }),
      });

      comparisonGroup.addLayer(circle);
      comparisonGroup.addLayer(labelMarker);
    });
  };

  // Fly to selected city
  const handleCityClick = async (city: string) => {
    if (onSelectCity) onSelectCity(city);

    if (mapInstanceRef.current) {
      if (city === 'Semua') {
        mapInstanceRef.current.flyTo([-6.24, 106.82], 11, { duration: 1.2 });
      } else if (JABODETABEK_COORDS[city]) {
        const { lat, lng, zoom } = JABODETABEK_COORDS[city];
        mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
      }
    }
  };

  // Toggle mode
  const handleToggleMode = (newMode: 'reports' | 'comparison') => {
    setMode(newMode);
    if (!mapInstanceRef.current) return;
    if (newMode === 'comparison') {
      if (markersLayerRef.current) mapInstanceRef.current.removeLayer(markersLayerRef.current);
      if (comparisonLayerRef.current) mapInstanceRef.current.addLayer(comparisonLayerRef.current);
      mapInstanceRef.current.flyTo([-6.25, 106.85], 11);
    } else {
      if (comparisonLayerRef.current) mapInstanceRef.current.removeLayer(comparisonLayerRef.current);
      if (markersLayerRef.current) mapInstanceRef.current.addLayer(markersLayerRef.current);
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
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Free OSM
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Pantau titik masalah, progres perbaikan, dan evaluasi respon pemda setempat.
            </p>
          </div>
        </div>

        {/* View mode toggle: Reports vs Comparison */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/60 text-xs">
          <button
            type="button"
            onClick={() => handleToggleMode('reports')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
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
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
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
            className={`px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition-colors ${
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
                {JABODETABEK_CITY_RANKINGS.slice(0, 4).map((r) => (
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
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${r.resolved_rate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>{r.total_reports} Pengaduan</span>
                      <span>User: {r.user_count.toLocaleString('id-ID')}</span>
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
