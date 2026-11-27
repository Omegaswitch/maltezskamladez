// Signed-in devices and new-place alerts (a Better Auth plugin, used by api/_auth.mjs).
// - Every sign-in notes the device (from the browser's user agent) and the place (Vercel's geo headers) of its session.
// - A sign-in from an IP address the person has not used before sends them an e-mail with a "that wasn't me" button:
//   a password link; setting a new password signs out every device (revokeSessionsOnPasswordReset).
//   The very first sign-in only records the address.
// - GET/POST /api/auth/my-settings: own language and whether to get the new-address alert (Můj účet).
// - GET /api/auth/my-sessions lists the person's signed-in devices; POST /api/auth/revoke-my-session { id } signs one out
//   (Better Auth's /revoke-other-sessions signs out all the others).
// The two tables are created on first use, so no migration is needed.
import crypto from "node:crypto";
import { createAuthEndpoint, createAuthMiddleware, sessionMiddleware } from "better-auth/api";
import map from "./map.js";

const SIGN_IN = new Set(["/sign-in/email", "/two-factor/verify-otp"]);
const LANGS = ["cs", "en", "de", "fr", "it"];

export function device(ua = "") {
  const b = /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "";
  const o = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS X|Macintosh/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "";
  return [b, o].filter(Boolean).join(" · ") || "?";
}
const place = (h) => {
  if (!h) return "";
  const dec = (v) => { try { return v ? decodeURIComponent(v) : ""; } catch { return v; } };
  return [dec(h.get("x-vercel-ip-city")), h.get("x-vercel-ip-country")].filter(Boolean).join(", ");
};

export function sessionsPlugin({ pool, alert }) {
  let ready;
  const tables = () => (ready ||= pool.query(`
    create table if not exists session_info (session_id text primary key, device text, place text);
    create table if not exists user_prefs (user_id text primary key, new_ip_alerts boolean not null default true);
    create table if not exists login_ip (user_id text not null, ip text not null, place text, first_seen timestamptz not null default now(),
      last_seen timestamptz not null default now(), primary key (user_id, ip));`).catch((e) => { ready = null; throw e; }));

  const after = createAuthMiddleware(async (ctx) => {
    const s = ctx.context.newSession;
    if (!SIGN_IN.has(ctx.path) || !s?.session) return;
    try {
      await tables();
      const h = ctx.request?.headers || ctx.headers, ip = s.session.ipAddress || "", where = place(h), dev = device(s.session.userAgent || "");
      await pool.query("insert into session_info values ($1, $2, $3) on conflict (session_id) do nothing", [s.session.id, dev, where]);
      if (!ip) return;
      const known = await pool.query("select ip from login_ip where user_id = $1", [s.user.id]);
      await pool.query(`insert into login_ip (user_id, ip, place) values ($1, $2, $3) on conflict (user_id, ip) do update set last_seen = now(), place = excluded.place`, [s.user.id, ip, where]);
      if (!known.rowCount || known.rows.some((r) => r.ip === ip)) return;  // first sign-in ever, or a known address
      if ((await pool.query("select new_ip_alerts from user_prefs where user_id = $1", [s.user.id])).rows[0]?.new_ip_alerts === false) return;  // turned off in Můj účet
      // a password link like Better Auth's own (request-password-reset), back to the portal the person signed in to
      const token = crypto.randomBytes(18).toString("base64url");
      await ctx.context.internalAdapter.createVerificationValue({ value: s.user.id, identifier: `reset-password:${token}`, expiresAt: new Date(Date.now() + 3 * 864e5) });
      const portal = new URL(/\/sprava\//.test(h?.get("referer") || "") ? "/sprava/" : "/pridat-aktualitu/", ctx.context.baseURL).href;
      const link = `${ctx.context.baseURL}/reset-password/${token}?callbackURL=${encodeURIComponent(portal)}`;
      // the approximate spot from Vercel's geo headers, rounded to ~1 km, as a signed map picture (api/map.js)
      const lat = (+h?.get("x-vercel-ip-latitude")).toFixed(2), lon = (+h?.get("x-vercel-ip-longitude")).toFixed(2);
      const geo = isFinite(lat) && isFinite(lon) ? { lat, lon, img: new URL(`/api/map/?lat=${lat}&lon=${lon}&sig=${map.sign(lat, lon)}`, ctx.context.baseURL).href,
        osm: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=11/${lat}/${lon}` } : null;
      await alert(s.user, { ip, place: where, device: dev, when: new Date(), link, geo });
    } catch (e) { console.log("sessions:", e.message); }  // never break signing in
  });

  return {
    id: "my-sessions",
    hooks: { after: [{ matcher: (ctx) => SIGN_IN.has(ctx.path), handler: after }] },
    endpoints: {
      mySessions: createAuthEndpoint("/my-sessions", { method: "GET", use: [sessionMiddleware] }, async (ctx) => {
        await tables().catch(() => {});
        const me = ctx.context.session;
        const r = await pool.query(`select s.id, s."ipAddress" ip, s."userAgent" ua, s."createdAt" created, s."updatedAt" seen, i.device, i.place
          from "session" s left join session_info i on i.session_id = s.id where s."userId" = $1 and s."expiresAt" > now() order by s."updatedAt" desc`, [me.user.id]).catch(() => ({ rows: [] }));
        return ctx.json(r.rows.map((x) => ({ id: x.id, ip: x.ip, device: x.device || device(x.ua || ""), place: x.place || "", created: x.created, seen: x.seen, current: x.id === me.session.id })));
      }),
      // Můj účet: own language (also the language of the system e-mails) and the new-address alert; the name stays with the owner
      mySettings: createAuthEndpoint("/my-settings", { method: "GET", use: [sessionMiddleware] }, async (ctx) => {
        await tables().catch(() => {});
        const u = ctx.context.session.user;
        const p = (await pool.query("select new_ip_alerts from user_prefs where user_id = $1", [u.id]).catch(() => ({ rows: [] }))).rows[0];
        return ctx.json({ name: u.name, email: u.email, role: u.role || "editor", lang: u.lang || "cs", newIpAlerts: p ? p.new_ip_alerts : true });
      }),
      saveMySettings: createAuthEndpoint("/my-settings", { method: "POST", use: [sessionMiddleware] }, async (ctx) => {
        await tables();
        const id = ctx.context.session.user.id, b = ctx.body || {};
        if (b.lang !== undefined) {
          if (!LANGS.includes(b.lang)) return ctx.json({ error: "invalid" }, { status: 400 });
          await pool.query(`update "user" set lang = $1, "updatedAt" = now() where id = $2`, [b.lang, id]);
        }
        if (typeof b.newIpAlerts === "boolean")
          await pool.query("insert into user_prefs (user_id, new_ip_alerts) values ($1, $2) on conflict (user_id) do update set new_ip_alerts = excluded.new_ip_alerts", [id, b.newIpAlerts]);
        return ctx.json({ status: true });
      }),
      revokeMySession: createAuthEndpoint("/revoke-my-session", { method: "POST", use: [sessionMiddleware] }, async (ctx) => {
        const id = String(ctx.body?.id || ""), me = ctx.context.session;
        if (id && id !== me.session.id) await pool.query(`delete from "session" where id = $1 and "userId" = $2`, [id, me.user.id]);
        return ctx.json({ status: true });
      }),
    },
  };
}
