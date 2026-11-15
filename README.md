# Česká maltézská mládež

Website of Česká maltézská mládež (Czech Maltese Youth), a work of the Czech Grand Priory of the Sovereign Military Hospitaller Order of St. John of Jerusalem of Rhodes and of Malta.

The site is static. A Python script (standard library only) turns the files in `content/` into plain HTML in `dist/`. Design, security headers and the publishing page come from the Grand Priory's site (maltezskyrad.cz); the sign-in is stricter here. The only packages are those of the serverless functions in `api/` (`npm ci`).

## Commands

```sh
python3 build.py serve 8000      # preview build, then serve it at http://localhost:8000 (headers and redirects applied)
python3 build.py                 # preview build into dist/ (noindex, status labels shown)
python3 build.py --production    # production build (see docs/deployment.md)
python3 check.py                 # checks dist/: links, headings, descriptions, brand assets, acronyms
npm ci && npm test               # the publishing API and the sign-in rules
```

Add `--offline` to skip fetching the Grand Magistry news feed. CI (`.github/workflows/ci.yml`) runs the build, `check.py` and the tests on every push.

## Where things are

| Path | What |
|---|---|
| `content/pages/<url>/index.html` | Pages. Each file has JSON front matter between `---` lines, then HTML. |
| `content/news/YYYY/MM/DD/slug.html` | News posts. The URL matches the old WordPress URL. |
| `content/site.json` | Names, contact details, menu, news categories, the AddCal calendar. |
| `content/i18n.json` | Interface and home-page strings in cs, en, fr, it and de. |
| `content/translations/<lang>.json` | Translated pages (en, fr, it, de), keyed by the Czech page URL: `url`, `title`, `description`, `body`. A page without an entry is simply not in that language's menu. |
| `vercel.json` | Hosting settings, security headers (CSP, HSTS…) and old-URL redirects; the build copies them to `dist/_headers` and `dist/_redirects`. |
| `static/` | CSS, JS, fonts, official brand files (`img/`) and migrated media (`media/`). |
| `api/` | Vercel functions: `news.js` (publishing), `auth.js` and `_auth.mjs` (sign-in), `rebuild.js` (daily rebuild). |
| `tools/import_wp.py` | One-off importer from the old WordPress site. Re-running it never overwrites a file marked `"imported": false`. |

## Editorial workflow

**Changing a page**
- Edit its file. Set `"imported": false` in the front matter so a re-import never overwrites it.
- `"status"` shows the review state in preview builds: `existing` (carried over, not yet reviewed), `new` (new text awaiting approval), `approval` (needs sign-off). Remove the field once the page is approved.

**Photographs awaiting consent**
- A post whose front matter has `"photos": "consent-pending"` is built without any `<img>` from its body and without its main and link-preview image; the text stays. All posts in the list in `docs/asset-manifest.md` ("Photographs: consent") carry it. Remove the flag from a post once consent for its photographs is confirmed (and drop the post from that list). The photographs stay in `static/media/` in the repository but are not deployed: the build leaves out every image file such a post no longer shows (and every file that only a draft, scheduled or withdrawn post uses) unless a published page or post still shows it, and `check.py` fails if one is in `dist/media/` (the old `/wp-content/uploads/…` redirect then ends in a 404). Remove the flag and rebuild to deploy them again.
- `"draft": true` takes a post off the site entirely (see "Withdrawn" in `docs/content-inventory.md`).

**News from co-workers (no GitHub needed)**
- Staff publish at `/pridat-aktualitu/` (not linked from the site, not indexed, behind sign-in): text editor limited to what the site styles, date, categories, summary, main photo, attachments, drafts, scheduled posts, pinned notices, edit and delete.
- Sign-in is by e-mail and password, with a code from an authenticator app as a second step: required for admins and owners, optional for editors. Wrong passwords lock the account for a while. Every change records who made it.
- Everything about roles, set-up, the environment variables and the GitHub token is in `docs/publishing.md`.

Environment variables (Vercel → Project → Settings → Environment Variables; never in the repository):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Postgres database with the accounts (`scripts/auth-schema.sql` creates the tables) |
| `BETTER_AUTH_SECRET` | long random string, e.g. `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | the site's origin, e.g. `https://cmm.maltezskyrad.cz` |
| `GITHUB_TOKEN` | fine-grained token: repository `Omegaswitch/maltezskamladez` only, Contents: Read and write |
| `DEPLOY_HOOK_URL`, `CRON_SECRET` | daily rebuild so scheduled posts go out on their day |
| `NEWS_NOTIFY`, `RESEND_API_KEY`, `MAIL_FROM` | optional: e-mail about every new post |

**Contacts, menu, calendar**
- Edit `content/site.json`.
- The calendar is an AddCal embed. Česká maltézská mládež has no AddCal calendar yet, so `addcal.calendarUid` and `addcal.publicUrl` are empty and the site shows no calendar: no widget, no page, no menu entry. Fill both in and rebuild; the calendar then appears on the home page and at `/kalendar/` in all five languages, with a loading skeleton and a plain link for visitors without JavaScript. The CSP in `vercel.json` allows AddCal's hosts only while there is no calendar: when you set the id, add them as listed in `docs/deployment.md` ("Calendar and the CSP"); the build stops and `check.py` fails if they do not match.

**Languages**
- The Czech site is the source. `content/translations/en.json` holds the main pages in English; `fr.json`, `it.json` and `de.json` hold About us, Our activities, Contact and a short privacy notice. The translated privacy notices do not describe the calendar: add that paragraph when a calendar is set. All of them are labelled "translation – awaiting review" in preview builds until a native speaker has checked them.

**Rules (from the Grand Magistry communications policy and coat-of-arms guidelines)**
- Use the full name of the Order at first mention, then "Suverénní maltézský řád" or "Maltézský řád".
- No acronyms, for the Order or for Česká maltézská mládež, and never "Malta" on its own.
- Never add, redraw or recolour an emblem. Only the files listed in `docs/asset-manifest.md` may be used; `check.py` enforces this. The old logo is not compliant and is not used (`docs/brand-compliance.md`).
- Do not invent facts or figures. Link to orderofmalta.int for the Order's official texts.

**Publishing:** see `docs/deployment.md`. Production deployment needs authorisation.

## Documentation

- `PRODUCT.md`: purpose, audience, constraints.
- `DESIGN.md`: design system (tokens, type, components), shared with the Grand Priory's site.
- `docs/content-inventory.md`: every page and post, its status, URL preservation and redirects.
- `docs/brand-compliance.md`: the logo verdict, the checklist against the official guidelines, open approvals.
- `docs/asset-manifest.md`: brand assets, photographs that need consent.
- `docs/publishing.md`: the staff page, roles, two-step sign-in, environment variables, the GitHub token.
- `docs/security-audit.md`: findings on the live site and the new implementation.
- `docs/qa-report.md`: what was tested and the results.
- `docs/deployment.md`: build, hosting, canonical host, launch checklist.
