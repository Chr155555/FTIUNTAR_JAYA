'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  ThumbsUp,
  Check,
  Star,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  EyeOff,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  Clock,
  Building2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { createClient } from '@/lib/supabase/client';
import type { Report, ReportTimeline, Comment } from '@/lib/types';

interface Props {
  report: Report;
  timelines: ReportTimeline[];
  comments: Comment[];
}

export function ReportDetail({ report, timelines, comments: initialComments }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [photoMode, setPhotoMode] = useState<'split' | 'before' | 'after'>('split');
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState(initialComments);
  const [stars, setStars] = useState(5);
  const [auditVote, setAuditVote] = useState<string | null>(null);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(report.upvote_count);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeSection, setActiveSection] = useState<'foto' | 'timeline' | 'audit' | 'diskusi'>('foto');

  useEffect(() => {
    const handleScroll = () => {
      const sections: ('foto' | 'timeline' | 'audit' | 'diskusi')[] = ['foto', 'timeline', 'audit', 'diskusi'];
      const sectionIds = ['foto-bukti', 'timeline-status', 'audit-pemda', 'diskusi-warga'];

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Citizen KPI Penalty report state
  const [showKpiReportModal, setShowKpiReportModal] = useState(false);
  const [kpiReason, setKpiReason] = useState('');
  const [kpiReportSubmitted, setKpiReportSubmitted] = useState(false);
  const [submittingKpi, setSubmittingKpi] = useState(false);

  const handleUpvote = async () => {
    const newCount = upvoted ? upvoteCount - 1 : upvoteCount + 1;
    setUpvoted(!upvoted);
    setUpvoteCount(newCount);
    await supabase
      .from('reports')
      .update({
        upvote_count: newCount,
        is_top_upvoted: newCount >= 150,
      })
      .eq('id', report.id);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || submittingComment) return;
    setSubmittingComment(true);

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    const authorName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Warga Terverifikasi';
    const isOfficial = currentUser?.email?.includes('go.id') || currentUser?.user_metadata?.role === 'gov';

    const newComment = {
      report_id: report.id,
      user_id: currentUser?.id || null,
      user_name: authorName,
      user_role: isOfficial ? 'Instansi Resmi' : 'Warga Terverifikasi',
      content: commentInput.trim(),
      is_official: isOfficial,
    };

    const { data } = await supabase.from('comments').insert(newComment).select().single();
    if (data) {
      setComments((prev) => [...prev, data]);
    }
    setCommentInput('');
    setSubmittingComment(false);
  };

  const handleAudit = async (type: 'puas' | 'belum') => {
    setAuditVote(type);
    const { data: authData } = await supabase.auth.getUser();
    await supabase.from('satisfaction_audits').insert({
      report_id: report.id,
      user_id: authData?.user?.id || 'guest-' + Math.floor(Math.random() * 10000),
      is_satisfied: type === 'puas',
      rating: stars,
    });
  };

  const handlePenaltySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpiReason.trim()) return;
    setSubmittingKpi(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      await supabase.from('kpi_penalties').insert({
        report_id: report.id,
        city: report.city,
        agency: report.agency,
        reason: kpiReason.trim(),
        penalty_points: 2.0,
        reported_by: authData?.user?.email || 'Warga Terverifikasi',
      });

      setKpiReportSubmitted(true);
      setTimeout(() => setShowKpiReportModal(false), 2000);
    } catch (err) {
      console.error('Failed to submit penalty:', err);
    } finally {
      setSubmittingKpi(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return 'Baru saja';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Baru saja';
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return 'Baru saja';
    if (diff < 60) return `${diff}m lalu`;
    if (diff < 1440) return `${Math.floor(diff / 60)}j lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const petitionTarget = upvoteCount < 100 ? 100 : upvoteCount < 300 ? 300 : 500;
  const petitionPercent = Math.min(100, Math.round((upvoteCount / petitionTarget) * 100));

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* SISI KIRI: Sidebar Navigation & List Kota Jabodetabek */}
      <aside className="w-full lg:w-60 xl:w-64 shrink-0 space-y-4 lg:sticky lg:top-20">
        {/* Kotak Navigasi Sesuai Isi Detail Laporan */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <h2 className="text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-2.5">
            NAVIGASI LAPORAN
          </h2>

          <button
            type="button"
            onClick={() => {
              setActiveSection('foto');
              document.getElementById('foto-bukti')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
              activeSection === 'foto'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span className="leading-snug">Foto Bukti Lapangan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('timeline');
              document.getElementById('timeline-status')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
              activeSection === 'timeline'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="leading-snug">Timeline Tracking Status</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('audit');
              document.getElementById('audit-pemda')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
              activeSection === 'audit'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Star className="w-4 h-4 shrink-0" />
            <span className="leading-snug">Timbang Kembali Hasil Penanganan Pemda</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('diskusi');
              document.getElementById('diskusi-warga')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
              activeSection === 'diskusi'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="leading-snug">Diskusi & Dukungan Warga ({comments.length})</span>
          </button>
        </div>
      </aside>

      {/* SISI KANAN: 5 Kotak Konten Detail */}
      <main className="flex-1 min-w-0 space-y-5">
      {/* Navigation & Ticket ID */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Feed & FYP</span>
        </Link>
        <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
          {report.ticket_number}
        </span>
      </div>

      {/* Official Rejection Alert Box (If Decline) */}
      {(report.status === 'Ditolak' || report.reject_reason) && (
        <section className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Pengaduan Ditolak oleh Pemerintah Daerah ({report.agency})
                </span>
              </div>
              <p className="text-xs text-rose-900">
                <strong className="font-semibold">Alasan Penolakan Resmi:</strong>{' '}
                {report.reject_reason ||
                  'Bukan kewenangan dinas terkait di tingkat kota / wilayah ini merupakan aset jalan nasional atau privat.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Info Card & Petition Counter */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-white">
              {report.city}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
              {report.category}
            </span>
          </div>
          <StatusBadge status={report.status} />
        </div>

        <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
          {report.title}
        </h1>

        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{report.address}</span>
          </div>
          <div>
            Pelapor: <strong className="font-semibold text-slate-900">{report.reporter_name || 'Anonim'}</strong>
          </div>
          <div>
            Instansi: <strong className="font-semibold text-slate-900">{report.agency}</strong>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed pt-2 border-t border-slate-100">
          {report.description}
        </p>

        {/* Petition progress bar */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-rose-600" />
              <span>Petisi Dukungan Warga: {upvoteCount} tanda tangan</span>
            </span>
            <span className="text-slate-400 text-[11px]">Target: {petitionTarget} dukungan</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-rose-600 rounded-full transition-all"
              style={{ width: `${petitionPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Semakin banyak dukungan petisi warga, semakin tinggi prioritas masalah ini masuk ke For You Page (FYP) dan didisposisi cepat oleh Pemda.
          </p>
        </div>
      </section>

      {/* Photo Comparison (Before vs After) */}
      <section id="foto-bukti" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Foto Bukti Lapangan</h2>
            <p className="text-xs text-slate-500">Transparansi kondisi sebelum vs sesudah pengerjaan.</p>
          </div>
          <div className="inline-flex rounded-full p-1 bg-slate-100 border border-slate-200/60 self-start">
            {[
              { id: 'split' as const, label: 'Bandingan' },
              { id: 'before' as const, label: 'Sebelum' },
              { id: 'after' as const, label: 'Sesudah' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPhotoMode(t.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  photoMode === t.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`grid gap-3.5 ${photoMode === 'split' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {(photoMode === 'split' || photoMode === 'before') && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-64 sm:h-72">
              <img src={report.before_image_url} alt="Sebelum" className="w-full h-full object-cover" />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-xs">
                Kondisi Sebelum
              </div>
            </div>
          )}
          {(photoMode === 'split' || photoMode === 'after') && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-64 sm:h-72">
              {report.after_image_url ? (
                <>
                  <img src={report.after_image_url} alt="Sesudah" className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-700/85 text-white text-[11px] font-medium backdrop-blur-xs">
                    Kondisi Sesudah ✓
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <span className="text-xs">Menunggu foto bukti sesudah perbaikan diunggah petugas pemda.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Timeline Tracking Status */}
      <section id="timeline-status" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4 scroll-mt-20">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Timeline Tracking Status</h2>
          <p className="text-xs text-slate-500">Progres penanganan dinas terkait secara transparan.</p>
        </div>

        <div className="space-y-0.5 pt-1">
          {timelines.map((item, idx) => (
            <div key={item.id} className="flex items-start gap-3.5">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    item.is_done
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {item.is_done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                {idx < timelines.length - 1 && (
                  <div className={`w-px h-10 my-1 ${item.is_done ? 'bg-slate-300' : 'bg-slate-200'}`} />
                )}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs font-semibold ${item.is_done ? 'text-slate-900' : 'text-slate-400'}`}>
                    {item.step_title}
                  </h4>
                  <span className="text-[11px] text-slate-400">{timeAgo(item.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Citizen Review & Satisfaction Audit & KPI Penalty */}
      <section id="audit-pemda" className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4 shadow-2xs scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Audit Kepuasan Komunitas Warga
            </span>
            <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
              Timbang Kembali Hasil Penanganan Pemda
            </h3>
            <p className="text-xs text-slate-500">
              Beri rating atau laporkan jika penanganan dianggap tidak sesuai atau penolakan tidak adil.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-full border border-slate-200">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setStars(s)} className="p-0.5 cursor-pointer">
                <Star
                  className={`w-4 h-4 ${
                    s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
            <span className="ml-1 text-xs font-semibold text-slate-700">{stars}.0</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200/60">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleAudit('puas')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                auditVote === 'puas'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tuntas & Puas</span>
            </button>

            <button
              type="button"
              onClick={() => handleAudit('belum')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                auditVote === 'belum'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Belum Selesai</span>
            </button>
          </div>

          {/* Citizen Penalty Button for Government KPI */}
          <button
            type="button"
            onClick={() => setShowKpiReportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Laporkan Penurunan KPI Pemda</span>
          </button>
        </div>
      </section>

      {/* KPI Penalty Modal */}
      {showKpiReportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Komplain Kinerja & Penalti KPI Kota
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Laporan Anda akan secara langsung menurunkan skor efektivitas & ranking {report.city} di Dashboard Jabodetabek.
              </p>
            </div>

            {kpiReportSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs text-center font-medium">
                ✓ Komplain penalti KPI berhasil dikirim dan diverifikasi sistem audit warga!
              </div>
            ) : (
              <form onSubmit={handlePenaltySubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Alasan Penalti Penurunan KPI:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={kpiReason}
                    onChange={(e) => setKpiReason(e.target.value)}
                    placeholder="Contoh: Penolakan tidak berdasar karena jalan ini masuk wilayah pemda, atau status diklaim selesai padahal aspal masih berlubang..."
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowKpiReportModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingKpi}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {submittingKpi ? 'Memproses...' : 'Kirim Penalti KPI'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Citizen Discussions & Petisi Signing */}
      <section id="diskusi-warga" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4 scroll-mt-20">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Diskusi & Dukungan Warga ({comments.length})
            </h3>
            <p className="text-xs text-slate-500">
              Beri tanda tangan petisi agar laporan ini naik ke jajaran teratas FYP.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUpvote}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              upvoted
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/80'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{upvoted ? 'Petisi Didukung' : 'Dukung Petisi Ini'}</span>
            <span>({upvoteCount})</span>
          </button>
        </div>

        {/* Add comment */}
        <form onSubmit={handleComment} className="flex gap-2">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Tulis informasi tambahan atau dukungan warga..."
            className="flex-1 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-2xs"
          />
          <button
            type="submit"
            disabled={submittingComment}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Kirim</span>
          </button>
        </form>

        {/* Comment list */}
        <div className="space-y-2.5 pt-2">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Belum ada tanggapan.</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className={`p-3.5 rounded-xl border ${
                  c.is_official
                    ? 'bg-amber-50/40 border-amber-200/70'
                    : 'bg-slate-50/70 border-slate-200/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{c.user_name}</span>
                    {(c.is_official || c.user_role === 'Instansi Resmi') && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 text-white">
                        {c.user_role || 'Instansi Resmi'}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
      </main>
    </div>
  );
}
