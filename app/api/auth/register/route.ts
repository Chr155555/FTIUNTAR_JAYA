import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { email, password, name, city } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan kata sandi wajib diisi' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // STRICT ROLE CONTROL: Public registration can ONLY create role 'user'
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          name: name ? name.trim() : splitEmailName(trimmedEmail),
          city: city || 'Jakarta Barat',
          role: 'user',
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    // Ensure role is 'user' in profiles table
    if (data.user?.id) {
      await supabase
        .from('profiles')
        .update({ role: 'user', city: city || 'Jakarta Barat' })
        .eq('id', data.user.id);
    }

    // Automatically sign in to set cookies and session
    const { data: signData } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil dan akun warga Anda telah aktif!',
      user: data.user,
      session: signData?.session,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

function splitEmailName(email: string) {
  return email.split('@')[0];
}
