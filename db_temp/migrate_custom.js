const { Client } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

const client = new Client({
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.ddeqnwsxowmpclyzrjkx',
  password: 'nAxu2$5f?sYa!eL',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to DB');
    
    await client.query(`
      ALTER TABLE public.stops ADD COLUMN IF NOT EXISTS custom_city_name TEXT;
    `);
    console.log('Added custom_city_name to stops');

    await client.query(`
      ALTER TABLE public.trip_activities ADD COLUMN IF NOT EXISTS custom_activity_name TEXT;
    `);
    console.log('Added custom_activity_name to trip_activities');

    // Make sure to reload schema cache in Supabase (if required, but altering table is enough for SQL)
    console.log('Migration successful.');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

main();
