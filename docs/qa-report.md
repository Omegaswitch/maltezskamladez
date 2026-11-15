# QA report

Date: 15 November 2026. Nothing was deployed; everything below ran locally.

## Builds

| Command | Result |
|---|---|
| `python3 build.py --offline` (preview) | 8 pages, 42 posts, translations en 8, fr 4, it 4, de 4; every page `noindex`, status labels shown, `robots.txt` disallows all |
| `python3 build.py` (with the Grand Magistry feed) | the same, plus the three latest headlines from orderofmalta.int on the five home pages |
| `python3 build.py --production --offline` | indexable pages, no status labels, `robots.txt` allows the site and disallows `/pridat-aktualitu/` and `/api/`, sitemap with 81 URLs; the staff page stays `noindex` |
| with a test calendar id in `content/site.json` | calendar widget on the home pages, `/kalendar/` in five languages, menu entry, AddCal paragraph in the privacy notice; 97 pages, 0 problems. Reverted: the site ships with no calendar |

## Automated checks (`check.py`, runs in CI)

92 HTML pages checked, 0 problems, in preview and in production mode. Every page has exactly one `<h1>`, a `<title>`, a meta description (404 excepted), internal links and images that resolve to a file or a redirect, no `javascript:` URLs, only approved brand files under `/img/`, no file of the old logo, no "SMOM", and no entity acronym unless the page is a carried-over text marked "existing" (10 such pages are reported as a note).

The check was proven to fail on injected defects: a broken link, an unknown image under `/img/`, the old logo under `/media/`, both acronyms.

## Tests

| Command | Result |
|---|---|
| `node tests/news.test.js` | `news ok`: roles, the two-step rule for admins, origin check, uploads, sanitiser, drafts, scheduling, pinning, edit, delete, audit trail, the cron endpoint |
| `node tests/auth.test.js` | `auth ok`: the sign-in rules against the real Better Auth 1.7.22 with a database in memory |
| `npm audit` | 0 vulnerabilities |

Also run once by hand, not part of CI:
- `scripts/auth-schema.sql` applied twice to a local PostgreSQL 16 (it is repeatable); a user added with `scripts/add-user.mjs` and one with `scripts/user-sql.mjs`; sign-in, two-step set-up, the per-IP rate limit (the fifth attempt in a minute is refused) and the failure count in `loginAttempt` observed in the database.
- The staff page in Chromium against `tests/news.local.js`, under the site's real CSP: wrong password refused → owner signs in → only the two-step card is offered → switched on with a code → ten backup codes shown → sign-out → sign-in asks for the code → wrong code refused → post written in the editor and published with its audit entry and commit trailers. No page errors and no CSP violations; the only console lines were the expected 401 answers.

## Browser check (Chromium, Playwright)

29 addresses at 390×844 and 1280×900, served by `build.py serve` with the production headers (CSP included): the home page in five languages, every Czech page, the news listing, a category and a year archive, three posts with galleries, the privacy notice, translated pages in each language, the staff page and a missing address.

For each: no horizontal overflow, exactly one `<h1>`, no broken image, no console error, no failed request, **no request to another origin**. Result: 58 of 58 pass. Screenshots of the home page, the contact page, a post and the news listing were reviewed by eye at both widths.

Fixed during QA:
- On a phone the e-mail address in the home page's facts row widened the page by 18 px; long values now wrap.
- A media file missing on the old site left a broken image; the importer now drops such references.
- The staff page asked for the user list while two-step sign-in was still off (a refused request); it no longer does.

## External links

All 19 distinct external addresses were requested. 18 answered 200 (orderofmalta.int in four languages, the Grand Priory's forms and documents, Facebook, OpenStreetMap, Vercel, the data protection authority). One could not be verified from the build environment: the footer link `https://www.maltezskyrad.cz/` (the connection was reset on every attempt). The Grand Priory's own audit says this address currently redirects to a host with an invalid certificate until its new site is launched; check it at launch.

## Not tested

- A deployment on Vercel (none was made): headers, redirects, the rewrite of `/api/auth/*`, the cron call and the functions' cold start are verified only locally.
- The AddCal widget with a real calendar (there is none yet); the code path is the Grand Priory's, tested there.
- Screen readers and an automated accessibility scan (axe-core is not available offline here). The markup, focus handling and contrast are the Grand Priory's, tested there with axe-core 4.10.2.
- Real phones; Safari and Firefox.
- E-mail notices through Resend.
- The PDF shrinker and photo uploads in the browser (unchanged code); the upload API itself is tested.

## Open items

See `docs/brand-compliance.md` (approvals), `docs/asset-manifest.md` (photo consents, the pending lockup), `docs/content-inventory.md` (editorial review) and `docs/security-audit.md` (accepted risks).
