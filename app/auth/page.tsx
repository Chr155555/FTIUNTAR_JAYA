'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { CITIES } from '@/lib/constants';

export default function AuthPage() {
  const router = useRouter();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Jakarta Barat');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Switch tab safely and reset form state
  const handleTabChange = (newTab: 'login' | 'register' | 'forgot') => {
    setTab(newTab);
    setMessage(null);
    setLoading(false);
  };

  // Instant fill & login for demo accounts
  const handleQuickDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setTab('login');
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({
          type: 'error',
          text: data.message || 'Gagal masuk akun demo. Silakan coba kembali.',
        });
      } else {
        setMessage({
          type: 'success',
          text: `Berhasil masuk sebagai ${data.user?.user_metadata?.name || demoEmail}! Mengalihkan...`,
        });
        setTimeout(() => {
          router.push('/profile');
          router.refresh();
        }, 800);
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Koneksi gagal. Periksa jaringan Anda.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Login & Register & Forgot Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Silakan isi alamat email Anda.' });
      return;
    }

    if (tab !== 'forgot' && (!password || password.length < 6)) {
      setMessage({ type: 'error', text: 'Kata sandi minimal 6 karakter.' });
      return;
    }

    setMessage(null);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    try {
      if (tab === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setMessage({
            type: 'error',
            text:
              data.message ||
              'Email atau kata sandi tidak cocok. Jika belum terdaftar, silakan pilih tab Daftar.',
          });
          setLoading(false);
          return;
        }

        setMessage({
          type: 'success',
          text: `Selamat datang kembali, ${data.user?.user_metadata?.name || data.user?.email}! Mengalihkan...`,
        });

        setTimeout(() => {
          router.push('/profile');
          router.refresh();
        }, 800);
      } else if (tab === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            name: name.trim() || email.split('@')[0],
            city,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setMessage({
            type: 'error',
            text: data.message || 'Pendaftaran gagal. Silakan coba kembali.',
          });
          setLoading(false);
          return;
        }

        setMessage({
          type: 'success',
          text: 'Pendaftaran berhasil! Akun Anda aktif dan tersimpan di database. Mengalihkan...',
        });

        setTimeout(() => {
          router.push('/profile');
          router.refresh();
        }, 1000);
      } else if (tab === 'forgot') {
        clearTimeout(timeoutId);
        setMessage({
          type: 'success',
          text: 'Tautan pemulihan kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk.',
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessage({
          type: 'error',
          text: 'Permintaan memakan waktu terlalu lama. Silakan periksa koneksi internet Anda.',
        });
      } else {
        setMessage({
          type: 'error',
          text: err.message || 'Terjadi kesalahan sistem. Silakan coba lagi.',
        });
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14 bg-slate-50/50">
      <div className="w-full max-w-sm space-y-4">
        {/* Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/70 shadow-xs space-y-5">
          {/* Brand & Header */}
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-2 border border-slate-200/60">
              <Lock className="w-4 h-4 text-slate-700" />
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
              {tab === 'login'
                ? 'Masuk ke Akun Warga'
                : tab === 'register'
                ? 'Daftar Akun Baru'
                : 'Pemulihan Kata Sandi'}
            </h1>
            <p className="text-xs text-slate-500">
              {tab === 'login'
                ? 'Gunakan email terdaftar atau akun uji coba di bawah'
                : tab === 'register'
                ? 'Buat akun dalam hitungan detik untuk melapor'
                : 'Masukkan email untuk menerima tautan pemulihan'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
            {([['login', 'Masuk'], ['register', 'Daftar'], ['forgot', 'Lupa Sandi']] as const).map(
              ([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTabChange(id)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tab === id
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>

          {/* Quick Demo Accounts Banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pilih Role Demo (1-Klik Masuk):</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('budi@gmail.com', 'password123')}
                disabled={loading}
                className="text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100/80 border border-slate-200/80 text-[11px] transition-colors cursor-pointer group disabled:opacity-50"
              >
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>1. Budi Santoso (User Biasa)</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400">budi@gmail.com • Hak: Buat Laporan & Petisi</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('pemda@jakbar.go.id', 'password123')}
                disabled={loading}
                className="text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100/80 border border-slate-200/80 text-[11px] transition-colors cursor-pointer group disabled:opacity-50"
              >
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>2. Satgas Pemda (Government Account)</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400">pemda@jakbar.go.id • Hak: Update Status & Bukti After</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@suarawarga.id', 'admin123')}
                disabled={loading}
                className="text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100/80 border border-rose-200/80 text-[11px] transition-colors cursor-pointer group disabled:opacity-50"
              >
                <div className="font-semibold text-rose-800 flex items-center justify-between">
                  <span>3. Super Admin (Admin Panel)</span>
                  <ArrowRight className="w-3 h-3 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400">admin@suarawarga.id • Hak: Delete Laporan & Buat Akun Gov</div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-100" />
            <span className="absolute bg-white px-2.5 text-[10px] uppercase tracking-wider text-slate-400">
              atau input manual
            </span>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Kota Domisili
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                  ℹ️ <strong>Perhatian Role:</strong> Pendaftaran publik otomatis menetapkan role <strong>Warga (User Biasa)</strong>. Akun Instansi Pemerintah dibuat oleh Super Admin melalui Admin Panel.
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              />
            </div>

            {tab !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Kata Sandi
                  </label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleTabChange('forgot')}
                      className="text-[10px] text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Lupa sandi?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                />
              </div>
            )}

            {/* Feedback message banner */}
            {message && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer mt-2 flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {tab === 'login'
                  ? loading
                    ? 'Sedang Masuk...'
                    : 'Masuk ke Akun'
                  : tab === 'register'
                  ? loading
                    ? 'Mendaftarkan...'
                    : 'Daftar Sekarang'
                  : loading
                  ? 'Mengirim...'
                  : 'Kirim Tautan Pemulihan'}
              </span>
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-2 text-center text-[11px] text-slate-400">
            {tab === 'login' ? (
              <span>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="text-slate-800 font-semibold hover:underline"
                >
                  Daftar di sini
                </button>
              </span>
            ) : (
              <span>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="text-slate-800 font-semibold hover:underline"
                >
                  Masuk di sini
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
