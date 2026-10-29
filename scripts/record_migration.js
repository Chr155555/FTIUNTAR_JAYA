const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:@210896Ab@fa@db.xssqhjcytklfpytnssot.supabase.co:5432/postgres'
});

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
