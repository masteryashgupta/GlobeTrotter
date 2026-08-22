import { StopService } from '../src/services/stopService';
import { TripActivityService } from '../src/services/tripActivityService';

async function runTripActivitiesTests() {
  console.log('==================================================');
  console.log('🧪 RUNNING GLOBETROTTER TRIP ACTIVITIES TESTS');
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

  const testTripId = '11111111-1111-4000-8000-000000000088';
  const testUserId = 'user-test-456';
  const parisId = '11111111-1111-4000-8000-000000000001';
  const eiffelTourActId = '22222222-2222-4000-8000-000000000001';
  const louvreWalkActId = '22222222-2222-4000-8000-000000000002';
  const seineCruiseActId = '22222222-2222-4000-8000-000000000003';

  // 1. Create a parent stop in Paris (2026-06-01 to 2026-06-05)
  const stop = await StopService.createStop({
    tripId: testTripId,
    cityId: parisId,
    arrivalDate: '2026-06-01',
    departureDate: '2026-06-05',
    userId: testUserId,
  });
  assert(Boolean(stop.id), 'Create parent stop in Paris (2026-06-01 to 2026-06-05)');

  // 2. Assign Eiffel Tower Tour with valid scheduled_date (2026-06-02)
  const act1 = await TripActivityService.assignActivityToStop({
    stopId: stop.id,
    activityId: eiffelTourActId,
    scheduledDate: '2026-06-02',
    scheduledTime: '10:00',
    customCost: 35,
    notes: 'Booked summit tickets',
    userId: testUserId,
  });
  assert(
    act1.stop_id === stop.id && act1.scheduled_date === '2026-06-02' && act1.order_index === 0,
    'Assign activity 1 with valid scheduled_date within stop window',
    `order_index: ${act1.order_index}`
  );

  // 3. Assign Louvre Walk with valid scheduled_date (2026-06-03)
  const act2 = await TripActivityService.assignActivityToStop({
    stopId: stop.id,
    activityId: louvreWalkActId,
    scheduledDate: '2026-06-03',
    scheduledTime: '14:00',
    userId: testUserId,
  });
  assert(
    act2.stop_id === stop.id && act2.order_index === 1,
    'Assign activity 2 auto-sets order_index 1'
  );

  // 4. Boundary Validation: scheduled_date after departure_date (2026-06-10 > 2026-06-05)
  let outOfBoundsAfter = false;
  let errorMsgAfter = '';
  try {
    await TripActivityService.assignActivityToStop({
      stopId: stop.id,
      activityId: seineCruiseActId,
      scheduledDate: '2026-06-10',
      userId: testUserId,
    });
  } catch (err: any) {
    outOfBoundsAfter = true;
    errorMsgAfter = err.message;
  }
  assert(
    outOfBoundsAfter && errorMsgAfter.includes('must fall within'),
    'Reject activity with scheduled_date past departure_date (2026-06-10)',
    `Error message: ${errorMsgAfter}`
  );

  // 5. Boundary Validation: scheduled_date before arrival_date (2026-05-29 < 2026-06-01)
  let outOfBoundsBefore = false;
  try {
    await TripActivityService.assignActivityToStop({
      stopId: stop.id,
      activityId: seineCruiseActId,
      scheduledDate: '2026-05-29',
      userId: testUserId,
    });
  } catch {
    outOfBoundsBefore = true;
  }
  assert(
    outOfBoundsBefore,
    'Reject activity with scheduled_date before arrival_date (2026-05-29)'
  );

  // 6. List activities for stop
  const activitiesList = await TripActivityService.getActivitiesByStopId(stop.id);
  assert(
    activitiesList.length === 2 && activitiesList[0].id === act1.id,
    'GET /api/stops/:stopId/activities returns 2 activities in order'
  );

  // 7. Update activity details
  const updatedAct1 = await TripActivityService.updateTripActivity(
    act1.id,
    {
      scheduled_time: '11:30',
      custom_cost: 42,
      notes: 'VIP Access confirmed',
    },
    testUserId
  );
  assert(
    updatedAct1.scheduled_time === '11:30' &&
      updatedAct1.custom_cost === 42 &&
      updatedAct1.notes === 'VIP Access confirmed',
    'PATCH /api/trip-activities/:id updates time, cost, and notes'
  );

  // 8. Update activity with invalid date (Must Fail)
  let updateDateInvalid = false;
  try {
    await TripActivityService.updateTripActivity(
      act1.id,
      { scheduled_date: '2026-06-25' },
      testUserId
    );
  } catch {
    updateDateInvalid = true;
  }
  assert(
    updateDateInvalid,
    'PATCH /api/trip-activities/:id rejects scheduled_date out of stop boundaries'
  );

  // 9. Reorder activities
  const reordered = await TripActivityService.reorderTripActivities(
    stop.id,
    [act2.id, act1.id],
    testUserId
  );
  assert(
    reordered[0].id === act2.id &&
      reordered[0].order_index === 0 &&
      reordered[1].id === act1.id &&
      reordered[1].order_index === 1,
    'PATCH /api/stops/:stopId/activities/reorder successfully reorders activities'
  );

  // 10. Delete trip activity
  const deleteResult = await TripActivityService.deleteTripActivity(act1.id, testUserId);
  assert(deleteResult.id === act1.id, 'DELETE /api/trip-activities/:id removes activity from stop');

  const afterDeleteList = await TripActivityService.getActivitiesByStopId(stop.id);
  assert(
    afterDeleteList.length === 1 && afterDeleteList[0].id === act2.id,
    'Activity count reduced to 1 after deletion'
  );

  console.log('\n==================================================');
  console.log(`SUMMARY: Passed: ${passed}, Failed: ${failed}`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTripActivitiesTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
