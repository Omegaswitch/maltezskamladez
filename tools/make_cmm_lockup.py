"""Builds the lockups of Česká maltézská mládež: adds the red "direction" line (CoA pp. 54-55, 60) to the existing banner lockups without touching them.

The shield and lines 1-2 are copied byte-for-byte from static/img/lockup/<lang>.svg (Century Gothic Bold outlines,
built by tools/make_lockup.py), so the existing lockup keeps its exact spacing and its viewBox origin and height.
Below line 2 it adds the rule with its tick and the direction line, using that lockup's own Y = 0.077x (x = shield
height 126) and the proportions measured on CoA p. 55: rule 0.015x thick, Y under line 2's baseline and Y above the
direction caps, starting 0.017x left of the text and ending 0.032x past the longest line; tick 0.013x wide, 0.17x
long; direction cap height 0.15x, indented Y from the rule start; red #e31818.

    python3 tools/make_cmm_lockup.py static/img/lockup docs/lockup-preview /path/to/centurygothic_bold.ttf tools/cmm-directions.json

Writes <lang>.svg (white lettering, for the banner photo) and <lang>-dark-text.svg (for light backgrounds); rename
to cmm-<lang>*.svg as in docs/lockup-preview. Same method as maltezskyrad.cz tools/make_direction_lockup.py
(Grand Priory lockup). The direction line must be set in Century Gothic Bold (licensed, not in the repository);
the preview used URW Gothic Demi as a stand-in for that line only. The translated names in cmm-directions.json
are the site's own (content/site.json) and await confirmation by the Grand Priory.
"""
import re, sys
from pathlib import Path
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

src_dir, out_dir, font_path = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
import json
DIRECTION = {"cs": "ČESKÉ VELKOPŘEVORSTVÍ", "en": "GRAND PRIORY OF BOHEMIA", "fr": "GRAND PRIEURÉ DE BOHÊME",
             "it": "GRAN PRIORATO DI BOEMIA", "de": "GROSSPRIORAT BÖHMEN"}
X = 126.0; Y = 0.077 * X
SHIELD_TOP, SHIELD_RIGHT, TRACK, RED = 0.19, 109.77, -0.010, "#e31818"
LEFT = SHIELD_RIGHT + Y                                  # as in make_lockup.py
B2 = SHIELD_TOP + 0.186 * X + 0.053 * X + 0.127 * X      # line 2 baseline, as in make_lockup.py
if len(sys.argv) > 4: DIRECTION = json.loads(Path(sys.argv[4]).read_text())  # {"cs": "...", ...}
font = TTFont(font_path); gs, cmap = font.getGlyphSet(), font.getBestCmap()

def line(text, left, baseline, cap):
    h = BoundsPen(gs); gs[cmap[ord("H")]].draw(h); k = cap / h.bounds[3]
    f = BoundsPen(gs); gs[cmap[ord(text[0])]].draw(f)
    x = left - f.bounds[0] * k
    pen, box = SVGPathPen(gs), BoundsPen(gs)
    for ch in text:
        g = gs[cmap[ord(ch)]]
        for p in (pen, box): g.draw(TransformPen(p, (k, 0, 0, -k, x, baseline)))
        x += (g.width + TRACK * font["head"].unitsPerEm) * k
    return re.sub(r"(\d+\.\d{2})\d+", r"\1", pen.getCommands()), box.bounds

def text_right(svg):
    # rightmost x of the existing text paths (after the shield group); all coordinates are absolute
    tail = svg[svg.index("</g>"):]
    nums = [float(n) for d in re.findall(r' d="([^"]+)"', tail) for n in re.findall(r"-?\d+(?:\.\d+)?", d)]
    return max(nums[0::2])

out_dir.mkdir(parents=True, exist_ok=True)
for lang, words in DIRECTION.items():
    svg = (src_dir / f"{lang}.svg").read_text()
    vx, vy, vw, vh = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    t = 0.0152 * X
    rule_y = B2 + Y
    rule_l = LEFT - 0.0171 * X
    cap3 = 0.1505 * X
    b3 = rule_y + t + Y + cap3
    d3, bb3 = line(words, rule_l + Y, b3, cap3)
    rule_r = max(text_right(svg), bb3[2]) + 0.0324 * X
    w = max(vw, rule_r - vx + 0.5)
    assert b3 < vy + vh, "direction line must stay inside the existing height"
    fill = re.search(r'</g><path fill="([^"]+)"', svg).group(1)   # the text colour of this lockup
    add = (f'<rect x="{rule_l:.2f}" y="{rule_y:.2f}" width="{rule_r - rule_l:.2f}" height="{t:.2f}" fill="{fill}"/>'
           f'<rect x="{rule_l:.2f}" y="{rule_y:.2f}" width="{0.0133 * X:.2f}" height="{0.1695 * X:.2f}" fill="{fill}"/>'
           f'<path fill="{RED}" d="{d3}"/>')
    vb = re.search(r'viewBox="([^"]+)"', svg).group(1).split()
    vb[2] = f"{w:.1f}"
    new = re.sub(r'viewBox="[^"]+"', f'viewBox="{" ".join(vb)}"', svg, count=1)
    new = re.sub(r'(<svg[^>]*?) width="[\d.]+"', lambda m: f'{m.group(1)} width="{w:.1f}"', new, count=1)
    new = new.replace("</svg>", add + "</svg>")
    assert new.startswith(svg[:svg.index("<g ")].split(" viewBox")[0]) and svg[svg.index("<g "):-6] in new  # original art kept verbatim
    (out_dir / f"{lang}.svg").write_text(new)
    dark = new.split("</g>", 1); dark = dark[0] + "</g>" + dark[1].replace(f'fill="{fill}"', 'fill="#000"')
    (out_dir / f"{lang}-dark-text.svg").write_text(dark)
    print(lang, f"w {vw:g} -> {w:.1f}, h {vh:g} (unchanged), direction baseline {b3:.1f}")
