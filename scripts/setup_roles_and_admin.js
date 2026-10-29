const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const dbClient = new Client({
  connectionString: 'postgresql://postgres:@210896Ab@fa@db.xssqhjcytklfpytnssot.supabase.co:5432/postgres'
});

const sb = createClient(
  'https://xssqhjcytklfpytnssot.supabase.co',
  'sb_publishable_hZtn7jlpj3zBstAULQz7Ig_G8W7z7U1'
);

async function main() {
  await dbClient.connect();
  console.log('Connected to PostgreSQL');

  // 1. Add agency column to profiles if not exists
  await dbClient.query(`
    ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS agency TEXT;
  `);

  // 2. Standardize roles in profiles: 'user', 'government', 'admin'
  await dbClient.query(`
    UPDATE public.profiles 
    SET role = 'user' 
    WHERE role = 'CITIZEN' OR role IS NULL;
  `);

  // 3. Create or update Admin account: admin@suarawarga.id / admin123
  const { data: adminAuth, error: adminErr } = await sb.auth.signUp({
    email: 'admin@suarawarga.id',
    password: 'admin123',
    options: {
      data: {
        name: 'Super Admin Platform',
        city: 'DKI Jakarta',
        role: 'admin',
      }
    }
  });

  if (adminErr) {
    console.log('Admin signup note:', adminErr.message);
  } else {
    console.log('Admin account created / ensured:', adminAuth.user?.id);
  }

  // Force set admin role in profiles and auth.users
  await dbClient.query(`
    UPDATE public.profiles
    SET role = 'admin', name = 'Super Admin Platform'
    WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@suarawarga.id');
  `);

  // 4. Update pemda@jakbar.go.id to role: 'government'
  await dbClient.query(`
    UPDATE public.profiles
    SET role = 'government', agency = 'Dinas Bina Marga DKI'
    WHERE id IN (SELECT id FROM auth.users WHERE email = 'pemda@jakbar.go.id');
  `);

  // 5. Update budi@gmail.com to role: 'user'
  await dbClient.query(`
    UPDATE public.profiles
    SET role = 'user'
    WHERE id IN (SELECT id FROM auth.users WHERE email = 'budi@gmail.com');
  `);

  // 6. Update user_metadata in auth.users
  await dbClient.query(`
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"')
    WHERE email = 'admin@suarawarga.id';

    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"government"')
    WHERE email = 'pemda@jakbar.go.id';

    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"user"')
    WHERE email = 'budi@gmail.com';
  `);

  // 7. Verify profiles
  const res = await dbClient.query(`
    SELECT p.name, p.role, p.city, p.agency, u.email
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    ORDER BY p.role, p.name;
  `);
  console.log('Updated user profiles:', res.rows);

  await dbClient.end();
}

main().catch(console.error);
