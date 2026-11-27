# Graph Report - maltezskamladez  (2026-11-27)

## Corpus Check
- 47 files · ~127,988 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .woff2 16, (none) 3, .css 2)

## Summary
- 1033 nodes · 2029 edges · 55 communities (47 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 77 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8949b119`
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
- news.test.js
- _auth.mjs
- optimize
- Z
- qt
- news.local.js
- load_news
- render_home
- check.py
- vercel.json
- u
- render_page
- Product
- Publishing (news, notices, galleries)
- QA report
- re
- make_og.py
- Deployment
- publish
- saveEvent
- Sanitiser
- site.js
- _sites.js
- Media
- lockup
- Brand compliance report
- Content inventory
- Česká maltézská mládež
- Security and privacy audit
- k
- serve
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

## Communities (55 total, 8 thin omitted)

### Community 0 - "news.js"
Cohesion: 0.13
Nodes (17): ALLOWED, CATEGORIES, configured(), crypto, eventSlug(), excerptOf(), FEATURES, HIDDEN_CATEGORIES (+9 more)

### Community 1 - "news-editor.js"
Cohesion: 0.09
Nodes (72): addCategory(), applyLang(), attachmentRow(), authCall(), authJson(), block(), blocks(), btn() (+64 more)

### Community 2 - "i"
Cohesion: 0.05
Nodes (6): d(), getText(), handleDOM(), handler(), i, U()

### Community 3 - "s"
Cohesion: 0.05
Nodes (4): h(), register(), s, wrap()

### Community 4 - "Module"
Cohesion: 0.06
Nodes (35): Module(), a(), Aa(), bb(), c(), cc(), a(), d() (+27 more)

### Community 5 - "m"
Cohesion: 0.06
Nodes (10): attachUI(), create(), descendant(), descendants(), et, getHTML(), j, m (+2 more)

### Community 6 - "b"
Cohesion: 0.20
Nodes (6): b(), find(), g(), getFormat(), n(), O()

### Community 7 - "quill.js"
Cohesion: 0.05
Nodes (15): copy(), Dt(), emit(), handleCompositionEnd(), handleCompositionStart(), hasNext(), ht(), It() (+7 more)

### Community 9 - "rt"
Cohesion: 0.13
Nodes (4): G, Q, X, z()

### Community 10 - "Components"
Cohesion: 0.07
Nodes (27): Buttons, Calendar block, Colors, Components, Content-status bar (preview only), Content-status (preview only), Design System: Česká maltézská mládež, Do: (+19 more)

### Community 11 - "N"
Cohesion: 0.11
Nodes (4): N, q(), R(), w()

### Community 12 - "o"
Cohesion: 0.10
Nodes (13): applyDelta(), attach(), deleteText(), f, formatLine(), formatText(), insertContents(), insertEmbed() (+5 more)

### Community 13 - "c"
Cohesion: 0.18
Nodes (3): c, clone(), normalizeNative()

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
Cohesion: 0.13
Nodes (23): A(), build(), buildItem(), buildLabel(), buildOptions(), buildPicker(), close(), constructor() (+15 more)

### Community 18 - "import_wp.py"
Cohesion: 0.24
Nodes (10): expand_acronym(), get_all(), get_json(), main(), page_body(), _self_test(), text_excerpt(), tidy_files() (+2 more)

### Community 19 - "news.test.js"
Cohesion: 0.13
Nodes (7): crypto, assert, commits, existing, messages, PEOPLE, stored

### Community 20 - "_auth.mjs"
Cohesion: 0.05
Nodes (46): ac, alert(), auth, HERE_CMM, LOC, mail(), NEW_PW, ORIGIN (+38 more)

### Community 21 - "optimize"
Cohesion: 0.12
Nodes (16): appendChild(), deleteAt(), enforceAllowedChildren(), format(), formatAt(), insertAt(), insertBefore(), isolate() (+8 more)

### Community 23 - "qt"
Cohesion: 0.09
Nodes (25): Bt(), Ct(), Et(), F(), Ft(), Gt(), hide(), e() (+17 more)

### Community 24 - "news.local.js"
Cohesion: 0.13
Nodes (11): sameOrigin(), useAuth(), blobs, crypto, fs, HEADERS, http, path (+3 more)

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

### Community 29 - "u"
Cohesion: 0.15
Nodes (10): a, add(), detach(), I(), i(), l(), p(), remove() (+2 more)

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

### Community 37 - "publish"
Cohesion: 0.25
Nodes (14): auditEntry(), contentsPath(), editable(), env(), exists(), gh(), listNews(), load() (+6 more)

### Community 38 - "saveEvent"
Cohesion: 0.26
Nodes (13): commit(), esc(), isImport(), listEvents(), mayChange(), oneLine(), readEvents(), remove() (+5 more)

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

### Community 47 - "Security and privacy audit"
Cohesion: 0.50
Nodes (3): Live site (cmm.maltezskyrad.cz, WordPress): findings, New implementation, Security and privacy audit

### Community 49 - "serve"
Cohesion: 0.67
Nodes (4): serve(), do_GET(), end_headers(), guess_type()

### Community 51 - "_descendants"
Cohesion: 0.67
Nodes (3): _descendants(), side_nav(), walk()

## Knowledge Gaps
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Module()` connect `Module` to `news.local.js`, `news.test.js`?**
  _High betweenness centrality (0.227) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `Module()` (e.g. with `ac()` and `$b()`) actually correct?**
  _`Module()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Should `news.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12631578947368421 - nodes in this community are weakly interconnected._
- **Why does `v()` connect `o` to `news-editor.js`, `b`, `quill.js`, `constructor`, `u`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Should `news-editor.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08612612612612612 - nodes in this community are weakly interconnected._
- **Why does `jt()` connect `qt` to `s`, `Module`, `b`, `quill.js`, `rt`, `o`, `constructor`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Should `i` be split into smaller, more focused modules?**
  _Cohesion score 0.0531986531986532 - nodes in this community are weakly interconnected._