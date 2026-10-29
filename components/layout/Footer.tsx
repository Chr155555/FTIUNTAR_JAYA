import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/70 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] border border-slate-200">
            SW
          </div>
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
