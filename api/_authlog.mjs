// Sign-in and account events into audit_log (shown on the owner's Aktivita page). Better Auth hooks: never a password, code, token or link.
// Logging must never break signing in: every step is wrapped, a failure is only dropped.
import { createAuthMiddleware, getSessionFromCtx, isAPIError } from "better-auth/api";

const who = (u) => (u ? `${u.name} <${u.email}>` : "neznámý");
const PATHS = new Set(["/sign-in/email", "/sign-out", "/two-factor/verify-otp", "/request-password-reset", "/reset-password", "/change-password",
  "/admin/create-user", "/admin/set-role", "/admin/remove-user", "/admin/ban-user", "/admin/revoke-user-sessions"]);

export function authHooks(pool) {
  const put = (actor, action, detail = "") => pool.query("insert into audit_log (actor, action, detail) values ($1, $2, $3)", [actor, action, String(detail).slice(0, 500)]).catch(() => {});
  const byId = async (id) => (typeof id === "string" ? (await pool.query(`select name, email from "user" where id = $1`, [id])).rows[0] : null);
  const byEmail = async (e) => (typeof e === "string" ? (await pool.query(`select name, email from "user" where lower(email) = lower($1)`, [e])).rows[0] : null);
  const stash = new Map();  // before → after of the same request: the person who is gone or hidden by then (the reset token is only a key here, never logged)
  const key = (ctx) => ctx.path + "|" + (ctx.body?.token || ctx.body?.userId);

  const before = createAuthMiddleware(async (ctx) => {
    try {
      if (!PATHS.has(ctx.path)) return;
      if (ctx.path === "/sign-out") { const s = await getSessionFromCtx(ctx).catch(() => null); if (s) await put(who(s.user), "sign-out"); return; }
      if (ctx.path === "/reset-password") {
        const v = await ctx.context.internalAdapter.findVerificationValue(`reset-password:${ctx.body?.token}`).catch(() => null);
        if (v) stash.set(key(ctx), await byId(v.value));
      } else if (ctx.body?.userId) stash.set(key(ctx), await byId(ctx.body.userId));
    } catch { /* never break auth */ }
  });

  const after = createAuthMiddleware(async (ctx) => {
    try {
      if (!PATHS.has(ctx.path) || ctx.path === "/sign-out") return;
      const b = ctx.body || {}, bad = isAPIError(ctx.context.returned), target = stash.get(key(ctx));
      stash.delete(key(ctx));
      const me = who((await getSessionFromCtx(ctx).catch(() => null))?.user), t = target ? who(target) : String(b.userId || "").slice(0, 40);
      switch (ctx.path) {
        case "/sign-in/email": {
          if (!bad) { const u = ctx.context.newSession?.user; if (u) await put(who(u), "sign-in"); break; }  // with a code required, the sign-in is logged when it is verified
          if (ctx.context.returned.statusCode !== 401) break;  // not a wrong password (too many attempts, banned)
          const u = await byEmail(b.email);
          await put(who(u), "sign-in failed", u ? "špatné heslo" : "neznámý e-mail");
          break;
        }
        case "/two-factor/verify-otp": {
          let u = ctx.context.newSession?.user;
          if (!u) {  // failed: the person is known only from the half-finished sign-in
            const c = ctx.context.createAuthCookie("two_factor"), id = await ctx.getSignedCookie(c.name, ctx.context.secret);
            const v = id && await ctx.context.internalAdapter.findVerificationValue(id).catch(() => null);
            u = v && await byId(v.value);
          }
          if (!bad && u) { await put(who(u), "2fa verified"); await put(who(u), "sign-in", "kód z e-mailu"); } else if (bad) await put(who(u), "2fa failed");
          break;
        }
        case "/request-password-reset": { const u = await byEmail(b.email); if (!bad && u) await put(who(u), "reset requested"); break; }
        case "/reset-password": if (!bad) await put(t, "password set"); break;
        case "/change-password": if (!bad) await put(me, "password changed"); break;
        case "/admin/create-user": if (!bad) await put(me, "user invited", `${b.name} <${b.email}>, role ${b.role}, lang ${b.data?.lang || "cs"}`); break;
        case "/admin/set-role": if (!bad) await put(me, "role changed", `${t}: ${b.role}`); break;
        case "/admin/remove-user": if (!bad) await put(me, "user removed", t); break;
        case "/admin/ban-user": if (!bad) await put(me, "user banned", t); break;
        case "/admin/revoke-user-sessions": if (!bad) await put(me, "sessions revoked", t); break;
      }
    } catch { /* never break auth */ }
  });

  // a plugin listed after twoFactor: its after-hook then sees newSession null while a code is still required
  const plugin = { id: "authlog", hooks: { before: [{ matcher: (c) => PATHS.has(c.path), handler: before }], after: [{ matcher: (c) => PATHS.has(c.path), handler: after }] } };
  return { plugin, put };
}
