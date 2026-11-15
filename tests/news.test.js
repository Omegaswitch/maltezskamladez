// Checks api/news.js with GitHub and the sign-in stubbed: roles, the two-step rule for admins, the origin check,
// file checks, cleaning of the text, the committed article and its audit trail, drafts and scheduling, pinning,
// events, and what an editor may not do. The sign-in itself is checked in tests/auth.test.js.
//   node tests/news.test.js
const assert = require("assert");
process.env.DATABASE_URL = "postgres://stub";
process.env.BETTER_AUTH_SECRET = "test-secret";
process.env.GITHUB_TOKEN = "test-token";
const SITE = require("../content/site.json");
const handler = require("../api/news.js");
const HOST = new URL(SITE.baseUrl).host;
// the people Better Auth would know, by session cookie
const PEOPLE = {
  lenka: { id: "u-lenka", name: "Lenka", role: "owner", twoFactorEnabled: true },
  petr: { id: "u-petr", name: "Petr", role: "editor", twoFactorEnabled: false },
  ota: { id: "u-ota", name: "Ota", role: "editor", twoFactorEnabled: true },
  novy: { id: "u-novy", name: "Nový správce", role: "admin", twoFactorEnabled: false },  // has not switched two-step sign-in on yet
  zakaz: { id: "u-zakaz", name: "Zakázaný", role: "editor", banned: true },
};
handler.useAuth(async () => ({ api: { getSession: async ({ headers }) => {
  const who = PEOPLE[((headers.get("cookie") || "").match(/(?:^|;\s*)s=(\w+)/) || [])[1]];
  return who ? { user: who, session: {} } : null;
} } }));
const NEWS_PATH_TEST = /^content\/news\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+\.html$/;
const CAT = Object.keys(SITE.newsCategories)[0];

const commits = [], messages = [];
let existing = new Set();
const stored = {};  // files the stubbed repository returns by path
global.fetch = async (url, opts = {}) => {
  const u = new URL(url), body = opts.body ? JSON.parse(opts.body) : null;
  const json = (status, data) => ({ ok: status < 300, status, json: async () => data });
  if (u.pathname.includes("/contents/")) {
    const p = decodeURIComponent(u.pathname.split("/contents/")[1]);
    if (stored[p]) return json(200, { content: Buffer.from(stored[p]).toString("base64") });
    return existing.has(p) ? json(200, {}) : json(404, {});
  }
  if (u.pathname.endsWith("/git/trees/main")) return json(200, { tree: [...new Set([...Object.keys(stored), ...existing])].map((path) => ({ path, type: "blob" })) });
  if (u.pathname.endsWith("/git/blobs")) return json(201, { sha: "a".repeat(40) });
  if (u.pathname.endsWith("/git/ref/heads/main")) return json(200, { object: { sha: "c".repeat(40) } });
  if (/\/git\/commits\/c+$/.test(u.pathname)) return json(200, { tree: { sha: "t".repeat(40) } });
  if (u.pathname.endsWith("/git/trees")) {
    commits.push(body.tree);
    for (const f of body.tree) if (f.content != null) stored[f.path] = f.content; else if (f.sha === null) delete stored[f.path];  // the stub keeps the repository's state
    return json(201, { sha: "n".repeat(40) });
  }
  if (u.pathname.endsWith("/git/commits")) { messages.push(body.message); return json(201, { sha: "d".repeat(40) }); }
  if (u.pathname.endsWith("/git/refs/heads/main")) return json(200, {});
  throw new Error("unexpected " + url);
};

function call(method, body, cookie, origin = `https://${HOST}`, url = "/api/news") {
  return new Promise((done) => {
    const headers = { host: HOST, ...(origin ? { origin } : {}), ...(cookie ? { cookie } : {}) };
    const res = { statusCode: 200, h: {}, setHeader(k, v) { this.h[k.toLowerCase()] = v; }, end(s) { done({ status: this.statusCode, body: JSON.parse(s || "{}"), cookie: this.h["set-cookie"] }); } };
    handler({ method, headers, body, url }, res);
  });
}
const meta = (doc) => JSON.parse(doc.split("---\n")[1]);
const lastCommit = () => commits[commits.length - 1];

(async () => {
  const { sanitise, slugify } = handler;
  assert.strictEqual(sanitise('<p onclick="x()">A <b>B</b><script>evil()</script></p>'), "<p>A <strong>B</strong></p>");
  assert.strictEqual(sanitise('<p><a href="javascript:alert(1)">x</a> <a href="https://a.cz/" target="_blank">y</a></p>'), '<p>x <a href="https://a.cz/">y</a></p>');
  assert.strictEqual(sanitise('<h1 style="font-size:90px">T</h1><p><img src="data:x"><img src="/media/2026/10/a-1.webp" onerror="x"></p>'), '<h2>T</h2><p><img src="/media/2026/10/a-1.webp" alt=""></p>');
  assert.strictEqual(sanitise("<p>1 < 2 &amp; 3&nbsp;4</p><p></p><p><br></p>"), "<p>1 &lt; 2 &amp; 3 4</p>");
  assert.match(sanitise("<ul><li>a<li>b</ul><p>c"), /<\/ul><p>c<\/p>$/);  // unclosed tags are closed
  assert.strictEqual(slugify("Koncert duchovní hudby – říjen 2026!"), "koncert-duchovni-hudby-rijen-2026");

  // ---- who is signed in, and what the role allows
  const info = await call("GET", null);
  assert.strictEqual(info.body.user, null);
  assert.strictEqual(info.body.features.pin, false);  // nobody signed in: no pinning
  assert.strictEqual((await call("POST", { action: "publish" })).status, 401);
  assert.strictEqual((await call("POST", { action: "publish" }, "s=nikdo")).status, 401);  // an unknown session
  assert.strictEqual((await call("POST", { action: "publish" }, "s=zakaz")).status, 401);  // a banned person
  assert.strictEqual((await call("POST", { action: "login", name: "Lenka", password: "x" })).status, 401);  // the old password sign-in is gone
  const A = "s=lenka", E = "s=petr", O = "s=ota";
  const admin = await call("GET", null, A);
  assert.strictEqual(admin.body.user, "Lenka");
  assert.strictEqual(admin.body.role, "admin");
  assert.strictEqual(admin.body.owner, true);
  assert.strictEqual(admin.body.features.pin, true);
  const editor = await call("GET", null, E);
  assert.strictEqual(editor.body.role, "editor");
  assert.strictEqual(editor.body.needs2fa, false);  // two-step sign-in is optional for editors
  assert.strictEqual(editor.body.features.pin, false);  // an editor is not offered pinning

  // ---- an admin without two-step sign-in can do nothing until it is switched on
  const N = "s=novy";
  const fresh = await call("GET", null, N);
  assert.strictEqual(fresh.body.needs2fa, true);
  assert.strictEqual(fresh.body.features.pin, false);
  for (const action of ["upload", "publish", "load", "delete"]) {
    const r = await call("POST", { action, path: "content/news/2026/11/02/x.html" }, N);
    assert.strictEqual(r.status, 403);
    assert.strictEqual(r.body.error, "2fa");
  }

  // ---- every change must come from this site's own pages
  assert.strictEqual((await call("POST", { action: "publish" }, A, "https://evil.example")).status, 403);
  assert.strictEqual((await call("POST", { action: "publish" }, A, null)).status, 403);  // no Origin at all
  assert.strictEqual((await call("POST", { action: "publish" }, A, "null")).status, 403);
  assert.strictEqual((await call("PUT", {}, A)).status, 405);
  const commitsBefore = commits.length;

  // ---- uploads: the content must be what it claims
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47]), Buffer.alloc(20)]).toString("base64");
  const up = await call("POST", { action: "upload", name: "Moje fotka.png", type: "image/png", data: png }, E);
  assert.strictEqual(up.status, 200);
  assert.match(up.body.path, /^static\/media\/\d{4}\/\d{2}\/moje-fotka-[0-9a-f]{8}\.png$/);
  assert.strictEqual((await call("POST", { action: "upload", name: "x.pdf", type: "application/pdf", data: png }, E)).status, 400);
  assert.strictEqual((await call("POST", { action: "upload", name: "x.exe", type: "application/octet-stream", data: png }, E)).status, 400);

  const pdfUp = await call("POST", { action: "upload", name: "Program.pdf", type: "application/pdf", data: Buffer.from("%PDF-1.4 test").toString("base64") }, E);
  assert.strictEqual(pdfUp.status, 200);
  assert.match(pdfUp.body.token, /^[0-9a-f]{64}$/);
  const file = (u, role, extra = {}) => ({ sha: u.sha, path: u.path, url: u.url, type: u.type, token: u.token, role, ...extra });

  // ---- a new post by the editor
  existing = new Set(["content/news/2026/11/02/koncert-v-listopadu.html"]);
  const pub = await call("POST", { action: "publish", title: "Koncert v listopadu", date: "2026-11-02T10:30", categories: [CAT, "bogus"],
    body: '<p>Přijďte <b>všichni</b>.</p><p><img src="blob:x"><img src="/media/2026/10/a-1.webp"></p><script>x</script>', excerpt: "  Krátce  ",
    files: [file(up.body, "image"), file(pdfUp.body, "attachment", { label: "Program <PDF>", ext: "pdf" })],
    pinned: true }, E);
  assert.strictEqual(pub.status, 200, JSON.stringify(pub.body));
  assert.strictEqual(pub.body.url, "/2026/11/02/koncert-v-listopadu-2/");  // the slug was taken
  const tree = lastCommit();
  const doc = tree.find((f) => f.path === "content/news/2026/11/02/koncert-v-listopadu-2.html").content;
  const m = meta(doc);
  assert.deepStrictEqual(m.categories, [CAT]);
  assert.strictEqual(m.author, "Petr");
  assert.strictEqual(m.authorId, "u-petr");
  assert.strictEqual(commits.length, commitsBefore + 1);  // nothing refused above reached the repository
  assert.deepStrictEqual(m.audit.map((a) => [a.by, a.id, a.role, a.action]), [["Petr", "u-petr", "editor", "publish"]]);
  assert.match(m.audit[0].at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  assert.match(messages[messages.length - 1], /^Aktualita: Koncert v listopadu \(Petr\)\n\nAudit-Action: publish\nAudit-User: Petr \(u-petr\)\nAudit-Role: editor$/);
  assert.strictEqual(m.pinned, undefined);  // an editor cannot pin
  assert.strictEqual(m.draft, undefined);
  assert.strictEqual(m.image, up.body.url);
  assert.strictEqual(m.excerpt, "Krátce");
  assert.match(doc, /<p>Přijďte <strong>všichni<\/strong>\.<\/p>\n<p><img src="\/media\/2026\/10\/a-1\.webp" alt=""><\/p>\n/);
  assert.ok(doc.includes(`<p class="file"><a href="${pdfUp.body.url}">Program &lt;PDF&gt;</a> (PDF)</p>`));
  assert.ok(tree.some((f) => f.path === up.body.path && f.sha === up.body.sha));
  assert.strictEqual((await call("POST", { action: "publish", title: "x", date: "2026-11-02T10:30", body: "<p>a</p>", files: [{ url: "https://evil/x.png", role: "image" }] }, E)).status, 400);
  // ---- new files need the token "upload" issued; nothing else may be committed through "publish"
  const attempt = (f, as = E) => call("POST", { action: "publish", title: "Soubor", date: "2026-11-04T10:00", body: "<p>a</p>", files: [f] }, as);
  const before = commits.length;
  assert.strictEqual((await attempt({ sha: "b".repeat(40), path: "static/media/2026/10/program-1a2b3c4d.pdf", type: "application/pdf", role: "attachment" })).status, 400);  // no token
  assert.strictEqual((await attempt(file({ ...up.body, token: "0".repeat(64) }, "image"))).status, 400);  // wrong token
  assert.strictEqual((await attempt(file({ ...up.body, token: "zz" }, "image"))).status, 400);
  assert.strictEqual((await attempt(file({ ...up.body, sha: "b".repeat(40) }, "image"))).status, 400);  // another blob
  assert.strictEqual((await attempt(file({ ...up.body, path: "static/media/2026/10/jina-1a2b3c4d.png" }, "image"))).status, 400);  // another path
  assert.strictEqual((await attempt(file({ ...up.body, type: "image/jpeg" }, "image"))).status, 400);  // another type
  const jpgPath = up.body.path.replace(/\.png$/, ".jpg");  // a token for a path whose extension does not match the type
  assert.strictEqual((await attempt({ ...file(up.body, "image"), path: jpgPath, token: require("crypto").createHmac("sha256", "test-secret").update(`${up.body.sha}|${jpgPath}|image/png`).digest("hex") })).status, 400);
  assert.strictEqual(commits.length, before);
  // a path that is already in the repository is refused, even with a valid token
  existing.add(up.body.path);
  const taken = await attempt(file(up.body, "image"));
  assert.strictEqual(taken.status, 409);
  assert.strictEqual(taken.body.error, "exists");
  assert.strictEqual(commits.length, before);
  existing.delete(up.body.path);
  assert.strictEqual((await call("POST", { action: "publish", title: "x", date: "2026-11-02T10:30", body: "<p>a</p>", files: [{ sha: "zz", path: "../../etc/passwd", role: "image" }] }, E)).status, 400);
  assert.strictEqual((await call("POST", { action: "publish", title: "x", date: "2026-11-02", body: "<p>a</p>" }, E)).status, 400);  // date without time

  // ---- a draft and a scheduled post
  const draft = await call("POST", { action: "publish", title: "Rozepsané", date: "2026-11-03T08:00", body: "<p>Ještě ne.</p>", draft: true }, E);
  assert.strictEqual(draft.body.draft, true);
  assert.strictEqual(meta(lastCommit()[0].content).draft, true);
  const future = await call("POST", { action: "publish", title: "Za rok", date: "2099-01-01T08:00", body: "<p>Až za rok.</p>" }, E);
  assert.strictEqual(future.body.scheduled, true);
  assert.strictEqual(meta(lastCommit()[0].content).draft, undefined);

  // ---- the list of all posts, drafts included, only behind the session
  assert.strictEqual((await call("GET", null, null, undefined, "/api/news?list=1")).status, 401);
  assert.strictEqual((await call("GET", null, "s=zakaz", undefined, "/api/news?list=1")).status, 401);
  assert.strictEqual((await call("GET", null, "s=novy", undefined, "/api/news?list=1")).status, 403);  // an admin without two-step sign-in
  const listed = await call("GET", null, E, undefined, "/api/news?list=1");
  assert.strictEqual(listed.status, 200);
  const byTitle = Object.fromEntries(listed.body.posts.map((p) => [p.title, p]));
  assert.strictEqual(byTitle["Rozepsané"].draft, true);
  assert.ok(byTitle["Za rok"].date.startsWith("2099"));  // a scheduled post
  assert.strictEqual(byTitle["Rozepsané"].body, undefined);  // titles and dates only, not the text
  assert.ok(listed.body.posts.every((p) => NEWS_PATH_TEST.test(p.path)));
  assert.strictEqual((await call("GET", null, E)).body.posts, undefined);  // the plain GET stays the sign-in info

  // ---- editing: an editor only their own, an admin anything; the admin can pin
  const path = "content/news/2026/11/02/koncert-v-listopadu-2.html";
  const loaded = await call("POST", { action: "load", path }, A);
  assert.strictEqual(loaded.status, 200);
  assert.strictEqual(loaded.body.mayChange, true);
  assert.strictEqual(loaded.body.pinned, false);
  assert.strictEqual((await call("POST", { action: "load", path }, O)).body.mayChange, false);
  assert.strictEqual((await call("POST", { action: "publish", path, title: "Ukradeno", date: "2026-11-02T10:30", body: "<p>x</p>" }, O)).status, 403);
  assert.strictEqual((await call("POST", { action: "delete", path }, O)).status, 403);
  const pinned = await call("POST", { action: "publish", path, title: "Koncert v listopadu (připnuto)", date: "2026-11-02T10:30", body: "<p>Nový text.</p>",
    categories: [CAT], files: [{ url: up.body.url, role: "image" }], pinned: true }, A);
  assert.strictEqual(pinned.status, 200);
  assert.strictEqual(pinned.body.url, "/2026/11/02/koncert-v-listopadu-2/");  // the address never changes
  let pm = meta(lastCommit()[0].content);
  assert.strictEqual(pm.pinned, true);
  assert.strictEqual(pm.author, "Petr");  // the author stays
  assert.strictEqual(pm.editedBy, "Lenka");
  assert.strictEqual(pm.authorId, "u-petr");
  assert.deepStrictEqual(pm.audit.map((a) => [a.by, a.role, a.action]), [["Petr", "editor", "publish"], ["Lenka", "owner", "edit"]]);
  assert.match(messages[messages.length - 1], /Audit-Action: edit\nAudit-User: Lenka \(u-lenka\)\nAudit-Role: owner$/);
  // a namesake with another account is not the author
  PEOPLE.petr2 = { id: "u-petr-2", name: "Petr", role: "editor" };
  assert.strictEqual((await call("POST", { action: "delete", path }, "s=petr2")).status, 403);
  // the editor's later save keeps the admin's pin
  await call("POST", { action: "publish", path, title: "Koncert v listopadu (upraveno)", date: "2026-11-02T10:30", body: "<p>Ještě novější.</p>", categories: [CAT], pinned: false }, E);
  pm = meta(lastCommit()[0].content);
  assert.strictEqual(pm.pinned, true);
  assert.strictEqual(pm.title, "Koncert v listopadu (upraveno)");
  // the same, unchanged file of the post being edited may be sent again; a different file at that path may not
  const keepPath = pinned.body.path;
  const withPhoto = (f) => call("POST", { action: "publish", path: keepPath, title: "Koncert", date: "2026-11-02T10:30", body: `<p>Nový text.</p><p><img src="${up.body.url}"></p>`, categories: [CAT], files: [f] }, E);
  assert.strictEqual((await withPhoto(file(up.body, "inline"))).status, 200);  // first save: the post gets the photo
  existing.add(up.body.path);
  const origFetch = global.fetch;
  global.fetch = async (url, opts) => { const u = new URL(url); return u.pathname.endsWith("/contents/" + up.body.path) ? { ok: true, status: 200, json: async () => ({ sha: up.body.sha }) } : origFetch(url, opts); };
  assert.strictEqual((await withPhoto(file(up.body, "inline"))).status, 200);  // the same, unchanged file again
  const other = await call("POST", { action: "upload", name: "Jiny.png", type: "image/png", data: png }, E);
  other.body.path = up.body.path; other.body.sha = "f".repeat(40);
  other.body.token = require("crypto").createHmac("sha256", "test-secret").update(`${other.body.sha}|${other.body.path}|image/png`).digest("hex");
  assert.strictEqual((await withPhoto(file(other.body, "inline"))).status, 409);
  global.fetch = origFetch; existing.delete(up.body.path); delete stored[up.body.path];
  // an imported post (no author) stays editable by any editor, and loses its "unreviewed" status when saved
  stored["content/news/2018/09/14/stary.html"] = `---\n${JSON.stringify({ title: "Starý", url: "/2018/09/14/stary/", date: "2018-09-14T10:00", categories: [CAT], image: "/media/2018/06/koncert.jpg", excerpt: "Starý", status: "existing", imported: true }, null, 1)}\n---\n<p>Starý text.</p>\n<figure><img src="/media/2018/06/koncert.jpg"><figcaption>Popisek</figcaption></figure>\n`;
  const old = await call("POST", { action: "load", path: "content/news/2018/09/14/stary.html" }, O);
  assert.strictEqual(old.body.editable, false);
  assert.strictEqual(old.body.mayChange, true);
  await call("POST", { action: "publish", path: "content/news/2018/09/14/stary.html", title: "Starý (opraveno)", date: "2018-09-14T10:00", body: "", categories: [CAT], files: [{ url: "/media/2018/06/koncert.jpg", role: "image" }] }, O);
  const om = meta(lastCommit()[0].content);
  assert.strictEqual(om.status, undefined);
  assert.strictEqual(om.editedBy, "Ota");
  assert.match(lastCommit()[0].content, /<figcaption>Popisek<\/figcaption>/);  // the old text is kept as it was
  assert.strictEqual(om.author, "Ota");
  assert.strictEqual(om.authorId, "u-ota");  // editing an import claims it with the editor's account id
  stored["content/news/2018/09/14/stary.html"] = lastCommit()[0].content;
  assert.strictEqual((await call("POST", { action: "load", path: "content/news/2018/09/14/stary.html" }, E)).body.mayChange, false);  // it is Ota's now
  // a namesake of the author, with another account id, is not the author (names no longer decide for posts with an id)
  PEOPLE.ota2 = { id: "u-ota-2", name: "Ota", role: "editor" };
  assert.strictEqual((await call("POST", { action: "load", path: "content/news/2018/09/14/stary.html" }, "s=ota2")).body.mayChange, false);
  assert.strictEqual((await call("POST", { action: "publish", path: "content/news/2018/09/14/stary.html", title: "Přepsáno", date: "2018-09-14T10:00", body: "<p>x</p>" }, "s=ota2")).status, 403);
  // an older post with a name but no id still goes by name until someone edits it
  stored["content/news/2018/09/15/stary2.html"] = `---\n${JSON.stringify({ title: "Starý 2", url: "/2018/09/15/stary2/", date: "2018-09-15T10:00", categories: [CAT], author: "Petr", imported: true }, null, 1)}\n---\n<p>Text.</p>\n`;
  assert.strictEqual((await call("POST", { action: "load", path: "content/news/2018/09/15/stary2.html" }, O)).body.mayChange, false);
  await call("POST", { action: "publish", path: "content/news/2018/09/15/stary2.html", title: "Starý 2 (opraveno)", date: "2018-09-15T10:00", body: "<p>Text.</p>" }, E);
  assert.strictEqual(meta(lastCommit()[0].content).authorId, "u-petr");
  // an admin editing a post that names another author does not take it over
  stored["content/news/2018/09/16/stary3.html"] = `---\n${JSON.stringify({ title: "Starý 3", url: "/2018/09/16/stary3/", date: "2018-09-16T10:00", categories: [CAT], author: "Jana", imported: true }, null, 1)}\n---\n<p>Text.</p>\n`;
  await call("POST", { action: "publish", path: "content/news/2018/09/16/stary3.html", title: "Starý 3 (opraveno)", date: "2018-09-16T10:00", body: "<p>Text.</p>" }, A);
  assert.strictEqual(meta(lastCommit()[0].content).authorId, undefined);
  assert.strictEqual(meta(lastCommit()[0].content).author, "Jana");

  // a body with a line ending in --- is not cut short
  stored["content/news/2018/09/17/pomlcky.html"] = `---\n${JSON.stringify({ title: "Pomlčky", url: "/2018/09/17/pomlcky/", date: "2018-09-17T10:00", categories: [CAT], excerpt: "x", imported: true }, null, 1)}\n---\n<p>ok ---\nafter</p>\n<p>Konec.</p>\n`;
  const dashed = await call("POST", { action: "load", path: "content/news/2018/09/17/pomlcky.html" }, O);
  assert.strictEqual(dashed.status, 200);
  assert.strictEqual(dashed.body.body, "<p>ok ---\nafter</p>\n<p>Konec.</p>");

  // ---- deleting: the author or an admin
  assert.strictEqual((await call("POST", { action: "delete", path: "../../.env" }, A)).status, 400);
  assert.strictEqual((await call("POST", { action: "delete", path: "content/news/2026/11/02/nic.html" }, A)).status, 404);
  const del = await call("POST", { action: "delete", path }, E);
  assert.strictEqual(del.status, 200);
  assert.deepStrictEqual(lastCommit(), [{ path, mode: "100644", type: "blob", sha: null }]);
  assert.match(messages[messages.length - 1], /Audit-Action: delete\nAudit-User: Petr \(u-petr\)/);

  // ---- events (where the site has a calendar)
  const features = (await call("GET", null, A)).body.features;
  if (features.events) {
    assert.deepStrictEqual((await call("POST", { action: "events" }, E)).body.events, []);
    const ev = await call("POST", { action: "event", title: "Den otevřených dveří", start: "2027-01-20 16:00", end: "2027-01-20 18:00", place: "Aula", description: "<p>Přijďte.</p><script>x</script>" }, E);
    assert.strictEqual(ev.status, 200, JSON.stringify(ev.body));
    assert.strictEqual(ev.body.url, "/udalost/den-otevrenych-dveri-2027-01-20/");
    let list = JSON.parse(stored["content/events.json"]);
    assert.deepStrictEqual(list, [{ author: "Petr", authorId: "u-petr", title: "Den otevřených dveří", start: "2027-01-20 16:00", end: "2027-01-20 18:00", allDay: false, url: ev.body.url, description: "<p>Přijďte.</p>", place: "Aula" }]);
    assert.strictEqual((await call("POST", { action: "event", title: "x", start: "2027-01-20 16:00", end: "2027-01-19 18:00" }, E)).status, 400);  // ends before it starts
    assert.strictEqual((await call("POST", { action: "event", title: "x", start: "zítra" }, E)).status, 400);
    const ev2 = await call("POST", { action: "event", title: "Den otevřených dveří", start: "2027-01-20 10:00", end: "2027-01-20 12:00" }, A);
    assert.strictEqual(ev2.body.url, "/udalost/den-otevrenych-dveri-2027-01-20-2/");  // a second one on the same day keeps its own address
    assert.strictEqual((await call("POST", { action: "event", url: ev.body.url, title: "Cizí", start: "2027-01-20 16:00" }, O)).status, 403);
    assert.strictEqual((await call("POST", { action: "event-delete", url: ev.body.url }, O)).status, 403);
    const upd = await call("POST", { action: "event", url: ev.body.url, title: "Den otevřených dveří (změna)", start: "2027-01-21 00:00", end: "2027-01-21 23:59", allDay: true }, A);
    assert.strictEqual(upd.body.url, ev.body.url);
    list = JSON.parse(stored["content/events.json"]);
    assert.strictEqual(list.length, 2);
    assert.deepStrictEqual(list.map((e) => e.start), ["2027-01-20 10:00", "2027-01-21 00:00"]);  // kept sorted
    assert.strictEqual(list[1].editedBy, "Lenka");
    assert.strictEqual(list[1].place, undefined);
    assert.strictEqual((await call("POST", { action: "event-delete", url: ev.body.url }, E)).status, 200);
    assert.strictEqual(JSON.parse(stored["content/events.json"]).length, 1);
    assert.strictEqual((await call("POST", { action: "event-delete", url: "/udalost/neni/" }, A)).status, 404);
  } else {
    assert.strictEqual((await call("POST", { action: "events" }, A)).status, 400);
  }

  // ---- no publishing without configuration
  process.env.GITHUB_TOKEN = "";
  assert.strictEqual((await call("POST", { action: "publish" }, A)).status, 503);
  process.env.DATABASE_URL = "";
  assert.strictEqual((await call("GET", null, A)).body.user, null);  // no database: nobody is signed in

  // ---- the daily rebuild answers only Vercel's cron call
  const rebuild = require("../api/rebuild.js");
  const cron = (authorization) => new Promise((done) => rebuild({ headers: authorization ? { authorization } : {} }, { status(c) { return { json: (b) => done([c, b]) }; } }));
  delete process.env.CRON_SECRET; delete process.env.DEPLOY_HOOK_URL;
  assert.strictEqual((await cron())[0], 401);  // no secret set: nobody may start builds
  assert.strictEqual((await cron("Bearer undefined"))[0], 401);
  process.env.CRON_SECRET = "cron-secret";
  assert.strictEqual((await cron("Bearer wrong-secret"))[0], 401);
  assert.deepStrictEqual(await cron("Bearer cron-secret"), [200, { rebuilt: false, reason: "DEPLOY_HOOK_URL is not set" }]);
  console.log("news ok");
})().catch((e) => { console.error(e); process.exit(1); });
