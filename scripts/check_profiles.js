const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:@210896Ab@fa@db.xssqhjcytklfpytnssot.supabase.co:5432/postgres'
});

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
