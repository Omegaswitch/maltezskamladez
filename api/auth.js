// /api/auth/* — Better Auth's sign-in, sign-out, second-step, session and user endpoints (configured in api/_auth.mjs).
// Plain Vercel functions have no catch-all routes, so vercel.json rewrites /api/auth/<path> here as ?__p=<path>.
const sameOrigin = (req) => {
  try { return !!req.headers.origin && new URL(req.headers.origin).host === req.headers.host; } catch { return false; }
};

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  // Every change comes from this site's own pages: a browser always sends Origin with such a POST. Better Auth checks
  // the origin too; this also refuses requests that send none.
  if (req.method !== "GET" && req.method !== "HEAD" && !sameOrigin(req)) {
    res.statusCode = 403; res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ code: "INVALID_ORIGIN" }));
  }
  const u = new URL(req.url, "http://local");
  const p = (u.searchParams.get("__p") ?? u.pathname.replace(/^\/api\/auth\/?/, "")).replace(/^\/+|\/+$/g, "");
  u.searchParams.delete("__p");
  req.url = "/api/auth/" + p + u.search;
  const [{ getAuth }, { toNodeHandler }] = await Promise.all([import("./_auth.mjs"), import("better-auth/node")]);
  return toNodeHandler(await getAuth())(req, res);
};
module.exports.sameOrigin = sameOrigin;
