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
  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'profiles'
  `);
  console.log('Profiles columns:', cols.rows);

  const users = await client.query(`
    SELECT p.id, p.name, p.role, p.city, u.email 
    FROM public.profiles p 
    JOIN auth.users u ON p.id = u.id
  `);
  console.log('Current profiles with role:', users.rows);

  await client.end();
}

main().catch(console.error);
