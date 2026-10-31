'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Bell, CheckCircle2, LogOut, User } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { createClient } from '@/lib/supabase/client';
import type { Report, Notification } from '@/lib/types';

interface Props {
  reports: Report[];
  notifications: Notification[];
}


function isStaffAccount(role?: string, email?: string): boolean {
  const r = (role || '').toLowerCase();
  return (
    r === 'admin' ||
    r === 'super_admin' ||
    r === 'government' ||
    r === 'gov_admin' ||
    email === 'admin@suarawarga.id' ||
    Boolean(email?.endsWith('.go.id'))
  );
}

export function ProfileContent({ reports, notifications: initialNotifs }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [tab, setTab] = useState<'my-reports' | 'upvoted' | 'notifications'>('upvoted');
  const [notifications, setNotifications] = useState(initialNotifs);

  // Read ?tab= URL param and jump to it
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'notifications') setTab('notifications');
    else if (tabParam === 'upvoted') setTab('upvoted');
    else if (tabParam === 'my-reports') setTab('my-reports');
  }, [searchParams]);

  const [user, setUser] = useState({
    name: 'Budi Santoso',
    email: 'budi.santoso@warga.id',
    city: 'Jakarta Barat',
    points: 420,
    badge: 'Warga Pelopor',
    role: 'CITIZEN' as string,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        const role = profile?.role || (authUser.email === 'admin@suarawarga.id' ? 'admin' : 'user');
        const email = profile?.email || authUser.email || '';
        const name = profile?.name || authUser.user_metadata?.name || email.split('@')[0] || 'Warga';
        const city = profile?.city || authUser.user_metadata?.city || 'Jakarta Barat';
        const points = profile?.points || 100;
        const badge = profile?.badge || (isStaffAccount(role, email) ? 'Instansi Resmi' : 'Warga Aktif');

        setUser({ name, email, city, points, badge, role });

        const tabParam = searchParams.get('tab');
        if (!tabParam) {
          if (isStaffAccount(role, email)) {
            setTab('upvoted');
          } else {
            setTab('my-reports');
          }
        }
      }
    }
    fetchUser();
  }, [searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Clean User Profile Card */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-800 shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">{user.name}</h1>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {user.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email} • {user.city}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-200/80 text-left sm:text-right">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Poin Kontribusi</div>
            <div className="text-base sm:text-lg font-bold text-slate-900">{user.points} PTS</div>
          </div>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Ganti Akun</span>
            </Link>
          )}
        </div>
      </section>

      {/* Clean Tab Pills */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-full w-fit">
        {([
          ...(!isStaffAccount(user.role, user.email) ? [{ id: 'my-reports' as const, label: 'Laporan Saya' }] : []),
          { id: 'upvoted' as const, label: 'Didukung' },
          { id: 'notifications' as const, label: `Notifikasi (${notifications.length})` },
        ] as { id: 'my-reports' | 'upvoted' | 'notifications'; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === t.id
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'my-reports' && (
        <div className="space-y-2.5">
          {reports
            .filter((rep) =>
              isLoggedIn
                ? rep.reporter_id === user.email ||
                  rep.reporter_name === user.name ||
                  rep.reporter_name?.includes(user.name.split(' ')[0])
                : true
            )
            .map((rep) => (
            <Link
              key={rep.id}
              href={`/laporan/${rep.ticket_number}`}
              className="block bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-slate-500">{rep.ticket_number}</span>
                    <StatusBadge status={rep.status} />
                  </div>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900">{rep.title}</h4>
                  <p className="text-xs text-slate-400">
                    {rep.city} • Disposisi: {rep.agency} • {rep.upvote_count} Dukungan
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-600 inline-flex items-center gap-0.5">
                  Lihat <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
          {reports.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-xs">Belum ada laporan yang Anda buat.</p>
          )}
        </div>
      )}

      {tab === 'upvoted' && (
        <div className="space-y-2.5">
          {reports.filter((r) => r.is_top_upvoted).map((rep) => (
            <Link
              key={rep.id}
              href={`/laporan/${rep.ticket_number}`}
              className="block bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900">{rep.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {rep.city} • {rep.upvote_count} Upvotes • <StatusBadge status={rep.status} />
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium shrink-0">
                  Didukung ✓
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-colors shadow-2xs ${
                n.is_read ? 'bg-white border-slate-200/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900">{n.title}</h4>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(n.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{n.message}</p>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-xs">Tidak ada notifikasi baru.</p>
          )}
        </div>
      )}
    </div>
  );
}
