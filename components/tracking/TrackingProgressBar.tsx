'use client';

import { useState, useMemo } from 'react';
import {
  Check,
  Clock,
  Building2,
  Calendar,
  AlertTriangle,
  Copy,
  CheckCircle2,
  FileCheck,
  ClipboardList,
  Wrench,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { Report, ReportTimeline } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Props {
  report: Report;
  timelines: ReportTimeline[];
}

interface StepDefinition {
  stepNumber: number;
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  slaTarget: string;
  icon: typeof FileCheck;
}

const STEPS: StepDefinition[] = [
  {
    stepNumber: 1,
    id: 'diterima',
    title: 'Laporan Diterima Sistem',
    shortTitle: 'Diterima',
    description: 'Aduan warga terdaftar dengan koordinat presisi dan masuk ke antrean verifikasi dinas.',
    slaTarget: 'Instan (< 1 Jam)',
    icon: FileCheck,
  },
  {
    stepNumber: 2,
    id: 'verifikasi',
    title: 'Verifikasi & Disposisi Dinas',
    shortTitle: 'Verifikasi',
    description: 'Pemeriksaan kelayakan masalah, validasi lokasi, dan penerbitan instruksi kerja ke dinas penanggung jawab.',
    slaTarget: 'Maks. 1x24 Jam Kerja',
    icon: ClipboardList,
  },
  {
    stepNumber: 3,
    id: 'pengerjaan',
    title: 'Penanganan Lapangan Aktif',
    shortTitle: 'Diproses',
    description: 'Satgas lapangan dan logistik alat berat dikerahkan ke lokasi untuk eksekusi perbaikan fisik.',
    slaTarget: '2 - 3 Hari Kerja',
    icon: Wrench,
  },
  {
    stepNumber: 4,
    id: 'selesai',
    title: 'Pekerjaan Tuntas & Audit Publik',
    shortTitle: 'Tuntas',
    description: 'Fasilitas umum telah diperbaiki dengan bukti foto kondisi sesudah dan siap dinilai oleh warga.',
    slaTarget: 'Audit Warga Terbuka',
    icon: ShieldCheck,
  },
];

export function TrackingProgressBar({ report, timelines }: Props) {
  const [copied, setCopied] = useState(false);

  // Compute current stage from report status & timelines
  const { currentStepIndex, isRejected, progressPercentage } = useMemo(() => {
    if (report.status === 'Ditolak') {
      return { currentStepIndex: 1, isRejected: true, progressPercentage: 0 };
    }
    if (report.status === 'Selesai') {
      return { currentStepIndex: 4, isRejected: false, progressPercentage: 100 };
    }
    if (report.status === 'On-Process') {
      return { currentStepIndex: 3, isRejected: false, progressPercentage: 75 };
    }
    // Default: 'Menunggu'
    return { currentStepIndex: 2, isRejected: false, progressPercentage: 35 };
  }, [report.status]);

  // Selected step for interactive inspection
  const [selectedStep, setSelectedStep] = useState<number>(currentStepIndex);

  const handleCopyTicket = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(report.ticket_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const activeStepData = STEPS[Math.max(0, Math.min(3, selectedStep - 1))];

  return (
    <section
      id="timeline-status"
      className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-6 shadow-2xs scroll-mt-20"
    >
      {/* 1. Header with Executive Title and Copy Ticket */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Pelacakan Real-Time
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Status Linimasa Penanganan Laporan
          </h2>
          <p className="text-xs text-slate-500">
            Pantau setiap tahapan tindak lanjut dari pemda secara transparan dan akuntabel.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleCopyTicket}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-mono font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Salin Nomor Tiket Aduan"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>#{report.ticket_number}</span>
              </>
            )}
          </button>
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* 2. Key Metadata Strip (SLA, PIC Agency, Dates) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Instansi PIC
          </span>
          <div className="flex items-center gap-1.5 text-slate-800 font-medium truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{report.agency || 'Dinas Terkait'}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Target SLA
          </span>
          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {isRejected
                ? 'Tidak Diproses'
                : report.status === 'Selesai'
                ? 'Tepat Waktu'
                : '1 - 3 Hari Kerja'}
            </span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Tanggal Dibuat
          </span>
          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{formatDate(report.created_at)}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Pembaruan Terakhir
          </span>
          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {report.resolved_at
                ? formatDate(report.resolved_at)
                : formatDate(report.updated_at || report.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Rejection Banner (If Rejected) */}
      {isRejected && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">
                Pengaduan Dihentikan / Ditolak oleh {report.agency}
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                {report.reject_reason ||
                  'Laporan tidak dapat ditindaklanjuti karena bukan merupakan aset milik pemerintah daerah atau terdapat duplikasi pelaporan aktif.'}
              </p>
            </div>
          </div>
          <div className="text-[11px] text-rose-600 pt-1 border-t border-rose-200/60">
            Jika Anda merasa keputusan ini keliru, Anda dapat mengajukan aduan baru dengan melampirkan foto titik patokan yang lebih jelas.
          </div>
        </div>
      )}

      {/* 4. Interactive Horizontal Stepper */}
      <div className="space-y-3">
        {/* Progress Bar with Percentage Header */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            {isRejected
              ? 'Progres: 0% (Dihentikan)'
              : `Progres Penanganan: ${progressPercentage}%`}
          </span>
          <span className="text-[11px] text-slate-400">
            Klik tahapan untuk melihat rincian aktivitas
          </span>
        </div>

        {/* The Continuous Progress Bar Track */}
        <div className="relative pt-3 pb-2">
          {/* Background Bar */}
          <div className="absolute top-7 left-6 right-6 h-1 bg-slate-100 -translate-y-1/2 z-0 hidden sm:block" />

          {/* Filled Progress Bar */}
          <div
            className={`absolute top-7 left-6 h-1 transition-all duration-500 -translate-y-1/2 z-0 hidden sm:block ${
              isRejected
                ? 'bg-rose-400'
                : report.status === 'Selesai'
                ? 'bg-emerald-500'
                : 'bg-slate-900'
            }`}
            style={{
              width: isRejected
                ? '0%'
                : `calc(${Math.min(100, Math.max(0, ((currentStepIndex - 1) / 3) * 100))}% * (100% - 48px) / 100)`,
            }}
          />

          {/* Step Nodes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 relative z-10">
            {STEPS.map((step) => {
              const isPassed = !isRejected && step.stepNumber < currentStepIndex;
              const isCurrent = !isRejected && step.stepNumber === currentStepIndex;
              const isSelected = selectedStep === step.stepNumber;
              const isStepRejected = isRejected && step.stepNumber === 2;

              let nodeClass = 'bg-white border-slate-200 text-slate-400';
              let badgeColor = 'bg-slate-100 text-slate-600';

              if (isStepRejected) {
                nodeClass = 'bg-rose-600 border-rose-600 text-white';
                badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
              } else if (isPassed) {
                nodeClass = 'bg-slate-900 border-slate-900 text-white';
                badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
              } else if (isCurrent) {
                nodeClass =
                  report.status === 'Selesai'
                    ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-slate-900 border-slate-900 text-white ring-4 ring-slate-100';
                badgeColor =
                  report.status === 'Selesai'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200';
              }

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setSelectedStep(step.stepNumber)}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50/90 shadow-2xs'
                      : 'border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border ${nodeClass}`}
                    >
                      {isStepRejected ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : isPassed || (isCurrent && report.status === 'Selesai') ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        step.stepNumber
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}
                    >
                      {isStepRejected
                        ? 'Ditolak'
                        : isPassed
                        ? 'Selesai'
                        : isCurrent
                        ? 'Aktif'
                        : 'Menunggu'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {step.slaTarget}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Selected Stage Deep-Dive Card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
              <activeStepData.icon className="w-4 h-4 text-slate-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tahap {activeStepData.stepNumber} dari 4
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                {activeStepData.title}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Target SLA</span>
            <span className="text-xs font-semibold text-slate-700">
              {activeStepData.slaTarget}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {activeStepData.description}
        </p>

        {/* Step-specific context */}
        {selectedStep === 1 && (
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Koordinat: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</span>
            <span>Waktu: {formatDate(report.created_at)}</span>
          </div>
        )}
        {selectedStep === 2 && (
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Instansi Penilai: Inspektorat / Dinas Bina Marga {report.city}</span>
            <span>Status: {isRejected ? 'Ditolak' : 'Disposisi Terbit'}</span>
          </div>
        )}
        {selectedStep === 3 && (
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Pelaksana Teknis: Satuan Tugas Pemeliharaan {report.agency}</span>
            <span>Kesiapan Armada: Personel & Material Siaga</span>
          </div>
        )}
        {selectedStep === 4 && (
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Audit Warga: Terbuka untuk rating kepuasan publik</span>
            <span>
              Status Bukti: {report.after_image_url ? 'Foto After Tersedia' : 'Menunggu Unggahan Petugas'}
            </span>
          </div>
        )}
      </div>

      {/* 6. Chronological Log / Timelines Trail */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Catatan Riwayat Tindak Lanjut
          </h4>
          <span className="text-[11px] text-slate-400">
            {timelines.length} entri tercatat
          </span>
        </div>

        <div className="space-y-0 relative pl-4 sm:pl-6 before:content-[''] before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
          {(timelines.length > 0 ? timelines : [
            {
              id: 'init',
              report_id: report.id,
              step_title: 'Laporan Diterima',
              description: 'Laporan berhasil dicatat dalam basis data sistem SuaraWarga.',
              is_done: true,
              timestamp: report.created_at,
            },
            {
              id: 'verify',
              report_id: report.id,
              step_title: 'Verifikasi & Disposisi',
              description: `Disposisi berkas dikirimkan kepada ${report.agency}.`,
              is_done: report.status !== 'Menunggu',
              timestamp: report.updated_at || report.created_at,
            },
          ]).map((item, idx) => (
            <div key={item.id || idx} className="relative pb-4 last:pb-0 pl-2">
              <div
                className={`absolute -left-[19px] sm:-left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center ${
                  item.is_done ? 'border-slate-900' : 'border-slate-300'
                }`}
              >
                {item.is_done && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className={`text-xs font-semibold ${item.is_done ? 'text-slate-900' : 'text-slate-400'}`}>
                  {item.step_title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDate(item.timestamp)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
