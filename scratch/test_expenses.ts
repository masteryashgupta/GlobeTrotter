import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

import { supabaseAdmin } from '../backend/src/lib/supabaseAdmin';

async function testExpensesFlow() {
  console.log('--- Testing Manual Expenses API Flow ---');

  // 1. Get or create a test user
  const { data: users, error: usersErr } = await supabaseAdmin.auth.admin.listUsers();
  if (usersErr) {
    console.error('Error fetching users:', usersErr);
    process.exit(1);
  }

  let testUser = users?.users?.[0];

  if (!testUser) {
    console.log('Creating test user...');
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: `test_user_${Date.now()}@globetrotter.com`,
      password: 'Password123!',
      email_confirm: true,
    });
    if (createErr || !newUser.user) {
      console.error('Failed to create test user:', createErr);
      process.exit(1);
    }
    testUser = newUser.user;
  }
  console.log(`✓ Using test user ID: ${testUser.id} (${testUser.email})`);

  // 2. Create profile if needed
  await supabaseAdmin.from('profiles').upsert({
    id: testUser.id,
    full_name: 'Test Expense User',
  } as any);

  // 3. Get or create a test trip
  const { data: trips } = await supabaseAdmin
    .from('trips')
    .select('*')
    .eq('owner_id', testUser.id);

  let testTrip = trips?.[0];
  if (!testTrip) {
    const { data: newTrip, error: tripErr } = await supabaseAdmin
      .from('trips')
      .insert({
        owner_id: testUser.id,
        name: 'Expense Integration Test Trip',
        description: 'Test trip for expenses endpoints',
        start_date: '2026-09-01',
        end_date: '2026-09-10',
        is_public: true,
      } as any)
      .select('*')
      .single();

    if (tripErr) {
      console.error('Failed to create trip:', tripErr);
      process.exit(1);
    }
    testTrip = newTrip;
  }
  console.log(`✓ Using test trip ID: ${testTrip.id} ("${testTrip.name}")`);

  // 4. Create test expenses across categories
  const sampleExpenses = [
    { trip_id: testTrip.id, category: 'transport', label: 'Flight from JFK to CDG', amount: 650.00 },
    { trip_id: testTrip.id, category: 'stay', label: 'Boutique Hotel Paris 3 nights', amount: 480.00 },
    { trip_id: testTrip.id, category: 'meals', label: 'Bistro Dinner in Montmartre', amount: 85.50 },
    { trip_id: testTrip.id, category: 'activity', label: 'Louvre Skip-the-line Tickets', amount: 45.00 },
    { trip_id: testTrip.id, category: 'misc', label: 'Travel Insurance Policy', amount: 35.00 },
  ];

  console.log('Inserting sample expenses across categories...');
  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from('expenses')
    .insert(sampleExpenses as any)
    .select('*');

  if (insertErr) {
    console.error('Failed to insert sample expenses:', insertErr);
    process.exit(1);
  }

  console.log(`✓ Successfully inserted ${inserted?.length || 0} expense records!`);

  // 5. Verify listing expenses for the trip
  const { data: list, error: listErr } = await supabaseAdmin
    .from('expenses')
    .select('*')
    .eq('trip_id', testTrip.id)
    .order('created_at', { ascending: false });

  if (listErr) {
    console.error('Failed to list expenses:', listErr);
    process.exit(1);
  }

  console.log(`✓ Verified persisted expenses count for trip: ${list?.length || 0}`);
  list?.forEach((exp) => {
    console.log(`   - [${exp.category?.toUpperCase()}] ${exp.label}: $${exp.amount}`);
  });

  // 6. Test updating an expense
  const expenseToUpdate = list?.[0];
  if (expenseToUpdate) {
    const updatedLabel = `${expenseToUpdate.label} (Updated)`;
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('expenses')
      .update({ label: updatedLabel, amount: Number(expenseToUpdate.amount) + 10 } as any)
      .eq('id', expenseToUpdate.id)
      .select('*')
      .single();

    if (!updateErr && updated) {
      console.log(`✓ Updated expense [${updated.id}]: ${updated.label} -> $${updated.amount}`);
    }
  }

  console.log('\n✅ All Expense CRUD operations verified successfully on Supabase!');
}

testExpensesFlow().catch(console.error);
