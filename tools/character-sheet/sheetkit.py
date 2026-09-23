# -*- coding: utf-8 -*-
"""Shared drawing kit for the 20 Below character sheet.

Every page is drawn in the PSD's own pixel space - 2550 x 3300 at 300 dpi
- so each export drops in at 0,0 and 100%. Pages carry no title: the mark
and the page number are the whole header, and the blocks start straight
after the rule.
"""
import io, os, re

# Paths are worked out from this file, so the build runs from anywhere
# in the repo and needs no editing on another machine.
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, "Branding", "character-sheet")
MARK = os.path.join(REPO, "Branding", "20belowMark.svg")

W, H = 2550, 3300
MARGIN = 117
INNER = W - 2 * MARGIN
TOP = 294        # first block starts here, under the rule
BOTTOM = 3138    # every page's content ends flush here

WHITE = "#FFFFFF"
ACCENT = "#3D84C4"
CYAN = "#3FD0E0"
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
GREEN = "#7BC47F"
GOLD = "#E0A85C"
RED = "#D9574A"
STEEL = "#9FB4C4"
C_OK, C_GOLD, C_AIR = "#6FBF73", "#E0A85C", "#6FB8E0"

BOXFILL = 0.55

P = []
FIELDS = []
PAGE = [0]


def reset():
    del P[:]
    del FIELDS[:]


def field(fid, kind, x, y, w, h, **extra):
    """Register a named region so the app can lay a live control over it.

    Coordinates are the page's own 2550 x 3300 space; a consumer scales
    them by whatever width it renders at. Nothing here knows about the
    art - the art and the map are emitted from the same numbers, which is
    the point.
    """
    f = {"id": fid, "kind": kind, "page": PAGE[0],
         "x": round(x, 1), "y": round(y, 1), "w": round(w, 1), "h": round(h, 1)}
    f.update(extra)
    FIELDS.append(f)
    return f


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


def box(x, y, s, col, w=4.5, r=10, op=1.0):
    add('  <rect x="%g" y="%g" width="%g" height="%g" rx="%g" fill="#01050A" '
        'fill-opacity="%g" stroke="%s" stroke-width="%g" stroke-opacity="%g"/>'
        % (x, y, s, s, r, BOXFILL, col, w, op))


def slot(x, y, w, h, col, r=10):
    add('  <rect x="%g" y="%g" width="%g" height="%g" rx="%g" fill="#01050A" '
        'fill-opacity="%g" stroke="%s" stroke-width="4.5"/>' % (x, y, w, h, r, BOXFILL, col))


def label(x, y, t, size, col, ls=0, anchor="start"):
    add('  <text x="%g" y="%g" font-family="%s" font-size="%g" letter-spacing="%g" '
        'fill="%s" text-anchor="%s">%s</text>' % (x, y, DISPLAY, size, ls, col, anchor, t))


def hero(x, y, t, size, col, anchor="start"):
    add('  <text x="%g" y="%g" font-family="%s" font-size="%g" font-weight="600" '
        'letter-spacing="%g" fill="%s" text-anchor="%s">%s</text>'
        % (x, y, HERO, size, size * 0.04, col, anchor, t))


def line(x, y, w, col=RULE, op=0.7, th=3):
    add('  <rect x="%g" y="%g" width="%g" height="%g" fill="%s" fill-opacity="%g"/>'
        % (x, y, w, th, col, op))


def frame(x, y, w, h, col, title=None, note=None, r=42):
    pp = panel_path(x, y, w, h, r)
    add('  <path d="%s" fill="#01050A" fill-opacity="0.55"/>' % pp,
        '  <path d="%s" fill="none" stroke="%s" stroke-width="5"/>' % (pp, col))
    if title:
        hero(x + 42, y + 66, title, 45, WHITE)
    if note:
        label(x + w - 42, y + 63, note, 32, mix(col, "#FFFFFF", 0.3), 4.8, "end")


def action(x, y, w, h, col, text, fid):
    """A pill in a block's header that the app turns into a button.

    The art draws the pill and its caption; the field map says where it
    is, so the app lays a hit target over it without knowing anything
    about how it looks. Same arrangement as the rest buttons on page 1.
    """
    pp = panel_path(x, y, w, h, h / 2.0)
    add('  <path d="%s" fill="#01050A" fill-opacity="0.55"/>' % pp,
        '  <path d="%s" fill="none" stroke="%s" stroke-width="4.5"/>' % (pp, col))
    label(x + w / 2.0, y + h * 0.66, text, 31, mix(col, "#FFFFFF", 0.4), 3.6, "middle")
    field(fid, "button", x, y, w, h)


def pips(x, y, n, s, col, gap=12, op=1.0):
    for i in range(n):
        box(x + i * (s + gap), y, s, col, 4.2, 9, op)
    return n * (s + gap) - gap


def heads(x, y, cols):
    """A row of column headings."""
    for off, t in cols:
        label(x + off, y, t, 30, DIM, 3.6)


def open_page(page, total, desc):
    """Start a page: the mark, the page number, the rule. No title."""
    reset()
    PAGE[0] = page
    add('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" '
        'shape-rendering="geometricPrecision" text-rendering="geometricPrecision">' % (W, H, W, H),
        '  <title>20 Below character sheet - page %d</title>' % page,
        '  <desc>%s</desc>' % desc)
    ms = io.open(MARK, encoding="utf-8").read()
    mw, mh = [float(v) for v in re.search(r'viewBox="([\d.\s-]+)"', ms).group(1).split()[2:]]
    mpath = re.search(r"(<path\b[^>]*/>)", ms).group(1)
    mark_h = 108
    add('  <svg x="%g" y="96" width="%g" height="%d" viewBox="0 0 %g %g" '
        'preserveAspectRatio="xMidYMid meet" overflow="visible">%s</svg>'
        % (MARGIN, mark_h * mw / mh, mark_h, mw, mh, mpath))
    # Not printed: a character with more Gifts than one page holds gets a
    # second Gifts page, so how many pages there are is only known once a
    # character is in front of you.
    field("page.number", "text", W - MARGIN - 600, 150, 600, 48, size=33, align="end")
    line(MARGIN, 240, INNER, ACCENT, 0.45)


def write(name, note=""):
    add('</svg>')
    os.makedirs(OUT, exist_ok=True)
    io.open(os.path.join(OUT, name), "w", encoding="utf-8",
            newline="\n").write("\n".join(P) + "\n")
    print("wrote %s  %d fields%s" % (name, len(FIELDS), ("  " + note) if note else ""))
    return list(FIELDS)


def write_fields(pages, name="character-sheet-fields.json"):
    """One map for the whole sheet, merged from every page."""
    import json
    flat = [f for p in pages for f in p]
    doc = {"width": W, "height": H, "pages": 5, "fields": flat}
    io.open(os.path.join(OUT, name), "w", encoding="utf-8",
            newline="\n").write(json.dumps(doc, indent=1) + "\n")
    print("wrote %s  %d fields across %d pages"
          % (name, len(flat), len(set(f["page"] for f in flat))))
