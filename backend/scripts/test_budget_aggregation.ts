import assert from 'assert';

interface TripMock {
  id: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  owner_id: string;
}

interface ExpenseMock {
  category: 'transport' | 'stay' | 'activity' | 'meals' | 'misc';
  amount: number;
  created_at?: string;
  stop_id?: string | null;
  stops?: { arrival_date: string } | null;
}

interface StopMock {
  id: string;
  arrival_date: string;
  departure_date: string;
}

interface TripActivityMock {
  stop_id: string;
  scheduled_date?: string | null;
  custom_cost?: number | null;
  activities?: { cost: number } | null;
}

export function computeTripBudgetBreakdown(
  trip: TripMock,
  expenses: ExpenseMock[],
  stops: StopMock[],
  tripActivities: TripActivityMock[]
) {
  // 1. Compute duration
  const startMs = new Date(trip.start_date).getTime();
  const endMs = new Date(trip.end_date).getTime();
  const tripDurationDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);

  // 2. Category sums & per-day mapping
  const byCategory: Record<string, number> = {
    transport: 0,
    stay: 0,
    activity: 0,
    meals: 0,
    misc: 0,
  };

  const perDayMap: Record<string, number> = {};

  expenses.forEach((exp) => {
    const amt = Number(exp.amount || 0);
    const cat = exp.category || 'misc';
    if (byCategory[cat] !== undefined) {
      byCategory[cat] += amt;
    } else {
      byCategory.misc += amt;
    }

    let dateKey = trip.start_date;
    if (exp.stops?.arrival_date) {
      dateKey = exp.stops.arrival_date;
    } else if (exp.created_at) {
      dateKey = exp.created_at.split('T')[0];
    }

    perDayMap[dateKey] = (perDayMap[dateKey] || 0) + amt;
  });

  // 3. Scheduled activities
  let scheduledActivitiesCost = 0;
  const stopDateMap: Record<string, string> = {};
  stops.forEach((s) => {
    stopDateMap[s.id] = s.arrival_date;
  });

  tripActivities.forEach((act) => {
    const cost = Number(act.custom_cost ?? act.activities?.cost ?? 0);
    scheduledActivitiesCost += cost;

    const dateKey = act.scheduled_date || stopDateMap[act.stop_id] || trip.start_date;
    if (dateKey) {
      perDayMap[dateKey] = (perDayMap[dateKey] || 0) + cost;
    }
  });

  // Add scheduled activities cost into 'activity' category
  byCategory.activity += scheduledActivitiesCost;

  // Round byCategory
  Object.keys(byCategory).forEach((key) => {
    byCategory[key] = Number(byCategory[key].toFixed(2));
  });

  // 4. Grand Total & Per-Day Average
  const total = Number(
    (byCategory.transport + byCategory.stay + byCategory.activity + byCategory.meals + byCategory.misc).toFixed(2)
  );
  const perDayAverage = Number((total / tripDurationDays).toFixed(2));

  // 5. Per-day breakdown array
  const perDay: Array<{ date: string; total: number }> = [];
  const startDate = new Date(trip.start_date);
  for (let i = 0; i < tripDurationDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayTotal = Number((perDayMap[dateStr] || 0).toFixed(2));
    perDay.push({ date: dateStr, total: dayTotal });
  }

  return {
    byCategory,
    total,
    tripDurationDays,
    perDayAverage,
    perDay,
  };
}

// Unit Test Suite
function runUnitTest() {
  console.log('--- Running Budget Breakdown Aggregation Unit Test ---');

  const mockTrip: TripMock = {
    id: 'trip-100',
    start_date: '2026-10-01',
    end_date: '2026-10-05',
    is_public: true,
    owner_id: 'user-1',
  };

  const mockExpenses: ExpenseMock[] = [
    { category: 'transport', amount: 100.00, created_at: '2026-10-01T08:00:00Z' },
    { category: 'stay', amount: 200.00, created_at: '2026-10-01T12:00:00Z' },
    { category: 'activity', amount: 50.00, created_at: '2026-10-02T10:00:00Z' },
    { category: 'meals', amount: 80.00, created_at: '2026-10-03T19:00:00Z' },
    { category: 'misc', amount: 20.00, created_at: '2026-10-04T15:00:00Z' },
  ];

  const mockStops: StopMock[] = [
    { id: 'stop-1', arrival_date: '2026-10-01', departure_date: '2026-10-05' },
  ];

  const mockTripActivities: TripActivityMock[] = [
    { stop_id: 'stop-1', scheduled_date: '2026-10-02', custom_cost: 75.00 },
  ];

  const result = computeTripBudgetBreakdown(mockTrip, mockExpenses, mockStops, mockTripActivities);

  console.log('Output JSON Shape:');
  console.log(JSON.stringify(result, null, 2));

  // Assertions
  assert.strictEqual(result.tripDurationDays, 5, 'Trip duration should be 5 days');
  assert.strictEqual(result.byCategory.transport, 100.00, 'Transport category sum');
  assert.strictEqual(result.byCategory.stay, 200.00, 'Stay category sum');
  assert.strictEqual(result.byCategory.activity, 125.00, 'Activity category sum (50 manual + 75 scheduled)');
  assert.strictEqual(result.byCategory.meals, 80.00, 'Meals category sum');
  assert.strictEqual(result.byCategory.misc, 20.00, 'Misc category sum');
  assert.strictEqual(result.total, 525.00, 'Grand total should be $525.00');
  assert.strictEqual(result.perDayAverage, 105.00, 'Per day average should be $105.00 (525 / 5)');
  assert.strictEqual(result.perDay.length, 5, 'Per day array length should match trip duration days');
  assert.strictEqual(result.perDay[1].date, '2026-10-02', 'Second day date');
  assert.strictEqual(result.perDay[1].total, 125.00, 'Second day total ($50 manual + $75 scheduled)');

  console.log('\n✅ ALL BUDGET BREAKDOWN AGGREGATION UNIT TESTS PASSED PERFECTLY!');
}

runUnitTest();
