import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true, message: 'Logout berhasil' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
