# Security and privacy audit

Date: 15 November 2026. Scope: the live site (read-only observation; nothing was changed) and the new implementation on this branch.

## Live site (cmm.maltezskyrad.cz, WordPress): findings

| # | Severity | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| L1 | **High** (confidentiality, trust) | **HTTP/HTTPS certificate mismatch.** The site is reachable only over plain `http://cmm.maltezskyrad.cz/`. On HTTPS the server presents a certificate that does not cover the name `cmm.maltezskyrad.cz` (the Grand Priory's audit of 18 October 2026 recorded that this host serves a certificate for `maltezskyrad.cz` only), so browsers show a certificate error and visitors and search engines stay on unencrypted HTTP. Sign-in to WordPress, if done on this host, travels in clear text. | HTTP answers 200; the import had to use HTTP; an HTTPS request from the build environment is cut off during the handshake. The certificate itself could not be read from here, because outbound TLS passes through an inspecting proxy; the wording of the mismatch comes from the Grand Priory's audit. | Launch the new site on a host with a certificate that covers its name, redirect HTTP to HTTPS (the new site sends HSTS), and until then do not sign in to WordPress over HTTP. See `docs/deployment.md`. |
| L2 | Medium | The WordPress REST user list (`/wp-json/wp/v2/users`) is public and lists two accounts with their login slugs. | HTTP 200 with two entries. | Block the endpoint, or retire WordPress at launch. Strong passwords for both accounts until then. |
| L3 | Medium | The theme loads jQuery 1.10.2 (2013; known XSS issues) and an old fancybox next to WordPress's jQuery 3.7.1. | `jquery-1.10.2.min.js`, `jquery.fancybox.pack.js` in the page source. | Moot at launch. |
| L4 | Low | No `Content-Security-Policy`, `Strict-Transport-Security` or `X-Frame-Options` header; the page announces `WordPress 6.9.11`. | Response headers (`server: openresty` only) and the generator meta tag. | The new site ships these headers (below). |
| L5 | Low (privacy) | Every page loads Google Fonts and the Google Maps script, so visitors' IP addresses go to Google without notice or consent. | `fonts.googleapis.com`, `maps.google.com/maps/api/js` in the page source. | The new site loads nothing from Google. |
| L6 | Low | A page (`/formular/`) shows raw PHP source of a form shortcode instead of a form. | Page content in the REST API. | Retired; the URL redirects to the grants page. |
| L7 | Info (privacy) | The site publishes photographs of identifiable people, some of them minors and many in a vulnerable group, with no visible record of consent. | Posts 2018–2025. | `docs/asset-manifest.md`: confirm consent before launch. |

## New implementation

**Architecture**
- Static HTML, CSS and JS generated at build time. The public site has no server-side code, no forms and no cookies.
- The only server-side code is the staff publishing page: three Vercel functions (`api/news.js`, `api/auth.js` with `api/_auth.mjs`, `api/rebuild.js`) and a Postgres database that holds accounts and sessions, nothing else.
- The template's GDPR form function was not carried over; consent forms stay on the Grand Priory's site.

**Content handling**
- Imported WordPress HTML passes an allowlist sanitiser (`tools/import_wp.py`) with a self-test that runs in CI. It keeps structural tags and `href`, `src`, `alt`; it removes scripts, styles, event handlers, forms and iframes, and unsafe URL schemes. Tracking parameters were removed from Facebook links.
- Text typed into the staff page passes a second, stricter allowlist sanitiser on the server (`api/news.js`); images may only point to `/media/`.
- `check.py` fails the build on any `javascript:` link.

**Security headers** (`vercel.json`, also written to `dist/_headers`; applied to every path)

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'`; scripts only from self (plus `'wasm-unsafe-eval'` for the PDF shrinker on the staff page); the AddCal hosts are listed only when a calendar is set; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`; `upgrade-insecure-requests` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Denies camera, microphone, geolocation, payment and USB |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `X-Frame-Options` | `DENY` |

- `/api/*` and `/pridat-aktualitu/*` are `no-store` and `noindex`.
- `style-src` allows `'unsafe-inline'` because the AddCal web component injects styles. No inline scripts are used; the only `<script>` without `src` is the JSON-LD data block on the home pages, which is never executed.

**Third parties**
- None today. In a browser crawl of 29 pages at two widths, no request left the site's own origin.
- The AddCal hosts are not in the CSP while no calendar is set (`content/site.json`): nothing can load from AddCal. When a calendar id is set they must be added (`docs/deployment.md`, "Calendar and the CSP"); the build stops and `check.py` fails if CSP and calendar disagree.
- Facebook is a plain link: no SDK, pixel or embed. Fonts are self-hosted.
- The Grand Magistry news list is fetched at build time, not in the visitor's browser; its links are restricted to `https://www.orderofmalta.int/`.

**Staff page: sign-in and publishing** (details and set-up in `docs/publishing.md`)

| Control | Implementation | Test |
|---|---|---|
| No self sign-up | Better Auth `disableSignUp`; accounts are made by an owner | `tests/auth.test.js` |
| Passwords | scrypt hashes; at least 12 characters, also for accounts an owner creates or resets (the library's admin endpoints do not apply the rule themselves, so a hook does) | `tests/auth.test.js` |
| Two-step sign-in | TOTP with backup codes. Required for admin and owner: without it `/api/news` refuses every action and `/api/auth/admin/*` is forbidden. Optional for editors | both test files |
| Lockout and backoff | 5 wrong passwords lock the account for 1 minute, doubling to 15 minutes, counted per e-mail address in the database (so it survives cold starts and changes of IP address); the same answer for addresses that do not exist; 5 wrong second-step codes lock for 15 minutes | `tests/auth.test.js` |
| Rate limits | per IP address, stored in the database: 5 a minute for sign-in, the second step and password change | observed against PostgreSQL 16 |
| Session cookie | `__Secure-` prefix, `Secure`, `HttpOnly`, `SameSite=Strict`, 12 hours, no client-side cache: removing or banning a person takes effect at once | `tests/auth.test.js` |
| CSRF | every POST to `/api/news` and `/api/auth/*` must carry an `Origin` equal to the site's host; a foreign origin, `null` or no origin is refused before anything else runs. Better Auth checks the origin again | both test files |
| Authorisation | role and ownership are checked on the server for every action; ownership is decided by account id, not by display name; saving an older post that has a name but no account id records the saver's id; imported posts (`wp_id`) have no owner: editors may edit them (the last editor is kept in `editedById`) but only admins delete them; `/api/auth/update-user` refuses a name change, only an owner renames people (`/admin/update-user`) | `tests/news.test.js` |
| Uploads | PDF, JPEG, PNG, WebP only; the first bytes must match the declared type; 3 MB; stored under a random name; paths outside `content/news/` and `static/media/` are refused; `upload` returns an HMAC token (blob, path, type) that `publish` verifies, the extension must match the type, and `publish` refuses a path that already exists (except the same unchanged file of the post being edited) | `tests/news.test.js` |
| Audit trail | front matter (`audit`, `authorId`), commit trailers (`Audit-Action`, `Audit-User`, `Audit-Role`), JSON lines in the function log for sign-ins, lockouts and changes to people; no passwords or tried addresses in the log | both test files |
| Daily rebuild | `/api/rebuild` answers only when `CRON_SECRET` is set and matches (compared in constant time) | `tests/news.test.js` |
| GitHub token | fine-grained, this repository only, Contents: read and write; steps in `docs/publishing.md` | — |

**Accepted risks and limits**
- **A1. Lockout can be used to annoy.** Someone who knows a co-worker's e-mail address can keep the account locked for up to 15 minutes at a time. This is the price of a per-account limit; the lock is temporary and capped, and the per-IP limit slows the attacker.
- **A2. Drafts and scheduled posts are not on the public site, but the GitHub repository is currently public.** The built site contains no list of drafts: the staff page reads the full list, drafts and scheduled posts included, from `GET /api/news?list=1`, which needs a signed-in session (two-step sign-in for admins and owners, as for every action) and returns titles, dates and authors only. `check.py` fails if a `news.json` appears in `dist/`. The repository itself is another matter: it is public today, so drafts (text and title), draft media and the audit trailers in commits (who did what, account ids) are readable there by anyone until the owner makes the repository private. Until then, do not put confidential information in a draft, its title or its photographs. Making the repository private is the owner's decision; Vercel's GitHub integration keeps working with a private repository.
- **A3. Authors' names and account ids** are stored in the repository (front matter and commits). Account ids are random strings, not e-mail addresses.
- **A4. Losing the second factor** needs someone with database access (`docs/publishing.md`). There is deliberately no self-service reset by e-mail.
- **A5. No QR code** is shown when two-step sign-in is switched on; the key is typed or opened by link. A QR library would be new third-party code on the staff page.
- **A6. Subresource Integrity** is not used for AddCal (a moving `v3` URL); the CSP host list is the control. Not relevant while the calendar is off.
- **A7. Dependencies.** The functions depend on `better-auth` and `pg` (`package-lock.json` pins the tree). The public site has no runtime dependency. Run `npm audit` before launch and with each update.

**Privacy**
- No cookies on the public site, no analytics. The staff page sets session cookies for signed-in staff only.
- The privacy notice (`/ochrana-osobnich-udaju/`, with short versions in four languages) names the controller, hosting at Vercel, the absence of cookies and tracking, the forms on the Grand Priory's site, photographs and the data subject's rights. It is marked "requires approval". It offers to remove a photograph on request; the client must confirm it will honour that.

**Secrets**
- The repository and the build contain no credentials, keys or tokens. Test files generate random secrets at run time.

**Not done here**
- No deployment was made, so the headers were verified on the local servers (`build.py serve`, `tests/news.local.js`), not on Vercel.
- No penetration test of a deployed instance and no review of the Vercel or database account settings (enable two-step sign-in there too).
