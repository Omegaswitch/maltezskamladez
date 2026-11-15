# Asset manifest and replacement list

Every brand asset is referenced from one place. To replace one, keep the path (or change it in the file named) and rebuild. `check.py` rejects any image under `/img/` that is not listed here, and any file of the old logo under `/media/`.

| ID | Asset | Path | Used by | Source | Status | Replace with |
|---|---|---|---|---|---|---|
| BAN-01 | Banner photograph (the Order's flag) | `static/img/banner/banner-photo.webp` | `.banner` in `static/css/site.css`, preload in `build.py` | Grand Magistry Entities Theme, `header_orderofmalta.psd`, photograph layer only; copied unchanged from the Grand Priory's site | Official | — |
| LCK-01 | Shield lockups, two lines (cs, en, fr, it, de): official red shield, the Order's name, the country | `static/img/lockup/<lang>.svg` | `lockup()` in `build.py` | Copied unchanged from the Grand Priory's site (built by `tools/make_lockup.py` from the licensed Century Gothic Bold; outlines only) | Official shield, approved wording | `LCK-02` when it exists |
| LCK-02 | Three-line "Directions" lockup: shield, MALTÉZSKÝ ŘÁD, ČESKÁ REPUBLIKA, rule, ČESKÁ MALTÉZSKÁ MLÁDEŽ in red | — (preview only: `docs/lockup-preview/`) | — (not used on the site, not built into `dist/`) | `tools/make_cmm_lockup.py`, geometry measured on CoA p. 55 | **Preview only.** A preview exists in `docs/lockup-preview/`, drawn with a stand-in font (URW Gothic Demi). The final version is pending the licensed Century Gothic Bold (not in the repository) and approval; specification in `docs/brand-compliance.md` | To be produced with the licensed font (`tools/make_cmm_lockup.py`), or requested from the Grand Magistry / Grand Priory; then copied to `static/img/lockup/` and listed here |
| OG-01 | Link-preview cards 1200×630 | `static/img/og-<lang>.jpg` | `layout()` in `build.py` | Copied unchanged from the Grand Priory's site: the banner photograph, the `LCK-01` lockup, a red strip. They carry the Order's name and the country, not an entity name, so they are valid here as they are. `tools/make_og.py` rebuilds them from the lockup files without any font | Official elements | Rebuild with `tools/make_og.py` once `LCK-02` exists |
| FAV-01 | Favicons (16, 32, 180, 192 px and `favicon.ico`): the red shield | `static/img/favicon/*`, `static/favicon.ico` | `layout()` in `build.py` | Grand Magistry Entities Theme favicon set | Official | — |
| FNT-01 | Asap, EB Garamond | `static/fonts/*.woff2` | `@font-face` in `site.css` | Fontsource builds, SIL Open Font License | Licensed | — (EB Garamond pending confirmation) |
| PH-* | Photographs from events | `static/media/YYYY/MM/*.jpg`, `*.jpeg` | Post front matter (`image`) and bodies | Imported from the media library of cmm.maltezskyrad.cz, at most 1200 px wide | Rights inherited from the current site. **Consent not documented.** | See "Photographs" below |
| DOC-* | Posters, leaflets and PDF invitations | `static/media/YYYY/MM/*.png`, `*.pdf` | Post bodies | Imported from the current site | Historical documents; several carry the old, non-compliant logo | Client's decision: keep as archive, replace, or remove |

Not on the site, and not to be created: the old logo (`logo…`, `cropped-logo…`, `Logo_800-570…`, `ples_logo.png`), the old header image, the theme's `author.jpg`, the armorial bearing, logos of other organisations, invented icons or emblems.

## Photographs: consent

The activities are for young people with disabilities from the age of 15, so **the photographs show identifiable people, some of them minors and many of them in a vulnerable group**. Publishing them needs consent (for minors, of their legal representative). The old site published them; we found no record of consent. Before production launch the client must confirm consent for each post below, or name the photographs to remove. A photograph is removed by deleting its `<img>` from the post and its file from `static/media/`.

**Interim measure: the flag `"photos": "consent-pending"`.** Every post in the table below carries it in its front matter. `build.py` then builds the post without any `<img>` from its body (figures, captions and photo links included) and without its main picture and link-preview image, so the text stays but no photograph is shown, in the gallery either. Remove the flag from a post once consent for its photographs is confirmed; when every post is cleared, delete the table. The files stay in `static/media/` in the repository, but they are **not deployed**: `build.py` does not copy to `dist/media/` any image a flagged post no longer shows (nor any file used only by a draft, scheduled or withdrawn post, such as `pansky-cundr`) unless a published page or post still shows it, and `check.py` fails if such a file is in `dist/`. Files that stay linked in a flagged post's text (PDF attachments) are still deployed.

| Date | Post | Photographs | Folder |
|---|---|---|---|
| 2025-04-20 | Ohlédnutí za událostmi České maltézské mládeže roku 2024 | 16 | `/media/2025/04/` |
| 2025-04-20 | Jarní výlet do Vranova | 11 | `/media/2025/04/` |
| 2023-12-18 | Koncert HATFIELD COLLEGE CHAPEL CHOIR v řádovém kostele | 1 | `/media/2023/12/` |
| 2023-11-28 | Koncert k punči I | 2 | `/media/2023/11/` |
| 2023-11-08 | PODZIMNÍ VÝLET DO SRNÍ VOL.2 | 15 | `/media/2023/11/` |
| 2023-10-01 | Reportáž z Pavlínčina a Igorova výletu lodí Queen Victoria | 4 | `/media/2023/10/` |
| 2023-09-24 | Reportáž z poutě do Santiaga de Compostely | 8 | `/media/2023/09/` |
| 2023-08-28 | MALTACAMP BELGIE 2023 | 16 | `/media/2023/08/` |
| 2023-08-07 | Letní tábor České maltézské mládeže 2023 | 30 | `/media/2023/08/` |
| 2023-06-22 | VÍKEND SPOLEČNĚ NA VODĚ | 4 | `/media/2023/06/` |
| 2023-06-12 | Česká maltézská mládež se zúčastnila 65. mezinárodní pouti Maltézského řádu do Lurd | 10 | `/media/2023/06/` |
| 2023-04-16 | PŘIHLAŠOVÁNÍ NA 4. LETNÍ TÁBOR ČESKÉ MALTÉZSKÉ MLÁDEŽE | 5 | `/media/2023/04/` |
| 2023-04-16 | JARNÍ VÝLET DO DVORA KRÁLOVÉ | 11 | `/media/2023/04/` |
| 2022-10-10 | Lebanon Camp 2022 | 38 | `/media/2022/10/` |
| 2022-09-01 | Třetí letní tábor České maltézské mládeže, srpen 2022 | 17 | `/media/2022/09/` |
| 2020-03-17 | KORONAVIRUS – Česká maltézská mládež chce pomáhat! | 1 | `/media/2020/03/` |
| 2019-09-28 | Charitativní koncert v kostele Svatého Mikuláše | 1 | `/media/2019/09/` |
| 2019-08-20 | Český tým se i letos zúčastnil mezinárodního tábora Malta Camp | 5 | `/media/2019/08/` |
| 2019-04-05 | Ve Velkopřevorském paláci proběhl první charitativní ples České maltézské mládeže | 6 | `/media/2019/04/` |
| 2019-04-05 | Jarní školení dobrovolníků České maltézské mládeže | 5 | `/media/2019/04/` |
| 2018-12-16 | Prodej punče 2018 – Fotogalerie | 15 | `/media/2018/12/` |
| 2018-10-25 | Podzimní školící víkend pro dobrovolníky | 5 | `/media/2018/10/` |
| 2018-10-10 | Malta Camp 2018 | 4 | `/media/2018/10/` |

## Posters and documents (`DOC-*`)

Checked by eye: the 2020 leaflet (`koronavirus_letacek.png`) carries the old logo. The others, and every PDF, should be checked the same way before a decision.

- `/media/2018/11/koncert_cmm.png`
- `/media/2018/12/koncert_cmm_2.png`
- `/media/2018/12/koncert_cmm_3.png`
- `/media/2018/12/koncert_cmm_4.png`
- `/media/2018/12/koncertovy-plakat-15.12.pdf`
- `/media/2018/12/koncertovy-plakat-22.12.pdf`
- `/media/2018/12/koncertovy-plakat-9.12..pdf`
- `/media/2019/01/invitation_card_cz.pdf`
- `/media/2019/11/Grantove_podminky_2019-2020.pdf`
- `/media/2019/11/cmm-adventni_koncert-1-1.pdf`
- `/media/2019/11/cmm-adventni_koncert-1-1.png`
- `/media/2019/12/cmm-adventni_koncert-2-1.pdf`
- `/media/2019/12/cmm-adventni_koncert-2-1.png`
- `/media/2019/12/cmm-adventni_koncert-3-1.pdf`
- `/media/2019/12/cmm-adventni_koncert-3-1.png`
- `/media/2019/12/cmm-adventni_koncert-4-1.pdf`
- `/media/2019/12/cmm-adventni_koncert-4-1.png`
- `/media/2020/03/koronavirus.pdf`
- `/media/2020/03/koronavirus_letacek.png`
- `/media/2022/02/Ukraine_conflict_vyzva_CMM-1.pdf`
- `/media/2023/12/HCCC-tour-programme.pdf`
