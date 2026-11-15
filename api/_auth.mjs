// Better Auth for /pridat-aktualitu/: e-mail + password sign-in with a second step (TOTP), sessions and roles kept in
// Postgres. Files starting with "_" are not routes on Vercel; api/auth.js serves this at /api/auth/*.
// Env: DATABASE_URL (Postgres, e.g. Neon), BETTER_AUTH_SECRET (long random string), BETTER_AUTH_URL (site origin).
//
// Rules (tests/auth.test.mjs):
// - Nobody can sign themselves up: an owner adds co-workers (the staff page, or `npm run auth:user`).
// - Nobody renames themselves (/update-user with a name is refused): names appear as authors and in the audit trail.
//   An owner renames people through /admin/update-user.
// - Roles: "owner" may also add, remove and reset people; "admin" may change any post; "editor" their own.
// - Two-step sign-in (an authenticator app) is required for admin and owner: until it is on they can sign in but
//   nothing except switching it on is allowed (here for /admin/*, in api/news.js for publishing). Optional for editors.
// - Wrong passwords lock the account: after LOCK.after in a row it is locked for LOCK.base seconds, twice as long
//   after each further one, up to LOCK.max. The count is per e-mail address, so changing the IP address does not
//   help; requests are also rate-limited per IP address. Wrong codes in the second step lock it the same way
//   (the plugin's accountLockout).
// - The session cookie is Secure, HttpOnly and SameSite=Strict; Better Auth refuses POSTs from another origin.
// - Sign-ins, failures, lockouts and changes to people are written to the function log as JSON lines ("audit").
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { admin, twoFactor } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import crypto from "node:crypto";

export const LOCK = { after: 5, base: 60, max: 900 };
export const lockSeconds = (failures) => (failures < LOCK.after ? 0 : Math.min(LOCK.max, LOCK.base * 2 ** (failures - LOCK.after)));
export const MIN_PASSWORD = 12;

const ac = createAccessControl(defaultStatements);
const roles = { owner: ac.newRole(adminAc.statements), admin: ac.newRole({ user: [], session: [] }), editor: ac.newRole({ user: [], session: [] }) };
const AUDITED = ["/sign-out", "/change-password", "/two-factor/enable", "/two-factor/disable", "/two-factor/verify-totp", "/two-factor/verify-backup-code"];

// Failed sign-ins per e-mail address (stored as a hash, so addresses that are not ours are not kept in clear).
export function pgAttempts(pool) {
  return {
    async get(key) {
      const r = await pool.query('select "failures", "lockedUntil" from "loginAttempt" where "key" = $1', [key]);
      return r.rows[0] || null;
    },
    async set(key, failures, lockedUntil) {
      await pool.query('insert into "loginAttempt" ("key", "failures", "lockedUntil", "updatedAt") values ($1, $2, $3, now()) ' +
        'on conflict ("key") do update set "failures" = $2, "lockedUntil" = $3, "updatedAt" = now()', [key, failures, lockedUntil]);
      await pool.query(`delete from "loginAttempt" where "updatedAt" < now() - interval '1 day'`);
    },
    async clear(key) { await pool.query('delete from "loginAttempt" where "key" = $1', [key]); },
  };
}

export function memoryAttempts() {  // tests and the local stand-in
  const m = new Map();
  return { get: async (k) => m.get(k) || null, set: async (k, failures, lockedUntil) => { m.set(k, { failures, lockedUntil }); }, clear: async (k) => { m.delete(k); } };
}

export function createAuth({ database, attempts, secret, baseURL, rateLimit = true, now = () => Date.now(), log = (e) => console.log(JSON.stringify(e)) }) {
  const audit = (event, data) => log({ audit: event, at: new Date(now()).toISOString(), ...data });
  const keyOf = (email) => crypto.createHash("sha256").update(String(email || "").trim().toLowerCase()).digest("hex");
  return betterAuth({
    database, secret, baseURL,
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: MIN_PASSWORD, maxPasswordLength: 128 },
    session: { expiresIn: 12 * 3600, updateAge: 3600, cookieCache: { enabled: false } },  // no cache: removing or banning someone takes effect at once
    advanced: { useSecureCookies: true, defaultCookieAttributes: { httpOnly: true, secure: true, sameSite: "strict" } },
    rateLimit: { enabled: rateLimit, storage: "database", window: 60, max: 60,
      customRules: { "/sign-in/email": { window: 60, max: 5 }, "/two-factor/*": { window: 60, max: 5 }, "/change-password": { window: 60, max: 5 }, "/admin/*": { window: 60, max: 30 } } },
    plugins: [
      admin({ ac, roles, defaultRole: "editor", adminRoles: ["owner"] }),
      twoFactor({ issuer: "Česká maltézská mládež – aktuality", accountLockout: { enabled: true, maxFailedAttempts: LOCK.after, durationSeconds: LOCK.max } }),
    ],
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path === "/sign-in/email") {
          const rec = await attempts.get(keyOf(ctx.body?.email));
          if (rec && rec.lockedUntil && new Date(rec.lockedUntil).getTime() > now()) {
            audit("sign-in-locked", { key: keyOf(ctx.body?.email).slice(0, 12) });
            throw new APIError("TOO_MANY_REQUESTS", { message: "Account temporarily locked", code: "ACCOUNT_LOCKED" });
          }
        }
        if (ctx.path === "/update-user" && ctx.body && "name" in ctx.body) {  // a display name is shown as the author: only an owner changes it, through the admin API
          throw new APIError("FORBIDDEN", { message: "Names are changed by an owner", code: "NAME_CHANGE_FORBIDDEN" });
        }
        if (ctx.path === "/admin/create-user" || ctx.path === "/admin/set-user-password") {  // the admin plugin does not apply the length rule itself
          const pw = String(ctx.body?.password ?? ctx.body?.newPassword ?? "");
          if (pw.length < MIN_PASSWORD || pw.length > 128) throw new APIError("BAD_REQUEST", { message: "Password too short", code: "PASSWORD_TOO_SHORT" });
        }
        if (ctx.path.startsWith("/admin/")) {  // people are managed only by someone signed in with two steps
          const s = await getSessionFromCtx(ctx);
          if (s && !s.user.twoFactorEnabled) throw new APIError("FORBIDDEN", { message: "Two-step sign-in required", code: "TWO_FACTOR_REQUIRED" });
        }
      }),
      after: createAuthMiddleware(async (ctx) => {
        const returned = ctx.context.returned, failed = returned instanceof APIError;
        if (ctx.path === "/sign-in/email") {
          const key = keyOf(ctx.body?.email);
          if (failed && returned.body?.code !== "INVALID_EMAIL_OR_PASSWORD") return;  // refused for another reason (origin, rate limit): not a guess
          if (failed) {
            const failures = ((await attempts.get(key)) || { failures: 0 }).failures + 1, wait = lockSeconds(failures);
            await attempts.set(key, failures, wait ? new Date(now() + wait * 1000) : null);
            audit("sign-in-failed", { key: key.slice(0, 12), failures, lockedSeconds: wait });
          } else {
            await attempts.clear(key);
            audit("sign-in", { user: ctx.context.newSession?.user?.id || null, secondStep: !ctx.context.newSession });
          }
        } else if ((ctx.path.startsWith("/admin/") && ctx.method === "POST") || AUDITED.includes(ctx.path)) {
          const s = ctx.context.newSession || ctx.context.session;
          audit(ctx.path.slice(1), { ok: !failed, by: s?.user?.id || null, target: ctx.body?.userId || ctx.body?.email || undefined, role: ctx.body?.role });
        }
      }),
    },
  });
}

let auth;
export async function getAuth() {
  if (!auth) {
    const { default: pg } = await import("pg");
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    auth = createAuth({ database: pool, attempts: pgAttempts(pool), secret: process.env.BETTER_AUTH_SECRET, baseURL: process.env.BETTER_AUTH_URL });
  }
  return auth;
}
