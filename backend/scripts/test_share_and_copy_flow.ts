import assert from 'assert';

interface TripMock {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  share_token?: string | null;
}

interface StopMock {
  id: string;
  trip_id: string;
  order_index: number;
  arrival_date: string;
  departure_date: string;
}

interface ActivityMock {
  id: string;
  stop_id: string;
  scheduled_date: string;
  custom_cost: number;
  notes: string;
}

// 1. Share Function Logic
export function shareTrip(trip: TripMock): { updatedTrip: TripMock; shareUrl: string } {
  const token = trip.share_token || 'mock_share_token_123';
  const updatedTrip = {
    ...trip,
    is_public: true,
    share_token: token,
  };
  return {
    updatedTrip,
    shareUrl: `http://localhost:5173/share/${token}`,
  };
}

// 2. Unshare Function Logic
export function unshareTrip(trip: TripMock): TripMock {
  return {
    ...trip,
    is_public: false,
    // Note: share_token is preserved in DB so future re-sharing maintains the same URL
  };
}

// 3. Deep Copy Function Logic
export function deepCopyTrip(
  sourceTrip: TripMock,
  sourceStops: StopMock[],
  sourceActivities: ActivityMock[],
  newOwnerId: string
) {
  if (!sourceTrip.is_public && sourceTrip.owner_id !== newOwnerId) {
    throw new Error('Forbidden: Cannot copy private trip');
  }

  const copyName = sourceTrip.name.startsWith('Copy of ')
    ? sourceTrip.name
    : `Copy of ${sourceTrip.name}`;

  const newTrip: TripMock = {
    id: `cloned-trip-${Date.now()}`,
    owner_id: newOwnerId,
    name: copyName,
    description: sourceTrip.description,
    start_date: sourceTrip.start_date,
    end_date: sourceTrip.end_date,
    is_public: false,
    share_token: null,
  };

  const newStops: StopMock[] = [];
  const newActivities: ActivityMock[] = [];

  sourceStops.forEach((stop, idx) => {
    const newStopId = `cloned-stop-${idx}-${Date.now()}`;
    newStops.push({
      id: newStopId,
      trip_id: newTrip.id,
      order_index: stop.order_index,
      arrival_date: stop.arrival_date,
      departure_date: stop.departure_date,
    });

    const linkedActivities = sourceActivities.filter((a) => a.stop_id === stop.id);
    linkedActivities.forEach((act, actIdx) => {
      newActivities.push({
        id: `cloned-act-${idx}-${actIdx}-${Date.now()}`,
        stop_id: newStopId,
        scheduled_date: act.scheduled_date,
        custom_cost: act.custom_cost,
        notes: act.notes,
      });
    });
  });

  const auditRecord = {
    original_trip_id: sourceTrip.id,
    copied_trip_id: newTrip.id,
    copied_by: newOwnerId,
  };

  return { newTrip, newStops, newActivities, auditRecord };
}

// Unit Test Suite for Share & Copy Logic
function runShareAndCopyUnitTest() {
  console.log('--- Running Share & Deep Copy Unit Test Suite ---');

  // Step 1: Create original trip
  const origTrip: TripMock = {
    id: 'trip-100',
    owner_id: 'owner-user-1',
    name: 'Original Paris Discovery',
    description: '7 days in Paris',
    start_date: '2026-11-01',
    end_date: '2026-11-07',
    is_public: false,
    share_token: null,
  };

  const origStops: StopMock[] = [
    { id: 'stop-1', trip_id: 'trip-100', order_index: 0, arrival_date: '2026-11-01', departure_date: '2026-11-07' },
  ];

  const origActivities: ActivityMock[] = [
    { id: 'act-1', stop_id: 'stop-1', scheduled_date: '2026-11-02', custom_cost: 45.00, notes: 'Louvre Museum Tour' },
  ];

  // Step 2: Share trip
  const { updatedTrip, shareUrl } = shareTrip(origTrip);
  assert.strictEqual(updatedTrip.is_public, true, 'Shared trip must have is_public = true');
  assert.ok(updatedTrip.share_token, 'Shared trip must have share_token');
  assert.ok(shareUrl.includes('/share/'), 'Share URL must contain /share/');
  console.log(`✓ Share Trip Verified: Token = ${updatedTrip.share_token}, URL = ${shareUrl}`);

  // Step 3: Unshare trip
  const unshared = unshareTrip(updatedTrip);
  assert.strictEqual(unshared.is_public, false, 'Unshared trip must have is_public = false');
  assert.strictEqual(unshared.share_token, updatedTrip.share_token, 'Unshared trip must preserve share_token');
  console.log('✓ Unshare Trip Verified: is_public = false, token preserved');

  // Step 4: Deep Copy trip as User B
  const { newTrip, newStops, newActivities, auditRecord } = deepCopyTrip(
    updatedTrip,
    origStops,
    origActivities,
    'user-b-id'
  );

  assert.strictEqual(newTrip.name, 'Copy of Original Paris Discovery', 'Cloned trip name prefix');
  assert.strictEqual(newTrip.owner_id, 'user-b-id', 'Cloned trip owner must be User B');
  assert.strictEqual(newTrip.is_public, false, 'Cloned trip must default to is_public = false');
  assert.strictEqual(newStops.length, 1, 'Cloned stops count');
  assert.strictEqual(newActivities.length, 1, 'Cloned activities count');
  assert.strictEqual(auditRecord.copied_by, 'user-b-id', 'Audit record copied_by');
  console.log('✓ Deep Copy Trip Verified: Cloned independently with new IDs and audit lineage');

  // Step 5: Test Independence: Edit cloned activity
  newActivities[0].custom_cost = 99.00;
  assert.strictEqual(origActivities[0].custom_cost, 45.00, 'Original activity cost remains unaffected');
  console.log('✓ Confirmed Independence: Modifying cloned trip activity ($99.00) did not affect original ($45.00)');

  console.log('\n✅ ALL SHARE & DEEP COPY LOGIC UNIT TESTS PASSED PERFECTLY!');
}

runShareAndCopyUnitTest();
