# Graph Report - maltezskamladez  (2026-11-15)

## Corpus Check
- 46 files · ~85,374 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .woff2 16, (none) 3, .css 2)

## Summary
- 998 nodes · 1928 edges · 56 communities (48 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c33e2648`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- news.js
- news-editor.js
- i
- s
- Module
- m
- b
- quill.js
- jt
- u
- Components
- N
- o
- c
- build.py
- layout
- steps
- constructor
- import_wp.py
- rt
- _auth.mjs
- check.py
- re
- qt
- news.local.js
- build
- home_feature
- Sanitiser
- vercel.json
- auth.test.js
- render_page
- Product
- Publishing (news, notices, galleries)
- QA report
- I
- make_og.py
- Deployment
- package.json
- f
- ref_crypto
- site.js
- selectItem
- Media
- lockup
- Brand compliance report
- Content inventory
- Česká maltézská mládež
- T
- k
- serve
- scripts
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
7. `jt()` - 26 edges
8. `b()` - 23 edges
9. `publish()` - 20 edges
10. `n()` - 20 edges

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

## Communities (56 total, 8 thin omitted)

### Community 0 - "news.js"
Cohesion: 0.07
Nodes (55): ALLOWED, auditEntry(), CATEGORIES, commit(), configured(), contentsPath(), crypto, editable() (+47 more)

### Community 1 - "news-editor.js"
Cohesion: 0.09
Nodes (60): addCategory(), attachmentRow(), authJson(), block(), blocks(), btn(), call(), categories() (+52 more)

### Community 2 - "i"
Cohesion: 0.05
Nodes (7): d(), getText(), handleDOM(), handler(), i, O(), U()

### Community 3 - "s"
Cohesion: 0.06
Nodes (4): h(), register(), s, wrap()

### Community 4 - "Module"
Cohesion: 0.06
Nodes (35): Module(), a(), Aa(), bb(), c(), cc(), a(), d() (+27 more)

### Community 5 - "m"
Cohesion: 0.07
Nodes (10): attachUI(), create(), descendant(), descendants(), et, g(), getHTML(), m (+2 more)

### Community 6 - "b"
Cohesion: 0.08
Nodes (20): appendChild(), b(), deleteAt(), enforceAllowedChildren(), find(), format(), formatAt(), getFormat() (+12 more)

### Community 7 - "quill.js"
Cohesion: 0.06
Nodes (13): copy(), emit(), handleCompositionEnd(), handleCompositionStart(), hasNext(), ht(), L, move() (+5 more)

### Community 8 - "jt"
Cohesion: 0.12
Nodes (21): Bt(), Ct(), Dt(), Et(), F(), Ft(), Gt(), It() (+13 more)

### Community 9 - "u"
Cohesion: 0.09
Nodes (6): add(), G, Q, u, value(), X

### Community 10 - "Components"
Cohesion: 0.07
Nodes (27): Buttons, Calendar block, Colors, Components, Content-status bar (preview only), Content-status (preview only), Design System: Česká maltézská mládež, Do: (+19 more)

### Community 11 - "N"
Cohesion: 0.11
Nodes (4): N, q(), R(), w()

### Community 12 - "o"
Cohesion: 0.13
Nodes (13): applyDelta(), attach(), deleteText(), formatLine(), formatText(), insertContents(), insertEmbed(), insertText() (+5 more)

### Community 13 - "c"
Cohesion: 0.11
Nodes (4): c, clone(), j, normalizeNative()

### Community 14 - "build.py"
Cohesion: 0.12
Nodes (10): _fix(), gallery_html(), gallery_posts(), _index(), load_news(), load_pages(), page_title(), photos_of() (+2 more)

### Community 15 - "layout"
Cohesion: 0.17
Nodes (15): breadcrumbs(), calendar_widget(), crumbs_html(), gm_feed(), home_url(), is_news(), lang_switch(), layout() (+7 more)

### Community 16 - "steps"
Cohesion: 0.11
Nodes (17): runs-on, steps, CI, jobs, build, name, on, pull_request (+9 more)

### Community 17 - "constructor"
Cohesion: 0.16
Nodes (17): A(), build(), constructor(), focus(), getDelta(), getNativeRange(), getRange(), handleComposition() (+9 more)

### Community 18 - "import_wp.py"
Cohesion: 0.24
Nodes (10): expand_acronym(), get_all(), get_json(), main(), page_body(), _self_test(), text_excerpt(), tidy_files() (+2 more)

### Community 20 - "_auth.mjs"
Cohesion: 0.17
Nodes (11): ac, AUDITED, createAuth(), getAuth(), LOCK, lockSeconds(), MIN_PASSWORD, pgAttempts() (+3 more)

### Community 21 - "check.py"
Cohesion: 0.18
Nodes (4): main(), Page, redirect_sources(), resolves()

### Community 22 - "re"
Cohesion: 0.22
Nodes (5): lead_image(), line(), text_right(), line(), main()

### Community 23 - "qt"
Cohesion: 0.29
Nodes (3): hide(), qt(), St()

### Community 24 - "news.local.js"
Cohesion: 0.14
Nodes (10): useAuth(), blobs, crypto, fs, HEADERS, http, path, port (+2 more)

### Community 25 - "build"
Cohesion: 0.17
Nodes (9): build(), media_refs(), privacy_html(), render_news_editor(), render_simple(), rss(), withheld_media(), write() (+1 more)

### Community 26 - "home_feature"
Cohesion: 0.17
Nodes (8): event_slug(), event_when(), events_list(), home_feature(), page_for(), plain(), section_children_html(), short_date()

### Community 27 - "Sanitiser"
Cohesion: 0.18
Nodes (5): _iframe_label(), make_url_map(), url_map(), sanitise(), Sanitiser

### Community 28 - "vercel.json"
Cohesion: 0.17
Nodes (11): buildCommand, cleanUrls, crons, framework, headers, installCommand, outputDirectory, redirects (+3 more)

### Community 29 - "auth.test.js"
Cohesion: 0.22
Nodes (5): memoryAttempts(), sameOrigin(), RFC-6238, assert, crypto

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
Cohesion: 0.32
Nodes (7): dependencies, better-auth@^1.7.22, pg@^8.23.1, description, private, better-auth, pg

### Community 39 - "ref_crypto"
Cohesion: 0.29
Nodes (3): crypto, id, [name, email, password, role = "editor"]

### Community 40 - "site.js"
Cohesion: 0.48
Nodes (6): go(), load(), pause(), restart(), watch(), watchWidgets()

### Community 41 - "selectItem"
Cohesion: 0.38
Nodes (7): buildItem(), buildLabel(), buildOptions(), buildPicker(), close(), escape(), selectItem()

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
Cohesion: 0.33
Nodes (5): Content inventory, For the editorial review, Posts (42), What the import changed, Withdrawn

### Community 46 - "Česká maltézská mládež"
Cohesion: 0.33
Nodes (5): Commands, Documentation, Editorial workflow, Where things are, Česká maltézská mládež

### Community 47 - "T"
Cohesion: 0.40
Nodes (3): e(), M(), T()

### Community 49 - "serve"
Cohesion: 0.67
Nodes (4): serve(), do_GET(), end_headers(), guess_type()

### Community 50 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, auth:user, auth:user-sql, test

### Community 51 - "_descendants"
Cohesion: 0.67
Nodes (3): _descendants(), side_nav(), walk()

## Knowledge Gaps
- **1 isolated node(s):** `RFC-6238`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 329 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Module()` connect `Module` to `news.local.js`, `ref_crypto`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `Module()` (e.g. with `ac()` and `$b()`) actually correct?**
  _`Module()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `RFC-6238` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `news.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06586538461538462 - nodes in this community are weakly interconnected._
- **Why does `jt()` connect `jt` to `s`, `Module`, `b`, `quill.js`, `o`, `constructor`, `qt`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `news-editor.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08806963645673323 - nodes in this community are weakly interconnected._
- **Why does `P()` connect `Module` to `jt`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._