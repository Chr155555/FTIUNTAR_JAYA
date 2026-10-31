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
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS supabase_migrations;
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version TEXT PRIMARY KEY,
      statements TEXT[],
      name TEXT
    );
    INSERT INTO supabase_migrations.schema_migrations (version, name)
    VALUES ('20261028120000', 'init_suarawarga_civic_platform')
    ON CONFLICT (version) DO NOTHING;
  `);
  console.log('Registered migration in supabase_migrations.schema_migrations');
  await client.end();
}

main().catch(console.error);
