'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Trash2,
  UserPlus,
  Building2,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { CITIES, CATEGORIES, AGENCY_ROUTING } from '@/lib/constants';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Report } from '@/lib/types';

interface Props {
  initialReports: Report[];
  initialProfiles: any[];
  currentUser: any;
  userRole: string;
}

export function AdminContent({
  initialReports,
  initialProfiles,
  currentUser,
  userRole,
}: Props) {
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>(initialReports);
  const [profiles, setProfiles] = useState<any[]>(initialProfiles);
  const [tab, setTab] = useState<'reports' | 'create-gov' | 'users'>('reports');

  // Search & filter
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New government user form
  const [govForm, setGovForm] = useState({
    name: '',
    email: '',
    password: '',
    agency: 'Dinas Bina Marga',
    city: 'Jakarta Barat',
  });
  const [creatingGov, setCreatingGov] = useState(false);

  const isAdmin = userRole === 'admin' || currentUser?.email === 'admin@suarawarga.id';

  // Handle Delete Report (Super Admin feature)
  const handleDeleteReport = async (id: string, ticketNumber: string) => {
    setDeletingId(id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data.message || 'Gagal menghapus laporan.' });
      } else {
        setReports((prev) => prev.filter((r) => r.id !== id));
        setDeleteConfirmId(null);
        setFeedback({
          type: 'success',
          text: `Laporan #${ticketNumber} berhasil dihapus permanen dari database.`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Koneksi gagal saat menghapus laporan.' });
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Create Government Account
  const handleCreateGov = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingGov(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/government-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(govForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data.message || 'Gagal membuat akun pemerintah.' });
      } else {
        setFeedback({
          type: 'success',
          text: `Akun instansi ${govForm.name} (${govForm.agency}) berhasil didaftarkan dengan role 'government'!`,
        });
        setGovForm({
          name: '',
          email: '',
          password: '',
          agency: 'Dinas Bina Marga',
          city: 'Jakarta Barat',
        });
        // refresh profiles
        const profRes = await fetch('/api/admin/government-users');
        const profData = await profRes.json();
        if (profData.profiles) setProfiles(profData.profiles);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setCreatingGov(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.ticket_number.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      (r.address && r.address.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q))
    );
  });

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Akses Terbatas: Super Admin Panel</h2>
          <p className="text-xs text-slate-500 mt-1">
            Halaman ini khusus untuk administrator platform untuk menghapus laporan dan mendaftarkan akun instansi pemerintah.
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-left space-y-1.5">
          <span className="font-semibold text-slate-800 text-[11px] block">Gunakan Akun Admin:</span>
          <div className="text-[11px] text-slate-600">Email: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">admin@suarawarga.id</code></div>
          <div className="text-[11px] text-slate-600">Sandi: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">admin123</code></div>
        </div>
        <Link
          href="/auth"
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Masuk Sebagai Admin</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Panel */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white">
              Super Admin Control
            </span>
            <span className="text-xs text-slate-300">SuaraWarga</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold mt-1.5">
            Admin Panel: Manajemen Laporan & Akun Instansi
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Otoritas penuh untuk menghapus laporan, memvalidasi satgas, dan menerbitkan akun dinas pemerintah.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="bg-white/10 px-3.5 py-2 rounded-xl text-center border border-white/10">
            <div className="text-base font-bold text-white">{reports.length}</div>
            <div className="text-[10px] text-slate-300">Laporan</div>
          </div>
          <div className="bg-white/10 px-3.5 py-2 rounded-xl text-center border border-white/10">
            <div className="text-base font-bold text-emerald-400">{profiles.length}</div>
            <div className="text-[10px] text-slate-300">Pengguna</div>
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-full w-fit">
        <button
          type="button"
          onClick={() => setTab('reports')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            tab === 'reports' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Moderasi & Hapus Laporan ({reports.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('create-gov')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            tab === 'create-gov' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          + Buat Akun Government
        </button>

        <button
          type="button"
          onClick={() => setTab('users')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            tab === 'users' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Daftar Role Akun ({profiles.length})
        </button>
      </div>

      {/* TAB 1: MODERASI & HAPUS LAPORAN */}
      {tab === 'reports' && (
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Kelola Seluruh Pengaduan Warga
              </h2>
              <p className="text-xs text-slate-500">
                Super Admin dapat menghapus laporan palsu, spam, atau tidak sesuai ketentuan.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari tiket, judul, kota..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredReports.map((rep) => (
              <div
                key={rep.id}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {rep.ticket_number}
                    </span>
                    <StatusBadge status={rep.status} />
                    <span className="text-[11px] font-medium text-slate-500">{rep.city}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">{rep.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    Instansi: {rep.agency} • Pelapor: {rep.reporter_name || 'Anonim'} • {rep.upvote_count} Dukungan
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={`/laporan/${rep.ticket_number}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                  >
                    <span>Lihat</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>

                  {deleteConfirmId === rep.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(rep.id, rep.ticket_number)}
                        disabled={deletingId === rep.id}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {deletingId === rep.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        <span>Konfirmasi Hapus</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(rep.id)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="text-center py-10 text-xs text-slate-400">
                Tidak ada laporan yang cocok dengan pencarian.
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 2: BUAT AKUN GOVERNMENT (KHUSUS ADMIN PANEL) */}
      {tab === 'create-gov' && (
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4 max-w-xl">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-900">
                Pendaftaran Akun Instansi Pemerintah (Government Account)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hanya akun pengguna biasa (`user`) yang dapat mendaftar mandiri. Akun pemerintah dengan hak memperbarui status & upload foto bukti After <strong>wajib didaftarkan oleh Super Admin di panel ini</strong>.
            </p>
          </div>

          <form onSubmit={handleCreateGov} className="space-y-3.5 pt-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Nama Petugas / Satgas Resmi
              </label>
              <input
                type="text"
                required
                value={govForm.name}
                onChange={(e) => setGovForm({ ...govForm, name: e.target.value })}
                placeholder="Contoh: Satgas SDA Depok / Tim Reaksi Cepat Bina Marga"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Email Dinas Resmi
                </label>
                <input
                  type="email"
                  required
                  value={govForm.email}
                  onChange={(e) => setGovForm({ ...govForm, email: e.target.value })}
                  placeholder="satgas@depok.go.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Kata Sandi Akses
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={govForm.password}
                  onChange={(e) => setGovForm({ ...govForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Dinas / Satuan Kerja
                </label>
                <select
                  value={govForm.agency}
                  onChange={(e) => setGovForm({ ...govForm, agency: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                >
                  <option value="Dinas Bina Marga">Dinas Bina Marga</option>
                  <option value="Dinas Sumber Daya Air (SDA)">Dinas Sumber Daya Air (SDA)</option>
                  <option value="Dinas Perhubungan (Dishub)">Dinas Perhubungan (Dishub)</option>
                  <option value="Dinas Lingkungan Hidup (DLH)">Dinas Lingkungan Hidup (DLH)</option>
                  <option value="Dinas Pertamanan & Perkim">Dinas Pertamanan & Perkim</option>
                  <option value="Satpol PP">Satpol PP</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Wilayah Kota Penugasan
                </label>
                <select
                  value={govForm.city}
                  onChange={(e) => setGovForm({ ...govForm, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800 block">Hak Akses Otomatis:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Diberikan role <code>government</code> di Supabase.</li>
                <li>Dapat login ke <strong>Portal Pemda (/gov-admin)</strong>.</li>
                <li>Bisa update status (Mulai Ditangani, Selesai, Tolak) dan mengunggah foto After.</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={creatingGov}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {creatingGov ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>{creatingGov ? 'Mendaftarkan Akun...' : 'Terbitkan Akun Instansi Pemerintah'}</span>
            </button>
          </form>
        </section>
      )}

      {/* TAB 3: DAFTAR ROLE AKUN */}
      {tab === 'users' && (
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Daftar Akun Pengguna & Hak Akses
            </h2>
            <p className="text-xs text-slate-500">
              Klasifikasi role: User Biasa (warga), Government (dinas pemda), dan Admin.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {profiles.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>{p.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        p.role === 'admin'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : p.role === 'government'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {p.role || 'user'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {p.city} {p.agency ? `• ${p.agency}` : ''}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  {p.role === 'government'
                    ? 'Akses: Portal Pemda & Update Status'
                    : p.role === 'admin'
                    ? 'Akses: Super Admin Panel'
                    : 'Akses: Pengaduan Warga'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
