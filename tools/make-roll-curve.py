# -*- coding: utf-8 -*-
"""Draw the roll-curve diagram: normal, Advantage, Disadvantage.

    python tools/make-roll-curve.py

Writes docs/assets/diagrams/roll-curve-comparison.svg.

Drawn as fitted bells rather than the exact distribution. 2d10 is
genuinely triangular - linear up to 11, linear down - so a faithful plot
has a hard corner at the top, which a reader takes for a drawing mistake
rather than for the truth. Each curve keeps its real centre and spread, so
the shift and the shape are honest; it is a picture of where the odds sit,
not a table to read values off. The exact numbers live in the Difficulty
Chart and in rules.md.

Centres and spreads are computed from the real distributions rather than
typed in, so if the dice ever change the picture follows.
"""
import io
import math
import os
from collections import Counter
from itertools import product

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "assets", "diagrams", "roll-curve-comparison.svg")
NL = chr(10)

# the book's palette, as the other diagrams use it
INK = "#eaf5fb"
DIM = "#5c7d92"
RULE = "#3a4552"
GREEN = "#4caf7d"
GREY = "#8fadbe"
RED = "#d1584f"

W, H = 680, 320
L, R, T, B = 46, 18, 58, 52          # margins
PW, PH = W - L - R, H - T - B


def distributions():
    normal, adv, dis = Counter(), Counter(), Counter()
    for a, b in product(range(1, 11), repeat=2):
        normal[a + b] += 1
    for a, b, c in product(range(1, 11), repeat=3):
        s = sorted((a, b, c))
        adv[s[0] + s[1]] += 1
        dis[s[1] + s[2]] += 1
    return [("Normal", normal, 100), ("Advantage", adv, 1000),
            ("Disadvantage", dis, 1000)]


def moments(counts, total):
    mean = sum(k * v for k, v in counts.items()) / total
    var = sum((k - mean) ** 2 * v for k, v in counts.items()) / total
    return mean, math.sqrt(var)


def x_px(v):
    return L + (v - 2) / 18.0 * PW


def y_px(v):
    return T + PH - (v / 1.06) * PH      # 1.0 peak, with headroom


def bell_path(mean, sd, close):
    """A Gaussian sampled finely enough to read as a curve at print size."""
    pts = []
    x = 2.0
    while x <= 20.0001:
        z = (x - mean) / sd
        pts.append((x_px(x), y_px(math.exp(-0.5 * z * z))))
        x += 0.1
    d = "M %.1f %.1f " % pts[0] + " ".join("L %.1f %.1f" % p for p in pts[1:])
    if close:
        d += " L %.1f %.1f L %.1f %.1f Z" % (x_px(20), y_px(0), x_px(2), y_px(0))
    return d


stats = {n: moments(c, t) for n, c, t in distributions()}
s = []
add = s.append

add('<svg width="%d" height="%d" viewBox="0 0 %d %d" '
    'xmlns="http://www.w3.org/2000/svg" role="img">' % (W, H, W, H))
add("<title>The roll curve, with Advantage and Disadvantage</title>")
add("<desc>Every core roll is 2d10 under a target, so lower is better. A normal "
    "roll centres on 11. Advantage keeps the lowest two of three dice and centres "
    "near 8.5; Disadvantage keeps the highest two and centres near 13.5. The shape "
    "is the same in each case - only its position moves, by about two and a half "
    "points either way.</desc>")

# horizontal rules, behind everything
for frac in (0.25, 0.5, 0.75, 1.0):
    y = y_px(frac)
    add('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="%s" stroke-width="1" '
        'opacity="0.25"/>' % (L, y, L + PW, y, RULE))

# the curves, palest first so the strokes stay legible where they cross
for name, colour in (("Normal", GREY), ("Advantage", GREEN), ("Disadvantage", RED)):
    mean, sd = stats[name]
    add('<path d="%s" fill="%s" fill-opacity="0.14" stroke="none"/>'
        % (bell_path(mean, sd, True), colour))
for name, colour in (("Normal", GREY), ("Advantage", GREEN), ("Disadvantage", RED)):
    mean, sd = stats[name]
    add('<path d="%s" fill="none" stroke="%s" stroke-width="2.4" '
        'stroke-linecap="round" stroke-linejoin="round"/>'
        % (bell_path(mean, sd, False), colour))

# centre markers
for name, colour in (("Advantage", GREEN), ("Normal", GREY), ("Disadvantage", RED)):
    mean, _ = stats[name]
    add('<circle cx="%.1f" cy="%.1f" r="4.5" fill="%s" stroke="#0a1720" '
        'stroke-width="1.5"/>' % (x_px(mean), y_px(1.0), colour))

# axis
add('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="%s" stroke-width="1.2"/>'
    % (L, y_px(0), L + PW, y_px(0), RULE))
for v in range(2, 21):
    x = x_px(v)
    add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" '
        'stroke-width="1"/>' % (x, y_px(0), x, y_px(0) + 4, RULE))
    add('<text x="%.1f" y="%.1f" text-anchor="middle" font-family="sans-serif" '
        'font-size="10" fill="%s">%d</text>' % (x, y_px(0) + 17, DIM, v))
add('<text x="%.1f" y="%d" text-anchor="middle" font-family="sans-serif" '
    'font-size="11" fill="%s">Roll result &#8212; lower is better</text>'
    % (L + PW / 2.0, H - 12, DIM))
add('<text x="14" y="%.1f" text-anchor="middle" font-family="sans-serif" '
    'font-size="11" fill="%s" transform="rotate(-90 14 %.1f)">Likelihood</text>'
    % (T + PH / 2.0, DIM, T + PH / 2.0))

# legend
legend = [("Advantage", GREEN, "keeps the lowest two of 3d10"),
          ("Normal", GREY, "2d10"),
          ("Disadvantage", RED, "keeps the highest two")]
x = L
for label, colour, note in legend:
    add('<line x1="%d" y1="24" x2="%d" y2="24" stroke="%s" stroke-width="3" '
        'stroke-linecap="round"/>' % (x, x + 16, colour))
    add('<text x="%d" y="28" font-family="sans-serif" font-size="12" '
        'font-weight="700" fill="%s">%s</text>' % (x + 23, INK, label))
    x += 23 + len(label) * 7 + 10
    add('<text x="%d" y="28" font-family="sans-serif" font-size="11" '
        'fill="%s">%s</text>' % (x, DIM, note))
    x += len(note) * 5.6 + 22

# the one number worth stating, since the axis has none
add('<text x="%d" y="44" font-family="sans-serif" font-size="11" fill="%s">'
    'Centres: %.1f &#183; %.1f &#183; %.1f &#8212; about two and a half points either way'
    '</text>' % (L, DIM, stats["Advantage"][0], stats["Normal"][0],
                 stats["Disadvantage"][0]))

add("</svg>")

io.open(OUT, "w", encoding="utf-8", newline=NL).write(NL.join(s) + NL)
print("wrote docs/assets/diagrams/roll-curve-comparison.svg")
for n in ("Advantage", "Normal", "Disadvantage"):
    m, sd = stats[n]
    print("  %-14s centre %5.2f  spread %4.2f" % (n, m, sd))
