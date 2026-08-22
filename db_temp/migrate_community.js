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
    
    const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/0006_community_posts.sql'), 'utf-8');
    await client.query(sql);
    console.log('Successfully ran 0006_community_posts.sql against production.');

    // Also update full_schema.sql
    const schemaPath = path.join(__dirname, '../supabase/full_schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf-8');
    if (!schema.includes('CREATE TABLE IF NOT EXISTS public.community_posts')) {
      schema += `\n\n${sql}`;
      fs.writeFileSync(schemaPath, schema);
      console.log('Updated full_schema.sql');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

main();
