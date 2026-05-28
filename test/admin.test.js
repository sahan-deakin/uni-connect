const BASE_URL  = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_API = '/api/admin';
const RES_API   = '/api/resources';

const results = [];

const coverageTracker = {
  CREATE_FAIL : 0,
  UPDATE_FAIL : 0,
  REQUIRED    : 0,
  TYPE        : 0,
  ENUM        : 0,
  LENGTH      : 0,
  WHITESPACE  : 0,
  IMMUTABLE   : 0,
  UNKNOWN     : 0,
  AUTH        : 0,
  NOT_FOUND   : 0,
};

function logHeader(uniqueId) {
  console.log('SIT725_VALIDATION_TESTS');
  console.log(`BASE_URL=${BASE_URL}`);
  console.log(`API_BASE=${ADMIN_API}`);
  console.log(`INFO|Generated uniqueId=${uniqueId}`);
}

function logResult(r) {
  console.log(
    `TEST|${r.id}|${r.name}|${r.method}|${r.path}` +
    `|expected=${r.expected}|actual=${r.actual}|pass=${r.pass ? 'Y' : 'N'}`,
  );
}

function logSummary() {
  const failed = results.filter(r => !r.pass).length;
  console.log(
    `SUMMARY|pass=${failed === 0 ? 'Y' : 'N'}|failed=${failed}|total=${results.length}`,
  );
  return failed === 0;
}

function logCoverage() {
  console.log(
    `COVERAGE` +
    `|CREATE_FAIL=${coverageTracker.CREATE_FAIL}` +
    `|UPDATE_FAIL=${coverageTracker.UPDATE_FAIL}` +
    `|REQUIRED=${coverageTracker.REQUIRED}` +
    `|TYPE=${coverageTracker.TYPE}` +
    `|ENUM=${coverageTracker.ENUM}` +
    `|LENGTH=${coverageTracker.LENGTH}` +
    `|WHITESPACE=${coverageTracker.WHITESPACE}` +
    `|IMMUTABLE=${coverageTracker.IMMUTABLE}` +
    `|UNKNOWN=${coverageTracker.UNKNOWN}` +
    `|AUTH=${coverageTracker.AUTH}` +
    `|NOT_FOUND=${coverageTracker.NOT_FOUND}`,
  );
}

async function http(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* ignore */ }
  return { status: res.status, text, json };
}

async function test({ id, name, method, path, expected, body, tags, token }) {
  const { status } = await http(method, path, body, token);
  const pass = status === expected;

  const result = { id, name, method, path, expected, actual: status, pass };
  results.push(result);
  logResult(result);

  const safeTags = Array.isArray(tags) ? tags : [];
  safeTags.forEach(tag => {
    if (Object.prototype.hasOwnProperty.call(coverageTracker, tag)) {
      coverageTracker[tag]++;
    }
  });
}

function fakeObjectId() {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

// fetch any existing user id from the admin users list
async function getExistingUserId() {
  const res  = await fetch(`${BASE_URL}${ADMIN_API}/users`);
  const data = await res.json();
  const users = Array.isArray(data) ? data : (data.users || []);
  const user = users[0];
  return user ? String(user._id || user.id) : null;
}

// login with known credentials and return a token
async function getToken() {
  // try a known seeded account first, fall back to no token (tests still run)
  const res  = await fetch(`${BASE_URL}/api/auth/login`, {
    method  : 'POST',
    headers : { 'Content-Type': 'application/json' },
    body    : JSON.stringify({ email: 'alex.johnson@deakin.edu.au', password: 'password123' }),
  });
  const data = await res.json();
  return data.token ?? null;
}

// create a minimal resource and return its _id
async function createResource(token) {
  const form = new FormData();
  form.append('title',       'Test Resource');
  form.append('unit',        'SIT725');
  form.append('type',        'Notes');
  form.append('desc',        'Seeded by admin test suite for report lifecycle.');
  form.append('institution', 'Deakin');
  form.append('uploader',    'Test Suite');
  form.append('tags',        JSON.stringify(['test']));
  form.append('upvotes',     '0');
  form.append('score',       '70');
  form.append('downloadCount', '0');

  const res = await fetch(`${BASE_URL}${RES_API}`, {
    method  : 'POST',
    headers : token ? { 'Authorization': `Bearer ${token}` } : {},
    body    : form,
  });
  const data = await res.json();
  return data?.data?._id ?? null;
}

async function run() {
  const uid = fakeObjectId();
  logHeader(uid);

  // use an existing user from the DB for block/unblock tests
  const targetId = await getExistingUserId();
  const token    = await getToken();

  // Seed one resource to use across report lifecycle tests
  const resourceId = await createResource(token);

  // T01 — GET all users returns 200
  await test({
    id: 'T01', name: 'GET /users — returns 200',
    method: 'GET', path: `${ADMIN_API}/users`, expected: 200, token,
    tags: [],
  });

  // T02 — GET all users without auth still returns 200 (public admin endpoint)
  await test({
    id: 'T02', name: 'GET /users — no auth, still 200 (unauthenticated access)',
    method: 'GET', path: `${ADMIN_API}/users`, expected: 200,
    tags: [],
  });

  // T03 — GET blocked users returns 200
  await test({
    id: 'T03', name: 'GET /blocked-users — returns 200',
    method: 'GET', path: `${ADMIN_API}/blocked-users`, expected: 200, token,
    tags: [],
  });

  // T04 — Block a user with all valid fields
  await test({
    id: 'T04', name: 'PUT /block-user — valid block (duration + reason)',
    method: 'PUT', path: `${ADMIN_API}/block-user/${targetId}`, expected: 200, token,
    body: { duration: '3months', reason: 'Spam behaviour detected during testing.' },
    tags: [],
  });

  // T05 — Block same user again (already blocked — still 200, idempotent update)
  await test({
    id: 'T05', name: 'PUT /block-user — blocking already-blocked user',
    method: 'PUT', path: `${ADMIN_API}/block-user/${targetId}`, expected: 200, token,
    body: { duration: '6months' },
    tags: [],
  });

  // T06 — Block without duration → 400
  await test({
    id: 'T06', name: 'PUT /block-user — missing duration (required)',
    method: 'PUT', path: `${ADMIN_API}/block-user/${targetId}`, expected: 400, token,
    body: { reason: 'No duration supplied.' },
    tags: ['UPDATE_FAIL', 'REQUIRED'],
  });

  // T07 — Block with empty body → 400
  await test({
    id: 'T07', name: 'PUT /block-user — empty body (duration missing)',
    method: 'PUT', path: `${ADMIN_API}/block-user/${targetId}`, expected: 400, token,
    body: {},
    tags: ['UPDATE_FAIL', 'REQUIRED'],
  });

  // T08 — Block with non-existent userId → 404
  await test({
    id: 'T08', name: 'PUT /block-user — non-existent userId',
    method: 'PUT', path: `${ADMIN_API}/block-user/${fakeObjectId()}`, expected: 404, token,
    body: { duration: '3months' },
    tags: ['NOT_FOUND'],
  });

  // T09 — Block with invalid ObjectId format → 400
  await test({
    id: 'T09', name: 'PUT /block-user — invalid ObjectId in path',
    method: 'PUT', path: `${ADMIN_API}/block-user/not-an-id`, expected: 400, token,
    body: { duration: '3months' },
    tags: ['UPDATE_FAIL', 'TYPE'],
  });

  // T10 — Unblock previously blocked user → 200
  await test({
    id: 'T10', name: 'PUT /unblock-user — valid unblock',
    method: 'PUT', path: `${ADMIN_API}/unblock-user/${targetId}`, expected: 200, token,
    tags: [],
  });

  // T11 — Unblock non-existent userId → 404
  await test({
    id: 'T11', name: 'PUT /unblock-user — non-existent userId',
    method: 'PUT', path: `${ADMIN_API}/unblock-user/${fakeObjectId()}`, expected: 404, token,
    tags: ['NOT_FOUND'],
  });

  // T12 — Unblock with invalid ObjectId → 400
  await test({
    id: 'T12', name: 'PUT /unblock-user — invalid ObjectId in path',
    method: 'PUT', path: `${ADMIN_API}/unblock-user/not-an-id`, expected: 400, token,
    tags: ['UPDATE_FAIL', 'TYPE'],
  });

  // T13 — GET reported resources returns 200 with an array
  await test({
    id: 'T13', name: 'GET /resources/reported — returns 200',
    method: 'GET', path: `${RES_API}/reported`, expected: 200, token,
    tags: [],
  });

  // T14 — Submit a valid report → 200
  await test({
    id: 'T14', name: 'POST /resources/:id/report — valid reason',
    method: 'POST', path: `${RES_API}/${resourceId}/report`, expected: 200, token,
    body: { reason: 'This resource contains plagiarised content.' },
    tags: [],
  });

  // T15 — Submit a second report on same resource while first is unresolved → 409
  await test({
    id: 'T15', name: 'POST /resources/:id/report — already reported (409 conflict)',
    method: 'POST', path: `${RES_API}/${resourceId}/report`, expected: 409, token,
    body: { reason: 'Duplicate report attempt.' },
    tags: [],
  });

  // T16 — Report without reason → 400
  await test({
    id: 'T16', name: 'POST /resources/:id/report — missing reason (required)',
    method: 'POST', path: `${RES_API}/${resourceId}/report`, expected: 400, token,
    body: {},
    tags: ['CREATE_FAIL', 'REQUIRED'],
  });

  // T17 — Report with whitespace-only reason → 400
  await test({
    id: 'T17', name: 'POST /resources/:id/report — whitespace-only reason',
    method: 'POST', path: `${RES_API}/${resourceId}/report`, expected: 400, token,
    body: { reason: '   ' },
    tags: ['CREATE_FAIL', 'WHITESPACE'],
  });

  // T18 — Report on non-existent resource → 404
  await test({
    id: 'T18', name: 'POST /resources/:id/report — non-existent resource',
    method: 'POST', path: `${RES_API}/${fakeObjectId()}/report`, expected: 404, token,
    body: { reason: 'Resource does not exist.' },
    tags: ['NOT_FOUND'],
  });

  // T19 — Report with invalid ObjectId in path → 400
  await test({
    id: 'T19', name: 'POST /resources/:id/report — invalid ObjectId in path',
    method: 'POST', path: `${RES_API}/not-an-id/report`, expected: 400, token,
    body: { reason: 'Bad id format.' },
    tags: ['CREATE_FAIL', 'TYPE'],
  });

  // T20 — Resolve the active report → 200
  await test({
    id: 'T20', name: 'PUT /resources/:id/resolve-report — resolves active report',
    method: 'PUT', path: `${RES_API}/${resourceId}/resolve-report`, expected: 200, token,
    tags: [],
  });

  // T21 — After resolve, resource can be reported again → 200
  await test({
    id: 'T21', name: 'POST /resources/:id/report — re-report after resolve',
    method: 'POST', path: `${RES_API}/${resourceId}/report`, expected: 200, token,
    body: { reason: 'Still problematic after previous resolution.' },
    tags: [],
  });

  // T22 — Resolve on non-existent resource → 404
  await test({
    id: 'T22', name: 'PUT /resources/:id/resolve-report — non-existent resource',
    method: 'PUT', path: `${RES_API}/${fakeObjectId()}/resolve-report`, expected: 404, token,
    tags: ['NOT_FOUND'],
  });

  // T23 — Resolve with invalid ObjectId → 400
  await test({
    id: 'T23', name: 'PUT /resources/:id/resolve-report — invalid ObjectId in path',
    method: 'PUT', path: `${RES_API}/not-an-id/resolve-report`, expected: 400, token,
    tags: ['UPDATE_FAIL', 'TYPE'],
  });

  // T24 — Delete a resource → 200
  await test({
    id: 'T24', name: 'DELETE /resources/:id — admin removes resource',
    method: 'DELETE', path: `${RES_API}/${resourceId}`, expected: 200, token,
    tags: [],
  });

  // T25 — Delete same resource again → 404 (already gone)
  await test({
    id: 'T25', name: 'DELETE /resources/:id — already deleted (404)',
    method: 'DELETE', path: `${RES_API}/${resourceId}`, expected: 404, token,
    tags: ['NOT_FOUND'],
  });

  // T26 — Delete non-existent resource → 404
  await test({
    id: 'T26', name: 'DELETE /resources/:id — non-existent resource',
    method: 'DELETE', path: `${RES_API}/${fakeObjectId()}`, expected: 404, token,
    tags: ['NOT_FOUND'],
  });

  // T27 — Delete with invalid ObjectId → 400
  await test({
    id: 'T27', name: 'DELETE /resources/:id — invalid ObjectId in path',
    method: 'DELETE', path: `${RES_API}/not-an-id`, expected: 400, token,
    tags: ['UPDATE_FAIL', 'TYPE'],
  });

  logSummary();
  logCoverage();

  process.exit(results.every(r => r.pass) ? 0 : 1);
}

run().catch(err => {
  console.error('ERROR', err);
  process.exit(2);
});