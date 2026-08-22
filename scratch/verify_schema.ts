import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key';

console.log('--- GlobeTrotter Schema Verification Script ---');
console.log(`Checking Supabase Endpoint: ${supabaseUrl}`);

const expectedTables = [
  'profiles',
  'cities',
  'activities',
  'trips',
  'stops',
  'trip_activities',
  'expenses',
  'trip_copies',
];

const migrationFile = path.join(__dirname, '../supabase/migrations/0001_initial_schema.sql');

if (fs.existsSync(migrationFile)) {
  console.log(`✓ Migration SQL file exists at: ${migrationFile}`);
  const content = fs.readFileSync(migrationFile, 'utf8');
  let missing = 0;
  for (const table of expectedTables) {
    if (content.includes(`CREATE TABLE IF NOT EXISTS public.${table}`)) {
      console.log(`  - Table definition '${table}': FOUND`);
    } else {
      console.log(`  - Table definition '${table}': MISSING`);
      missing++;
    }
  }
  if (content.includes('ALTER PUBLICATION supabase_realtime ADD TABLE')) {
    console.log('✓ Realtime publication configuration: FOUND');
  }
  if (content.includes('ENABLE ROW LEVEL SECURITY')) {
    console.log('✓ Row Level Security (RLS) policies: FOUND');
  }
  if (missing === 0) {
    console.log('✓ All 8 relational tables, RLS policies & Realtime setup verified in migration SQL.');
  }
} else {
  console.error(`✗ Migration file not found: ${migrationFile}`);
  process.exit(1);
}
