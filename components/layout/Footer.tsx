import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-16">
      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="w-8 h-8" />
            <span className="text-white font-bold text-lg tracking-tight">SuaraWarga</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Platform pengaduan infrastruktur publik berbasis warga untuk wilayah <span className="text-slate-300 font-medium">Jakarta, Bogor, Depok, Tangerang, dan Bekasi</span>. Transparansi, akuntabilitas, dan kolaborasi nyata.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Sistem aktif & real-time
          </div>
        </div>

        {/* Navigasi */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Navigasi</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">Beranda & FYP</Link></li>
            <li><Link href="/peta" className="hover:text-white transition-colors">Peta Jabodetabek</Link></li>
            <li><Link href="/kpi" className="hover:text-white transition-colors">KPI Kota</Link></li>
            <li><Link href="/lapor" className="hover:text-white transition-colors">Buat Laporan</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Legal & Info</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
            <li><Link href="/legal/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
            <li><Link href="/legal/guidelines" className="hover:text-white transition-colors">Panduan Komunitas</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <span>© 2026 SuaraWarga — Hak Cipta Dilindungi.</span>
          <span className="text-slate-500 font-medium">FTI UNTAR JAYA 2026</span>
        </div>
      </div>
    </footer>
  );
}