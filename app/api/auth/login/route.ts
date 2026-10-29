import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan kata sandi wajib diisi' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      const msg = error.message.includes('Invalid login credentials')
        ? 'Email atau kata sandi tidak cocok. Silakan periksa kembali atau gunakan tab Daftar jika belum punya akun.'
        : error.message;

      return NextResponse.json(
        { success: false, message: msg },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: data.user,
      session: data.session,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
