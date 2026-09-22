# -*- coding: utf-8 -*-
"""The whole of page 1, drawn in the PSD's own pixel space.

2550 x 3300 at 300 dpi, so the export drops in at 0,0 and 100%. Geometry
is measured off the emblem rather than assumed: its centre, its star
tips, and the radius where its arms actually cross - which is not where a
true pentagram's would, because the emblem is drawn, not constructed.
"""
import io, os, re, math

# Paths are worked out from this file, so the build runs from anywhere
# in the repo and needs no editing on another machine.
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, "Branding", "character-sheet")
MARK = os.path.join(REPO, "Branding", "20belowMark.svg")
os.makedirs(OUT, exist_ok=True)

W, H = 2550, 3300
CX, CY = 1274.5, 1377.5           # the emblem's centre
# The emblem is drawn, not constructed, so nothing here is derived from a
# regular pentagram. The five tip nodes were read off the art; the inner
# vertices are where the arms between them cross.
STAR_INNER = [(1439.5, 1134.0), (1547.5, 1409.1), (1273.5, 1602.1),
         (1001.5, 1411.6), (1110.5, 1134.0)]

# Panel centres as they sat in the PSD, mapped back out of its layer
# transform so they land where they were without the stretch.
# measured off "give me this.png" - Air sits 12px higher than Earth there,
# so it does here too
PANELS = {"MOIRA": (884, 398), "EARTH": (125, 976), "AIR": (1643, 964),
          "WATER": (249, 1722), "FIRE": (1520, 1722)}

WHITE = "#FFFFFF"
CPANEL = "#12232E"
ACCENT = "#3D84C4"
CYAN = "#3FD0E0"
READ = "#C9DCE8"
DIM = "#8FADBE"
RULE = "#5C7488"
# Anton set as a black condensed face and read as a wall. Headings are
# the body face at semibold with air between the letters instead.
HERO = "'Segoe UI Semibold', 'Segoe UI', Montserrat, system-ui, sans-serif"
# The small captions were set in the same condensed face as the headings
# and suffered worse for it: at 25 units a narrow face is a smudge.
DISPLAY = "'Segoe UI', Montserrat, system-ui, sans-serif"
BODY = "Montserrat, 'Segoe UI', system-ui, sans-serif"

EARTH, AIR, FIRE, WATER, MOIRA = "#8A6D4E", "#A8C9E0", "#E0663F", "#078F9B", "#A06FD1"
SOC, MENT = "#D99A3D", "#A06FD1"
C_OK, C_GOLD, C_AIR = "#6FBF73", "#E0A85C", "#6FB8E0"
GREEN = "#7BC47F"

FILL = 0.78                       # panels: see the art through them, but read
BOXFILL = 0.55
MARGIN = 117
INNER = W - 2 * MARGIN
PANEL_W, PANEL_H = 781, 427
BOTTOM_EDGE = 3138   # every page's content ends flush here
S = PANEL_W / 702.0   # the panel grew, so everything inside it grows with it

ELEMENTS = [
    ("MOIRA", MOIRA, "FATE", [("ATROPOS", "Physical Defense"), ("KLOTHO", "Lucky number")]),
    ("AIR", AIR, "PRECISION", [("INITIATIVE", "Turn order"), ("PSYCHE", "Mental wall")]),
    ("FIRE", FIRE, "INTENSITY", [("FEROCITY", "Ki on a die"), ("PRESENCE", "Social wall")]),
    ("WATER", WATER, "ADAPTATION", [("STAMINA", "Token caps"), ("HEALTH", "Health Levels")]),
    ("EARTH", EARTH, "FORCE", [("SOAK", "Physical wall"), ("POTENCE", "Lift and break")]),
]
FIGURED = [("DEFENCE", "10 - Atropos", ACCENT), ("SOCIAL DEF", "10 - Psyche", SOC),
           ("MENTAL DEF", "10 - Presence", MENT), ("MOVEMENT", "5 + Air, metres", GREEN),
           ("CARRY", "Potence^2 x 10 kg", EARTH)]
VIT = [("HEALTH LEVELS", C_OK, "5 + HEALTH", "0 UNCONSCIOUS, BELOW DYING"),
       ("POISE", C_GOLD, "5 + PRESENCE", "0 FLUSTERED, BELOW HUMILIATED"),
       ("SANITY", C_AIR, "5 + PSYCHE", "0 OVERWHELMED, BELOW SHATTERED")]

P = []
FIELDS = []


def field(fid, kind, x, y, w, h, **extra):
    """Register a named region so the app can lay a live control over it."""
    f = {"id": fid, "kind": kind, "page": 1,
         "x": round(x, 1), "y": round(y, 1), "w": round(w, 1), "h": round(h, 1)}
    f.update(extra)
    FIELDS.append(f)


def add(*l):
    P.extend(l)


def mix(a, b, t):
    A = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    B = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#%02X%02X%02X" % tuple(round(A[i] + (B[i] - A[i]) * t) for i in range(3))


def panel_path(x, y, w, h, r):
    return ("M%g %g H%g A%g %g 0 0 1 %g %g V%g A%g %g 0 0 1 %g %g H%g "
            "A%g %g 0 0 1 %g %g V%g A%g %g 0 0 1 %g %g Z"
            % (x + r, y, x + w - r, r, r, x + w, y + r, y + h - r, r, r,
               x + w - r, y + h, x + r, r, r, x, y + h - r, y + r, r, r, x + r, y))


def poly(cx, cy, r, rot=90.0, n=5):
    pts = ["%g %g" % (cx + r * math.cos(math.radians(rot + i * 360.0 / n)),
                      cy + r * math.sin(math.radians(rot + i * 360.0 / n))) for i in range(n)]
    return "M" + " L".join(pts) + " Z"


def box(x, y, s, col, w=5.4, r=14):
    add('  <rect x="%g" y="%g" width="%g" height="%g" rx="%g" fill="#01050A" '
        'fill-opacity="%g" stroke="%s" stroke-width="%g"/>' % (x, y, s, s, r, BOXFILL, col, w))


def label(x, y, t, size, col, ls=0, anchor="start"):
    add('  <text x="%g" y="%g" font-family="%s" font-size="%g" letter-spacing="%g" '
        'fill="%s" text-anchor="%s">%s</text>' % (x, y, DISPLAY, size, ls, col, anchor, t))


def text(x, y, t, size, col, anchor="start", weight=500):
    add('  <text x="%g" y="%g" font-family="%s" font-size="%g" font-weight="%g" '
        'fill="%s" text-anchor="%s">%s</text>' % (x, y, BODY, size, weight, col, anchor, t))


def hero(x, y, t, size, col, anchor="start"):
    add('  <text x="%g" y="%g" font-family="%s" font-size="%g" font-weight="700" '
        'fill="%s" text-anchor="%s">%s</text>' % (x, y, HERO, size, col, anchor, t))


def line(x, y, w, col=RULE, op=0.7, th=3):
    add('  <rect x="%g" y="%g" width="%g" height="%g" fill="%s" fill-opacity="%g"/>'
        % (x, y, w, th, col, op))


def frame(x, y, w, h, col, title=None, note=None):
    pp = panel_path(x, y, w, h, 42)
    add('  <path d="%s" fill="#01050A" fill-opacity="0.55"/>' % pp,
        '  <path d="%s" fill="none" stroke="%s" stroke-width="5"/>' % (pp, col))
    if title:
        hero(x + 42, y + 66, title, 45, WHITE)
    if note:
        label(x + w - 42, y + 63, note, 32, mix(col, "#FFFFFF", 0.3), 4.8, "end")


ms = io.open(MARK, encoding="utf-8").read()
mw, mh = [float(v) for v in re.search(r'viewBox="([\d.\s-]+)"', ms).group(1).split()[2:]]
mpath = re.search(r"(<path\b[^>]*/>)", ms).group(1)

add('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" '
    'shape-rendering="geometricPrecision" text-rendering="geometricPrecision">' % (W, H, W, H),
    '  <title>20 Below character sheet - page 1</title>',
    '  <desc>The five Elements on the emblem\'s pentagram with their sub-stats, the figured '
    'characteristics, the Vitals and the two pools.</desc>')

# --- header ---------------------------------------------------------------
mark_h = 132
mark_w = mark_h * mw / mh
add('  <svg x="%g" y="78" width="%g" height="%d" viewBox="0 0 %g %g" '
    'preserveAspectRatio="xMidYMid meet" overflow="visible">%s</svg>'
    % (MARGIN, mark_w, mark_h, mw, mh, mpath))
hero(MARGIN + mark_w + 63, 186, "CHARACTER SHEET", 78, WHITE)
field("page.number", "text", W - MARGIN - 600, 150, 600, 48, size=33, align="end")

# Who this is, before anything it can do. No rules under either one:
# they are printed from the character, not written on.
label(MARGIN + mark_w + 63, 252, "NAME", 31, DIM, 3.9)
field("name", "text", MARGIN + mark_w + 207, 216, 723, 48, size=33)
# A concept is a sentence, not a word. It starts where the title ends -
# measured off the rendered art at 957 - which lines the two up and
# leaves it the whole width of the page for two comfortable lines.
CONCEPT_X = 957
label(CONCEPT_X - 174, 252, "CONCEPT", 31, DIM, 3.9)
field("concept", "para", CONCEPT_X, 204, W - MARGIN - CONCEPT_X, 96, lines=2)

# Resting is the one thing a player does to the whole sheet at once, so
# it sits under the name rather than inside any one block. Stacked, and
# low enough to clear the header outright.
for i, (lab, fid) in enumerate((("SHORT REST", "rest.short"),
                                ("LONG REST", "rest.long"))):
    byy = 336 + i * 84
    pp = panel_path(MARGIN, byy, 294, 66, 33)
    add('  <path d="%s" fill="#01050A" fill-opacity="0.55"/>' % pp,
        '  <path d="%s" fill="none" stroke="%s" stroke-width="4.5"/>' % (pp, ACCENT))
    label(MARGIN + 147, byy + 42, lab, 31, mix(ACCENT, "#FFFFFF", 0.4), 3.6, "middle")
    field(fid, "button", MARGIN, byy, 294, 66)

# --- the centre pentagon, on the emblem's own crossings -------------------
# The reference carries no centre panel, so neither does this.

# --- an Element panel on each tip -----------------------------------------
for i, (name, col, domain, subs) in enumerate(ELEMENTS):
    x, y = PANELS[name]
    lit = mix(col, "#FFFFFF", 0.5)
    pp = panel_path(x, y, PANEL_W, PANEL_H, 36)
    add('  <path d="%s" fill="%s" fill-opacity="%g"/>' % (pp, mix(CPANEL, col, 0.14), FILL),
        '  <path d="%s" fill="none" stroke="%s" stroke-width="7"/>' % (pp, col))
    hero(x + 42 * S, y + 90 * S, name, 78 * S, WHITE)
    label(x + 44 * S, y + 132 * S, domain, 30 * S, lit, 6.6 * S)
    # No box and no caption: the Element's rating is what the panel is for,
    # so it is simply set large in the space to the right of the sub-stats.
    field("attribute.%s" % name.title(), "text",
          x + PANEL_W - 250 * S, y + 120 * S, 210 * S, 230 * S,
          element=name.title(), size=190 * S, centre=True)
    # rows sit high enough that the second one finishes inside the panel
    ry = y + 168 * S
    for sname, feeds in subs:
        box(x + 48 * S, ry, 84 * S, col)
        field("substat.%s.value" % sname.title(), "text",
              x + 48 * S, ry, 84 * S, 84 * S, sub=sname.title(), element=name.title())
        label(x + 156 * S, ry + 39 * S, sname, 42 * S, WHITE, 4.2)
        text(x + 156 * S, ry + 78 * S, feeds, 28.5 * S, READ)
        # The Descriptors live on page 2, in full and with room. A clipped
        # echo of them here only crowded the rating.
        ry += 102 * S

# --- nature ---------------------------------------------------------------
ny = 2172
NH = 234
frame(MARGIN, ny, INNER, NH, MOIRA, "NATURE")
# The name is sized to the longest Nature in the book - Perfectionist,
# thirteen characters - with five more to spare, and whatever is left
# over is split evenly between the Drive and the trigger. Both are
# sentences, so both wrap.
NAME_W = 396
label(MARGIN + 42, ny + 132, "NATURE", 30, DIM, 3.6)
field("nature.nature", "text", MARGIN + 234, ny + 108, NAME_W, 48, size=33)
rest_x = MARGIN + 234 + NAME_W + 60
half = (INNER - 42 - (rest_x - MARGIN) - 48) / 2.0
for j, (lab, fid) in enumerate((("THE DRIVE", "nature.the_drive"),
                                ("WHAT TRIGGERS A TOKEN", "nature.what_triggers_a_token"))):
    x = rest_x + j * (half + 48)
    label(x, ny + 108, lab, 30, DIM, 3.6)
    field(fid, "para", x, ny + 120, half, 84, lines=2)

# --- figured --------------------------------------------------------------
fy = 2436
frame(MARGIN, fy, INNER, 174, ACCENT, "FIGURED")
fw = (INNER - 96) / 5.0
for i, (name, formula, col) in enumerate(FIGURED):
    x = MARGIN + 48 + i * fw
    box(x, fy + 84, 60, col, 4.5, 12)
    field("figured.%s" % name.title().replace(" ", ""), "text", x, fy + 84, 60, 60,
          readonly=True, formula=formula, centre=True)
    label(x + 84, fy + 108, name, 34, mix(col, "#FFFFFF", 0.45), 3.9)
    text(x + 84, fy + 141, formula, 29, DIM)

# --- vitals and pools -----------------------------------------------------
by = 2634
BH = BOTTOM_EDGE - by
VW = 1506
frame(MARGIN, by, VW, BH, ACCENT, "VITALS")
for i, (lab, col, formula, states) in enumerate(VIT):
    y = by + 132 + i * 120
    label(MARGIN + 48, y, lab, 33, col, 4.2)
    label(MARGIN + 480, y, formula, 30, mix(col, "#FFFFFF", 0.2), 3.3)
    label(MARGIN + 750, y, states, 29, DIM, 2.7)
    vid = lab.split()[0].lower()
    field("vital.%s.pips" % vid, "pips", MARGIN + 48, y + 24, 15 * 57 - 12, 45,
          n=15, size=45, gap=12, vital=vid, color=col)
    for j in range(15):
        add('  <rect x="%g" y="%g" width="45" height="45" rx="9" fill="%s" '
            'fill-opacity="0.16" stroke="%s" stroke-width="3.9"/>'
            % (MARGIN + 48 + j * 57, y + 24, col, col))
    label(MARGIN + 936, y + 60, "-", 42, DIM, 0, "middle")
    field("vital.%s.minus" % vid, "button", MARGIN + 906, y + 15, 60, 60, vital=vid)
    line(MARGIN + 972, y + 66, 78)
    field("vital.%s.current" % vid, "text", MARGIN + 972, y + 24, 78, 48, vital=vid)
    text(MARGIN + 1062, y + 60, "/", 33, DIM)
    line(MARGIN + 1092, y + 66, 78)
    field("vital.%s.max" % vid, "text", MARGIN + 1092, y + 24, 78, 48,
          vital=vid, readonly=True)
    label(MARGIN + 1200, y + 60, "+", 42, DIM, 0, "middle")
    field("vital.%s.plus" % vid, "button", MARGIN + 1170, y + 15, 60, 60, vital=vid)

px0 = 1659
PW = 774
frame(px0, by, PW, BH, CYAN, "POOLS")
# Spaced off the block rather than off a pitch: the boxes are 72 deep and
# the caption above the next row needs its own air, so each row is placed
# where it actually clears the one before it.
for lab, col, note, dy in (("KI", CYAN, "TOP ELEMENT + 8", 126),
                           ("FATE TOKENS", MOIRA, "HELD: STAMINA x 3", 270)):
    y = by + dy
    label(px0 + 48, y, lab, 33, mix(col, "#FFFFFF", 0.45), 4.2)
    label(px0 + 348, y, note, 29, DIM, 2.7)
    pid = "ki" if lab == "KI" else "fate"
    box(px0 + 48, y + 24, 72, col)
    field("pool.%s.current" % pid, "text", px0 + 48, y + 24, 72, 72, pool=pid)
    text(px0 + 138, y + 75, "/", 36, DIM)
    box(px0 + 174, y + 24, 72, col)
    field("pool.%s.max" % pid, "text", px0 + 174, y + 24, 72, 72,
          pool=pid, readonly=True)
    # The Vitals get a - and a + beside the count; the pools are spent
    # one at a time too, so they get the same pair.
    label(px0 + 300, y + 72, "-", 42, DIM, 0, "middle")
    field("pool.%s.minus" % pid, "button", px0 + 270, y + 27, 60, 60, pool=pid)
    label(px0 + 384, y + 72, "+", 42, DIM, 0, "middle")
    field("pool.%s.plus" % pid, "button", px0 + 354, y + 27, 60, 60, pool=pid)
    if lab == "FATE TOKENS":
        label(px0 + 444, y + 54, "SPENT", 30, DIM, 3.6)
        label(px0 + 444, y + 84, "THIS SCENE", 30, DIM, 3.6)
        box(px0 + 672, y + 24, 72, col)
        # No controls of its own: spending a Token with the - beside the
        # held count is what fills this, and the + puts it back.
        field("pool.fate.spent", "text", px0 + 672, y + 24, 72, 72,
              pool="fate", readonly=True)

ey = by + 414
label(px0 + 48, ey, "EXHAUSTED", 33, mix(EARTH, "#FFFFFF", 0.45), 4.2)
label(px0 + 348, ey, "STACKS 1-5", 29, DIM, 2.7)
field("exhausted", "pips", px0 + 48, ey + 24, 5 * 72 - 18, 54, n=5, size=54, gap=18,
      color=EARTH)
for i in range(5):
    box(px0 + 48 + i * 72, ey + 24, 54, EARTH)
label(px0 + 450, ey + 63, "-", 42, DIM, 0, "middle")
field("exhausted.minus", "button", px0 + 420, ey + 21, 60, 60)
label(px0 + 534, ey + 63, "+", 42, DIM, 0, "middle")
field("exhausted.plus", "button", px0 + 504, ey + 21, 60, 60)

add('</svg>')
io.open(os.path.join(OUT, "character-sheet-stats.svg"), "w", encoding="utf-8",
        newline="\n").write("\n".join(P) + "\n")
import json
io.open(os.path.join(OUT, "character-sheet-page1-fields.json"), "w", encoding="utf-8",
        newline="\n").write(json.dumps(FIELDS, indent=1) + "\n")
print("page 1: %d fields" % len(FIELDS))
print("wrote character-sheet-stats.svg  inner pentagon on measured vertices, "
      "panels back at their PSD positions, bands end %d" % (by + BH))
