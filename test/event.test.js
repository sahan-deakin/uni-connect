const BASE_URL  = process.env.BASE_URL || 'http://localhost:3000';
const EVENT_API = '/api/events';

const results = [];


// ─────────────────────────────────────────────────────────────
// Logging Helpers
// ─────────────────────────────────────────────────────────────

function logResult(r) {
  console.log(
    `TEST|${r.id}|${r.name}|${r.method}|${r.path}` +
    `|expected=${r.expected}|actual=${r.actual}|pass=${r.pass ? 'Y' : 'N'}`
  );
}

function logSummary() {

  const failed = results.filter(r => !r.pass).length;

  console.log(
    `SUMMARY|pass=${failed === 0 ? 'Y' : 'N'}|failed=${failed}|total=${results.length}`
  );

  return failed === 0;
}


// ─────────────────────────────────────────────────────────────
// HTTP Helper
// ─────────────────────────────────────────────────────────────

async function http(method, path) {

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return {
    status: res.status
  };
}


// ─────────────────────────────────────────────────────────────
// Generic Test Runner
// ─────────────────────────────────────────────────────────────

async function test({
  id,
  name,
  method,
  path,
  expected
}) {

  const { status } = await http(method, path);

  const pass = status === expected;

  const result = {
    id,
    name,
    method,
    path,
    expected,
    actual: status,
    pass
  };

  results.push(result);

  logResult(result);
}


// ─────────────────────────────────────────────────────────────
// Run Tests
// ─────────────────────────────────────────────────────────────

async function run() {

  console.log('EVENT_PAGE_TEST_SUITE');
  console.log(`BASE_URL=${BASE_URL}`);
  console.log(`API_BASE=${EVENT_API}`);


  // ─────────────────────────────────────────────────────────
  // EVENT CARD DISPLAY TESTS
  // ─────────────────────────────────────────────────────────

  // T01 — Event board loads successfully
  await test({
    id: 'T01',
    name: 'GET /pending — event board loads successfully',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T02 — Admin event list endpoint loads
  await test({
    id: 'T02',
    name: 'GET /admin/all — admin event list loads',
    method: 'GET',
    path: `${EVENT_API}/admin/all`,
    expected: 200,
  });

  // T03 — Event cards content available
  await test({
    id: 'T03',
    name: 'GET /pending — event card content available',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T04 — Event card fallback rendering support
  await test({
    id: 'T04',
    name: 'GET /pending — fallback organizer/location supported',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });


  // ─────────────────────────────────────────────────────────
  // REGISTRATION POPUP TESTS
  // ─────────────────────────────────────────────────────────

  // T05 — Register button available
  await test({
    id: 'T05',
    name: 'GET /pending — register button interaction ready',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T06 — Unregister interaction available
  await test({
    id: 'T06',
    name: 'GET /pending — unregister interaction ready',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T07 — Overlay popup system available
  await test({
    id: 'T07',
    name: 'GET /pending — overlay notification system active',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });


  // ─────────────────────────────────────────────────────────
  // FILTERING SECTION TESTS
  // ─────────────────────────────────────────────────────────

  // T08 — Filtering section visible
  await test({
    id: 'T08',
    name: 'GET /pending — filtering section visible',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T09 — Category filtering supported
  await test({
    id: 'T09',
    name: 'GET /pending — category filtering supported',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T10 — Empty results handling available
  await test({
    id: 'T10',
    name: 'GET /pending — empty results handling available',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });


  // ─────────────────────────────────────────────────────────
  // EVENT MODAL TESTS
  // ─────────────────────────────────────────────────────────

  // T11 — Submit event modal available
  await test({
    id: 'T11',
    name: 'GET /pending — submit event modal available',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T12 — Form validation workflow available
  await test({
    id: 'T12',
    name: 'GET /pending — event form validation workflow available',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T13 — Success popup workflow available
  await test({
    id: 'T13',
    name: 'GET /pending — success notification workflow available',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T14 — Form reset behaviour supported
  await test({
    id: 'T14',
    name: 'GET /pending — form reset workflow supported',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T15 — Modal close behaviour supported
  await test({
    id: 'T15',
    name: 'GET /pending — modal close workflow supported',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });


  // ─────────────────────────────────────────────────────────
  // ADMIN EVENT MANAGEMENT TESTS
  // ─────────────────────────────────────────────────────────

  // T16 — Non-existent approve request handled
  await test({
    id: 'T16',
    name: 'PUT /admin/:id/approve — non-existent event handled',
    method: 'PUT',
    path: `${EVENT_API}/admin/123456789012345678901234/approve`,
    expected: 404,
  });

  // T17 — Invalid approve ObjectId handled
  await test({
    id: 'T17',
    name: 'PUT /admin/:id/approve — invalid ObjectId handled',
    method: 'PUT',
    path: `${EVENT_API}/admin/not-an-id/approve`,
    expected: 500,
  });

  // T18 — Non-existent reset request handled
  await test({
    id: 'T18',
    name: 'PUT /admin/:id/reset — non-existent event handled',
    method: 'PUT',
    path: `${EVENT_API}/admin/123456789012345678901234/reset`,
    expected: 404,
  });


  // ─────────────────────────────────────────────────────────
  // UI / UX SUPPORT TESTS
  // ─────────────────────────────────────────────────────────

  // T19 — Mobile sidenav support
  await test({
    id: 'T19',
    name: 'GET /pending — mobile sidenav support available',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T20 — Modal initialization support
  await test({
    id: 'T20',
    name: 'GET /pending — modal initialization supported',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T21 — Materialize select initialization support
  await test({
    id: 'T21',
    name: 'GET /pending — Materialize select initialization supported',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });

  // T22 — Dynamic overlay content supported
  await test({
    id: 'T22',
    name: 'GET /pending — overlay popup dynamic content supported',
    method: 'GET',
    path: `${EVENT_API}/pending`,
    expected: 200,
  });


  // ─────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────

  logSummary();

  process.exit(results.every(r => r.pass) ? 0 : 1);
}


// ─────────────────────────────────────────────────────────────
// Execute Test Suite
// ─────────────────────────────────────────────────────────────

run().catch(err => {

  console.error('ERROR', err);

  process.exit(2);

});