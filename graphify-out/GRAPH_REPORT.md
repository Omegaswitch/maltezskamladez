# Graph Report - maltezskamladez  (2026-11-27)

## Corpus Check
- 47 files · ~101,141 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .woff2 16, (none) 3, .css 2)

## Summary
- 1032 nodes · 2028 edges · 56 communities (43 shown, 13 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 77 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `58d4765e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- news.js
- news-editor.js
- i
- h
- Module
- m
- b
- quill.js
- jt
- rt
- Components
- N
- o
- c
- build.py
- layout
- steps
- constructor
- import_wp.py
- s
- _auth.mjs
- optimize
- length
- qt
- news.local.js
- load_news
- home_feature
- _mail.js
- vercel.json
- u
- render_page
- Product
- Publishing (news, notices, galleries)
- QA report
- I
- make_og.py
- Deployment
- package.json
- f
- map.js
- site.js
- update
- j
- lockup
- Brand compliance report
- Content inventory
- Česká maltézská mládež
- k
- serve
- _sessions.mjs
- _descendants
- localized_nav
- CLAUDE.md
- _existing

## God Nodes (most connected - your core abstractions)
1. `i` - 57 edges
2. `Module()` - 50 edges
3. `s` - 42 edges
4. `o` - 39 edges
5. `m` - 38 edges
6. `h()` - 31 edges
7. `T()` - 29 edges
8. `jt()` - 26 edges
9. `b()` - 23 edges
10. `publish()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `New implementation` --references--> `publish()`  [INFERRED]
  docs/security-audit.md → api/news.js
- `Asset manifest and replacement list` --references--> `lockup()`  [INFERRED]
  docs/asset-manifest.md → build.py
- `Pages` --references--> `privacy_html()`  [INFERRED]
  docs/content-inventory.md → build.py
- `jt()` --indirect_call--> `P()`  [INFERRED]
  static/js/vendor/quill-2.0.3/quill.js → static/js/vendor/ghostscript-1.1.0/gs.js
- `session()` --calls--> `sitesOf()`  [EXTRACTED]
  api/news.js → api/_sites.js

## Import Cycles
- None detected.

## Communities (56 total, 13 thin omitted)

### Community 0 - "news.js"
Cohesion: 0.06
Nodes (61): ALLOWED, auditEntry(), CATEGORIES, commit(), configured(), contentsPath(), crypto, editable() (+53 more)

### Community 1 - "news-editor.js"
Cohesion: 0.09
Nodes (72): addCategory(), applyLang(), attachmentRow(), authCall(), authJson(), block(), blocks(), btn() (+64 more)

### Community 2 - "i"
Cohesion: 0.06
Nodes (6): d(), getText(), handleDOM(), handler(), i, U()

### Community 4 - "Module"
Cohesion: 0.06
Nodes (35): Module(), a(), Aa(), bb(), c(), cc(), a(), d() (+27 more)

### Community 5 - "m"
Cohesion: 0.07
Nodes (9): attachUI(), descendant(), descendants(), et, g(), getHTML(), m, nt() (+1 more)

### Community 6 - "b"
Cohesion: 0.23
Nodes (4): b(), find(), getFormat(), n()

### Community 7 - "quill.js"
Cohesion: 0.05
Nodes (18): copy(), Dt(), emit(), handleCompositionEnd(), handleCompositionStart(), hasNext(), ht(), It() (+10 more)

### Community 8 - "jt"
Cohesion: 0.18
Nodes (16): Bt(), create(), Ct(), F(), Ft(), Gt(), e(), jt() (+8 more)

### Community 9 - "rt"
Cohesion: 0.09
Nodes (5): G, Q, rt, X, z()

### Community 10 - "Components"
Cohesion: 0.07
Nodes (27): Buttons, Calendar block, Colors, Components, Content-status bar (preview only), Content-status (preview only), Design System: Česká maltézská mládež, Do: (+19 more)

### Community 11 - "N"
Cohesion: 0.11
Nodes (4): N, q(), R(), w()

### Community 12 - "o"
Cohesion: 0.14
Nodes (12): applyDelta(), attach(), deleteText(), formatLine(), formatText(), insertContents(), insertEmbed(), insertText() (+4 more)

### Community 14 - "build.py"
Cohesion: 0.11
Nodes (15): event_slug(), event_when(), events_list(), _fix(), gallery_html(), gallery_posts(), _index(), load_pages() (+7 more)

### Community 15 - "layout"
Cohesion: 0.13
Nodes (20): breadcrumbs(), build(), calendar_widget(), crumbs_html(), gm_feed(), home_url(), is_news(), lang_switch() (+12 more)

### Community 16 - "steps"
Cohesion: 0.11
Nodes (17): runs-on, steps, CI, jobs, build, name, on, pull_request (+9 more)

### Community 17 - "constructor"
Cohesion: 0.16
Nodes (17): buildItem(), buildLabel(), buildOptions(), buildPicker(), close(), constructor(), escape(), focus() (+9 more)

### Community 18 - "import_wp.py"
Cohesion: 0.06
Nodes (27): main(), Page, redirect_sources(), resolves(), download(), expand_acronym(), get_all(), get_json() (+19 more)

### Community 20 - "_auth.mjs"
Cohesion: 0.15
Nodes (14): ac, LOC, NEW_PW, ORIGIN, { plugin, put }, pool, roles, SITE (+6 more)

### Community 21 - "optimize"
Cohesion: 0.15
Nodes (10): deleteAt(), enforceAllowedChildren(), formatAt(), insertAt(), isolate(), optimize(), split(), splitAfter() (+2 more)

### Community 22 - "length"
Cohesion: 0.15
Nodes (6): format(), length(), moveChildren(), replaceWith(), unwrap(), Z

### Community 23 - "qt"
Cohesion: 0.11
Nodes (8): Et(), hide(), kt(), O(), qt(), St(), T(), wt

### Community 24 - "news.local.js"
Cohesion: 0.13
Nodes (11): sameOrigin(), useAuth(), blobs, crypto, fs, HEADERS, http, path (+3 more)

### Community 25 - "load_news"
Cohesion: 0.29
Nodes (4): load_news(), media_refs(), withheld_media(), withhold_photos()

### Community 27 - "_mail.js"
Cohesion: 0.23
Nodes (8): alert(), auth, mail(), button(), esc(), frame(), L, ORIGIN

### Community 28 - "vercel.json"
Cohesion: 0.17
Nodes (11): buildCommand, cleanUrls, crons, framework, headers, installCommand, outputDirectory, redirects (+3 more)

### Community 29 - "u"
Cohesion: 0.21
Nodes (3): add(), u, value()

### Community 30 - "render_page"
Cohesion: 0.24
Nodes (8): contact_card(), enhance_body(), fix_img(), fmt_date(), image_size(), img(), render_article(), render_page()

### Community 31 - "Product"
Cohesion: 0.20
Nodes (9): Accessibility and inclusion, Capabilities and constraints, Operating context, Platform, Product, Product principles, Product purpose, Stack (+1 more)

### Community 32 - "Publishing (news, notices, galleries)"
Cohesion: 0.22
Nodes (8): Daily rebuild (scheduled posts), Environment variables, Publishing (news, notices, galleries), Security, Testing, The GitHub token: least privilege, What can be published, Who can do what

### Community 33 - "QA report"
Cohesion: 0.22
Nodes (8): Automated checks (`check.py`, runs in CI), Browser check (Chromium, Playwright), Builds, External links, Not tested, Open items, QA report, Tests

### Community 34 - "I"
Cohesion: 0.31
Nodes (7): a, detach(), I(), i(), l(), p(), remove()

### Community 36 - "Deployment"
Cohesion: 0.25
Nodes (7): Build, Calendar and the CSP, Canonical host and the current certificate fault, Deployment, Hosting, Launch checklist, nginx translation

### Community 37 - "package.json"
Cohesion: 0.24
Nodes (9): dependencies, better-auth@^1.7.22, pg@^8.23.1, description, private, scripts, test, better-auth (+1 more)

### Community 39 - "map.js"
Cohesion: 0.27
Nodes (7): CRC, crc(), crypto, decode(), encode(), render(), zlib

### Community 40 - "site.js"
Cohesion: 0.48
Nodes (6): go(), load(), pause(), restart(), watch(), watchWidgets()

### Community 41 - "update"
Cohesion: 0.22
Nodes (9): A(), appendChild(), build(), getDelta(), getRange(), insertBefore(), normalizedToRange(), update() (+1 more)

### Community 43 - "lockup"
Cohesion: 0.33
Nodes (4): lockup(), Asset manifest and replacement list, Photographs: consent, Posters and documents (`DOC-*`)

### Community 44 - "Brand compliance report"
Cohesion: 0.33
Nodes (5): Brand compliance report, Checklist, Open approvals (for the Grand Magistry, the Grand Priory or the client), The compliant form ("Directions" lockup, CoA pp. 53–56 and 60), The old logo: not compliant, not used

### Community 45 - "Content inventory"
Cohesion: 0.25
Nodes (7): privacy_html(), Content inventory, For the editorial review, Pages, Posts (42), What the import changed, Withdrawn

### Community 46 - "Česká maltézská mládež"
Cohesion: 0.33
Nodes (5): Commands, Documentation, Editorial workflow, Where things are, Česká maltézská mládež

### Community 49 - "serve"
Cohesion: 0.67
Nodes (4): serve(), do_GET(), end_headers(), guess_type()

### Community 50 - "_sessions.mjs"
Cohesion: 0.38
Nodes (5): device(), LANGS, place(), sessionsPlugin(), SIGN_IN

### Community 51 - "_descendants"
Cohesion: 0.67
Nodes (3): _descendants(), side_nav(), walk()

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Module()` connect `Module` to `news.js`, `news.local.js`?**
  _High betweenness centrality (0.228) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `Module()` (e.g. with `ac()` and `$b()`) actually correct?**
  _`Module()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Should `news.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05516475379489078 - nodes in this community are weakly interconnected._
- **Why does `v()` connect `o` to `news-editor.js`, `I`, `b`, `quill.js`, `update`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Should `news-editor.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08612612612612612 - nodes in this community are weakly interconnected._
- **Why does `n()` connect `b` to `I`, `Module`, `m`, `quill.js`, `jt`, `update`, `o`, `constructor`, `length`, `qt`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Should `i` be split into smaller, more focused modules?**
  _Cohesion score 0.055152394775036286 - nodes in this community are weakly interconnected._