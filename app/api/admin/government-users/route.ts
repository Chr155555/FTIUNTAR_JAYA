import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    // 1. Verify admin session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Harap masuk terlebih dahulu' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin =
      profile?.role === 'admin' ||
      user.user_metadata?.role === 'admin' ||
      user.email === 'admin@suarawarga.id';

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Admin yang dapat membuat akun pemerintah' },
        { status: 403 }
      );
    }

    const { name, email, password, agency, city } = await req.json();

    if (!name || !email || !password || !agency) {
      return NextResponse.json(
        { success: false, message: 'Nama, email dinas, kata sandi, dan instansi wajib diisi' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Create client using publishable/anon key
    const adminSb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Sign up government account with role 'government'
    const { data: newAuthUser, error: authError } = await adminSb.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          name: name.trim(),
          agency: agency.trim(),
          city: city || 'Jakarta Barat',
          role: 'government',
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { success: false, message: authError.message },
        { status: 400 }
      );
    }

    const newUserId = newAuthUser.user?.id;
    if (newUserId) {
      // Force set role 'government' and agency in profiles
      await supabase
        .from('profiles')
        .update({
          role: 'government',
          name: name.trim(),
          agency: agency.trim(),
          city: city || 'Jakarta Barat',
        })
        .eq('id', newUserId);
    }

    return NextResponse.json({
      success: true,
      message: `Akun Instansi Pemerintah (${agency}) berhasil dibuat.`,
      user: {
        id: newUserId,
        email: trimmedEmail,
        name,
        agency,
        role: 'government',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // List all accounts in profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, profiles });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
