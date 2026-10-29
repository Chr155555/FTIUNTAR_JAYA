'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Megaphone,
  Compass,
  MapPin,
  Award,
  ShieldCheck,
  PlusCircle,
  Bell,
  LogOut,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 1,
      title: 'Pembaruan Status Laporan #LAP-2026-8821',
      desc: 'Satgas Bina Marga Jakbar sedang melakukan penambalan cold-mix di lokasi.',
      time: '15m lalu',
      type: 'process',
      read: false,
      link: '/laporan/LAP-2026-8821',
    },
    {
      id: 2,
      title: 'Pemberitahuan Pekerjaan Pemda Bekasi',
      desc: 'Pekerjaan pengaspalan malam Jl. Ahmad Yani mulai pukul 22.00 WIB.',
      time: '1j lalu',
      type: 'notice',
      read: false,
      link: '/#pengumuman',
    },
    {
      id: 3,
      title: 'Laporan Selesai & Menunggu Audit',
      desc: 'Drainase Margonda Depok sudah lancar. Silakan isi audit kepuasan warga.',
      time: '2j lalu',
      type: 'success',
      read: true,
      link: '/laporan/LAP-2026-8819',
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    // Close notification dropdown when clicked outside
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await supabase.auth.signOut();
    setCurrentUser(null);
    router.push('/');
    router.refresh();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const navItems = [
    { href: '/', label: 'Beranda & FYP', icon: Compass },
    { href: '/#peta', label: 'Peta Jabodetabek', icon: MapPin },
    { href: '/#kpi', label: 'KPI Kota', icon: Award },
    { href: '/gov-admin', label: 'Portal Pemda', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/70">
      <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between gap-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs group-hover:bg-slate-800 transition-colors">
            <Megaphone className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900">
            Suara<span className="text-rose-600">Warga</span>
            <span className="text-slate-400 font-normal"> - JABODETABEK</span>
          </span>
        </Link>

        {/* Desktop Nav (Clean, Google/Twitter minimal style - No hardcoded Detail tab) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href) && item.href !== '/';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions, Notifications & User */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Buat Laporan CTA Button */}
          <Link
            href="/lapor"
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buat Laporan</span>
            <span className="sm:hidden">Lapor</span>
          </Link>

          {/* Interactive Notifications Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Notifikasi Pengaduan & Pemda"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2.5 z-50 animate-fade-in">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-slate-900">Notifikasi Terkini</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 font-bold">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-slate-500 hover:text-slate-900 font-medium"
                    >
                      Tandai sudah dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setShowNotifications(false)}
                      className={`p-3 block hover:bg-slate-50 transition-colors ${
                        !n.read ? 'bg-slate-50/60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'process' ? (
                            <Clock className="w-4 h-4 text-amber-500" />
                          ) : n.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                            <span className="line-clamp-1">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-1">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                            {n.desc}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="px-3.5 pt-2 border-t border-slate-100 text-center">
                  <Link
                    href="/profile"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                  >
                    <span>Buka Riwayat Laporan Saya</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Account State */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200/80 transition-colors"
                title={currentUser.email}
              >
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] flex items-center justify-center font-bold">
                  {(currentUser.user_metadata?.name || currentUser.email || 'W').charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[90px] truncate text-xs">
                  {currentUser.user_metadata?.name || currentUser.email.split('@')[0]}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-full border border-slate-200/80 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Keluar (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                pathname === '/auth'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Submenu Navigation */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-100 scrollbar-none">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              pathname === item.href
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

