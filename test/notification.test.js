/**
 * SIT725 – Notification API Validation Tests (MANDATORY TEMPLATE)
 *
 * Schema under test:
 *   studentId : ObjectId  required
 *   type      : enum['message','forum_reply','event','resource']  required
 *   title     : String  required  minlength:1  maxlength:100  non-blank after trim
 *   message   : String  required  minlength:1  maxlength:500  non-blank after trim
 *   read      : Boolean  default:false
 *   createdAt / updatedAt : auto (timestamps:true) — immutable by client
 *
 * HOW TO RUN: (Node.js 18+ required)
 *   1. Start MongoDB
 *   2. Start your server   (npm start)
 *   3. node notification-validation-tests.js
 *
 * DO NOT MODIFY:
 *   - Output format (TEST|, SUMMARY|, COVERAGE|)
 *   - test() function signature
 *   - Exit behaviour
 *   - coverageTracker object
 *   - Logging structure
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API_BASE  = "/api/notifications";

// ─── Internal state (DO NOT MODIFY) ─────────────────────────────────────────

const results = [];

const coverageTracker = {
  CREATE_FAIL  : 0,   // POST returns 4xx
  UPDATE_FAIL  : 0,   // PUT/PATCH returns 4xx
  REQUIRED     : 0,   // missing required field
  TYPE         : 0,   // wrong JS type sent for a field
  ENUM         : 0,   // value not in allowed enum set
  LENGTH       : 0,   // minlength / maxlength violation
  WHITESPACE   : 0,   // blank-after-trim violation
  IMMUTABLE    : 0,   // attempt to change read-only field
  UNKNOWN      : 0,   // unrecognised field sent
  AUTH         : 0,   // missing / invalid auth token
  NOT_FOUND    : 0,   // resource does not exist
};

// ─── Output helpers (DO NOT MODIFY) ─────────────────────────────────────────

function logHeader(uniqueId) {
  console.log("SIT725_VALIDATION_TESTS");
  console.log(`BASE_URL=${BASE_URL}`);
  console.log(`API_BASE=${API_BASE}`);
  console.log(`INFO|Generated uniqueId=${uniqueId}`);
}

function logResult(r) {
  console.log(
    `TEST|${r.id}|${r.name}|${r.method}|${r.path}` +
    `|expected=${r.expected}|actual=${r.actual}|pass=${r.pass ? "Y" : "N"}`,
  );
}

function logSummary() {
  const failed = results.filter(r => !r.pass).length;
  console.log(
    `SUMMARY|pass=${failed === 0 ? "Y" : "N"}|failed=${failed}|total=${results.length}`,
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

// ─── HTTP helper ─────────────────────────────────────────────────────────────

async function http(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  return { status: res.status, text };
}

// ─── Test registration (DO NOT MODIFY) ───────────────────────────────────────

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

// ─── Auth helper – adjust to your login endpoint ─────────────────────────────

async function getAuthToken(studentId) {
  const email    = `test-${studentId}@uniconnect.test`;
  const password = "Testpassword1!";
  // Register first (409 is fine if the account already exists)
  await fetch(`${BASE_URL}/api/auth/register`, {
    method  : "POST",
    headers : { "Content-Type": "application/json" },
    body    : JSON.stringify({ username: `tester-${studentId.slice(0, 8)}`, email, password }),
  });
  // Login to get a JWT
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method  : "POST",
    headers : { "Content-Type": "application/json" },
    body    : JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.token ?? null;
}

// ─── Factories ───────────────────────────────────────────────────────────────

/** Returns a fully valid notification body. studentId must be a valid 24-char hex ObjectId. */
function makeValidNotification(studentId) {
  return {
    studentId,
    type    : "message",
    title   : "Valid Notification Title",
    message : "This is a valid notification body.",
    read    : false,
  };
}

/** Returns a fully valid update body (no studentId – immutable). */
function makeValidUpdate() {
  return {
    type    : "event",
    title   : "Updated Notification Title",
    message : "This is an updated notification message.",
    read    : true,
  };
}

/** Generates a valid-looking 24-char hex ObjectId string. */
function fakeObjectId() {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

// ─── Main run ────────────────────────────────────────────────────────────────

async function run() {
  const studentObjId = fakeObjectId();
  logHeader(studentObjId);

  const token = await getAuthToken(studentObjId);

  const createPath      = API_BASE;
  const listPath        = API_BASE;
  const unreadCountPath = `${API_BASE}/unread-count`;
  const markAllReadPath = `${API_BASE}/mark-all-read`;
  const byIdPath        = id => `${API_BASE}/${id}`;
  const markReadPath    = id => `${API_BASE}/${id}/read`;

  let notificationId = null;

  // ═══════════════════════════════════════════════════════════════════════════
  // HAPPY-PATH BASELINE
  // ═══════════════════════════════════════════════════════════════════════════

  // T01 – Valid create, all fields supplied
  await test({
    id: "T01", name: "Valid create – all fields",
    method: "POST", path: createPath, expected: 201, token,
    body: makeValidNotification(studentObjId),
    tags: [],
  });

  // Capture the _id Mongoose assigned so later tests can reference it
  {
    const { text } = await http("GET", listPath, undefined, token);
    try {
      const data = JSON.parse(text);
      notificationId = data.notifications?.[0]?._id ?? null;
    } catch { /* ignore */ }
  }

  // T02 – Valid create without optional `read` (defaults to false)
  await test({
    id: "T02", name: "Valid create – read omitted, defaults false",
    method: "POST", path: createPath, expected: 201, token,
    body: (() => { const b = makeValidNotification(fakeObjectId()); delete b.read; return b; })(),
    tags: [],
  });

  // T03 – GET list returns 200
  await test({
    id: "T03", name: "GET notifications list",
    method: "GET", path: listPath, expected: 200, token,
    tags: [],
  });

  // T04 – GET unread count returns 200
  await test({
    id: "T04", name: "GET unread count",
    method: "GET", path: unreadCountPath, expected: 200, token,
    tags: [],
  });

  // T05 – Mark single notification as read
  await test({
    id: "T05", name: "Mark single notification read",
    method: "PATCH", path: markReadPath(notificationId), expected: 200, token,
    tags: [],
  });

  // T06 – Mark all notifications as read
  await test({
    id: "T06", name: "Mark all notifications read",
    method: "PATCH", path: markAllReadPath, expected: 200, token,
    tags: [],
  });

  // T07 – Valid full update
  await test({
    id: "T07", name: "Valid full update",
    method: "PUT", path: byIdPath(notificationId), expected: 200, token,
    body: makeValidUpdate(),
    tags: [],
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // studentId FIELD
  // ═══════════════════════════════════════════════════════════════════════════

  // T08 – studentId missing → required
  await test({
    id: "T08", name: "studentId – missing (required)",
    method: "POST", path: createPath, expected: 400, token,
    body: (() => { const b = makeValidNotification(studentObjId); delete b.studentId; return b; })(),
    tags: ["CREATE_FAIL", "REQUIRED"],
  });

  // T09 – studentId is null → required
  await test({
    id: "T09", name: "studentId – null (required)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), studentId: null },
    tags: ["CREATE_FAIL", "REQUIRED"],
  });

  // T10 – studentId is a plain number → wrong type / cast error
  await test({
    id: "T10", name: "studentId – number instead of ObjectId string",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), studentId: 123456 },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T11 – studentId is too short to be a valid ObjectId
  await test({
    id: "T11", name: "studentId – invalid ObjectId string (too short)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), studentId: "notanobjectid" },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T12 – studentId is an empty string → cast / required error
  await test({
    id: "T12", name: "studentId – empty string",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), studentId: "" },
    tags: ["CREATE_FAIL", "REQUIRED"],
  });

  // T13 – studentId sent on update → immutable
  await test({
    id: "T13", name: "studentId – immutable on update",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: { ...makeValidUpdate(), studentId: fakeObjectId() },
    tags: ["UPDATE_FAIL", "IMMUTABLE"],
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // type FIELD  (enum: message | forum_reply | event | resource)
  // ═══════════════════════════════════════════════════════════════════════════

  // T14 – type missing → required
  await test({
    id: "T14", name: "type – missing (required)",
    method: "POST", path: createPath, expected: 400, token,
    body: (() => { const b = makeValidNotification(studentObjId); delete b.type; return b; })(),
    tags: ["CREATE_FAIL", "REQUIRED"],
  });

  // T15 – type is null → required
  await test({
    id: "T15", name: "type – null (required)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), type: null },
    tags: ["CREATE_FAIL", "REQUIRED"],
  });

  // T16 – type is empty string → enum / required
  await test({
    id: "T16", name: "type – empty string (not in enum)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), type: "" },
    tags: ["CREATE_FAIL", "ENUM"],
  });

  // T17 – type is a random string → enum
  await test({
    id: "T17", name: "type – arbitrary string not in enum",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), type: "notification" },
    tags: ["CREATE_FAIL", "ENUM"],
  });

  // T18 – type close but wrong case → enum (case-sensitive)
  await test({
    id: "T18", name: "type – wrong case (Message vs message)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), type: "Message" },
    tags: ["CREATE_FAIL", "ENUM"],
  });

  // T19 – type is a number → wrong type
  await test({
    id: "T19", name: "type – number instead of string",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), type: 1 },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T20–T23 – each valid enum value individually accepted
  for (const [i, enumVal] of ["message", "forum_reply", "event", "resource"].entries()) {
    await test({
      id: `T${20 + i}`, name: `type – valid enum "${enumVal}"`,
      method: "POST", path: createPath, expected: 201, token,
      body: { ...makeValidNotification(fakeObjectId()), type: enumVal },
      tags: [],
    });
  }

  // T24 – type invalid on update → enum
  await test({
    id: "T24", name: "type – invalid enum on update",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: { ...makeValidUpdate(), type: "push" },
    tags: ["UPDATE_FAIL", "ENUM"],
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // title FIELD  (required, minlength:1, maxlength:100, non-blank after trim)
  // ═══════════════════════════════════════════════════════════════════════════

  // T25 – title missing → required
  await test({
    id: "T25", name: "title – missing (required)",
    method: "POST", path: createPath, expected: 400, token,
    body: (() => { const b = makeValidNotification(studentObjId); delete b.title; return b; })(),
    tags: ["CREATE_FAIL", "REQUIRED"],
  });

  // T26 – title is null → required
  await test({
    id: "T26", name: "title – null (required)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), title: null },
    tags: ["CREATE_FAIL", "REQUIRED"],
  });

  // T27 – title is empty string → minlength / required
  await test({
    id: "T27", name: "title – empty string",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), title: "" },
    tags: ["CREATE_FAIL", "REQUIRED", "LENGTH"],
  });

  // T28 – title is whitespace only → blank-after-trim validator
  await test({
    id: "T28", name: "title – whitespace only (blank after trim)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), title: "   " },
    tags: ["CREATE_FAIL", "WHITESPACE"],
  });

  // T29 – title exactly 1 char (at minlength boundary, should pass)
  await test({
    id: "T29", name: "title – 1 character (at minlength boundary)",
    method: "POST", path: createPath, expected: 201, token,
    body: { ...makeValidNotification(fakeObjectId()), title: "X" },
    tags: [],
  });

  // T30 – title exactly 100 chars (at maxlength boundary, should pass)
  await test({
    id: "T30", name: "title – 100 characters (at maxlength boundary)",
    method: "POST", path: createPath, expected: 201, token,
    body: { ...makeValidNotification(fakeObjectId()), title: "A".repeat(100) },
    tags: [],
  });

  // T31 – title 101 chars → exceeds maxlength
  await test({
    id: "T31", name: "title – 101 characters (exceeds maxlength 100)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), title: "A".repeat(101) },
    tags: ["CREATE_FAIL", "LENGTH"],
  });

  // T32 – title is a number → wrong type
  await test({
    id: "T32", name: "title – number instead of string",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), title: 42 },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T33 – title is an array → wrong type
  await test({
    id: "T33", name: "title – array instead of string",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), title: ["Hello"] },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T34 – title empty string on update → required / length
  await test({
    id: "T34", name: "title – empty string on update",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: { ...makeValidUpdate(), title: "" },
    tags: ["UPDATE_FAIL", "REQUIRED", "LENGTH"],
  });

  // T35 – title whitespace only on update → blank-after-trim
  await test({
    id: "T35", name: "title – whitespace only on update",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: { ...makeValidUpdate(), title: "   " },
    tags: ["UPDATE_FAIL", "WHITESPACE"],
  });

  // T36 – title 101 chars on update → maxlength
  await test({
    id: "T36", name: "title – 101 characters on update",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: { ...makeValidUpdate(), title: "A".repeat(101) },
    tags: ["UPDATE_FAIL", "LENGTH"],
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // message FIELD  (required, minlength:1, maxlength:500, non-blank after trim)
  // ═══════════════════════════════════════════════════════════════════════════

  // T37 – message missing → required
  await test({
    id: "T37", name: "message – missing (required)",
    method: "POST", path: createPath, expected: 400, token,
    body: (() => { const b = makeValidNotification(studentObjId); delete b.message; return b; })(),
    tags: ["CREATE_FAIL", "REQUIRED"],
  });

  // T38 – message is null → required
  await test({
    id: "T38", name: "message – null (required)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), message: null },
    tags: ["CREATE_FAIL", "REQUIRED"],
  });

  // T39 – message is empty string → minlength / required
  await test({
    id: "T39", name: "message – empty string",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), message: "" },
    tags: ["CREATE_FAIL", "REQUIRED", "LENGTH"],
  });

  // T40 – message is whitespace only → blank-after-trim
  await test({
    id: "T40", name: "message – whitespace only (blank after trim)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), message: "   " },
    tags: ["CREATE_FAIL", "WHITESPACE"],
  });

  // T41 – message exactly 1 char (at minlength, should pass)
  await test({
    id: "T41", name: "message – 1 character (at minlength boundary)",
    method: "POST", path: createPath, expected: 201, token,
    body: { ...makeValidNotification(fakeObjectId()), message: "X" },
    tags: [],
  });

  // T42 – message exactly 500 chars (at maxlength, should pass)
  await test({
    id: "T42", name: "message – 500 characters (at maxlength boundary)",
    method: "POST", path: createPath, expected: 201, token,
    body: { ...makeValidNotification(fakeObjectId()), message: "A".repeat(500) },
    tags: [],
  });

  // T43 – message 501 chars → exceeds maxlength
  await test({
    id: "T43", name: "message – 501 characters (exceeds maxlength 500)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), message: "A".repeat(501) },
    tags: ["CREATE_FAIL", "LENGTH"],
  });

  // T44 – message is a number → wrong type
  await test({
    id: "T44", name: "message – number instead of string",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), message: 999 },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T45 – message is a boolean → wrong type
  await test({
    id: "T45", name: "message – boolean instead of string",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), message: true },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T46 – message empty string on update → required / length
  await test({
    id: "T46", name: "message – empty string on update",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: { ...makeValidUpdate(), message: "" },
    tags: ["UPDATE_FAIL", "REQUIRED", "LENGTH"],
  });

  // T47 – message whitespace only on update
  await test({
    id: "T47", name: "message – whitespace only on update",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: { ...makeValidUpdate(), message: "   " },
    tags: ["UPDATE_FAIL", "WHITESPACE"],
  });

  // T48 – message 501 chars on update → maxlength
  await test({
    id: "T48", name: "message – 501 characters on update",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: { ...makeValidUpdate(), message: "A".repeat(501) },
    tags: ["UPDATE_FAIL", "LENGTH"],
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // read FIELD  (Boolean, default false — no minlength/maxlength applies)
  // ═══════════════════════════════════════════════════════════════════════════

  // T49 – read = true on create → accepted
  await test({
    id: "T49", name: "read – true on create (explicit)",
    method: "POST", path: createPath, expected: 201, token,
    body: { ...makeValidNotification(fakeObjectId()), read: true },
    tags: [],
  });

  // T50 – read = false on create → accepted
  await test({
    id: "T50", name: "read – false on create (explicit)",
    method: "POST", path: createPath, expected: 201, token,
    body: { ...makeValidNotification(fakeObjectId()), read: false },
    tags: [],
  });

  // T51 – read is string "true" → wrong type
  await test({
    id: "T51", name: "read – string 'true' instead of boolean",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), read: "true" },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T52 – read is string "false" → wrong type
  await test({
    id: "T52", name: "read – string 'false' instead of boolean",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), read: "false" },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T53 – read is number 1 → wrong type
  await test({
    id: "T53", name: "read – number 1 instead of boolean",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), read: 1 },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T54 – read is number 0 → wrong type
  await test({
    id: "T54", name: "read – number 0 instead of boolean",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), read: 0 },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T55 – read is null → cast / type error
  await test({
    id: "T55", name: "read – null value",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), read: null },
    tags: ["CREATE_FAIL", "TYPE"],
  });

  // T56 – PATCH mark-read sets read=true
  await test({
    id: "T56", name: "PATCH mark-read endpoint sets read=true",
    method: "PATCH", path: markReadPath(notificationId), expected: 200, token,
    tags: [],
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMESTAMP FIELDS  (createdAt / updatedAt — auto, immutable by client)
  // ═══════════════════════════════════════════════════════════════════════════

  // T57 – createdAt supplied on create → rejected (immutable / unknown)
  await test({
    id: "T57", name: "createdAt – client-supplied on create (immutable)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), createdAt: "2000-01-01T00:00:00.000Z" },
    tags: ["CREATE_FAIL", "IMMUTABLE"],
  });

  // T58 – updatedAt supplied on create → rejected
  await test({
    id: "T58", name: "updatedAt – client-supplied on create (immutable)",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), updatedAt: "2000-01-01T00:00:00.000Z" },
    tags: ["CREATE_FAIL", "IMMUTABLE"],
  });

  // T59 – createdAt supplied on update → rejected
  await test({
    id: "T59", name: "createdAt – client-supplied on update (immutable)",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: { ...makeValidUpdate(), createdAt: "2000-01-01T00:00:00.000Z" },
    tags: ["UPDATE_FAIL", "IMMUTABLE"],
  });

  // T60 – updatedAt supplied on update → rejected
  await test({
    id: "T60", name: "updatedAt – client-supplied on update (immutable)",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: { ...makeValidUpdate(), updatedAt: "2000-01-01T00:00:00.000Z" },
    tags: ["UPDATE_FAIL", "IMMUTABLE"],
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UNKNOWN FIELDS
  // ═══════════════════════════════════════════════════════════════════════════

  // T61 – extra field on create
  await test({
    id: "T61", name: "unknown field 'hack' on create",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), hack: true },
    tags: ["CREATE_FAIL", "UNKNOWN"],
  });

  // T62 – extra field on update
  await test({
    id: "T62", name: "unknown field 'hack' on update",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: { ...makeValidUpdate(), hack: true },
    tags: ["UPDATE_FAIL", "UNKNOWN"],
  });

  // T63 – _id supplied on create → unknown / immutable
  await test({
    id: "T63", name: "unknown field '_id' on create",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), _id: fakeObjectId() },
    tags: ["CREATE_FAIL", "UNKNOWN"],
  });

  // T64 – multiple unknown fields → still rejected
  await test({
    id: "T64", name: "multiple unknown fields on create",
    method: "POST", path: createPath, expected: 400, token,
    body: { ...makeValidNotification(studentObjId), foo: 1, bar: 2 },
    tags: ["CREATE_FAIL", "UNKNOWN"],
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHENTICATION
  // ═══════════════════════════════════════════════════════════════════════════

  // T65 – GET list without token → 401
  await test({
    id: "T65", name: "GET list – no auth token",
    method: "GET", path: listPath, expected: 401,
    tags: ["AUTH"],
  });

  // T66 – GET unread count without token → 401
  await test({
    id: "T66", name: "GET unread count – no auth token",
    method: "GET", path: unreadCountPath, expected: 401,
    tags: ["AUTH"],
  });

  // T67 – POST create without token → 401
  await test({
    id: "T67", name: "POST create – no auth token",
    method: "POST", path: createPath, expected: 401,
    body: makeValidNotification(studentObjId),
    tags: ["AUTH"],
  });

  // T68 – PATCH mark-read without token → 401
  await test({
    id: "T68", name: "PATCH mark-read – no auth token",
    method: "PATCH", path: markReadPath(notificationId), expected: 401,
    tags: ["AUTH"],
  });

  // T69 – PATCH mark-all-read without token → 401
  await test({
    id: "T69", name: "PATCH mark-all-read – no auth token",
    method: "PATCH", path: markAllReadPath, expected: 401,
    tags: ["AUTH"],
  });

  // T70 – PUT update without token → 401
  await test({
    id: "T70", name: "PUT update – no auth token",
    method: "PUT", path: byIdPath(notificationId), expected: 401,
    body: makeValidUpdate(),
    tags: ["AUTH"],
  });

  // T71 – malformed bearer token → 401
  await test({
    id: "T71", name: "GET list – malformed bearer token",
    method: "GET", path: listPath, expected: 401,
    token: "not.a.real.token",
    tags: ["AUTH"],
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // NOT FOUND / INVALID ID FORMAT
  // ═══════════════════════════════════════════════════════════════════════════

  const nonExistentId = fakeObjectId();

  // T72 – mark-read on non-existent notification → 404
  await test({
    id: "T72", name: "PATCH mark-read – non-existent id",
    method: "PATCH", path: markReadPath(nonExistentId), expected: 404, token,
    tags: ["NOT_FOUND"],
  });

  // T73 – PUT update on non-existent notification → 404
  await test({
    id: "T73", name: "PUT update – non-existent id",
    method: "PUT", path: byIdPath(nonExistentId), expected: 404, token,
    body: makeValidUpdate(),
    tags: ["NOT_FOUND"],
  });

  // T74 – mark-read with non-ObjectId string in path → 400
  await test({
    id: "T74", name: "PATCH mark-read – invalid id format in path",
    method: "PATCH", path: markReadPath("not-an-id"), expected: 400, token,
    tags: ["TYPE"],
  });

  // T75 – PUT update with non-ObjectId string in path → 400
  await test({
    id: "T75", name: "PUT update – invalid id format in path",
    method: "PUT", path: byIdPath("not-an-id"), expected: 400, token,
    body: makeValidUpdate(),
    tags: ["TYPE"],
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EDGE CASES
  // ═══════════════════════════════════════════════════════════════════════════

  // T76 – completely empty body on create → 400
  await test({
    id: "T76", name: "create – completely empty body",
    method: "POST", path: createPath, expected: 400, token,
    body: {},
    tags: ["CREATE_FAIL", "REQUIRED"],
  });

  // T77 – completely empty body on update → 400
  await test({
    id: "T77", name: "update – completely empty body",
    method: "PUT", path: byIdPath(notificationId), expected: 400, token,
    body: {},
    tags: ["UPDATE_FAIL", "REQUIRED"],
  });

  // T78 – title and message with unicode (should be accepted)
  await test({
    id: "T78", name: "title + message – unicode characters accepted",
    method: "POST", path: createPath, expected: 201, token,
    body: { ...makeValidNotification(fakeObjectId()), title: "你好世界", message: "مرحبا بالعالم" },
    tags: [],
  });

  // T79 – title with leading/trailing whitespace (trim normalises)
  await test({
    id: "T79", name: "title – leading/trailing whitespace trimmed to valid",
    method: "POST", path: createPath, expected: 201, token,
    body: { ...makeValidNotification(fakeObjectId()), title: "  Trimmed Title  " },
    tags: [],
  });

  // T80 – message with leading/trailing whitespace (trim normalises)
  await test({
    id: "T80", name: "message – leading/trailing whitespace trimmed to valid",
    method: "POST", path: createPath, expected: 201, token,
    body: { ...makeValidNotification(fakeObjectId()), message: "  Trimmed message.  " },
    tags: [],
  });

  // ─────────────────────────────────────────────────────────────────────────
  logSummary();
  logCoverage();
  // ─────────────────────────────────────────────────────────────────────────

  process.exit(results.every(r => r.pass) ? 0 : 1);
}

run().catch(err => {
  console.error("ERROR", err);
  process.exit(2);
});