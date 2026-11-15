// A local stand-in for the hosting: serves dist/ with the site's security headers, api/news.js with GitHub replaced
// by a folder on disk, and the real sign-in (api/_auth.mjs) on a database kept in memory. The whole flow (sign-in,
// the second step, upload, publish, edit, delete) can be tried in a browser or by a test without any account.
// Writes go to the repository checkout itself (content/, static/media/), where git shows them.
//   npm ci && python3 build.py --offline && node tests/news.local.js [port]     then open http://localhost:8090/pridat-aktualitu/
//   sign-in: editor@example.test, admin@example.test, owner@example.test, password "local-password-1"
//   (admin and owner are asked to switch two-step sign-in on first, as on the real site)
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.join(__dirname, "..");
process.env.DATABASE_URL = "memory";  // only tells api/news.js that sign-in is configured; nothing connects to it
process.env.BETTER_AUTH_SECRET = crypto.randomBytes(32).toString("base64");
process.env.GITHUB_TOKEN = "local";
const blobs = {};  // sha -> bytes, until the commit writes them
global.fetch = async (url, opts = {}) => {
  const u = new URL(url), body = opts.body ? JSON.parse(opts.body) : null;
  const json = (status, data) => ({ ok: status < 300, status, json: async () => data });
  if (u.pathname.includes("/contents/")) {
    const p = path.join(ROOT, decodeURIComponent(u.pathname.split("/contents/")[1]));
    return fs.existsSync(p) ? json(200, { content: fs.readFileSync(p).toString("base64") }) : json(404, {});
  }
  if (u.pathname.endsWith("/git/trees/main")) {  // the posts on disk
    const out = [], walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else out.push({ path: path.relative(ROOT, f).split(path.sep).join("/"), type: "blob" }); } };
    walk(path.join(ROOT, "content/news"));
    return json(200, { tree: out });
  }
  if (u.pathname.endsWith("/git/blobs")) { const sha = crypto.createHash("sha1").update(body.content).digest("hex"); blobs[sha] = Buffer.from(body.content, "base64"); return json(201, { sha }); }
  if (u.pathname.endsWith("/git/ref/heads/main")) return json(200, { object: { sha: "0".repeat(40) } });
  if (/\/git\/commits\/0+$/.test(u.pathname)) return json(200, { tree: { sha: "1".repeat(40) } });
  if (u.pathname.endsWith("/git/trees")) {
    for (const f of body.tree) {
      const p = path.join(ROOT, f.path);
      if (!p.startsWith(ROOT + path.sep)) throw new Error("outside the repository: " + f.path);
      if (f.sha === null) { if (fs.existsSync(p)) fs.unlinkSync(p); continue; }
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, f.content != null ? f.content : blobs[f.sha]);
    }
    return json(201, { sha: "2".repeat(40) });
  }
  if (u.pathname.endsWith("/git/commits")) { console.log("commit:", body.message); return json(201, { sha: "3".repeat(40) }); }
  if (u.pathname.endsWith("/git/refs/heads/main")) return json(200, {});
  if (u.hostname === "api.resend.com") return json(200, {});
  throw new Error("unexpected " + url);
};
const handler = require("../api/news.js");
const { sameOrigin } = require("../api/auth.js");
const HEADERS = Object.fromEntries(require("../vercel.json").headers[0].headers.map((h) => [h.key, h.value]));
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf", ".woff2": "font/woff2", ".xml": "application/xml", ".wasm": "application/wasm" };
const port = Number(process.argv[2] || process.env.PORT || 8090);
(async () => {
const { createAuth, memoryAttempts } = await import("../api/_auth.mjs");
const { memoryAdapter } = await import("better-auth/adapters/memory");
const { toNodeHandler } = await import("better-auth/node");
const auth = createAuth({ database: memoryAdapter({ user: [], session: [], account: [], verification: [], twoFactor: [], rateLimit: [] }), attempts: memoryAttempts(),
  secret: process.env.BETTER_AUTH_SECRET, baseURL: `http://localhost:${port}`, rateLimit: false });
for (const role of ["editor", "admin", "owner"]) await auth.api.createUser({ body: { name: role[0].toUpperCase() + role.slice(1), email: `${role}@example.test`, password: "local-password-1", role } });
handler.useAuth(async () => auth);
const authHandler = toNodeHandler(auth);
http.createServer(async (req, res) => {
  for (const [k, v] of Object.entries(HEADERS)) if (k !== "Strict-Transport-Security") res.setHeader(k, v.replace("; upgrade-insecure-requests", ""));  // plain http locally
  if (req.url.startsWith("/api/auth")) {
    if (req.method !== "GET" && !sameOrigin(req)) { res.statusCode = 403; return res.end('{"code":"INVALID_ORIGIN"}'); }
    return authHandler(req, res);
  }
  if (req.url.startsWith("/api/news")) {
    const chunks = []; for await (const c of req) chunks.push(c);
    try { req.body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch { req.body = {}; }
    return handler(req, res);
  }
  let p = path.join(ROOT, "dist", decodeURIComponent(req.url.split("?")[0]));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (!p.startsWith(path.join(ROOT, "dist")) || !fs.existsSync(p)) { res.statusCode = 404; return res.end("not found"); }
  res.setHeader("Content-Type", TYPES[path.extname(p)] || "application/octet-stream");
  fs.createReadStream(p).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`local publishing at http://localhost:${port}/pridat-aktualitu/ (see the top of this file for the accounts); build first with python3 build.py`));
})();
