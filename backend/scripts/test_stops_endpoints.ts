import http from 'http';
import { StopService } from '../src/services/stopService';

const BASE_URL = 'http://127.0.0.1:5000/api';

// Create a mock auth token helper or direct StopService test
async function runStopsTests() {
  console.log('==================================================');
  console.log('🧪 RUNNING GLOBETROTTER STOPS & OVERLAP TESTS');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  const testTripId = '11111111-1111-4000-8000-000000000099';
  const testUserId = 'user-test-123';
  const parisId = '11111111-1111-4000-8000-000000000001';
  const niceId = '11111111-1111-4000-8000-000000000002';
  const tokyoId = '11111111-1111-4000-8000-000000000004';

  // Test 1: Create initial stop in Paris (2026-06-01 to 2026-06-05)
  const stop1 = await StopService.createStop({
    tripId: testTripId,
    cityId: parisId,
    arrivalDate: '2026-06-01',
    departureDate: '2026-06-05',
    userId: testUserId,
  });

  assert(
    stop1.city_id === parisId && stop1.order_index === 0,
    'Create initial stop in Paris (2026-06-01 to 2026-06-05)',
    `order_index: ${stop1.order_index}`
  );

  // Test 2: Create second non-overlapping stop in Nice (2026-06-06 to 2026-06-10)
  const stop2 = await StopService.createStop({
    tripId: testTripId,
    cityId: niceId,
    arrivalDate: '2026-06-06',
    departureDate: '2026-06-10',
    userId: testUserId,
  });

  assert(
    stop2.city_id === niceId && stop2.order_index === 1,
    'Create non-overlapping stop in Nice (2026-06-06 to 2026-06-10) auto sets order_index 1',
    `order_index: ${stop2.order_index}`
  );

  // Test 3: Overlap validation - Partial overlap with Paris (2026-06-04 to 2026-06-08)
  let overlap1Failed = false;
  let overlap1Msg = '';
  try {
    await StopService.createStop({
      tripId: testTripId,
      cityId: tokyoId,
      arrivalDate: '2026-06-04',
      departureDate: '2026-06-08',
      userId: testUserId,
    });
  } catch (err: any) {
    overlap1Failed = true;
    overlap1Msg = err.message;
  }
  assert(
    overlap1Failed && overlap1Msg.includes('overlap'),
    'Reject overlapping stop (2026-06-04 to 2026-06-08) overlapping with Paris',
    `Error message: ${overlap1Msg}`
  );

  // Test 4: Overlap validation - Complete engulfing overlap (2026-05-25 to 2026-06-15)
  let overlap2Failed = false;
  let overlap2Msg = '';
  try {
    await StopService.createStop({
      tripId: testTripId,
      cityId: tokyoId,
      arrivalDate: '2026-05-25',
      departureDate: '2026-06-15',
      userId: testUserId,
    });
  } catch (err: any) {
    overlap2Failed = true;
    overlap2Msg = err.message;
  }
  assert(
    overlap2Failed && overlap2Msg.includes('overlap'),
    'Reject encompassing overlap (2026-05-25 to 2026-06-15)',
    `Error message: ${overlap2Msg}`
  );

  // Test 5: Overlap validation - Exact same day overlap (2026-06-05 to 2026-06-05)
  let overlap3Failed = false;
  try {
    await StopService.createStop({
      tripId: testTripId,
      cityId: tokyoId,
      arrivalDate: '2026-06-05',
      departureDate: '2026-06-05',
      userId: testUserId,
    });
  } catch (err: any) {
    overlap3Failed = true;
  }
  assert(overlap3Failed, 'Reject same-day boundary overlap (2026-06-05)');

  // Test 6: List all stops for the trip
  const allStops = await StopService.getStopsByTripId(testTripId);
  assert(
    allStops.length === 2 && allStops[0].id === stop1.id && allStops[1].id === stop2.id,
    'GET /api/trips/:tripId/stops returns 2 stops sorted by order_index ASC'
  );

  // Test 7: Update stop dates safely (excluding itself)
  const updatedStop2 = await StopService.updateStop(
    stop2.id,
    { arrival_date: '2026-06-07', departure_date: '2026-06-12' },
    testUserId
  );
  assert(
    updatedStop2.arrival_date === '2026-06-07' && updatedStop2.departure_date === '2026-06-12',
    'PATCH /api/stops/:id safely updates dates when non-overlapping'
  );

  // Test 8: Update stop dates causing overlap with Stop 1 (Must fail)
  let updateOverlapFailed = false;
  try {
    await StopService.updateStop(
      stop2.id,
      { arrival_date: '2026-06-03', departure_date: '2026-06-08' },
      testUserId
    );
  } catch {
    updateOverlapFailed = true;
  }
  assert(updateOverlapFailed, 'PATCH /api/stops/:id rejects update that overlaps with Stop 1');

  // Test 9: Reorder stops
  const reordered = await StopService.reorderStops(testTripId, [stop2.id, stop1.id], testUserId);
  assert(
    reordered[0].id === stop2.id &&
      reordered[0].order_index === 0 &&
      reordered[1].id === stop1.id &&
      reordered[1].order_index === 1,
    'PATCH /api/trips/:tripId/stops/reorder successfully updates stop order indices'
  );

  // Test 10: Delete a stop
  const deleteResult = await StopService.deleteStop(stop1.id, testUserId);
  assert(deleteResult.id === stop1.id, 'DELETE /api/stops/:id returns success');

  const stopsAfterDelete = await StopService.getStopsByTripId(testTripId);
  assert(
    stopsAfterDelete.length === 1 && stopsAfterDelete[0].id === stop2.id,
    'Stop count reduced to 1 after deletion'
  );

  console.log('\n==================================================');
  console.log(`SUMMARY: Passed: ${passed}, Failed: ${failed}`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStopsTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
