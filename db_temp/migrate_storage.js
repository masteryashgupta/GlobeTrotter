const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
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
    
    const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/0004_storage_buckets.sql'), 'utf-8');
    await client.query(sql);
    console.log('Successfully ran 0004_storage_buckets.sql against production.');

    const res = await client.query('SELECT id, name, public FROM storage.buckets');
    console.log('Buckets in production:', res.rows);

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

main();
