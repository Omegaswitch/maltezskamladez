# Publishing (news, notices, galleries)

The site is static: everything the public sees is built by `build.py` from the files in `content/`. Staff do not touch
those files. They publish at **`/pridat-aktualitu/`** (not linked from the site, not indexed, behind a password) and the
page's API, `api/news.js`, writes the files into the repository `Omegaswitch/maltezskamladez` as ordinary commits. Vercel rebuilds
the site in about a minute. The code comes from the Grand Priory site (maltezskyrad.cz), with stronger sign-in rules (see below).

## Who can do what

People sign in with their e-mail address and a password (Better Auth, `api/_auth.mjs`; accounts live in Postgres). Nobody can sign themselves up.

| | editor | admin | owner |
|---|---|---|---|
| write, save a draft, schedule, publish | ✅ | ✅ | ✅ |
| edit a post | own, and imported ones | any | any |
| delete a post | own only | any | any |
| delete an imported post (no author id) | ❌ | ✅ | ✅ |
| pin a notice to the home page | – | ✅ | ✅ |
| add and remove people, set a new password for someone | – | – | ✅ |
| two-step sign-in (code from an authenticator app) | optional | **required** | **required** |

The editor shows a person only what their role allows; the API checks the role again on every request.

**Two-step sign-in.** An admin or owner who has not switched it on can sign in, but the site refuses everything except switching it on (card *Dvoufázové přihlášení* on the tab *Účet a uživatelé*): password, then the key typed into the app, then a code from the app. Ten backup codes are shown once; each works once instead of a code. An editor can switch it on and off the same way.

**Lost phone.** Use a backup code. If there is none, someone with access to the database runs, for that person's e-mail address:

```sql
delete from "twoFactor" where "userId" = (select "id" from "user" where "email" = 'jana@example.cz');
update "user" set "twoFactorEnabled" = false where "email" = 'jana@example.cz';
```

The person then switches it on again at the next sign-in.

**Wrong passwords.** Five wrong passwords in a row lock the account for 1 minute, each further one for twice as long, up to 15 minutes; the right password does not help while it is locked. The count is kept per e-mail address, so it does not matter where the attempts come from. Five wrong codes in the second step lock it for 15 minutes. On top of that every address may try to sign in 5 times a minute.

**First set-up** (once):

1. Create a Postgres database (for example Neon) and run `scripts/auth-schema.sql` in its SQL editor.
2. Set the environment variables below in Vercel and redeploy.
3. Add the first owner: `node scripts/user-sql.mjs "Jméno Příjmení" jmeno@example.cz 'heslo-aspon-12-znaku' owner` prints two SQL lines to paste into the SQL editor (or, with the variables set locally, `npm run auth:user -- "Jméno" e-mail heslo owner`).
4. The owner signs in, switches two-step sign-in on, changes the password and adds the others on the staff page.

## What can be published

| Type | How | Where it appears |
|---|---|---|
| **News post** | tab *Nová aktualita*: title, date, categories, summary, text (Quill, limited to the site's own styles), main photo, attachments | `/aktuality/`, category and year archives, RSS, the home page |
| **Draft** | tick *Koncept* | nowhere on the site; listed with the flag *koncept* in *Upravit nebo smazat*; publish it by editing and unticking |
| **Scheduled post** | choose a future date | on the site from that day (see *Daily rebuild*); listed with *naplánováno na …* until then |
| **Pinned notice** (admin) | tick *Připnout na úvodní stránku* | a red notice band on the home page and the news listing, with a link to the post; unpin by editing |
| **Photo gallery** | insert two or more photos in a row in the text (the photo button accepts several files) | the post shows a photo grid |

Editing keeps a post's address and records `editedBy`. Deleting removes the post in one commit (the media files stay in
`static/media/`, so links in old e-mails keep working).

## Daily rebuild (scheduled posts)

A static site only changes when it is built. Publishing triggers a build, but a scheduled post must go out on its day
and date-based lists must move on by themselves. `vercel.json` therefore asks Vercel to call
`/api/rebuild` every day at 03:00 UTC (`crons`). That function asks a **deploy hook** to rebuild. Set up once in Vercel
(project `maltezskamladez`):

1. Settings → Git → Deploy Hooks → create one for `main`, copy its URL into the environment variable `DEPLOY_HOOK_URL`.
2. Settings → Environment Variables → `CRON_SECRET` = a long random string (Vercel sends it with every cron call; without it the function answers nobody).
3. Redeploy. Without `DEPLOY_HOOK_URL` the function answers `rebuilt: false` and nothing happens.

A post dated today goes out at the next build, whatever the hour on it. Times are Europe/Prague.

## Security

- **Sign-in:** Better Auth with Postgres. Passwords are stored as scrypt hashes, at least 12 characters. The session cookie is `Secure`, `HttpOnly` and `SameSite=Strict` and lasts 12 hours; removing or banning a person ends their sessions at once. Two-step sign-in, lockout and rate limits as above.
- **Cross-site:** every changing request to `/api/news` and `/api/auth/*` must carry an `Origin` header naming this site; a foreign origin, or none, is refused (tested). Better Auth checks the origin again.
- **Text:** server-side allowlist sanitiser (headings, emphasis, lists, quotes, links with safe schemes, images from `/media/` only); scripts, styles, event handlers, foreign attributes and inline data are dropped. The CSP (`vercel.json`) blocks inline scripts anyway.
- **Files:** photos and PDFs only, checked by their first bytes, 3 MB each, saved under a new random name under `static/media/YYYY/MM/`; photos are shrunk and stripped of camera data in the browser.
- **Paths:** the API only ever writes under `content/news/` and `static/media/`; any other path is refused (tested).
- **Audit trail:** who did what is kept in three places. (1) The post's front matter: `author`, `authorId`, `editedBy` and `audit`, the last 50 steps with time, name, account id, role and action. (2) The commit: the message ends with `Audit-Action`, `Audit-User` (name and account id) and `Audit-Role` trailers, so `git log` answers "who deleted this". (3) The function log (Vercel → Logs): one JSON line per sign-in, failed sign-in, lockout, password change, two-step change and change to people; these lines carry account ids or a hash of the address tried, never a password.
- **Secrets** live only in Vercel environment variables. Nothing in `static/` or the built pages contains a token, and the API never echoes one.

### The GitHub token: least privilege

Create a **fine-grained personal access token** (github.com → Settings → Developer settings → Fine-grained tokens), ideally under a machine account that has access to nothing else:

- Repository access: **Only select repositories** → `Omegaswitch/maltezskamladez`.
- Repository permissions: **Contents: Read and write**. Metadata: Read-only is added by GitHub. Nothing else: no Actions, Administration, Secrets, Workflows, Pull requests or account permissions.
- Expiry: at most one year; put the renewal in a calendar. Replacing the token is a change of `GITHUB_TOKEN` in Vercel and a redeploy.

With these rights the token cannot change workflows (`.github/workflows/` needs the Workflows permission), settings or other repositories. Protect `main` against force pushes and deletion in the repository settings, so that history, and with it the audit trail, cannot be rewritten with this token.

### Environment variables

| Variable | Value |
|---|---|
| `DATABASE_URL` | Postgres connection string (with `sslmode=require`) of the database holding the accounts |
| `BETTER_AUTH_SECRET` | long random string: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | the site's origin, e.g. `https://cmm.maltezskyrad.cz`; sign-in works only from this origin |
| `GITHUB_TOKEN` | the fine-grained token above |
| `GITHUB_REPO`, `GITHUB_BRANCH` | optional; default `Omegaswitch/maltezskamladez` and `main` |
| `DEPLOY_HOOK_URL`, `CRON_SECRET` | daily rebuild (above) |
| `NEWS_NOTIFY`, `RESEND_API_KEY`, `MAIL_FROM` | optional e-mail about every new post |

Without `DATABASE_URL` and `BETTER_AUTH_SECRET` nobody can sign in and the staff page says it is not set up. None of these values belongs in the repository.

## Testing

- `node tests/news.test.js` — the API with GitHub and the sign-in stubbed: roles, the two-step rule for admins, origin check, drafts, scheduling, pinning, file checks, sanitiser, edit, delete, the audit trail.
- `node tests/auth.test.js` — the sign-in rules against the real Better Auth with a database in memory: no self sign-up, cookie attributes, lockout and backoff, the second step and backup codes, roles, origin check. Needs `npm ci`.
- `node tests/news.local.js` — a local stand-in of the hosting: serves `dist/` with the site's security headers, the API with GitHub replaced by this checkout and the real sign-in on a database in memory, so the whole flow can be tried in a browser at `http://localhost:8090/pridat-aktualitu/` (accounts at the top of the file; build first with `python3 build.py`). Posts land in `content/`, where `git status` shows them; discard them when done.

Verified on 15 November 2026 (`docs/qa-report.md`): the schema and the sign-in against a local PostgreSQL 16, and in Chromium against the stand-in: wrong password refused → owner signs in → only the two-step card is offered → switched on with a code → backup codes shown → sign-out → sign-in asks for the code → wrong code refused → post published with its audit entry. No page errors, no CSP violations.
