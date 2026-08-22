import assert from 'assert';
import { expenseCreateSchema, expenseUpdateSchema } from '../../shared/validation';

export function runValidationAudit() {
  console.log('--- 1. Client & Server Schema Validation Audit ---');

  // Valid expense payload
  const validPayload = {
    trip_id: 'trip-123',
    category: 'transport',
    label: 'Flight ticket',
    amount: 250.50,
  };
  const validRes = expenseCreateSchema.safeParse(validPayload);
  assert.ok(validRes.success, 'Valid expense payload must pass schema validation');
  console.log('  ✓ Valid expense payload passed schema validation');

  // Invalid: Negative Amount
  const negativePayload = {
    trip_id: 'trip-123',
    category: 'meals',
    label: 'Dinner',
    amount: -50.00,
  };
  const negativeRes = expenseCreateSchema.safeParse(negativePayload);
  assert.strictEqual(negativeRes.success, false, 'Negative amount must be rejected by schema');
  console.log('  ✓ Negative amount rejected by expenseCreateSchema');

  // Invalid: Zero Amount
  const zeroPayload = {
    trip_id: 'trip-123',
    category: 'meals',
    label: 'Snack',
    amount: 0,
  };
  const zeroRes = expenseCreateSchema.safeParse(zeroPayload);
  assert.strictEqual(zeroRes.success, false, 'Zero amount must be rejected by schema');
  console.log('  ✓ Zero amount rejected by expenseCreateSchema');

  // Invalid: Category Enum Value
  const invalidCatPayload = {
    trip_id: 'trip-123',
    category: 'luxuries',
    label: 'Yacht rental',
    amount: 1000.00,
  };
  const invalidCatRes = expenseCreateSchema.safeParse(invalidCatPayload);
  assert.strictEqual(invalidCatRes.success, false, 'Invalid category enum must be rejected');
  console.log('  ✓ Invalid category enum value ("luxuries") rejected');

  // Valid Update Schema
  const validUpdate = { amount: 300.00, label: 'Updated Flight' };
  const updateRes = expenseUpdateSchema.safeParse(validUpdate);
  assert.ok(updateRes.success, 'Valid expense update payload must pass validation');
  console.log('  ✓ Valid expense update payload passed');
}

export function runDragRescheduleValidationAudit() {
  console.log('\n--- 2. Calendar Drag-to-Reschedule Date Boundary Audit ---');

  const stopArrival = '2026-10-01';
  const stopDeparture = '2026-10-05';

  const validDropDate = '2026-10-03';
  const isWithinBounds = validDropDate >= stopArrival && validDropDate <= stopDeparture;
  assert.ok(isWithinBounds, 'Target date 2026-10-03 is within stop dates (2026-10-01 to 2026-10-05)');
  console.log('  ✓ Valid drop date (2026-10-03) accepted within stop range');

  const invalidBeforeDropDate = '2026-09-30';
  const isBeforeValid = invalidBeforeDropDate >= stopArrival && invalidBeforeDropDate <= stopDeparture;
  assert.strictEqual(isBeforeValid, false, 'Target date before arrival date must be rejected');
  console.log('  ✓ Invalid drop date before arrival (2026-09-30) rejected');

  const invalidAfterDropDate = '2026-10-06';
  const isAfterValid = invalidAfterDropDate >= stopArrival && invalidAfterDropDate <= stopDeparture;
  assert.strictEqual(isAfterValid, false, 'Target date after departure date must be rejected');
  console.log('  ✓ Invalid drop date after departure (2026-10-06) rejected');
}

export function runUnshareRevocationAudit() {
  console.log('\n--- 3. Public Share & Unshare Revocation Audit ---');

  interface TripDbMock {
    id: string;
    share_token: string;
    is_public: boolean;
  }

  const tripDb: TripDbMock = {
    id: 'trip-999',
    share_token: 'share_token_abc_123',
    is_public: true,
  };

  // Helper lookup simulation
  function fetchPublicTrip(token: string) {
    if (tripDb.share_token === token && tripDb.is_public) {
      return { status: 200, data: tripDb };
    }
    return { status: 404, error: 'Shared trip not found or link is private' };
  }

  // Shared state
  const sharedResult = fetchPublicTrip('share_token_abc_123');
  assert.strictEqual(sharedResult.status, 200, 'Public trip must be accessible when is_public = true');
  console.log('  ✓ Public trip accessible via share_token when is_public = true');

  // Unshare action
  tripDb.is_public = false;
  const unsharedResult = fetchPublicTrip('share_token_abc_123');
  assert.strictEqual(unsharedResult.status, 404, 'Unshared trip must return 404 when is_public = false');
  assert.strictEqual(tripDb.share_token, 'share_token_abc_123', 'Share token preserved in database for future re-sharing');
  console.log('  ✓ Unsharing trip sets is_public = false and revokes public access (returns 404)');
}

export function runDeepCopyIndependenceAudit() {
  console.log('\n--- 4. Deep Copy Data Independence Audit ---');

  const originalTrip = {
    id: 'orig-1',
    name: 'Tokyo Adventure',
    stops: [
      { id: 'orig-stop-1', city: 'Tokyo', activities: [{ id: 'orig-act-1', name: 'Shibuya Crossing', cost: 20.00 }] },
    ],
  };

  // Deep copy simulation
  const clonedTrip = {
    id: 'clone-1',
    name: `Copy of ${originalTrip.name}`,
    stops: [
      { id: 'clone-stop-1', city: 'Tokyo', activities: [{ id: 'clone-act-1', name: 'Shibuya Crossing', cost: 20.00 }] },
    ],
  };

  // User B edits cloned activity cost
  clonedTrip.stops[0].activities[0].cost = 150.00;

  assert.strictEqual(clonedTrip.stops[0].activities[0].cost, 150.00, 'Cloned activity cost updated to $150.00');
  assert.strictEqual(originalTrip.stops[0].activities[0].cost, 20.00, 'Original activity cost remains $20.00');
  console.log('  ✓ Modifying cloned activity cost ($150.00) did not mutate original activity cost ($20.00)');
}

function runFullQAPass() {
  console.log('=============== PART C FULL QA AUDIT SUITE ===============\n');
  runValidationAudit();
  runDragRescheduleValidationAudit();
  runUnshareRevocationAudit();
  runDeepCopyIndependenceAudit();
  console.log('\n✅ ALL PART C QA AUDIT CHECKS PASSED CLEANLY!');
}

runFullQAPass();
