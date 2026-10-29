'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CITIES } from '@/lib/constants';
import type { Report } from '@/lib/types';

interface Props {
  reports: Report[];
}

export function GovAdminContent({ reports }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedId, setSelectedId] = useState(reports[0]?.id || '');
  const [status, setStatus] = useState('On-Process');
  const [agency, setAgency] = useState(reports[0]?.agency || '');
  const [note, setNote] = useState('');
  const [afterUrl, setAfterUrl] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [success, setSuccess] = useState('');

  const [pubCity, setPubCity] = useState('Jakarta Barat');
  const [pubTitle, setPubTitle] = useState('');
  const [pubImpact, setPubImpact] = useState('');
  const [pubAgency, setPubAgency] = useState('Dinas Bina Marga');

  const selected = reports.find((r) => r.id === selectedId);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    const updateData: Record<string, unknown> = {
      status,
      agency,
    };
    if (status === 'Ditolak') {
      updateData.reject_reason = rejectReason;
    } else {
      if (afterUrl.trim()) updateData.after_image_url = afterUrl.trim();
      if (status === 'Selesai') updateData.resolved_at = new Date().toISOString();
    }

    await supabase.from('reports').update(updateData).eq('id', selected.id);

    if (status === 'On-Process') {
      await supabase.from('report_timelines')
        .update({ is_done: true, description: note || 'Tim petugas sedang bekerja di lokasi.' })
        .eq('report_id', selected.id)
        .eq('step_title', 'Sedang Dikerjakan (On-Process)');
      await supabase.from('report_timelines')
        .update({ is_done: true })
        .eq('report_id', selected.id)
        .eq('step_title', 'Verifikasi & Disposisi');
    } else if (status === 'Selesai') {
      await supabase.from('report_timelines')
        .update({ is_done: true, description: note || 'Pekerjaan selesai, bukti foto diunggah.' })
        .eq('report_id', selected.id)
        .eq('step_title', 'Selesai & Audit Warga');
    }

    await supabase.from('notifications').insert({
      user_id: selected.reporter_id || 'guest',
      report_id: selected.id,
      title: `Update #${selected.ticket_number}: ${status}`,
      message: status === 'Ditolak' ? `Ditolak: ${rejectReason}` : note || `Status diperbarui oleh ${agency}.`,
    });

    setSuccess(`Status #${selected.ticket_number} berhasil diperbarui.`);
    setTimeout(() => { setSuccess(''); router.refresh(); }, 2500);
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

    setSuccess('Pemberitahuan Pekerjaan Umum berhasil diterbitkan.');
    setPubTitle('');
    setPubImpact('');
    setTimeout(() => { setSuccess(''); router.refresh(); }, 2500);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header Dashboard */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/15">
            Portal Pemerintah Daerah
          </span>
          <h1 className="text-base sm:text-lg font-bold mt-1.5">
            Command Center Verifikasi & Disposisi
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola status tiket laporan pengaduan masyarakat & koordinasi satgas.
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
        {/* Form 1: Verifikasi Tiket */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h2 className="font-semibold text-sm text-slate-900">1. Tindak Lanjut Laporan Warga</h2>
            <p className="text-xs text-slate-400">Verifikasi kelengkapan, perbarui status dan upload bukti After.</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Pilih Tiket</label>
              <select
                value={selectedId}
                onChange={(e) => {
                  const r = reports.find((rr) => rr.id === e.target.value);
                  setSelectedId(e.target.value);
                  if (r) { setStatus(r.status); setAgency(r.agency); }
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="On-Process">On-Process</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Dinas Tujuan</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {status === 'Ditolak' ? (
              <div>
                <label className="block text-[11px] font-medium text-rose-600 mb-1">Alasan Penolakan</label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Kewenangan jalan nasional / data lokasi tidak valid"
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 border border-rose-200 text-xs text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Catatan Lapangan</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tim satgas telah melakukan penambalan cold-mix..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">URL Foto Bukti Selesai (After)</label>
                  <input
                    type="text"
                    value={afterUrl}
                    onChange={(e) => setAfterUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer mt-1"
            >
              Simpan Pembaruan
            </button>
          </form>
        </section>

        {/* Form 2: Publikasi Pemberitahuan */}
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
              className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 text-xs font-semibold transition-colors cursor-pointer mt-1"
            >
              Terbitkan ke Banner Beranda
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
