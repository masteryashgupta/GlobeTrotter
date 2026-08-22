import { StopService } from '../src/services/stopService';
import { TripActivityService } from '../src/services/tripActivityService';
import { CatalogService } from '../src/services/catalogService';

async function runPartBComprehensiveQA() {
  console.log('==================================================');
  console.log('🛡️ RUNNING COMPREHENSIVE PART B QA & VALIDATION AUDIT');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  const qaTripId = '11111111-1111-4000-8000-000000000099';
  const qaUserId = 'qa-tester-789';
  const tokyoId = '11111111-1111-4000-8000-000000000002';
  const kyotoId = '11111111-1111-4000-8000-000000000003';
  const osakaId = '11111111-1111-4000-8000-000000000004';

  console.log('--- 1. CITY & ACTIVITY CATALOG SEARCH TESTS ---');
  const popularCities = await CatalogService.getPopularCities(5);
  test('Popular cities query returns exactly 5 items ordered by popularity', popularCities.length === 5 && popularCities[0].popularity >= popularCities[1].popularity);

  const searchTokyo = await CatalogService.searchCities({ q: 'tokyo' });
  test('Full-text search for "tokyo" finds Tokyo', searchTokyo.some(c => c.name.toLowerCase().includes('tokyo')));

  const searchFoodActivities = await CatalogService.searchActivities({ category: 'food', maxCost: 50 });
  test('Filter activities by category=food and maxCost=50', searchFoodActivities.every(a => a.category === 'food' && (!a.cost || Number(a.cost) <= 50)));

  console.log('\n--- 2. STOPS & DATE OVERLAP VALIDATION TESTS ---');
  // Initial stop in Tokyo (Oct 1 to Oct 5)
  const stop1 = await StopService.createStop({
    tripId: qaTripId,
    cityId: tokyoId,
    arrivalDate: '2026-10-01',
    departureDate: '2026-10-05',
    userId: qaUserId,
  });
  test('Create Stop 1 in Tokyo (2026-10-01 to 2026-10-05)', Boolean(stop1.id) && stop1.order_index === 0);

  // Non-overlapping stop in Kyoto (Oct 6 to Oct 10)
  const stop2 = await StopService.createStop({
    tripId: qaTripId,
    cityId: kyotoId,
    arrivalDate: '2026-10-06',
    departureDate: '2026-10-10',
    userId: qaUserId,
  });
  test('Create Stop 2 in Kyoto (2026-10-06 to 2026-10-10) with auto order_index 1', Boolean(stop2.id) && stop2.order_index === 1);

  // Malformed / Overlap 1: Start date during stop 1
  let overlap1Caught = false;
  try {
    await StopService.createStop({
      tripId: qaTripId,
      cityId: osakaId,
      arrivalDate: '2026-10-03',
      departureDate: '2026-10-07',
      userId: qaUserId,
    });
  } catch (err: any) {
    overlap1Caught = err.statusCode === 400 && err.message.includes('overlap');
  }
  test('Reject stop creation with partial overlap (2026-10-03 to 2026-10-07) with 400', overlap1Caught);

  // Malformed / Overlap 2: Encompassing overlap
  let overlap2Caught = false;
  try {
    await StopService.createStop({
      tripId: qaTripId,
      cityId: osakaId,
      arrivalDate: '2026-09-28',
      departureDate: '2026-10-12',
      userId: qaUserId,
    });
  } catch (err: any) {
    overlap2Caught = err.statusCode === 400;
  }
  test('Reject stop creation that completely encompasses existing stops with 400', overlap2Caught);

  // Malformed / Overlap 3: Update existing stop dates to conflict
  let overlapUpdateCaught = false;
  try {
    await StopService.updateStop(
      stop2.id,
      { arrival_date: '2026-10-04', departure_date: '2026-10-09' },
      qaUserId
    );
  } catch (err: any) {
    overlapUpdateCaught = err.statusCode === 400;
  }
  test('Reject PATCH /api/stops/:id that conflicts with Stop 1 dates with 400', overlapUpdateCaught);

  console.log('\n--- 3. ACTIVITY DATE BOUNDARY VALIDATION TESTS ---');
  // Valid activity assignment
  const act1 = await TripActivityService.assignActivityToStop({
    stopId: stop1.id,
    scheduledDate: '2026-10-02',
    scheduledTime: '09:00',
    customCost: 25,
    notes: 'Tsukiji Market Morning Tour',
    userId: qaUserId,
  });
  test('Assign activity to Stop 1 with valid scheduled_date (2026-10-02)', Boolean(act1.id) && act1.order_index === 0);

  // Out of range: Activity date before stop arrival
  let outOfRangeBeforeCaught = false;
  try {
    await TripActivityService.assignActivityToStop({
      stopId: stop1.id,
      scheduledDate: '2026-09-30',
      userId: qaUserId,
    });
  } catch (err: any) {
    outOfRangeBeforeCaught = err.statusCode === 400 && err.message.includes('must fall within');
  }
  test('Reject activity assignment with scheduled_date before arrival_date with 400', outOfRangeBeforeCaught);

  // Out of range: Activity date after stop departure
  let outOfRangeAfterCaught = false;
  try {
    await TripActivityService.assignActivityToStop({
      stopId: stop1.id,
      scheduledDate: '2026-10-06',
      userId: qaUserId,
    });
  } catch (err: any) {
    outOfRangeAfterCaught = err.statusCode === 400 && err.message.includes('must fall within');
  }
  test('Reject activity assignment with scheduled_date past departure_date with 400', outOfRangeAfterCaught);

  // Out of range: Activity PATCH update out of bounds
  let outOfRangePatchCaught = false;
  try {
    await TripActivityService.updateTripActivity(
      act1.id,
      { scheduled_date: '2026-10-15' },
      qaUserId
    );
  } catch (err: any) {
    outOfRangePatchCaught = err.statusCode === 400;
  }
  test('Reject PATCH /api/trip-activities/:id with out-of-range date with 400', outOfRangePatchCaught);

  console.log('\n--- 4. DRAG-AND-DROP REORDERING PERSISTENCE ---');
  const stop3 = await StopService.createStop({
    tripId: qaTripId,
    cityId: osakaId,
    arrivalDate: '2026-10-11',
    departureDate: '2026-10-15',
    userId: qaUserId,
  });

  // Reorder stops to [Stop 3, Stop 1, Stop 2]
  await StopService.reorderStops(qaTripId, [stop3.id, stop1.id, stop2.id], qaUserId);
  const reorderedStops = await StopService.getStopsByTripId(qaTripId);

  test(
    'Reordered stops persist order_index (0: Osaka, 1: Tokyo, 2: Kyoto)',
    reorderedStops[0].id === stop3.id &&
      reorderedStops[0].order_index === 0 &&
      reorderedStops[1].id === stop1.id &&
      reorderedStops[1].order_index === 1 &&
      reorderedStops[2].id === stop2.id &&
      reorderedStops[2].order_index === 2
  );

  console.log('\n==================================================');
  console.log(`QA AUDIT COMPLETE: Passed: ${passed}, Failed: ${failed}`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPartBComprehensiveQA().catch((err) => {
  console.error('QA script error:', err);
  process.exit(1);
});
