// Rebuilds the site once a day (vercel.json → crons), so that scheduled posts go out on their day without anyone
// publishing. Vercel calls it with the CRON_SECRET it was given; it then asks the deploy hook (Vercel → Settings →
// Git → Deploy Hooks) to rebuild. Both are set as environment variables, never in code. Without CRON_SECRET the
// function answers nobody, so a stranger cannot start builds.
const crypto = require("crypto");

module.exports = async (req, res) => {
  const secret = process.env.CRON_SECRET, hook = process.env.DEPLOY_HOOK_URL;
  const given = Buffer.from(String(req.headers.authorization || "")), wanted = Buffer.from(`Bearer ${secret}`);
  if (!secret || given.length !== wanted.length || !crypto.timingSafeEqual(given, wanted)) return res.status(401).json({ error: "unauthorized" });
  if (!hook) return res.status(200).json({ rebuilt: false, reason: "DEPLOY_HOOK_URL is not set" });
  const r = await fetch(hook, { method: "POST" });
  res.status(r.ok ? 200 : 502).json({ rebuilt: r.ok });
};
