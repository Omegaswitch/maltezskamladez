# Graph Report - maltezskamladez  (2026-11-27)

## Corpus Check
- 46 files · ~135,069 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .woff2 16, (none) 3, .css 2)

## Summary
- 1021 nodes · 2013 edges · 56 communities (46 shown, 10 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 77 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `35031bcb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- news.js
- news-editor.js
- i
- s
- Module
- m
- j
- quill.js
- rt
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
- f
- _auth.mjs
- optimize
- _mail.js
- qt
- load_news
- render_home
- check.py
- vercel.json
- update
- render_page
- Product
- Publishing (news, notices, galleries)
- QA report
- re
- make_og.py
- Deployment
- map.js
- package.json
- Sanitiser
- site.js
- _sites.js
- Media
- lockup
- Brand compliance report
- Content inventory
- Česká maltézská mládež
- _sessions.mjs
- k
- serve
- _authlog.mjs
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
- `ua()` --indirect_call--> `E()`  [INFERRED]
  static/js/vendor/ghostscript-1.1.0/gs.js → static/js/vendor/quill-2.0.3/quill.js

## Import Cycles
- None detected.

## Communities (56 total, 10 thin omitted)

### Community 0 - "news.js"
Cohesion: 0.06
Nodes (54): ALLOWED, auditEntry(), CATEGORIES, commit(), configured(), contentsPath(), crypto, editable() (+46 more)

### Community 1 - "news-editor.js"
Cohesion: 0.09
Nodes (72): addCategory(), applyLang(), attachmentRow(), authCall(), authJson(), block(), blocks(), btn() (+64 more)

### Community 2 - "i"
Cohesion: 0.05
Nodes (6): d(), getText(), handleDOM(), handler(), i, U()

### Community 3 - "s"
Cohesion: 0.05
Nodes (3): h(), register(), s

### Community 4 - "Module"
Cohesion: 0.06
Nodes (34): Module(), a(), Aa(), bb(), c(), cc(), a(), d() (+26 more)

### Community 5 - "m"
Cohesion: 0.06
Nodes (13): attachUI(), b(), create(), descendant(), et, find(), g(), getFormat() (+5 more)

### Community 7 - "quill.js"
Cohesion: 0.05
Nodes (15): copy(), detach(), emit(), handleCompositionEnd(), handleCompositionStart(), hasNext(), ht(), L (+7 more)

### Community 9 - "rt"
Cohesion: 0.09
Nodes (7): add(), G, Q, u, value(), X, z()

### Community 10 - "Components"
Cohesion: 0.07
Nodes (27): Buttons, Calendar block, Colors, Components, Content-status bar (preview only), Content-status (preview only), Design System: Česká maltézská mládež, Do: (+19 more)

### Community 11 - "N"
Cohesion: 0.10
Nodes (5): E(), N, q(), R(), w()

### Community 12 - "o"
Cohesion: 0.16
Nodes (12): applyDelta(), attach(), deleteText(), formatLine(), formatText(), insertContents(), insertEmbed(), insertText() (+4 more)

### Community 13 - "c"
Cohesion: 0.12
Nodes (4): c, clone(), splitAfter(), Y

### Community 14 - "build.py"
Cohesion: 0.12
Nodes (10): event_slug(), event_when(), events_list(), gallery_posts(), _index(), page_for(), page_title(), photos_of() (+2 more)

### Community 15 - "layout"
Cohesion: 0.17
Nodes (16): breadcrumbs(), build(), calendar_widget(), crumbs_html(), home_url(), is_news(), lang_switch(), layout() (+8 more)

### Community 16 - "steps"
Cohesion: 0.11
Nodes (17): runs-on, steps, CI, jobs, build, name, on, pull_request (+9 more)

### Community 17 - "constructor"
Cohesion: 0.16
Nodes (17): buildItem(), buildLabel(), buildOptions(), buildPicker(), close(), constructor(), escape(), focus() (+9 more)

### Community 18 - "import_wp.py"
Cohesion: 0.24
Nodes (10): expand_acronym(), get_all(), get_json(), main(), page_body(), _self_test(), text_excerpt(), tidy_files() (+2 more)

### Community 20 - "_auth.mjs"
Cohesion: 0.17
Nodes (12): ac, HERE_CMM, LOC, NEW_PW, ORIGIN, { plugin, put }, pool, roles (+4 more)

### Community 21 - "optimize"
Cohesion: 0.11
Nodes (16): appendChild(), deleteAt(), descendants(), enforceAllowedChildren(), format(), formatAt(), insertAt(), isolate() (+8 more)

### Community 22 - "_mail.js"
Cohesion: 0.24
Nodes (10): alert(), auth, mail(), brandOf(), button(), esc(), frame(), L (+2 more)

### Community 23 - "qt"
Cohesion: 0.08
Nodes (28): Bt(), Ct(), Dt(), Et(), F(), Ft(), Gt(), hide() (+20 more)

### Community 25 - "load_news"
Cohesion: 0.20
Nodes (7): _fix(), load_news(), load_pages(), media_refs(), read_doc(), withheld_media(), withhold_photos()

### Community 26 - "render_home"
Cohesion: 0.22
Nodes (6): gm_feed(), home_feature(), localized(), news_item(), render_home(), short_date()

### Community 27 - "check.py"
Cohesion: 0.18
Nodes (4): main(), Page, redirect_sources(), resolves()

### Community 28 - "vercel.json"
Cohesion: 0.17
Nodes (11): buildCommand, cleanUrls, crons, framework, headers, installCommand, outputDirectory, redirects (+3 more)

### Community 29 - "update"
Cohesion: 0.21
Nodes (13): A(), a, build(), getDelta(), getRange(), I(), i(), insertBefore() (+5 more)

### Community 30 - "render_page"
Cohesion: 0.22
Nodes (9): contact_card(), enhance_body(), fix_img(), fmt_date(), gallery_html(), image_size(), img(), render_article() (+1 more)

### Community 31 - "Product"
Cohesion: 0.20
Nodes (9): Accessibility and inclusion, Capabilities and constraints, Operating context, Platform, Product, Product principles, Product purpose, Stack (+1 more)

### Community 32 - "Publishing (news, notices, galleries)"
Cohesion: 0.22
Nodes (8): Daily rebuild (scheduled posts), Environment variables, Publishing (news, notices, galleries), Security, Testing, The GitHub token: least privilege, What can be published, Who can do what

### Community 33 - "QA report"
Cohesion: 0.22
Nodes (8): Automated checks (`check.py`, runs in CI), Browser check (Chromium, Playwright), Builds, External links, Not tested, Open items, QA report, Tests

### Community 34 - "re"
Cohesion: 0.22
Nodes (5): lead_image(), line(), text_right(), line(), main()

### Community 36 - "Deployment"
Cohesion: 0.25
Nodes (7): Build, Calendar and the CSP, Canonical host and the current certificate fault, Deployment, Hosting, Launch checklist, nginx translation

### Community 37 - "map.js"
Cohesion: 0.24
Nodes (7): CRC, crc(), crypto, decode(), encode(), render(), zlib

### Community 38 - "package.json"
Cohesion: 0.24
Nodes (9): dependencies, better-auth@^1.7.22, pg@^8.23.1, description, private, scripts, test, better-auth (+1 more)

### Community 39 - "Sanitiser"
Cohesion: 0.18
Nodes (5): _iframe_label(), make_url_map(), url_map(), sanitise(), Sanitiser

### Community 40 - "site.js"
Cohesion: 0.48
Nodes (6): go(), load(), pause(), restart(), watch(), watchWidgets()

### Community 41 - "_sites.js"
Cohesion: 0.32
Nodes (7): loadAuth(), session(), CHOICES, editorFor(), mayPublish(), SITES, sitesOf()

### Community 42 - "Media"
Cohesion: 0.38
Nodes (3): download(), Media, _norm()

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

### Community 47 - "_sessions.mjs"
Cohesion: 0.47
Nodes (5): device(), LANGS, place(), sessionsPlugin(), SIGN_IN

### Community 49 - "serve"
Cohesion: 0.67
Nodes (4): serve(), do_GET(), end_headers(), guess_type()

### Community 50 - "_authlog.mjs"
Cohesion: 0.67
Nodes (3): authHooks(), PATHS, who()

### Community 51 - "_descendants"
Cohesion: 0.67
Nodes (3): _descendants(), side_nav(), walk()

## Knowledge Gaps
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Module()` connect `Module` to `news.js`?**
  _High betweenness centrality (0.196) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `Module()` (e.g. with `ac()` and `$b()`) actually correct?**
  _`Module()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Should `news.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06241519674355495 - nodes in this community are weakly interconnected._
- **Why does `v()` connect `o` to `news-editor.js`, `m`, `quill.js`, `f`, `update`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Should `news-editor.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08648648648648649 - nodes in this community are weakly interconnected._
- **Why does `n()` connect `m` to `Module`, `quill.js`, `o`, `constructor`, `optimize`, `qt`, `update`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Should `i` be split into smaller, more focused modules?**
  _Cohesion score 0.0531986531986532 - nodes in this community are weakly interconnected._