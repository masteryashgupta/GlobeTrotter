import http from 'http';

async function makeRequest(options: http.RequestOptions, postData?: any): Promise<{ statusCode?: number; body: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing Profile Endpoints Validation & Auth Protection ---');

  // 1. Test GET /api/profile without Auth
  const getProfile = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/profile',
    method: 'GET',
  });
  console.log('GET /api/profile (no auth):', getProfile.statusCode, getProfile.body);

  // 2. Test PATCH /api/profile without Auth
  const patchProfile = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/profile',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    },
    { full_name: 'Test Name' }
  );
  console.log('PATCH /api/profile (no auth):', patchProfile.statusCode, patchProfile.body);

  // 3. Test DELETE /api/profile without Auth
  const deleteNoAuth = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/profile',
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    },
    { confirm: true }
  );
  console.log('DELETE /api/profile (no auth):', deleteNoAuth.statusCode, deleteNoAuth.body);

  // 4. Test GET /api/profile/saved-destinations without Auth
  const savedDest = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/profile/saved-destinations',
    method: 'GET',
  });
  console.log('GET /api/profile/saved-destinations (no auth):', savedDest.statusCode, savedDest.body);
}

runTests().catch(console.error);
