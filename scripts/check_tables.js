/* eslint-disable */
const { Client } = require('pg');
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

const client = new Client({ connectionString });

async function main() {
  await client.connect();
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('Tables in public schema:', tables.rows.map(r => r.table_name));

  const reports = await client.query('SELECT count(*) FROM public.reports');
  console.log('Total reports in database:', reports.rows[0].count);

  const users = await client.query('SELECT count(*) FROM auth.users');
  console.log('Total users in auth.users:', users.rows[0].count);

  // Check if supabase_migrations schema exists
  const migSchema = await client.query(`
    SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'supabase_migrations';
  `);
  console.log('Has supabase_migrations schema:', migSchema.rows.length > 0);

  if (migSchema.rows.length > 0) {
    const migs = await client.query('SELECT * FROM supabase_migrations.schema_migrations');
    console.log('Recorded CLI migrations:', migs.rows);
  }

  await client.end();
}

main().catch(console.error);
