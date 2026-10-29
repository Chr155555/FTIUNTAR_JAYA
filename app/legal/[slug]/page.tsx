import Link from 'next/link';

const PAGES: Record<string, { title: string; content: React.ReactNode }> = {
  privacy: {
    title: 'Kebijakan & Privasi (Privacy Policy)',
    content: (
      <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p>
          SuaraWarga melindungi penuh privasi warga pelapor. Apabila Anda memilih opsi <strong>Lapor Sebagai Anonim</strong>, nama, email, dan identitas Anda disamarkan dari feed publik.
        </p>
        <p>
          Titik koordinat lokasi GPS dan foto bukti lapangan hanya dipergunakan untuk memverifikasi dan mendisposisikan tindak lanjut fisik kepada Dinas / Instansi Pemerintah Daerah terkait.
        </p>
        <p>
          Kami berkomitmen tidak memperjualbelikan maupun menyebarluaskan data kontak pribadi warga kepada pihak komersial mana pun.
        </p>
      </div>
    ),
  },
  terms: {
    title: 'Syarat & Ketentuan (Terms of Service)',
    content: (
      <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p>
          Setiap warga wajib menyampaikan pengaduan berdasarkan fakta lapangan nyata, bukan hoaks, bukan fitnah pribadi, dan tidak bermuatan ujaran kebencian.
        </p>
        <p>
          Penyalahgunaan fasilitas pelaporan publik untuk menjatuhkan pihak lain secara sengaja dapat berakibat penonaktifan akun sesuai ketentuan perundangan yang berlaku.
        </p>
        <p>
          Pemerintah Daerah berhak menolak atau mengoreksi kategori laporan yang masuk apabila lokasi berada di luar kewenangan administratif daerah.
        </p>
      </div>
    ),
  },
  guidelines: {
    title: 'Panduan Komunitas (Aturan Pelaporan)',
    content: (
      <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <li>Ambil foto bukti dengan pencahayaan cukup dan sertakan patokan gedung atau marka jalan sekitar.</li>
        <li>Tentukan titik pin pada peta seakurat mungkin agar satgas lapangan cepat menemukan lokasi.</li>
        <li>Gunakan fitur <strong>Upvote (Dukung)</strong> pada laporan yang sudah ada agar tidak terjadi duplikasi laporan serupa.</li>
        <li>Gunakan bahasa yang lugas, sopan, dan jelas mendeskripsikan bahaya fasilitas bagi keselamatan umum.</li>
      </ul>
    ),
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const page = PAGES[slug];

  if (!page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-3">
        <h1 className="text-lg font-bold text-slate-900">Halaman tidak ditemukan</h1>
        <Link href="/" className="text-slate-600 hover:text-slate-900 text-xs font-medium underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-full w-fit">
        {Object.entries(PAGES).map(([key, p]) => (
          <Link
            key={key}
            href={`/legal/${key}`}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              slug === key
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {p.title.split(' ')[0]}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h1 className="text-base sm:text-lg font-bold text-slate-900">{page.title}</h1>
        {page.content}
      </div>
    </div>
  );
}
