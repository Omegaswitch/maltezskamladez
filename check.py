#!/usr/bin/env python3
"""Checks the built site in dist/. Run after build.py; exits non-zero on any failure.

    python3 build.py --offline && python3 check.py
"""
import posixpath
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
sys.path.insert(0, str(ROOT / "tools"))

# Only these official emblem/brand files may appear; anything else under /img/ is a new, unapproved mark.
BRAND_FILES = re.compile(r"^/img/(banner/banner-photo\.webp|og-(cs|en|fr|it|de)\.jpg|lockup/(cs|en|fr|it|de)\.svg|favicon/[\w.-]+)$")
# The communications policy forbids acronyms, for the Order and for its entities (CP p. 25). Every page fails on either.
ACRONYM = re.compile(r"\bS\.?\s?M\.?\s?O\.?\s?M\b")
ENTITY_ACRONYM = re.compile(r"\bČMM\b")


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs, self.h1, self.title, self.desc, self._in_title = [], 0, "", None, False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self._in_title = True
        if tag == "meta" and a.get("name") == "description":
            self.desc = a.get("content") or ""
        for k in ("href", "src"):
            if a.get(k):
                self.refs.append(a[k])
        for part in (a.get("srcset") or "").split(","):
            if part.strip():
                self.refs.append(part.split()[0])

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def redirect_sources():
    f = DIST / "_redirects"
    return [line.split()[0] for line in f.read_text().splitlines() if line.strip() and not line.startswith("#")] if f.exists() else []


def resolves(path, sources):
    p = unquote(path)
    target = DIST / p.lstrip("/")
    if target.is_file() or (target / "index.html").is_file():
        return True
    return any(s == path or (s.endswith("*") and path.startswith(s[:-1])) for s in sources)


def main():
    if not (DIST / "index.html").exists():
        sys.exit("dist/ is empty; run build.py first")
    import import_wp
    import_wp._self_test()

    sources, errors, pages = redirect_sources(), [], 0
    for f in DIST.rglob("news.json"):  # drafts and scheduled posts must not be listed in any public file (api/news.js lists them behind sign-in)
        errors.append(f"/{f.relative_to(DIST)}: a static list of posts could expose drafts")
    for f in sorted(DIST.rglob("*.html")):
        rel = "/" + str(f.relative_to(DIST))
        page = Page()
        text = f.read_text(encoding="utf-8")
        page.feed(text)
        pages += 1
        if page.h1 != 1:
            errors.append(f"{rel}: {page.h1} <h1> elements")
        if not page.title.strip():
            errors.append(f"{rel}: empty <title>")
        if f.name != "404.html" and not (page.desc or "").strip():
            errors.append(f"{rel}: missing meta description")
        for ref in page.refs:
            u = urlsplit(ref)
            if ref.strip().lower().startswith("javascript:"):
                errors.append(f"{rel}: javascript: URL")
            if u.scheme or u.netloc or not u.path:
                continue  # external, mailto, tel, fragment
            path = u.path if u.path.startswith("/") else posixpath.normpath(posixpath.join(posixpath.dirname(rel), u.path)) + ("/" if u.path.endswith("/") else "")
            if not resolves(path, sources):
                errors.append(f"{rel}: broken link {ref}")
            if u.path.startswith("/img/") and not BRAND_FILES.match(u.path):
                errors.append(f"{rel}: unapproved brand asset {u.path}")
            if u.path.startswith("/media/") and import_wp.LEGACY_EMBLEMS.search(u.path):
                errors.append(f"{rel}: old logo {u.path} (not an emblem of the Order; docs/brand-compliance.md)")
        body = re.sub(r"<(script|style)\b.*?</\1>", "", text, flags=re.S)
        visible = re.sub(r"<[^>]+>", " ", body)
        if ACRONYM.search(visible):
            errors.append(f"{rel}: forbidden acronym SMOM")
        if ENTITY_ACRONYM.search(visible):
            errors.append(f"{rel}: entity acronym ČMM")

    headers = (DIST / "_headers").read_text(encoding="utf-8") if (DIST / "_headers").exists() else ""
    widget = any("<addcal-calendar" in f.read_text(encoding="utf-8") for f in DIST.rglob("*.html"))
    if widget != ("addcal.co" in headers):  # the CSP names AddCal exactly when a page loads it
        errors.append("CSP and calendar disagree: the AddCal hosts must be in vercel.json exactly when content/site.json has a calendar id (docs/deployment.md)")

    for e in errors:
        print("FAIL", e)
    print(f"checked {pages} pages: {len(errors)} problems")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
