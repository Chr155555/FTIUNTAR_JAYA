/* eslint-disable */
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Auto-load environment variables from .env or .env.local
try {
  if (typeof process.loadEnvFile === 'function') {
    const envLocal = path.resolve(__dirname, '../.env.local');
    const envRoot = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envLocal)) process.loadEnvFile(envLocal);
    else if (fs.existsSync(envRoot)) process.loadEnvFile(envRoot);
  }
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is missing.');
  console.error('Please configure DATABASE_URL in your .env or .env.local file.');
  process.exit(1);
}

const dbClient = new Client({ connectionString });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xssqhjcytklfpytnssot.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
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
