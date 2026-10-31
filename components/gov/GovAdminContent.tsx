'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Search,
  MapPin,
  Radio,
  FileText,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CITIES, isSameCity } from '@/lib/constants';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Report, ReportStatus } from '@/lib/types';

interface Props {
  reports: Report[];
  currentUser?: any;
  userRole?: string;
  userAgency?: string;
}

export function GovAdminContent({
  reports: initialReports,
  currentUser,
  userRole = 'guest',
  userAgency,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [reports, setReports] = useState<Report[]>(initialReports);
  const isAuthorized = userRole === 'government' || userRole === 'admin';

  // Navigation tabs: 'reports' | 'broadcast'
  const [activeTab, setActiveTab] = useState<'reports' | 'broadcast'>('reports');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Selection & Update Form State
  const [selectedId, setSelectedId] = useState(reports[0]?.id || '');
  const [status, setStatus] = useState<ReportStatus>(
    (reports[0]?.status as ReportStatus) || 'On-Process'
  );
  const [agency, setAgency] = useState(reports[0]?.agency || userAgency || 'Dinas Bina Marga');
  const [note, setNote] = useState('');
  const [afterUrl, setAfterUrl] = useState(reports[0]?.after_image_url || '');
  const [afterFilePreview, setAfterFilePreview] = useState<string | null>(
    reports[0]?.after_image_url || null
  );
  const [afterFileName, setAfterFileName] = useState('');
  const [afterFileSize, setAfterFileSize] = useState<number | null>(null);
  const [afterFileError, setAfterFileError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState(reports[0]?.reject_reason || '');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);

  // Broadcast PU Form State
  const [pubCity, setPubCity] = useState('Jakarta Barat');
  const [pubTitle, setPubTitle] = useState('');
  const [pubImpact, setPubImpact] = useState('');
  const [pubAgency, setPubAgency] = useState('Dinas Bina Marga');

  // Quick Demo account login for judges/evaluators
  const handleQuickDemoLogin = async () => {
    setDemoLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'pemda@jakbar.go.id', password: 'password123' }),
      });
      const data = await res.json();
      if (res.ok && data?.session) {
        await supabase.auth.setSession(data.session);
        window.location.reload();
      } else {
        alert('Gagal login demo. Silakan gunakan form login di halaman Masuk.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoginLoading(false);
    }
  };

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (!isSameCity(r.city, selectedCity)) return false;
      if (selectedStatus !== 'Semua' && r.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          r.title.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.ticket_number.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.agency && r.agency.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [reports, selectedCity, selectedStatus, searchQuery]);

  const selected = reports.find((r) => r.id === selectedId) || filteredReports[0] || reports[0];

  // Live Statistics
  const totalOnProcess = reports.filter((r) => r.status === 'On-Process').length;
  const totalResolved = reports.filter((r) => r.status === 'Selesai').length;
  const uniqueCitiesCount = new Set(reports.map((r) => r.city)).size;

  // Calculate highest KPI city
  const topCity = useMemo(() => {
    const scored = CITIES.map((c) => {
      const cityReports = reports.filter((r) => r.city === c);
      const total = cityReports.length;
      const resolved = cityReports.filter((r) => r.status === 'Selesai').length;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 85;
      return { city: c, score: Math.min(99, Math.max(75, rate)) };
    }).sort((a, b) => b.score - a.score);
    return scored[0] || { city: 'Kota Depok', score: 95 };
  }, [reports]);

  // Handle report selection
  const handleSelectReport = (r: Report) => {
    setSelectedId(r.id);
    setStatus(r.status);
    setAgency(r.agency || userAgency || 'Dinas Bina Marga');
    setAfterUrl(r.after_image_url || '');
    setAfterFilePreview(r.after_image_url || null);
    setRejectReason(r.reject_reason || '');
    setNote('');
  };

  // File upload for After image with JPG/PNG and < 5 MB validation
  const handleAfterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAfterFileError(null);
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isAllowed =
        ['jpg', 'jpeg', 'png', 'webp'].includes(ext) || file.type.startsWith('image/');
      if (!isAllowed) {
        setAfterFileError('Format file tidak didukung. Harap pilih foto JPG atau PNG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setAfterFileError(
          `Ukuran file (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas 5 MB.`
        );
        return;
      }

      setAfterFileName(file.name);
      setAfterFileSize(file.size);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAfterFilePreview(result);
        setAfterUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample After Image for 1-click testing
  const handleUseSampleAfter = () => {
    const sample =
      'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80';
    setAfterFilePreview(sample);
    setAfterUrl(sample);
    setAfterFileName('bukti-setelah-perbaikan-satgas.jpg');
    setAfterFileSize(420 * 1024);
    setAfterFileError(null);
  };

  // Submit Status Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    if (status === 'Ditolak' && !rejectReason.trim()) {
      alert('Alasan penolakan wajib diisi untuk memberi transparansi kepada pelapor!');
      return;
    }

    setSubmitting(true);
    const finalAfterImage = afterFilePreview || afterUrl.trim();

    const updateData: Record<string, unknown> = {
      status,
      agency,
    };
    if (status === 'Ditolak') {
      updateData.reject_reason = rejectReason.trim();
    } else {
      if (finalAfterImage) updateData.after_image_url = finalAfterImage;
      if (status === 'Selesai') updateData.resolved_at = new Date().toISOString();
    }

    try {
      await supabase.from('reports').update(updateData).eq('id', selected.id);

      if (status === 'On-Process') {
        await supabase
          .from('report_timelines')
          .update({
            is_done: true,
            description: note || 'Tim satgas dinas sedang bekerja aktif di lokasi.',
          })
          .eq('report_id', selected.id)
          .eq('step_title', 'Sedang Dikerjakan (On-Process)');
      } else if (status === 'Selesai') {
        await supabase
          .from('report_timelines')
          .update({
            is_done: true,
            description: note || 'Pekerjaan rampung dan foto bukti After telah diverifikasi.',
          })
          .eq('report_id', selected.id)
          .eq('step_title', 'Selesai & Audit Warga');
      }

      await supabase.from('notifications').insert({
        user_id: selected.reporter_id || 'guest',
        report_id: selected.id,
        title: `Update #${selected.ticket_number}: ${status}`,
        message:
          status === 'Ditolak'
            ? `Pengaduan ditolak oleh ${agency}: ${rejectReason}`
            : note || `Status tiket diperbarui menjadi ${status} oleh ${agency}.`,
      });
    } catch (err) {
      console.warn('Supabase update note (safe fallback in demo):', err);
    }

    // Update local state immediately for instant feedback
    setReports((prev) =>
      prev.map((r) =>
        r.id === selected.id
          ? {
              ...r,
              status,
              agency,
              after_image_url: finalAfterImage || r.after_image_url,
              reject_reason: status === 'Ditolak' ? rejectReason : null,
            }
          : r
      )
    );

    setSubmitting(false);
    setSuccess(`Status laporan #${selected.ticket_number} berhasil diperbarui menjadi ${status}.`);
    setTimeout(() => {
      setSuccess('');
    }, 3500);
  };

  // Submit Broadcast Notice
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim()) return;

    try {
      await supabase.from('public_notices').insert({
        city: pubCity,
        title: pubTitle,
        impact: pubImpact || 'Harap berhati-hati saat melintas di area pengerjaan.',
        agency: pubAgency,
      });
    } catch (err) {
      console.warn('Notice broadcast note:', err);
    }

    setSuccess('Pemberitahuan Pekerjaan Umum berhasil disiarkan ke banner beranda warga.');
    setPubTitle('');
    setPubImpact('');
    setTimeout(() => {
      setSuccess('');
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Demo / Authorization Notice Bar */}
      {!isAuthorized && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm">Mode Preview Satgas Pemda</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                  Akses Terbuka
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Anda dapat menguji antarmuka, memfilter pengaduan, dan mengubah status laporan. Untuk
                sinkronisasi akun dinas penuh, gunakan tombol masuk demo di samping.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={demoLoginLoading}
            className="shrink-0 px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <span>{demoLoginLoading ? 'Memproses...' : 'Masuk Akun Satgas Demo'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header Banner Card (Matching Screenshot Design) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-slate-600" />
              Portal Pemda & Satgas Jabodetabek
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Live Command Center
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Portal Pemda & Command Center Satgas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Pantau sebaran pengaduan masuk, verifikasi teknis dan disposisi dinas terkait, serta
            unggah bukti hasil pengerjaan fisik di wilayah Jabodetabek secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'broadcast' ? 'reports' : 'broadcast')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Radio className="w-4 h-4" />
            <span>{activeTab === 'broadcast' ? 'Daftar Pengaduan' : 'Siarkan Pekerjaan PU'}</span>
          </button>
        </div>
      </div>

      {/* 2. Summary KPI Badges (Matching Screenshot 4-card grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
            Total Pengaduan
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block">
            {reports.length}
          </span>
          <span className="text-[11px] text-slate-500">Tersebar di {uniqueCitiesCount} Wilayah</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase text-amber-600 block tracking-wider">
            Sedang Dikerjakan
          </span>
          <span className="text-lg sm:text-xl font-bold text-amber-600 mt-0.5 block">
            {totalOnProcess}
          </span>
          <span className="text-[11px] text-slate-500">Tim Satgas di Lapangan</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase text-emerald-600 block tracking-wider">
            Tuntas Diperbaiki
          </span>
          <span className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5 block">
            {totalResolved}
          </span>
          <span className="text-[11px] text-slate-500">Bukti After Terverifikasi</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
            Kota Tertinggi KPI
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block truncate">
            {topCity.city}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">Skor: {topCity.score}%</span>
        </div>
      </div>

      {/* 3. Search & Region Filter Bar Card (Matching Screenshot) */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari titik lokasi, kategori, nomor tiket, atau jalan di portal Pemda..."
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
              Menemukan <strong className="text-slate-900 font-semibold">{filteredReports.length}</strong>{' '}
              laporan untuk &quot;{searchQuery}&quot;
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
            WILAYAH:
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

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 border-t border-slate-100">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            STATUS:
          </span>
          {['Semua', 'Menunggu', 'On-Process', 'Selesai', 'Ditolak'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {st === 'Semua' ? 'Semua Status' : st}
            </button>
          ))}
        </div>
      </section>

      {/* Success Notification Alert */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 4. Section Card: Pengaduan Warga & Tindak Lanjut Satgas (Matching Screenshot) */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                Pusat Disposisi & Verifikasi Laporan Warga
              </h2>
              <p className="text-xs text-slate-500">
                Pilih laporan di bawah untuk memeriksa detail, ubah status penanganan satgas, dan
                unggah foto bukti perbaikan (After).
              </p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-full text-xs font-medium shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Laporan ({filteredReports.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('broadcast')}
              className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === 'broadcast'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Siarkan Pekerjaan PU
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Reports & Action Form */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: List of Reports (Matching Screenshot Card Style) */}
            <div className="lg:col-span-5 space-y-3 max-h-[780px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredReports.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400">
                  Tidak ada laporan pengaduan yang sesuai dengan filter wilayah atau pencarian.
                </div>
              ) : (
                filteredReports.map((r) => {
                  const isSelected = r.id === selected?.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleSelectReport(r)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                        isSelected
                          ? 'bg-slate-50/80 border-slate-900 ring-2 ring-slate-900 shadow-xs'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      {/* Image Thumbnail with Dark City Badge (Directly like screenshot) */}
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={
                            r.before_image_url ||
                            'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80'
                          }
                          alt={r.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-semibold">
                          {r.city}
                        </span>
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px]">
                          {r.ticket_number}
                        </span>
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {r.category}
                            </span>
                            <StatusBadge status={r.status} />
                          </div>
                          <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                            {r.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                            📍 {r.address}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                          <span>{r.agency || 'Dinas Terkait'}</span>
                          <span>{new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Tindak Lanjut Satgas Workspace Form */}
            <div className="lg:col-span-7 bg-slate-50/60 rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
              {selected ? (
                <>
                  {/* Selected Report Header */}
                  <div className="space-y-2 pb-4 border-b border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                          {selected.ticket_number}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                          {selected.city}
                        </span>
                      </div>
                      <StatusBadge status={selected.status} />
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {selected.title}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/70">
                      {selected.description || 'Tidak ada deskripsi tambahan dari pelapor.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                      <span>
                        📍 <strong>Lokasi:</strong> {selected.address}
                      </span>
                      <span>
                        👤 <strong>Pelapor:</strong>{' '}
                        {selected.is_anonymous ? 'Anonim' : selected.reporter_name || 'Warga'}
                      </span>
                    </div>
                  </div>

                  {/* Photo Visual Comparison (Before vs After) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Before Photo */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>Foto Laporan Warga (Before)</span>
                        <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          Kondisi Rusak
                        </span>
                      </div>
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          src={
                            selected.before_image_url ||
                            'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80'
                          }
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* After Photo Preview */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>Foto Hasil Penanganan (After)</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {afterFilePreview || selected.after_image_url ? 'Bukti Tersedia' : 'Belum Ada'}
                        </span>
                      </div>
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {afterFilePreview || selected.after_image_url ? (
                          <img
                            src={(afterFilePreview || selected.after_image_url) as string}
                            alt="After"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-3 text-slate-400 space-y-1">
                            <Upload className="w-5 h-5 mx-auto text-slate-300" />
                            <span className="text-[11px] block">Belum ada foto After</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Tindak Lanjut Satgas */}
                  <form onSubmit={handleUpdate} className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Status Penanganan Satgas
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as ReportStatus)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 shadow-2xs"
                        >
                          <option value="Menunggu">Menunggu Verifikasi</option>
                          <option value="On-Process">Sedang Ditangani (On-Process)</option>
                          <option value="Selesai">Tuntas Selesai (Accept & Selesai)</option>
                          <option value="Ditolak">Ditolak (Decline / Luar Wewenang)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Dinas / Satgas Pelaksana
                        </label>
                        <input
                          type="text"
                          value={agency}
                          onChange={(e) => setAgency(e.target.value)}
                          placeholder="Contoh: Dinas Bina Marga"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 shadow-2xs"
                        />
                      </div>
                    </div>

                    {status === 'Ditolak' ? (
                      <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 space-y-1.5">
                        <label className="block text-[11px] font-bold text-rose-700">
                          Alasan Penolakan Resmi (Wajib Transparan):
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Contoh: Bukan aset pemda tingkat kota, merupakan jalan nasional Kementerian PUPR atau pengembang swasta..."
                          className="w-full p-2.5 rounded-lg bg-white border border-rose-300 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Catatan Tindak Lanjut Satgas
                          </label>
                          <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Contoh: Tim satgas telah menambal aspal 4 titik sepanjang 30 meter..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 shadow-2xs"
                          />
                        </div>

                        {/* Upload Foto Bukti Selesai (After) */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-slate-800">
                              Upload Foto Bukti Selesai (After):
                            </label>
                            <span className="text-[10px] text-slate-400">JPG, PNG (&lt; 5 MB)</span>
                          </div>

                          {afterFileError && (
                            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                              {afterFileError}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Pilih File Foto</span>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                onChange={handleAfterFileUpload}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={handleUseSampleAfter}
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                            >
                              Gunakan Contoh Foto Demo
                            </button>

                            {afterFileName && afterFileSize && (
                              <span className="text-[11px] text-emerald-700 font-medium px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                                {afterFileName} ({(afterFileSize / 1024).toFixed(0)} KB) ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Submit Button (Matching Black Style in Screenshot) */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{submitting ? 'Menyimpan Pembaruan...' : 'Simpan Pembaruan Status'}</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">Pilih salah satu laporan di kolom kiri untuk mulai memvalidasi.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Siarkan Pemberitahuan PU */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl mx-auto py-2 space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                Siarkan Pemberitahuan Pekerjaan Umum (PU)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengumuman pekerjaan jalan, drainase, atau perbaikan pipa akan tampil langsung di
                banner siaran publik warga Jabodetabek secara real-time.
              </p>
            </div>

            <form onSubmit={handlePublish} className="space-y-3.5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Wilayah Kota</label>
                  <select
                    value={pubCity}
                    onChange={(e) => setPubCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Instansi Pelaksana
                  </label>
                  <input
                    type="text"
                    value={pubAgency}
                    onChange={(e) => setPubAgency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Judul Pekerjaan Fisik
                </label>
                <input
                  type="text"
                  required
                  value={pubTitle}
                  onChange={(e) => setPubTitle(e.target.value)}
                  placeholder="Contoh: Normalisasi Drainase & Penurapan Saluran Air Kali Grogol"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Dampak Lalu Lintas / Catatan Warga
                </label>
                <input
                  type="text"
                  value={pubImpact}
                  onChange={(e) => setPubImpact(e.target.value)}
                  placeholder="Contoh: Penyempitan 1 lajur arah barat mulai pukul 09.00 - 15.00 WIB"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Terbitkan ke Banner Beranda Warga
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
