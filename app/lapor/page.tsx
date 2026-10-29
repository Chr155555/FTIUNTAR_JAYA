'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Building2,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  Upload,
  Camera,
  Trash2,
  ImageIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES, CITIES, AGENCY_ROUTING, JABODETABEK_COORDS } from '@/lib/constants';
import { JabodetabekMap } from '@/components/map/JabodetabekMap';

export default function LaporPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [form, setForm] = useState({
    city: 'Jakarta Barat',
    address: '',
    lat: -6.1668,
    lng: 106.7903,
    category: 'Jalan Rusak',
    title: '',
    description: '',
    photoUrl: '',
    isAnonymous: false,
  });

  const agency = AGENCY_ROUTING[form.category] || 'Dinas Terkait Pemda';

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

  const validateAndProcessFile = (file: File) => {
    setUploadError(null);
    setErrorMsg(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isImageMime = file.type.startsWith('image/');
    const isValidFormat = ALLOWED_EXTENSIONS.includes(ext) || isImageMime;

    if (!isValidFormat) {
      setUploadError('Format file tidak didukung! Harap unggah foto dengan format JPG, JPEG, atau PNG.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(`Ukuran foto terlalu besar (${sizeMB} MB). Batas maksimum file adalah 5 MB (< 5 MB).`);
      return false;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFilePreview(result);
      setForm((p) => ({ ...p, photoUrl: result }));
    };
    reader.readAsDataURL(file);
    return true;
  };

  // Handle citizen uploading photo directly from local device (< 5 MB, JPG/PNG)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setUploadedFile(null);
    setFilePreview(null);
    setUploadError(null);
    setForm((p) => ({ ...p, photoUrl: '' }));
  };

  // Coordinate picked on free Leaflet / OpenFreeMap Jabodetabek map
  const handleCoordinatePicked = (lat: number, lng: number) => {
    setForm((prev) => ({ ...prev, lat, lng }));
  };

  const handleCityChange = (newCity: string) => {
    const coords = JABODETABEK_COORDS[newCity] || { lat: -6.2, lng: 106.8 };
    setForm((prev) => ({
      ...prev,
      city: newCity,
      lat: coords.lat,
      lng: coords.lng,
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setErrorMsg('Harap lengkapi judul laporan masalah Anda.');
      return;
    }
    if (!form.address.trim()) {
      setErrorMsg('Harap masukkan alamat atau patokan lokasi.');
      return;
    }
    if (!form.photoUrl) {
      setErrorMsg('Harap masukkan / unggah foto bukti masalah dari perangkat Anda.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    const ticketNumber = `LAP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      const reporterName = form.isAnonymous
        ? `Warga Anonim #${Math.floor(100 + Math.random() * 899)}`
        : currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Warga Terverifikasi';

      const { data, error } = await supabase
        .from('reports')
        .insert({
          ticket_number: ticketNumber,
          title: form.title.trim(),
          description:
            form.description.trim() ||
            'Mohon segera ditindaklanjuti oleh dinas terkait untuk keamanan masyarakat.',
          category: form.category,
          city: form.city,
          address: form.address.trim(),
          latitude: form.lat,
          longitude: form.lng,
          agency,
          before_image_url: form.photoUrl,
          is_anonymous: form.isAnonymous,
          reporter_id: currentUser?.id || null,
          reporter_name: reporterName,
          upvote_count: 1,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        await supabase.from('report_timelines').insert([
          {
            report_id: data.id,
            step_title: 'Laporan Diterima',
            description: 'Laporan berhasil dipos ke sistem dan masuk ke feed rekomendasi petisi warga.',
            is_done: true,
          },
          {
            report_id: data.id,
            step_title: 'Verifikasi & Disposisi',
            description: `Menunggu verifikasi dan disposisi ke ${agency}.`,
            is_done: false,
          },
          {
            report_id: data.id,
            step_title: 'Sedang Dikerjakan (On-Process)',
            description: 'Petugas dinas mengerahkan tim lapangan dan alat berat.',
            is_done: false,
          },
          {
            report_id: data.id,
            step_title: 'Selesai & Audit Warga',
            description: 'Pekerjaan rampung dan ditimbang kembali oleh warga.',
            is_done: false,
          },
        ]);

        setSuccessTicket(ticketNumber);
        setTimeout(() => {
          router.push(`/laporan/${ticketNumber}`);
          router.refresh();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim pengaduan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
              Formulir Pengaduan Jabodetabek
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              Buat Laporan Baru & Mulai Petisi
            </h1>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Langkah {step} dari 4
          </span>
        </div>

        {/* Stepper Pills */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 rounded-full">
          {['Lokasi & Kota', 'Kategori', 'Detail Masalah', 'Kirim'].map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i + 1)}
              className={`py-1.5 rounded-full text-xs font-medium text-center transition-all cursor-pointer ${
                step === i + 1
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : step > i + 1
                  ? 'text-slate-800'
                  : 'text-slate-400'
              }`}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {successTicket && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Laporan #{successTicket} berhasil diterbitkan! Mengalihkan ke halaman laporan...</span>
          </div>
        )}

        {/* Step 1: Lokasi & Pilih Kota Jabodetabek */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                1. Pilih Wilayah Jabodetabek & Titik Lokasi
              </h2>
              <p className="text-xs text-slate-500">
                Klik pada peta Jabodetabek (OpenFreeMaps Bright Mode) untuk menandai koordinat tepat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Kota / Wilayah Target (JABODETABEK)
                </label>
                <select
                  value={form.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Alamat Lengkap / Patokan
                </label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Contoh: Jl. Margonda Raya No. 45, depan Stasiun UI..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-500">
                Klik peta di bawah untuk menempatkan pin masalah:
              </label>
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <JabodetabekMap
                  reports={[]}
                  selectedCity={form.city}
                  height="260px"
                  interactiveSelect={true}
                  onCoordinatePicked={handleCoordinatePicked}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Koordinat dipilih: <strong>{form.lat}</strong>, <strong>{form.lng}</strong>
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Lanjut: Pilih Kategori</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Kategori Masalah */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">2. Pilih Kategori Masalah</h2>
              <p className="text-xs text-slate-500">
                Sistem otomatis mengarahkan ke dinas teknis pemerintah daerah yang berwenang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, category: cat }))}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    form.category === cat
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs sm:text-sm text-slate-900">{cat}</div>
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Dinas Penanggung Jawab Disposisi:
                </span>
                <div className="font-semibold text-slate-900 text-xs mt-0.5">{agency}</div>
              </div>
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjut: Deskripsi & Foto</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Deskripsi & Foto Bukti (USER EXPORT / UPLOAD BUKAN PILIH) */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                3. Rincian Kronologi & Masukkan Foto Bukti
              </h2>
              <p className="text-xs text-slate-500">
                Foto bukti dimasukkan langsung dari perangkat Anda (bukan memilih foto contoh).
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Judul Laporan</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Contoh: Aspal amblas 20cm dekat Halte Grogol membahayakan motor"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Deskripsi Lengkap / Kronologi Dampak
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Jelaskan ukuran kerusakan, perkiraan risiko saat hujan, atau kemacetan yang timbul..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* FILE UPLOAD (FORMAT JPG / PNG, < 5 MB) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-800">
                  Upload Foto Bukti Kondisi (Sebelum Perbaikan)
                </label>
                <span className="text-[11px] font-medium text-slate-500">
                  Wajib dilampirkan
                </span>
              </div>

              {/* Upload Error Alert */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block">Gagal mengunggah foto:</span>
                    <span>{uploadError}</span>
                  </div>
                </div>
              )}

              {filePreview ? (
                /* Uploaded Preview Card */
                <div className="relative rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative w-36 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={filePreview}
                      alt="Bukti foto kondisi fisik"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Foto Berhasil Diunggah</span>
                    </div>

                    <p className="text-xs font-medium text-slate-800 truncate" title={uploadedFile?.name || 'foto_bukti.jpg'}>
                      {uploadedFile ? uploadedFile.name : 'foto_kondisi_lapangan.jpg'}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        {uploadedFile ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB` : '< 5 MB'} / 5 MB
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200 uppercase">
                        {uploadedFile?.name.split('.').pop() || 'JPG'}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        • Memenuhi syarat (&lt; 5 MB)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Foto ini siap dijadikan bukti fisik untuk penanganan dinas terkait.
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                    <label className="flex-1 sm:flex-none text-center px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer transition-colors">
                      Ganti Foto
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Dropzone to Browse / Upload from Device (< 5 MB, JPG/PNG) */
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`block border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer group ${
                    isDragging
                      ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-600 group-hover:text-rose-600 flex items-center justify-center mx-auto mb-3 transition-colors shadow-2xs">
                    <Upload className="w-5 h-5" />
                  </div>

                  <div className="text-xs sm:text-sm font-semibold text-slate-800">
                    Klik untuk memilih foto atau seret ke sini
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Ambil langsung dari kamera ponsel atau telusuri galeri file komputer
                  </p>

                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      Format: JPG, JPEG, PNG
                    </span>
                    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 shadow-2xs">
                      Ukuran Maks: &lt; 5 MB
                    </span>
                  </div>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!form.photoUrl) {
                    setErrorMsg('Harap masukkan foto bukti terlebih dahulu.');
                    return;
                  }
                  setErrorMsg(null);
                  setStep(4);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Tinjau & Kirim</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Konfirmasi & Kirim */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">4. Konfirmasi Publikasi Pengaduan</h2>
              <p className="text-xs text-slate-500">
                Laporan Anda akan langsung tampil di For You Page (FYP) dan peta warga Jabodetabek.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Wilayah:</span>
                <strong className="text-slate-900">{form.city}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kategori & Instansi:</span>
                <strong className="text-slate-900">{form.category} • {agency}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Alamat:</span>
                <strong className="text-slate-900">{form.address}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block mb-0.5">Judul Masalah:</span>
                <span className="font-semibold text-slate-900">{form.title}</span>
              </div>
              {form.photoUrl && (
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  <span className="text-slate-400">Foto Bukti:</span>
                  <span className="text-emerald-700 font-semibold">✓ Foto terlampir dari perangkat</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200">
              <input
                type="checkbox"
                id="anon"
                checked={form.isAnonymous}
                onChange={(e) => setForm((p) => ({ ...p, isAnonymous: e.target.checked }))}
                className="rounded border-slate-300 text-slate-900"
              />
              <label htmlFor="anon" className="text-xs text-slate-700 cursor-pointer">
                Kirim sebagai <strong>Warga Anonim</strong> (Nama asli tidak dipublikasikan).
              </label>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menerbitkan Pengaduan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Terbitkan & Mulai Petisi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
