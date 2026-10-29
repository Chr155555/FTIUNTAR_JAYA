'use client';

import { useState } from 'react';
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
  ImageIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CITIES } from '@/lib/constants';
import type { Report } from '@/lib/types';

interface Props {
  reports: Report[];
  currentUser?: any;
  userRole?: string;
  userAgency?: string;
}

export function GovAdminContent({
  reports,
  currentUser,
  userRole = 'guest',
  userAgency,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const isAuthorized = userRole === 'government' || userRole === 'admin';

  const [selectedId, setSelectedId] = useState(reports[0]?.id || '');
  const [status, setStatus] = useState('On-Process');
  const [agency, setAgency] = useState(reports[0]?.agency || userAgency || 'Dinas Bina Marga');
  const [note, setNote] = useState('');
  const [afterUrl, setAfterUrl] = useState('');
  const [afterFilePreview, setAfterFilePreview] = useState<string | null>(null);
  const [afterFileName, setAfterFileName] = useState('');
  const [afterFileSize, setAfterFileSize] = useState<number | null>(null);
  const [afterFileError, setAfterFileError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [pubCity, setPubCity] = useState('Jakarta Barat');
  const [pubTitle, setPubTitle] = useState('');
  const [pubImpact, setPubImpact] = useState('');
  const [pubAgency, setPubAgency] = useState('Dinas Bina Marga');

  const selected = reports.find((r) => r.id === selectedId);

  // File upload for After image with JPG/PNG and < 5 MB validation
  const handleAfterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAfterFileError(null);
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isAllowed = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) || file.type.startsWith('image/');
      if (!isAllowed) {
        setAfterFileError('Format file tidak didukung. Harap pilih foto JPG atau PNG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setAfterFileError(`Ukuran file (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas 5 MB. Gunakan foto < 5 MB.`);
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

    await supabase.from('reports').update(updateData).eq('id', selected.id);

    if (status === 'On-Process') {
      await supabase
        .from('report_timelines')
        .update({ is_done: true, description: note || 'Tim petugas dinas sedang bekerja di lokasi.' })
        .eq('report_id', selected.id)
        .eq('step_title', 'Sedang Dikerjakan (On-Process)');
      await supabase
        .from('report_timelines')
        .update({ is_done: true })
        .eq('report_id', selected.id)
        .eq('step_title', 'Verifikasi & Disposisi');
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

    setSubmitting(false);
    setSuccess(`Status #${selected.ticket_number} berhasil diperbarui.`);
    setTimeout(() => {
      setSuccess('');
      router.refresh();
    }, 2000);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim()) return;

    await supabase.from('public_notices').insert({
      city: pubCity,
      title: pubTitle,
      impact: pubImpact || 'Harap berhati-hati saat melintas di area pengerjaan.',
      agency: pubAgency,
    });

    setSuccess('Pemberitahuan Pekerjaan Umum berhasil diterbitkan ke banner warga.');
    setPubTitle('');
    setPubImpact('');
    setTimeout(() => {
      setSuccess('');
      router.refresh();
    }, 2000);
  };

  // If user is ordinary citizen (role 'user'), restrict access
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-100">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Portal Khusus Instansi Pemerintah</h2>
          <p className="text-xs text-slate-500 mt-1">
            Akun Anda terdaftar sebagai <strong>Warga Biasa (User)</strong>. Hanya akun dinas pemerintah (Government Account) yang dapat memvalidasi dan memperbarui status laporan.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-1">
          <span className="font-semibold text-slate-800 text-[11px] block">Gunakan Akun Dinas Demo:</span>
          <div className="text-[11px] text-slate-600">Email: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">pemda@jakbar.go.id</code></div>
          <div className="text-[11px] text-slate-600">Sandi: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">password123</code></div>
        </div>

        <Link
          href="/auth"
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Ganti Akun ke Akun Pemda</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header Dashboard */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Government Official Portal
            </span>
            <span className="text-xs text-slate-300">{currentUser?.email}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold mt-1.5">
            Command Center Verifikasi & Disposisi Satgas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tindak lanjuti pengaduan warga, perbarui status teknis, dan unggah bukti hasil pengerjaan.
          </p>
        </div>
        <div className="flex gap-2.5 text-center">
          <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
            <div className="text-base font-bold text-white">{reports.length}</div>
            <div className="text-[10px] text-slate-400">Total Masuk</div>
          </div>
          <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
            <div className="text-base font-bold text-emerald-400">
              {reports.filter((r) => r.status === 'Selesai').length}
            </div>
            <div className="text-[10px] text-slate-400">Selesai</div>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
          ✓ {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Form 1: Verifikasi Tiket & Update Status */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h2 className="font-semibold text-sm text-slate-900">1. Tindak Lanjut Laporan Warga</h2>
            <p className="text-xs text-slate-400">
              Ubah status pengerjaan dan lampirkan bukti foto sesudah (After).
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Pilih Tiket</label>
              <select
                value={selectedId}
                onChange={(e) => {
                  const r = reports.find((rr) => rr.id === e.target.value);
                  setSelectedId(e.target.value);
                  if (r) {
                    setStatus(r.status);
                    setAgency(r.agency);
                    setAfterUrl(r.after_image_url || '');
                    setAfterFilePreview(r.after_image_url || null);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.ticket_number}] {r.title.slice(0, 36)}... ({r.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Status Laporan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="On-Process">Sedang Ditangani (On-Process)</option>
                  <option value="Selesai">Accept / Selesai (Tuntas)</option>
                  <option value="Ditolak">Decline / Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Dinas Pelaksana</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {status === 'Ditolak' ? (
              <div>
                <label className="block text-[11px] font-bold text-rose-600 mb-1">
                  Alasan Penolakan Resmi (Wajib Diisi):
                </label>
                <textarea
                  rows={2}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Misal: Bukan kewenangan dinas kota, aset berada di bawah Kementerian PUPR atau pengembang perumahan swasta..."
                  className="w-full p-2.5 rounded-xl bg-rose-50/50 border border-rose-300 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Catatan Progres Satgas</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tim satgas telah melakukan pengerukan lumpur 50 meter..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </div>

                {/* Upload Foto Bukti Selesai (After) dari perangkat (< 5 MB, JPG/PNG) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Upload Foto Bukti Selesai (After):
                    </label>
                    <span className="text-[10px] text-slate-400">Format: JPG, JPEG, PNG (&lt; 5 MB)</span>
                  </div>

                  {afterFileError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      {afterFileError}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Foto Bukti</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        onChange={handleAfterFileUpload}
                        className="hidden"
                      />
                    </label>

                    {afterFileName && afterFileSize && (
                      <span className="text-[11px] text-slate-600 font-medium px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        {afterFileName} ({ (afterFileSize / (1024 * 1024)).toFixed(2) } MB) • &lt; 5 MB ✓
                      </span>
                    )}
                  </div>

                  {afterFilePreview && (
                    <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-slate-200 mt-2 bg-slate-100">
                      <img src={afterFilePreview} alt="Preview After" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] bg-slate-900/80 text-white font-medium">
                        Bukti After
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer mt-1 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Pembaruan Status'}
            </button>
          </form>
        </section>

        {/* Form 2: Siarkan Pemberitahuan PU */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h2 className="font-semibold text-sm text-slate-900">2. Siarkan Pemberitahuan PU</h2>
            <p className="text-xs text-slate-400">Muncul di banner siaran publik beranda warga secara live.</p>
          </div>

          <form onSubmit={handlePublish} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Kota</label>
                <select
                  value={pubCity}
                  onChange={(e) => setPubCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Instansi Pelaksana</label>
                <input
                  type="text"
                  value={pubAgency}
                  onChange={(e) => setPubAgency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Judul Pekerjaan</label>
              <input
                type="text"
                required
                value={pubTitle}
                onChange={(e) => setPubTitle(e.target.value)}
                placeholder="Pembersihan Saluran Drainase Kali Daan Mogot"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Dampak Lalu Lintas</label>
              <input
                type="text"
                value={pubImpact}
                onChange={(e) => setPubImpact(e.target.value)}
                placeholder="Penyempitan 1 lajur arah barat pukul 09.00 - 15.00 WIB"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 text-xs font-semibold transition-colors cursor-pointer mt-1"
            >
              Terbitkan ke Banner Beranda
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
