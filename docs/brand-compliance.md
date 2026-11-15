# Brand compliance report

Checked against:

- **CP**: *Sovereign Order of Malta Worldwide Communications Policy and Guide* (Rome, February 2025);
- **CoA**: *Guidelines for correct use of the two emblems and of the flags of the Order of Malta* (v3.3, 1 September 2023);
- **Theme**: the Grand Magistry *Entities Theme* package (March 2025).

Status values: ✅ complies · ⚠️ complies with a caveat or needs a decision · ❌ does not comply.

## The old logo: not compliant, not used

The current site's logo (`/wp-content/uploads/2019/09/cropped-logo_new_1-2-2.png`) is a pictogram of a figure pushing a wheelchair. The wheel is a red circle holding the white eight-pointed cross; the words "česká maltézská mládež" stand beside it.

| Rule | Source | Finding |
|---|---|---|
| "Do not use any other emblem" | CoA p. 59, prohibition 5 | ❌ The example of a forbidden emblem shown there is exactly a cross in a red circle. |
| Since 1 March 2007 only the two official emblems may be used | CoA pp. 3–4 | ❌ The pictogram is a third emblem. |
| The cross alone is not the Order's legal symbol; it appears within the shield | CP p. 19 | ❌ The cross is taken out of the shield and put in a circle. |
| The shield carries "Order of Malta" in the local language and keeps its white contour | CoA p. 59, prohibitions 1 and 3 | ❌ The mark has neither the name nor the contour. |
| A project's name includes "Order of Malta" ("Maltézský řád") | CP p. 17 | ❌ The logo's wording is "česká maltézská mládež" only. |

**Verdict: the logo is not compliant and is not on the new site.** The importer drops every file of it and the placeholder pictures built from it; `check.py` fails the build if one is referenced. It survives inside at least one carried-over leaflet (2020) and possibly in other posters and PDF invitations from 2018–2020 (`docs/asset-manifest.md`, `DOC-*`); these need the client's decision.

### The compliant form ("Directions" lockup, CoA pp. 53–56 and 60)

```
 ┌────────┐  MALTÉZSKÝ ŘÁD            line 1, black, cap height ⅓ of the shield height
 │official│  ČESKÁ REPUBLIKA          line 2, black
 │  red   │  ───────────────          thin black rule
 │ shield │  ČESKÁ MALTÉZSKÁ MLÁDEŽ   line 3, red (the direction)
 └────────┘
```

- The shield is the official red shield file, unchanged. It is not drawn here on purpose.
- Font: Century Gothic Bold, tracking −10.
- Proportions, the Y spacing between shield and text and the clear space: as on CoA pp. 54–55.
- Colours: shield and the direction line red; the other text black. On a red background the lockup sits in a white box.

`tools/make_lockup.py` builds lines 1–2 from the licensed font. Line 3 needs the licensed Century Gothic Bold, which is not in the repository, so it has not been produced: no substitute font was used. **Pending asset `LCK-02`**: have the three-line lockup produced with the licensed font, or request it from the Grand Magistry or the Grand Priory.

Until then the banner shows the existing Czech two-line shield lockup ("MALTÉZSKÝ ŘÁD / ČESKÁ REPUBLIKA") with the full name of the Order and "Česká maltézská mládež" as live text beside it, the same way the Grand Priory's site sets its entity name.

## Checklist

| # | Requirement | Source | Status | How the site meets it |
|---|---|---|---|---|
| 1 | Top banner, colours and layout follow the Grand Magistry website | CP, Theme | ✅ | Red top bar, official banner photograph with the shield lockup, full name in white caps, `#454545` menu bar, grey / white / red footer bands; same code as the Grand Priory's site. |
| 2 | Colours `#e31818`, `#f3f3f3`, `#c7c7c7`, `#454545`, `#000` | Theme | ⚠️ | As on the Grand Priory's site: the theme's CSS uses `#e31a18`, its spec `#e31818`. The canonical value is an open question there too. |
| 3 | Font Asap; display serif | Theme | ⚠️ | Asap for interface and body text. Headings use EB Garamond, pending the same confirmation as on the Grand Priory's site (one token, `--display`). |
| 4 | Full official name at first mention and in the banner | CP | ✅ | Banner and footer carry "Suverénní vojenský špitální řád svatého Jana Jeruzalémského, z Rhodu a z Malty". New texts then use "Suverénní maltézský řád" or "Maltézský řád". |
| 5 | Never "Malta" alone | CP | ⚠️ | New texts comply. Carried-over posts name the international camp "Malta Camp", which is the event's own name. |
| 6 | No acronyms, for the Order or for an entity | CP p. 25 | ✅ | `check.py` fails on "SMOM" and on "ČMM" on every page. The carried-over texts now use the full name in the right case (the defined terms of the grant rules and the 2022 appeal are gone). |
| 7 | Footer links to www.orderofmalta.int | CP | ✅ | Red footer band on every page, in the page's language; the Grand Priory's site is linked beside it. |
| 8 | Only the two official emblems; none created, redrawn, recoloured or animated | CoA | ✅ | Only the official red shield appears (banner lockup, link-preview cards, favicons). The armorial bearing is not used: this is an activity, not an institution. `check.py` allows only the files in `docs/asset-manifest.md` under `/img/` and rejects the old logo under `/media/`. |
| 9 | The cross only inside the shield, only in white | CP p. 19 | ✅ | See 8. The banner photograph (official asset) shows the Order's flag. |
| 10 | Activities use the shield with the Order's name in the local language | CoA | ✅ | The Czech lockup reads "MALTÉZSKÝ ŘÁD / ČESKÁ REPUBLIKA"; other languages use their own lockup. |
| 11 | The activity's own lockup ("Directions") | CoA pp. 53–56, 60 | ⚠️ | Not yet produced (`LCK-02`, above). |
| 12 | Apolitical, no invented facts or figures | CP | ✅ | New texts (home page, privacy notice, translations) state only what the existing site states. They are labelled "new", "approval" or "translation" until approved. |
| 13 | Photographs: rights and consent, especially of minors | CP | ⚠️ | All photographs come from the existing site. Consent is not documented anywhere we could see; see `docs/asset-manifest.md`, `PH-*`. |
| 14 | Social links | CP | ✅ | One plain link to the Facebook page of Česká maltézská mládež. No Facebook script, pixel or embed. |

## Open approvals (for the Grand Magistry, the Grand Priory or the client)

1. The three-line lockup `LCK-02`: who produces it, and its approval.
2. Retiring the old logo everywhere else too (Facebook, printed matter); what to do with the historical posters and PDFs that carry it.
3. The translated names of the entity: "Czech Maltese Youth", "Jeunesse maltaise tchèque", "Gioventù maltese ceca", "Tschechische Malteserjugend".
4. Native-speaker review of the EN, FR, IT and DE texts (`content/i18n.json`, `content/translations/`).
5. Approval of the home page (marked "new") and the privacy notice (marked "approval"); editorial review of every page marked "existing", including the name of the Order, which carried-over texts wrote as "Suverénní řád maltézských rytířů" (replaced by the official form; only the name of the nursing school in Ječná street, in the 2024 review post, was left as the school's own name).
6. Photo consents (row 13).
7. The red value and the heading serif (rows 2–3), as decided for the Grand Priory's site.
