// Checks the sign-in rules of api/_auth.mjs against the real Better Auth, with an in-memory database: no self
// sign-up, the session cookie, lockout and backoff after wrong passwords, the second step (TOTP), what an admin
// without it may not do, roles, and the origin check of api/auth.js.
//   npm ci && node tests/auth.test.js
const assert = require("assert");
const crypto = require("crypto");

const ORIGIN = "https://cmm.test";
const PASSWORD = "dlouhe-heslo-2026";

// RFC 6238, as an authenticator app computes it (SHA-1, 6 digits, 30 s)
function totp(uri, at = Date.now()) {
  const secret = new URL(uri).searchParams.get("secret").replace(/=+$/, "");
  let bits = "";
  for (const c of secret) bits += "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 30000)));
  const h = crypto.createHmac("sha1", key).update(counter).digest(), o = h[19] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, "0");
}

(async () => {
  let memoryAdapter;
  try {
    ({ memoryAdapter } = await import("better-auth/adapters/memory"));
  } catch (e) {
    if (e.code !== "ERR_MODULE_NOT_FOUND") throw e;
    console.log("auth SKIPPED: run `npm ci` first (better-auth is not installed)");
    process.exit(process.env.CI ? 1 : 0);
  }
  const { createAuth, memoryAttempts, lockSeconds, LOCK, MIN_PASSWORD } = await import("../api/_auth.mjs");

  const db = { user: [], session: [], account: [], verification: [], twoFactor: [], rateLimit: [] };
  const log = [];
  let clock = Date.now();
  const quiet = console.error; console.error = () => {};  // Better Auth logs every refused request
  const auth = createAuth({ database: memoryAdapter(db), attempts: memoryAttempts(), secret: crypto.randomBytes(32).toString("base64"), baseURL: ORIGIN,
    rateLimit: false, now: () => clock, log: (e) => log.push(e) });
  const events = (name) => log.filter((e) => e.audit === name);

  const jar = () => ({ cookies: {} });
  async function post(path, body, j = jar(), origin = ORIGIN, method = "POST") {
    const cookie = Object.entries(j.cookies).map(([k, v]) => `${k}=${v}`).join("; ");
    const r = await auth.handler(new Request(ORIGIN + "/api/auth" + path, { method, headers: { ...(body ? { "content-type": "application/json" } : {}), ...(origin ? { origin } : {}), ...(cookie ? { cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined }));
    const set = r.headers.getSetCookie();
    for (const c of set) { const [kv] = c.split(";"), i = kv.indexOf("="); if (/Max-Age=0/i.test(c)) delete j.cookies[kv.slice(0, i)]; else j.cookies[kv.slice(0, i)] = kv.slice(i + 1); }
    return { status: r.status, body: (await r.json().catch(() => null)) || {}, set, jar: j };
  }
  const get = (path, j) => post(path, null, j, ORIGIN, "GET");
  const signIn = (email, password, j) => post("/sign-in/email", { email, password }, j);
  const add = (name, email, role) => auth.api.createUser({ body: { name, email, password: PASSWORD, role } });

  assert.deepStrictEqual([4, 5, 6, 7, 8, 9, 30].map(lockSeconds), [0, 60, 120, 240, 480, 900, 900]);
  assert.ok(MIN_PASSWORD >= 12);

  await add("Olga Ownerová", "olga@cmm.test", "owner");
  await add("Adam Adminů", "adam@cmm.test", "admin");
  await add("Eva Editorová", "eva@cmm.test", "editor");

  // ---- nobody signs themselves up; short passwords are refused
  assert.notStrictEqual((await post("/sign-up/email", { name: "Cizí", email: "cizi@example.com", password: PASSWORD })).status, 200);
  assert.strictEqual(db.user.length, 3);
  await assert.rejects(auth.api.createUser({ body: { name: "Krátké", email: "kratke@cmm.test", password: "kratke-123", role: "editor" } }));

  // ---- sign-in: the cookie is Secure, HttpOnly and SameSite=Strict
  const eva = await signIn("eva@cmm.test", PASSWORD);
  assert.strictEqual(eva.status, 200);
  const sessionCookie = eva.set.find((c) => c.startsWith("__Secure-better-auth.session_token="));
  assert.ok(sessionCookie, "session cookie");
  assert.match(sessionCookie, /; HttpOnly/i);
  assert.match(sessionCookie, /; Secure/i);
  assert.match(sessionCookie, /; SameSite=Strict/i);
  assert.match(sessionCookie, /Max-Age=43200/);  // 12 hours
  assert.strictEqual((await get("/get-session", eva.jar)).body.user.email, "eva@cmm.test");
  assert.strictEqual(events("sign-in").length, 1);

  // ---- a request from another origin is refused
  assert.strictEqual((await post("/sign-in/email", { email: "eva@cmm.test", password: PASSWORD }, jar(), "https://evil.example")).status, 403);
  assert.strictEqual((await post("/sign-out", {}, { cookies: { ...eva.jar.cookies } }, "https://evil.example")).status, 403);
  const { sameOrigin } = require("../api/auth.js");  // the wrapper also refuses a POST with no Origin
  assert.strictEqual(sameOrigin({ headers: { host: "cmm.test", origin: ORIGIN } }), true);
  assert.strictEqual(sameOrigin({ headers: { host: "cmm.test" } }), false);
  assert.strictEqual(sameOrigin({ headers: { host: "cmm.test", origin: "https://evil.example" } }), false);
  assert.strictEqual(sameOrigin({ headers: { host: "cmm.test", origin: "null" } }), false);
  assert.strictEqual(events("sign-in-failed").length, 0);  // a refused origin is not counted as a wrong password

  // ---- lockout and backoff: LOCK.after wrong passwords lock the account, also for the right password
  for (let i = 1; i <= LOCK.after; i++) {
    const r = await signIn("Eva@cmm.test", "spatne-heslo-" + i);
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.body.code, "INVALID_EMAIL_OR_PASSWORD");
  }
  assert.strictEqual(events("sign-in-failed").pop().lockedSeconds, 60);
  let locked = await signIn("eva@cmm.test", PASSWORD);
  assert.strictEqual(locked.status, 429);
  assert.strictEqual(locked.body.code, "ACCOUNT_LOCKED");
  assert.strictEqual(locked.set.length, 0);  // no session
  assert.strictEqual(events("sign-in-locked").length, 1);
  clock += 61e3;  // the lock has passed; one more wrong password locks for twice as long
  assert.strictEqual((await signIn("eva@cmm.test", "zase-spatne")).status, 401);
  assert.strictEqual(events("sign-in-failed").pop().lockedSeconds, 120);
  clock += 61e3;
  assert.strictEqual((await signIn("eva@cmm.test", PASSWORD)).status, 429);
  clock += 60e3;
  assert.strictEqual((await signIn("eva@cmm.test", PASSWORD)).status, 200);  // a good sign-in clears the count
  assert.strictEqual((await signIn("eva@cmm.test", "spatne")).status, 401);
  assert.strictEqual(events("sign-in-failed").pop().failures, 1);
  // an address nobody has is locked the same way, so the answer does not tell whether an account exists
  for (let i = 0; i < LOCK.after; i++) assert.strictEqual((await signIn("nikdo@cmm.test", "x".repeat(12))).status, 401);
  assert.strictEqual((await signIn("nikdo@cmm.test", "x".repeat(12))).status, 429);
  assert.strictEqual((await signIn("adam@cmm.test", PASSWORD)).status, 200);  // other accounts are not affected

  // ---- an owner without the second step may not manage people
  const olga = await signIn("olga@cmm.test", PASSWORD);
  const refused = await post("/admin/create-user", { name: "X", email: "x@cmm.test", password: PASSWORD, role: "editor" }, olga.jar);
  assert.strictEqual(refused.status, 403);
  assert.strictEqual(refused.body.code, "TWO_FACTOR_REQUIRED");
  assert.strictEqual((await get("/admin/list-users?limit=10", olga.jar)).status, 403);
  assert.strictEqual(db.user.length, 3);

  // ---- switching the second step on: the password, then a code from the app
  assert.notStrictEqual((await post("/two-factor/enable", { password: "spatne-heslo-x" }, olga.jar)).status, 200);
  const enable = await post("/two-factor/enable", { password: PASSWORD }, olga.jar);
  assert.strictEqual(enable.status, 200);
  assert.match(enable.body.totpURI, /^otpauth:\/\/totp\//);
  assert.ok(enable.body.backupCodes.length >= 8);
  assert.strictEqual((await get("/get-session", olga.jar)).body.user.twoFactorEnabled, false);  // not on until a code proves the app works
  assert.notStrictEqual((await post("/two-factor/verify-totp", { code: "000000" }, olga.jar)).status, 200);
  assert.strictEqual((await post("/two-factor/verify-totp", { code: totp(enable.body.totpURI) }, olga.jar)).status, 200);
  assert.strictEqual((await get("/get-session", olga.jar)).body.user.twoFactorEnabled, true);
  const made = await post("/admin/create-user", { name: "Nový Redaktor", email: "novy@cmm.test", password: PASSWORD, role: "editor" }, olga.jar);
  assert.strictEqual(made.status, 200);
  assert.strictEqual(events("admin/create-user").pop().ok, true);

  // ---- from now on the password alone does not sign the owner in
  const step1 = await signIn("olga@cmm.test", PASSWORD);
  assert.strictEqual(step1.status, 200);
  assert.strictEqual(step1.body.twoFactorRedirect, true);
  assert.ok(!step1.set.some((c) => c.startsWith("__Secure-better-auth.session_token=") && !/Max-Age=0/.test(c)), "no session before the code");
  assert.strictEqual((await get("/get-session", step1.jar)).body.user, undefined);
  assert.notStrictEqual((await post("/two-factor/verify-totp", { code: "123456" }, step1.jar)).status, 200);
  const step2 = await post("/two-factor/verify-totp", { code: totp(enable.body.totpURI) }, step1.jar);
  assert.strictEqual(step2.status, 200);
  assert.strictEqual((await get("/get-session", step1.jar)).body.user.email, "olga@cmm.test");
  // a backup code works once
  const again = await signIn("olga@cmm.test", PASSWORD);
  assert.strictEqual((await post("/two-factor/verify-backup-code", { code: enable.body.backupCodes[0] }, again.jar)).status, 200);
  const third = await signIn("olga@cmm.test", PASSWORD);
  assert.notStrictEqual((await post("/two-factor/verify-backup-code", { code: enable.body.backupCodes[0] }, third.jar)).status, 200);
  // wrong codes lock the second step too
  for (let i = 0; i < LOCK.after; i++) await post("/two-factor/verify-totp", { code: "00000" + i }, third.jar);
  assert.notStrictEqual((await post("/two-factor/verify-totp", { code: totp(enable.body.totpURI) }, third.jar)).status, 200);

  // ---- roles: an admin (even with the second step) and an editor do not manage people
  const adam = await signIn("adam@cmm.test", PASSWORD);
  const adam2fa = await post("/two-factor/enable", { password: PASSWORD }, adam.jar);
  await post("/two-factor/verify-totp", { code: totp(adam2fa.body.totpURI) }, adam.jar);
  assert.strictEqual((await post("/admin/create-user", { name: "Y", email: "y@cmm.test", password: PASSWORD, role: "owner" }, adam.jar)).status, 403);
  assert.strictEqual((await post("/admin/set-role", { userId: db.user.find((u) => u.email === "adam@cmm.test").id, role: "owner" }, adam.jar)).status, 403);
  const eva2 = await signIn("eva@cmm.test", PASSWORD);
  assert.strictEqual((await post("/admin/remove-user", { userId: db.user[0].id }, eva2.jar)).status, 403);
  assert.strictEqual(db.user.length, 4);

  // ---- nobody renames themselves; an owner can rename people
  const evaId = db.user.find((u) => u.email === "eva@cmm.test").id;
  const eva3 = await signIn("eva@cmm.test", PASSWORD);
  const rename = await post("/update-user", { name: "Olga Ownerová" }, eva3.jar);
  assert.strictEqual(rename.status, 403);
  assert.strictEqual(rename.body.code, "NAME_CHANGE_FORBIDDEN");
  assert.strictEqual((await post("/update-user", { name: "Olga Ownerová", image: "x" }, adam.jar)).status, 403);  // an admin neither
  assert.strictEqual(db.user.find((u) => u.id === evaId).name, "Eva Editorová");
  assert.strictEqual((await post("/admin/update-user", { userId: evaId, data: { name: "Eva Nová" } }, eva3.jar)).status, 403);  // not through the admin API either
  assert.strictEqual((await post("/admin/update-user", { userId: evaId, data: { name: "Eva Nová" } }, adam.jar)).status, 403);
  assert.strictEqual(db.user.find((u) => u.id === evaId).name, "Eva Editorová");
  await add("Druhý Owner", "owner2@cmm.test", "owner");  // Olga's second step is locked by the wrong codes above
  const olga2 = await signIn("owner2@cmm.test", PASSWORD);
  const owner2fa = await post("/two-factor/enable", { password: PASSWORD }, olga2.jar);
  await post("/two-factor/verify-totp", { code: totp(owner2fa.body.totpURI) }, olga2.jar);
  assert.strictEqual((await post("/admin/update-user", { userId: evaId, data: { name: "Eva Nová" } }, olga2.jar)).status, 200);
  assert.strictEqual(db.user.find((u) => u.id === evaId).name, "Eva Nová");

  // ---- signing out ends the session
  assert.strictEqual((await post("/sign-out", {}, eva2.jar)).status, 200);
  assert.strictEqual((await get("/get-session", eva2.jar)).body.user, undefined);

  // ---- nothing secret in the audit lines
  assert.ok(!JSON.stringify(log).includes(PASSWORD));
  assert.ok(!JSON.stringify(log).includes("eva@cmm.test"));  // sign-in lines carry a hash prefix or the account id
  console.error = quiet;
  console.log("auth ok");
})().catch((e) => { process.stderr.write((e && e.stack || String(e)) + "\n"); process.exit(1); });
