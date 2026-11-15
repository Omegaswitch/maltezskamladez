# Deployment

**Production deployment and any change to the live cmm.maltezskyrad.cz require explicit authorisation from Česká maltézská mládež and the Grand Priory.** Nothing in this repository deploys automatically to production.

## Build

```sh
python3 build.py                 # preview: noindex everywhere, content-status labels shown
python3 build.py --production    # production: indexable, no labels
python3 build.py --offline       # either mode, without fetching the Grand Magistry news feed
python3 check.py                 # must print "0 problems" before anything is published
```

The only requirement is Python 3.10 or newer, with no packages. The output is `dist/`, a plain static folder: HTML, CSS, JS, fonts, media, `sitemap.xml`, `feed.xml`, `robots.txt`, `_headers` and `_redirects`.

The Grand Magistry news list on the homepage is fetched at build time from `orderofmalta.int`. If the fetch fails, the build still succeeds and the block is left out. Rebuild at least daily, for example with a scheduled CI job, to keep it current.

## Hosting

Any static host works. Security headers and legacy redirects are defined once, in `vercel.json` (`headers`, `redirects`); the build also writes them as `dist/_headers` and `dist/_redirects` (Netlify / Cloudflare Pages format) for other hosts and the local preview server.

| Host | `_headers` (CSP, HSTS…) | `_redirects` (legacy URLs) | Notes |
|---|---|---|---|
| Netlify | ✅ native | ✅ native | Build `python3 build.py --production`, publish `dist`. |
| Cloudflare Pages | ✅ native | ✅ native | Same. |
| Vercel (`vercel.json`) | ✅ from `vercel.json` | ✅ from `vercel.json` | The build command is `python3 build.py --production --offline`: indexable pages, `Allow: /` robots.txt with the sitemap, canonical URLs on `https://cmm.maltezskyrad.cz`. `--offline` keeps the Grand Magistry headlines off. |
| nginx / Apache (own server) | translate | translate | See below. |

### Calendar and the CSP

`vercel.json` is static, so the Content-Security-Policy there allows only the site itself while `content/site.json` has no AddCal calendar id (`addcal.calendarUid` empty). When a calendar id is set, add these to the CSP value in `vercel.json` (one place; `dist/_headers` is copied from it) before building:

- `script-src`: `https://cdn.addcal.co` (after `'self'`)
- `img-src`: `https://cdn.addcal.co https://addcal.co`
- `font-src`: `https://cdn.addcal.co`
- `connect-src`: `https://addcal.co https://cdn.addcal.co`
- `frame-src https://addcal.co` as a new directive (for example after `connect-src`)

Keep `'wasm-unsafe-eval'` and `worker-src 'self'`; the staff page's PDF shrinker needs them. The build stops with a message if a calendar id is set and the CSP lacks the AddCal hosts, and `check.py` fails if the CSP names AddCal while no page has the widget (or the reverse). When the calendar is removed again, take the hosts out.

### nginx translation

```nginx
server {
  server_name cmm.maltezskyrad.cz;
  root /var/www/maltezskamladez/dist;
  error_page 404 /404.html;

  add_header Content-Security-Policy "<value from dist/_headers>" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" always;
  add_header Cross-Origin-Opener-Policy same-origin always;
  add_header X-Frame-Options DENY always;

  location ~ ^/(fonts|css|js)/ { add_header Cache-Control "public, max-age=31536000, immutable"; }

  # one line per entry in dist/_redirects, e.g.
  location = /sekce-pro-cleny/ { return 301 /kontakt/; }
  location ^~ /wp-content/uploads/ { rewrite ^/wp-content/uploads/(.*)$ /media/$1 permanent; }
  location ^~ /category/ { return 301 /aktuality/; }
}
server {  # canonical host
  server_name www.maltezskamladez.cz maltezskamladez.cz;  # only if these names are to redirect here
  return 301 https://cmm.maltezskyrad.cz$request_uri;
}
```

Repeat the `add_header` lines in any `location` block that also sets its own `add_header`; nginx does not inherit them.

## Canonical host and the current certificate fault

The canonical URL is `baseUrl` in `content/site.json`. It is set to the address of the current site, `https://cmm.maltezskyrad.cz`, so that every old URL keeps working. The client has to confirm the final host (the contact e-mail uses the domain `maltezskamladez.cz`); changing it is a one-line edit of `baseUrl`.

Today `cmm.maltezskyrad.cz` answers over plain HTTP only: on HTTPS it presents a certificate that does not cover the name (`docs/security-audit.md`, L1). At launch:

1. Serve the site on the confirmed host with a certificate that covers that name.
2. Redirect the other host names (and plain HTTP) to it.
3. If the host changes, keep `cmm.maltezskyrad.cz` as a redirect so old links and search results keep working.

## Launch checklist

1. Resolve the open approvals in `docs/brand-compliance.md`, and approve every page labelled "new" and the privacy notice.
2. Get written authorisation to replace the live site.
3. Run `python3 build.py --production && python3 check.py`.
4. Deploy `dist/` with the headers and redirects active on the host. Verify:
   - `curl -I https://cmm.maltezskyrad.cz/` shows the CSP and HSTS headers;
   - `curl -I https://cmm.maltezskyrad.cz/home/` returns 301.
5. Submit `https://cmm.maltezskyrad.cz/sitemap.xml` in Google Search Console.
6. Retire WordPress. Keep a full backup (database and `wp-content`) offline, and remove the public `/wp-json/` API.
