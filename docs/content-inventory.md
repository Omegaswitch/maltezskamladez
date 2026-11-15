# Content inventory

Everything on the old WordPress site (`http://cmm.maltezskyrad.cz/`) on 15 November 2026, and where it is now. The import is `tools/import_wp.py`; it reads the public REST API, passes every text through an allowlist sanitiser and copies only the media the texts use (at most 1200 px wide). Imported texts are marked `"status": "existing"`: carried over, awaiting editorial review.

## Pages

| Old URL | Title | New site | Status |
|---|---|---|---|
| `/` | Aktuality (home) | `/` – new home page; the news listing is `/aktuality/` | new text, awaiting approval |
| `/kdo-jsme/` | O nás | same URL | existing |
| `/nase-aktivity/` | Naše aktivity | same URL | existing |
| `/mam-zajem-o-sluzby/` | Mám zájem o služby | same URL | existing |
| `/chci-byt-dobrovolnikem/` | Chci být dobrovolníkem | same URL | existing |
| `/jak-nas-podporit/` | Jak nás podpořit | same URL | existing |
| `/granty-ceske-maltezske-mladeze/` | Granty | same URL; the acronym is written out | existing |
| `/pravidla-pro-udelovani-grantu/` | Pravidla pro udělování grantů | same URL, under Granty in the menu | existing |
| `/kontakt/` | Kontakt | same URL; the same details shown as a contact card from `content/site.json` | existing |
| `/ochrana-osobnich-udaju/` | Ochrana soukromí | same URL; new privacy notice for this site (`privacy_html` in `build.py`) that keeps the old page's two links | needs approval |
| `/home/` | Naše pravidla ("Pravidla budou brzy doplněna") | redirect to `/` | retired |
| `/formular/` | Formulář (a broken form shortcode) | redirect to `/granty-ceske-maltezske-mladeze/` | retired |

Other old addresses: `/category/galerie/` → `/aktuality/galerie/`, other `/category/…` and `/author/…` → `/aktuality/`, `/feed/` → `/feed.xml`, `/wp-content/uploads/…` → `/media/…` (all in `vercel.json`).

## Withdrawn

- **Pánský čundr** (`content/news/2018/10/09/pansky-cundr.html`): **withdrawn pending editorial review (child safeguarding).** The post names a minor from a youth care facility and describes his drug history. It is taken off the site with the repository's own draft mechanism (`"draft": true` in the front matter, and `"imported": false` so a re-import does not bring it back): it is not built, so it is gone from the post page, the listings, the archives, the gallery, the sitemap and the feed. The old address now answers 404; nothing on the site linked to it. Staff see it in the editor's list as a draft. Reinstating it needs an editor's decision after the text has been rewritten without the identifying details. The text remains in the repository and its history, so it stays readable there while the repository is public (`docs/security-audit.md`, A2).

## What the import changed

- **Old logo and placeholder pictures left out.** Files named `logo…`, `cropped-logo…`, `Logo_800-570…` and `ples_logo.png` are not imported (`docs/brand-compliance.md`). Posts whose main picture was the logo placeholder have no main picture.
- **Acronym written out** in post titles, summaries, bodies and on the grants and grant-rules pages (the communications policy allows no entity acronym): the full name in the right Czech case; defined terms ("dále jen ČMM") were removed. `check.py` fails on the acronym on any page.
- **Photo galleries** became plain photos; two or more in a row are laid out as a grid and each opens its file.
- **Links**: tracking parameters removed from Facebook links; links to the Grand Priory's old host `cvp.maltezskyrad.cz` point to `www.maltezskyrad.cz`; links to WordPress attachment pages removed.
- **One photo was already missing on the old site** (`2025/04/IMG_8041-2.jpg`, in "Ohlédnutí za událostmi … roku 2024"); its reference is dropped.
- **Categories**: WordPress had "Nezařazené" (shown as "Zprávy") and "Galerie"; both are kept.

## For the editorial review

- Legacy texts name the Order as "Suverénní řád maltézských rytířů"; the official short forms are "Suverénní maltézský řád" and "Maltézský řád".
- "Mám zájem o služby" gives a phone number (+420 731 589 705) that differs from the contact page.
- "Výzva … k pomoci obětem konfliktu na Ukrajině" (2022) still asks for donations with a variable symbol; decide whether it stays as an archive item. The Order is apolitical; the text is a humanitarian appeal and is left as written.
- Posters and PDF invitations from 2018–2019 carry the old logo (`docs/asset-manifest.md`).

## Posts (42)

All keep their old URL `/YYYY/MM/DD/slug/`.

| Date | Title | URL | Photos |
|---|---|---|---|
| 2025-04-20 | Ohlédnutí za událostmi České maltézské mládeže roku 2024 | `/2025/04/20/ohlednuti-za-udalostmi-cmm-roku-2024/` | 16 |
| 2025-04-20 | Jarní výlet do Vranova | `/2025/04/20/jarni-vylet-do-vranova/` | 11 |
| 2023-12-18 | Koncert HATFIELD COLLEGE CHAPEL CHOIR v řádovém kostele | `/2023/12/18/koncert-hatfield-college-chapel-choir-v-radovem-kostele/` | 1 |
| 2023-11-28 | Koncert k punči I | `/2023/11/28/koncert-k-punci-i/` | 2 |
| 2023-11-08 | PODZIMNÍ VÝLET DO SRNÍ VOL.2 | `/2023/11/08/podzimni-vylet-do-srni-vol-2/` | 15 |
| 2023-10-01 | Reportáž z Pavlínčina a Igorova výletu lodí Queen Victoria | `/2023/10/01/reportaz-z-pavlincina-a-igorova-vyletu-lodi-queen-victoria/` | 4 |
| 2023-09-24 | Reportáž z poutě do Santiaga de Compostely | `/2023/09/24/reportaz-z-poute-do-santiaga-de-compostely/` | 8 |
| 2023-08-28 | MALTACAMP BELGIE 2023 | `/2023/08/28/maltacamp-belgie-2023/` | 16 |
| 2023-08-07 | Letní tábor České maltézské mládeže 2023 | `/2023/08/07/letni-tabor-cmm-2023/` | 30 |
| 2023-06-22 | VÍKEND SPOLEČNĚ NA VODĚ | `/2023/06/22/vikend-spolecne-na-vode/` | 4 |
| 2023-06-12 | Česká maltézská mládež se zúčastnila 65. mezinárodní pouti Maltézského řádu do Lurd | `/2023/06/12/ceska-maltezska-mladez-se-zucastnila-65-mezinarodni-pouti-maltezskeho-radu-do-lurd/` | 10 |
| 2023-04-16 | PŘIHLAŠOVÁNÍ NA 4. LETNÍ TÁBOR ČESKÉ MALTÉZSKÉ MLÁDEŽE | `/2023/04/16/prihlasovani-na-4-letni-tabor-cmm/` | 5 |
| 2023-04-16 | JARNÍ VÝLET DO DVORA KRÁLOVÉ | `/2023/04/16/jarni-vylet-do-dvora-kralove/` | 11 |
| 2022-10-10 | Lebanon Camp 2022 | `/2022/10/10/lebanon-camp-2022/` | 38 |
| 2022-09-01 | Třetí letní tábor České maltézské mládeže, srpen 2022 | `/2022/09/01/tabor-2022/` | 17 |
| 2022-02-27 | Výzva České maltézské mládeže k pomoci obětem konfliktu na Ukrajině | `/2022/02/27/vyzva-cmm-ke-konfliktu-na-ukrajine/` | 0 |
| 2021-10-03 | Benefiční koncert Smíchovské komorní filharmonie pro Českou maltézskou mládež | `/2021/10/03/pokus/` | 0 |
| 2020-07-01 | Společně na vodu! | `/2020/07/01/spolecne-na-vodu-2/` | 0 |
| 2020-03-17 | KORONAVIRUS – Česká maltézská mládež chce pomáhat! | `/2020/03/17/koronavirus-cmm-chce-pomahat/` | 2 |
| 2019-12-14 | 4. Koncert k punči | `/2019/12/14/4-koncert-k-punci/` | 1 |
| 2019-12-07 | Česká maltézská mládež bude finančně pomáhat handicapovaným osobám a jejich rodinám | `/2019/12/07/cmm-bude-financne-pomahat-handicapovanym-osobam-a-jejich-rodinam/` | 0 |
| 2019-12-07 | 3. Koncert k punči | `/2019/12/07/3-koncert-k-punci/` | 1 |
| 2019-12-03 | 2. Koncert k punči | `/2019/12/03/2-koncert-k-punci/` | 1 |
| 2019-11-23 | Koncert k punči | `/2019/11/23/koncert-k-punci/` | 1 |
| 2019-10-28 | Podzimní výlet České maltézské mládeže do Kroměříže | `/2019/10/28/podzimni-vylet-ceske-maltezske-mladeze-do-kromerize/` | 0 |
| 2019-09-28 | Charitativní koncert v kostele Svatého Mikuláše | `/2019/09/28/charitativni-koncert-v-kostele-svateho-mikulase/` | 1 |
| 2019-08-20 | Český tým se i letos zúčastnil mezinárodního tábora Malta Camp | `/2019/08/20/cesky-tym-se-i-letos-zucastnil-mezinarodniho-tabora-malta-camp/` | 5 |
| 2019-08-20 | Česká maltézská mládež společně splula Vltavu | `/2019/08/20/ceska-maltezska-mladez-spolecne-splula-vltavu/` | 0 |
| 2019-05-08 | Česká maltézská mládež podnikla jarní výlet do Broumova | `/2019/05/08/273/` | 0 |
| 2019-04-05 | Ve Velkopřevorském paláci proběhl první charitativní ples České maltézské mládeže | `/2019/04/05/ve-velkoprevorskem-palaci-probehl-prvni-charitativni-ples-ceske-maltezske-mladeze/` | 6 |
| 2019-04-05 | Jarní školení dobrovolníků České maltézské mládeže | `/2019/04/05/jarni-skoleni-dobrovolniku-ceske-maltezske-mladeze/` | 5 |
| 2019-01-28 | První Charitativní ples České maltézském mládeže | `/2019/01/28/prvni-charitativni-ples-ceske-maltezskem-mladeze/` | 0 |
| 2018-12-16 | Prodej punče 2018 – Fotogalerie | `/2018/12/16/prodej-punce-2018/` | 15 |
| 2018-12-16 | Slavnostní závěr – IV. koncert k punči | `/2018/12/16/216/` | 1 |
| 2018-12-13 | Předvánoční zastavení s dechovým kvintetem – III. koncert k punči | `/2018/12/13/predvanocni-zastaveni-s-dechovym-kvintetem-iii-koncert-k-punci/` | 1 |
| 2018-12-03 | Od baroka po současnost – II. koncert k punči | `/2018/12/03/od-baroka-po-soucasnost-ii-koncert-k-punci/` | 1 |
| 2018-11-17 | Koncert s první adventní hvězdou | `/2018/11/17/koncert-s-prvni-adventni-hvezdou/` | 1 |
| 2018-10-25 | Podzimní školící víkend pro dobrovolníky | `/2018/10/25/podzimni-skolici-vikend-pro-dobrovolniky/` | 5 |
| 2018-10-10 | Podzimní výlet do Břeclavi | `/2018/10/10/podzimni-vylet-do-breclavi/` | 0 |
| 2018-10-10 | Malta Camp 2018 | `/2018/10/10/malta-camp-2018/` | 4 |
| 2018-10-09 | Společně na vodu | `/2018/10/09/spolecne-na-vodu/` | 0 |
| 2018-10-09 | Pánský čundr | withdrawn, see below (was `/2018/10/09/pansky-cundr/`) | 0 |
