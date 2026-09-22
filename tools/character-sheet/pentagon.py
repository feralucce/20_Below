# -*- coding: utf-8 -*-
"""The centre pentagon on its own, traced 1:1 from 'GIVE ME THIS 2.png'.

The guide's five corners are used exactly as they are - it is slightly
irregular, like the emblem - and the shape is placed so its vertex
centroid sits on the emblem's centre.

Output is the full 2550 x 3300 canvas with nothing else on it, so it
drops into the PSD at 0,0 and 100%.
"""
import io, os

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, "Branding", "character-sheet")
os.makedirs(OUT, exist_ok=True)

W, H = 2550, 3300
CX, CY = 1274.5, 1377.5           # the emblem's centre

# corners as traced off the guide, in its own 616 x 522 space
GUIDE = [(120.0, 0.0), (495.0, 0.0), (615.0, 299.0), (309.5, 521.0), (0.0, 294.0)]
GC = (sum(p[0] for p in GUIDE) / 5.0, sum(p[1] for p in GUIDE) / 5.0)
# Centring the traced guide on the emblem's centre is close but not where
# it actually belongs: the placement that lines up with the star is the
# one in the PSD, and this is the difference between the two, measured
# off that layer's ink rather than guessed.
NUDGE = (3.0, -21.0)
OFF = (CX - GC[0] + NUDGE[0], CY - GC[1] + NUDGE[1])
PTS = [(x + OFF[0], y + OFF[1]) for x, y in GUIDE]

WHITE = "#FFFFFF"
CPANEL = "#12232E"
ACCENT = "#3D84C4"
READ = "#C9DCE8"
DIM = "#8FADBE"
HERO = "Anton, 'Arial Narrow', sans-serif"
DISPLAY = "'Bebas Neue', Anton, 'Arial Narrow', sans-serif"
FILL = 0.78


def mix(a, b, t):
    A = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    B = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#%02X%02X%02X" % tuple(round(A[i] + (B[i] - A[i]) * t) for i in range(3))


def label(x, y, t, size, col, ls=0):
    return ('  <text x="%g" y="%g" font-family="%s" font-size="%g" letter-spacing="%g" '
            'fill="%s" text-anchor="middle">%s</text>' % (x, y, DISPLAY, size, ls, col, t))


path = "M" + " L".join("%g %g" % p for p in PTS) + " Z"
svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" '
       'shape-rendering="geometricPrecision" text-rendering="geometricPrecision">' % (W, H, W, H),
       '  <title>20 Below character sheet - centre pentagon</title>',
       '  <desc>The core roll panel: the pentagon traced from the emblem\'s inner vertices, '
       'carrying the core roll.</desc>',
       '  <path d="%s" fill="%s" fill-opacity="%g" stroke="%s" stroke-width="7" '
       'stroke-opacity="0.9"/>' % (path, CPANEL, FILL, ACCENT),
       label(CX, CY - 150, "THE CORE ROLL", 34, DIM, 5.6),
       '  <text x="%g" y="%g" font-family="%s" font-size="120" font-weight="700" fill="%s" '
       'text-anchor="middle">2d10</text>' % (CX, CY - 30, HERO, WHITE),
       label(CX, CY + 60, "ELEMENT + DIFFICULTY", 36, READ, 2.8),
       label(CX, CY + 130, "ROLL UNDER", 34, mix(ACCENT, "#FFFFFF", 0.45), 5.6),
       '</svg>']

io.open(os.path.join(OUT, "character-sheet-pentagon.svg"), "w", encoding="utf-8",
        newline="\n").write("\n".join(svg) + "\n")
print("corners on canvas: %s" % ", ".join("(%.0f, %.0f)" % p for p in PTS))
print("bbox x %.0f..%.0f  y %.0f..%.0f"
      % (min(p[0] for p in PTS), max(p[0] for p in PTS),
         min(p[1] for p in PTS), max(p[1] for p in PTS)))
