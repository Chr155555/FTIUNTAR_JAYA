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
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Load notifications
  const loadNotifications = async (userId?: string) => {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      const { data } = await query;
      if (data && data.length > 0) {
        setNotifications(data);
      } else {
        setNotifications([
          {
            id: 'sys-1',
            title: 'Sistem Terhubung ke Database',
            message: 'Database pengaduan warga Jabodetabek aktif.',
            created_at: new Date().toISOString(),
            is_read: false,
          },
          {
            id: 'sys-2',
            title: 'Satgas Pemda Siaga',
            message: 'Respon cepat pengaduan warga diperbarui.',
            created_at: new Date().toISOString(),
            is_read: false,
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load notifications from database:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
      loadNotifications(data.user?.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        loadNotifications(session.user.id);
      }
    });

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    } catch (e) {
      // ignore
    }
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return 'Baru saja';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return 'Baru saja';
    if (diff < 60) return `${diff}m lalu`;
    if (diff < 1440) return `${Math.floor(diff / 60)}j lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const isAdmin =
    currentUser?.user_metadata?.role === 'admin' || currentUser?.email === 'admin@suarawarga.id';

  const navItems = [
    { href: '/', label: 'Beranda & FYP', icon: Compass },
    { href: '/peta', label: 'Peta Jabodetabek', icon: MapPin },
    { href: '/#kpi', label: 'KPI Kota', icon: Award },
    { href: '/gov-admin', label: 'Portal Pemda', icon: ShieldCheck },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin Panel', icon: ShieldCheck }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs group-hover:bg-slate-800 transition-colors">
            <Megaphone className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              SuaraWarga
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-sky-500 uppercase">
              - JABODETABEK
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold border border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-medium'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions & Notifications & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/lapor"
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buat Laporan</span>
            <span className="sm:hidden">Lapor</span>
          </Link>

          {/* Interactive Live Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Notifikasi Pengaduan & Pemda"
            >
              <Bell className="w-4 h-4" />
              {(unreadCount > 0 || notifications.length > 0) && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 0 ? unreadCount : 2}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2.5 z-50 animate-fade-in">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-slate-900">
                      Notifikasi Database ({notifications.length})
                    </span>
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
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 block hover:bg-slate-50 transition-colors ${
                        !n.is_read ? 'bg-slate-50/60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {n.title?.includes('Selesai') ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : n.title?.includes('Ditolak') ? (
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                            <span className="line-clamp-1">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-1">
                              {timeAgo(n.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </div>
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
                  {(currentUser.user_metadata?.role === 'government' || currentUser.user_metadata?.role === 'satgas' ? 'S' : currentUser.user_metadata?.name || currentUser.email || 'W').charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[100px] truncate text-xs font-medium">
                  {currentUser.user_metadata?.role === 'government' || currentUser.user_metadata?.role === 'satgas'
                    ? 'Satgas Pemd...'
                    : currentUser.user_metadata?.name || currentUser.email.split('@')[0]}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-full border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
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
