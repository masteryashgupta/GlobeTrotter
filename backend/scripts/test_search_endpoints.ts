import http from 'http';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function fetchJson(endpoint: string): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${endpoint}`, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 200, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode || 200, data: body });
        }
      });
      res.on('error', reject);
    });
  });
}

async function runTests() {
  console.log('==================================================');
  console.log('🧪 RUNNING GLOBETROTTER SEARCH API MANUAL TESTS');
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

  // 1. Health Check
  const health = await fetchJson('/health');
  assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returns 200 OK');

  // 2. GET /api/cities/popular?limit=5
  const pop5 = await fetchJson('/cities/popular?limit=5');
  assert(pop5.status === 200, 'GET /api/cities/popular returns 200');
  assert(Array.isArray(pop5.data) && pop5.data.length === 5, 'GET /api/cities/popular?limit=5 returns exactly 5 cities');
  assert(pop5.data[0].popularity >= pop5.data[1].popularity, 'Popular cities are ordered by popularity descending');
  console.log(`   Top 3 cities: ${pop5.data.slice(0, 3).map((c: any) => `${c.name} (${c.popularity}%)`).join(', ')}`);

  // 3. GET /api/cities/search?q=tokyo
  const searchTokyo = await fetchJson('/cities/search?q=tokyo');
  assert(searchTokyo.status === 200, 'GET /api/cities/search?q=tokyo returns 200');
  assert(searchTokyo.data.some((c: any) => c.name === 'Tokyo'), 'Search found "Tokyo"');

  // 4. GET /api/cities/search?country=France&region=Europe
  const searchFrance = await fetchJson('/cities/search?country=France&region=Europe');
  assert(searchFrance.status === 200, 'GET /api/cities/search?country=France&region=Europe returns 200');
  assert(searchFrance.data.every((c: any) => c.country === 'France' && c.region === 'Europe'), 'All results belong to France, Europe');
  console.log(`   Found French cities: ${searchFrance.data.map((c: any) => c.name).join(', ')}`);

  // 5. GET /api/cities/:id
  const sampleCity = pop5.data[0];
  const cityDetail = await fetchJson(`/cities/${sampleCity.id}`);
  assert(cityDetail.status === 200, `GET /api/cities/${sampleCity.id} returns 200`);
  assert(cityDetail.data.name === sampleCity.name, `Fetched city detail matches name: ${sampleCity.name}`);

  const notFoundCity = await fetchJson('/cities/non-existent-city-id-99999');
  assert(notFoundCity.status === 404, 'GET /api/cities/invalid-id returns 404');

  // 6. GET /api/activities/search?category=food&maxCost=40
  const foodActivities = await fetchJson('/activities/search?category=food&maxCost=40');
  assert(foodActivities.status === 200, 'GET /api/activities/search?category=food&maxCost=40 returns 200');
  assert(
    foodActivities.data.every((a: any) => a.category === 'food' && a.cost <= 40),
    'Filtered activities match category=food and cost <= 40'
  );
  console.log(`   Sample food activities under $40: ${foodActivities.data.slice(0, 3).map((a: any) => `${a.name} ($${a.cost})`).join(', ')}`);

  // 7. GET /api/activities/search?cityId=<id>
  const cityActivities = await fetchJson(`/activities/search?cityId=${sampleCity.id}`);
  assert(cityActivities.status === 200, `GET /api/activities/search?cityId=${sampleCity.id} returns 200`);
  assert(cityActivities.data.length > 0, `Found activities for ${sampleCity.name}`);
  assert(cityActivities.data.every((a: any) => a.city_id === sampleCity.id), `All activities belong to ${sampleCity.name}`);

  // 8. GET /api/activities/:id
  const sampleAct = cityActivities.data[0];
  const actDetail = await fetchJson(`/activities/${sampleAct.id}`);
  assert(actDetail.status === 200, `GET /api/activities/${sampleAct.id} returns 200`);
  assert(actDetail.data.name === sampleAct.name, `Fetched activity matches: ${sampleAct.name}`);
  assert(actDetail.data.cities !== undefined, 'Activity includes parent city relationship data');

  const notFoundAct = await fetchJson('/activities/non-existent-act-id-99999');
  assert(notFoundAct.status === 404, 'GET /api/activities/invalid-id returns 404');

  console.log('\n==================================================');
  console.log(`SUMMARY: Passed: ${passed}, Failed: ${failed}`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
