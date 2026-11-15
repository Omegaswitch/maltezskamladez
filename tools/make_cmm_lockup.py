#!/usr/bin/env python3
"""Builds the three-line "Directions" lockup of Česká maltézská mládež per the Coat of Arms guidelines (CoA pp. 53-60):
the official shield, MALTÉZSKÝ ŘÁD, ČESKÁ REPUBLIKA, a rule, and ČESKÁ MALTÉZSKÁ MLÁDEŽ in red. Writes cmm-lockup.svg,
cmm-lockup-white-bg.svg, cmm-lockup-on-dark.svg and cmm-lockup-spec.svg (the clear-space sheet) to the output folder.

    pip install fonttools && python3 tools/make_cmm_lockup.py /path/to/centurygothic_bold.ttf [output folder]

The output folder defaults to docs/lockup-preview/. Spacing was measured on CoA p. 55 at 300 dpi, with x = shield height:
Y = 0.0876x is the clear space and the shield-to-text gap; line 1 has cap height 0.175x, level with the shield top; line 2
cap height 0.13x, 0.061x below line 1; the rule is 0.015x thick, 0.074x above and below, and starts 0.017x left of the
text; the tick is 0.013x wide by 0.17x; the direction line has cap height 0.15x and is indented Y from the rule start.

It must be run with the licensed Century Gothic Bold (Monotype; not in the repository). The preview in docs/lockup-preview/
used URW Gothic Demi as a stand-in, so it is only a preview: the final version (asset LCK-02, docs/asset-manifest.md)
is pending the licensed font and approval. Nothing here is used on the site.
"""
import re, sys
from pathlib import Path
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
font_path, out = sys.argv[1], Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / 'docs' / 'lockup-preview'
src = (ROOT / 'static' / 'img' / 'lockup' / 'cs.svg').read_text()  # the official shield, as in the lockup files
shield = src[src.index('<g '):src.index('</g>') + 4]
X = 126.0
SHIELD_TOP, SHIELD_RIGHT, TRACK = 0.19, 109.77, -0.010
RED = '#e31818'
font = TTFont(font_path); gs, cmap = font.getGlyphSet(), font.getBestCmap()

def line(text, left, baseline, cap):
    h = BoundsPen(gs); gs[cmap[ord('H')]].draw(h); k = cap / h.bounds[3]
    f = BoundsPen(gs); gs[cmap[ord(text[0])]].draw(f)
    x = left - f.bounds[0] * k
    pen, box = SVGPathPen(gs), BoundsPen(gs)
    for ch in text:
        g = gs[cmap[ord(ch)]]
        for p in (pen, box): g.draw(TransformPen(p, (k, 0, 0, -k, x, baseline)))
        x += (g.width + TRACK * font['head'].unitsPerEm) * k
    return re.sub(r'(\d+\.\d{2})\d+', r'\1', pen.getCommands()), box.bounds

# Geometry measured on the guidelines' "Zona di respirazione" drawing with a direction line (CoA p. 55, 300 dpi;
# shield height 525 px = x). Y = 46 px = 0.0876x: clear space on every side, shield-to-text gap, direction indent.
x = X
Y = 0.0876 * x
SHIELD_LEFT, SHIELD_BOTTOM = -0.2, 126.2
left = SHIELD_RIGHT + Y
c1 = 0.1752 * x; top1 = SHIELD_TOP + 0.0095 * x            # line 1 caps start level with the shield top
d1, bb1 = line('MALTÉZSKÝ ŘÁD', left, top1 + c1, c1)
c2 = 0.1295 * x; top2 = top1 + c1 + 0.0610 * x
d2, bb2 = line('ČESKÁ REPUBLIKA', left, top2 + c2, c2)
rule_y = top2 + c2 + 0.0743 * x                            # rule sits 0.074x under line 2's baseline
t = 0.0152 * x                                             # rule weight
rule_l = left - 0.0171 * x
c3 = 0.1505 * x; top3 = rule_y + t + 0.0743 * x
d3, bb3 = line('ČESKÁ MALTÉZSKÁ MLÁDEŽ', rule_l + Y, top3 + c3, c3)
rule_r = max(bb1[2], bb2[2], bb3[2]) + 0.0324 * x
tick_w, tick_h = 0.0133 * x, 0.1695 * x                    # tick runs down to the middle of the direction caps
ink_top = min(SHIELD_TOP, bb1[1]); ink_bottom = max(SHIELD_BOTTOM, bb3[3])
ink_left, ink_right = SHIELD_LEFT, max(rule_r, bb1[2], bb3[2])
vx, vy = ink_left - Y, ink_top - Y
w, h = ink_right - ink_left + 2 * Y, ink_bottom - ink_top + 2 * Y

def svg(text_fill, bg=None):
    vb = f'{vx:.2f} {vy:.2f} {w:.2f} {h:.2f}'
    rect = f'<rect x="{vx:.2f}" y="{vy:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w * 3:.0f}" height="{h * 3:.0f}">'
            f'<title>Maltézský řád – Česká republika – Česká maltézská mládež</title>{rect}'
            f'<g transform="translate(0 0)">{shield.replace("<g ", "<g ", 1)}</g>'
            f'<path fill="{text_fill}" d="{d1}"/><path fill="{text_fill}" d="{d2}"/>'
            f'<rect x="{rule_l:.2f}" y="{rule_y:.2f}" width="{rule_r - rule_l:.2f}" height="{t:.2f}" fill="{text_fill}"/>'
            f'<rect x="{rule_l:.2f}" y="{rule_y:.2f}" width="{tick_w:.2f}" height="{tick_h:.2f}" fill="{text_fill}"/>'
            f'<path fill="{RED}" d="{d3}"/></svg>')

out.mkdir(parents=True, exist_ok=True)
(out / 'cmm-lockup.svg').write_text(svg('#000'))
(out / 'cmm-lockup-white-bg.svg').write_text(svg('#000', '#fff'))
(out / 'cmm-lockup-on-dark.svg').write_text(svg('#fff', '#454545'))
print('ok', round(w), round(h))

# Spec sheet: clear-space frame and Y guides, like CoA p. 55.
g = '#999'; sw = 0.35
guides = (f'<rect x="{vx:.2f}" y="{vy:.2f}" width="{w:.2f}" height="{h:.2f}" fill="none" stroke="{g}" stroke-width="{sw}"/>'
          f'<path d="M{ink_left:.2f} {vy:.2f}V{vy + h:.2f}M{ink_right:.2f} {vy:.2f}V{vy + h:.2f}M{vx:.2f} {ink_top:.2f}H{vx + w:.2f}M{vx:.2f} {ink_bottom:.2f}H{vx + w:.2f}'
          f'M{SHIELD_RIGHT:.2f} {vy:.2f}V{ink_bottom:.2f}M{left:.2f} {vy:.2f}V{ink_bottom:.2f}M{rule_l + Y:.2f} {rule_y:.2f}V{ink_bottom:.2f}" stroke="{g}" stroke-width="{sw}" stroke-dasharray="1.2 1"/>')
pad = 14
spec = svg('#000', '#fff').replace(f'viewBox="{vx:.2f} {vy:.2f} {w:.2f} {h:.2f}" width="{w * 3:.0f}" height="{h * 3:.0f}"',
    f'viewBox="{vx - pad:.2f} {vy - pad:.2f} {w + 2 * pad:.2f} {h + 2 * pad:.2f}" width="{(w + 2 * pad) * 3:.0f}" height="{(h + 2 * pad) * 3:.0f}" style="background:#fff"')
lbl = lambda x_, y_, s: f'<text x="{x_:.2f}" y="{y_:.2f}" font-family="sans-serif" font-size="4.5" fill="#666">{s}</text>'
spec = spec.replace('</svg>', guides + lbl(vx + 1, vy - 2, 'Y') + lbl(SHIELD_RIGHT + 1, vy - 2, 'Y') + lbl(ink_right + 1, vy - 2, 'Y')
                    + lbl(vx - 6, vy + Y * 0.7, 'Y') + lbl(vx - 6, ink_bottom + Y * 0.7, 'Y') + lbl(rule_l + 1, ink_bottom + 4, 'Y') + '</svg>')
(out / 'cmm-lockup-spec.svg').write_text(spec)
