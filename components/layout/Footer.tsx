import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/70 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
                    <BrandLogo className="w-5 h-5" />
          <span>
            © 2026 <strong>SuaraWarga</strong> • Platform Pengaduan Infrastruktur Publik
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <Link href="/legal/privacy" className="hover:text-slate-900 transition-colors">
            Kebijakan Privasi
          </Link>
          <Link href="/legal/terms" className="hover:text-slate-900 transition-colors">
            Syarat & Ketentuan
          </Link>
          <Link href="/legal/guidelines" className="hover:text-slate-900 transition-colors">
            Panduan Komunitas
          </Link>
        </div>
      </div>
    </footer>
  );
}