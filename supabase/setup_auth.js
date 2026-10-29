const { Client } = require('pg');

async function fix() {
  const client = new Client({
    host: 'db.xssqhjcytklfpytnssot.supabase.co',
    port: 5432,
    user: 'postgres',
    password: '@210896Ab@fa',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  // Create public.profiles table if not exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name text NOT NULL DEFAULT 'Warga',
      email text,
      city text NOT NULL DEFAULT 'Jakarta Barat',
      role text NOT NULL DEFAULT 'CITIZEN',
      points integer NOT NULL DEFAULT 100,
      badge text NOT NULL DEFAULT 'Warga Aktif',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
    CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Public profiles insert" ON public.profiles;
    CREATE POLICY "Public profiles insert" ON public.profiles FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Public profiles update" ON public.profiles;
    CREATE POLICY "Public profiles update" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

    -- Function with SECURITY DEFINER to create profile
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, auth
    AS $$
    BEGIN
      INSERT INTO public.profiles (id, name, email, city, role, points, badge)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'city', 'Jakarta Barat'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'CITIZEN'),
        100,
        'Warga Aktif'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email;

      -- Auto confirm email so citizen can login immediately
      UPDATE auth.users
      SET email_confirmed_at = COALESCE(email_confirmed_at, now())
      WHERE id = NEW.id;

      RETURN NEW;
    END;
    $$;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  `);

  console.log('Fixed trigger with SECURITY DEFINER.');
  await client.end();
}
fix().catch(console.error);
