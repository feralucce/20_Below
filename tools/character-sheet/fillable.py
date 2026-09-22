# -*- coding: utf-8 -*-
"""The character sheet as a PDF you can type into.

    python tools/character-sheet/fillable.py

Writes Branding/character-sheet/20-below-character-sheet-fillable.pdf -
the five pages as they are drawn, with a real form field over every
named region in the field map. The same map the app lays live controls
over, so the PDF and the app cannot drift apart: rebuild the sheet and
rerun this, and the fields follow.

Every field is black with white lettering, which is the only way text
reads on a sheet this dark. Every pip, tier box and tick is its own
checkbox, so Levels, Skill training and Health are all clicked rather
than typed.
"""
import io, json, os

import pymupdf
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(REPO, "Branding", "character-sheet")
PREVIEW = os.path.join(SRC, "preview")
OUT = os.path.join(SRC, "20-below-character-sheet-fillable.pdf")

# 2550 x 3300 at 300 dpi is US Letter, and a PDF is measured in points.
PAGE_W, PAGE_H = 2550.0, 3300.0
PT = 612.0 / PAGE_W

BLACK = (0, 0, 0)
WHITE = (1, 1, 1)
# Borders pick up each block's own colour where the map carries one, so a
# Flaw's Level boxes stay red and a Skill's tier boxes stay green.
DEFAULT_BORDER = (0.36, 0.45, 0.53)

# Buttons are the app's business - a rest, a stepper, a roll. Nothing on
# paper does anything when you press it.
SKIP_KINDS = {"button"}


def hex_rgb(value, fallback=DEFAULT_BORDER):
    if not isinstance(value, str) or not value.startswith("#") or len(value) != 7:
        return fallback
    return tuple(int(value[i:i + 2], 16) / 255.0 for i in (1, 3, 5))


def rect(x, y, w, h):
    return pymupdf.Rect(x * PT, y * PT, (x + w) * PT, (y + h) * PT)


def text_widget(name, r, size, multiline=False):
    w = pymupdf.Widget()
    w.field_name = name
    w.field_type = pymupdf.PDF_WIDGET_TYPE_TEXT
    w.rect = r
    w.fill_color = BLACK
    w.text_color = WHITE
    w.border_color = DEFAULT_BORDER
    w.border_width = 0.4
    w.text_fontsize = size
    w.text_font = "Helv"
    if multiline:
        w.field_flags = pymupdf.PDF_TX_FIELD_IS_MULTILINE
    return w


def check_widget(name, r, border):
    w = pymupdf.Widget()
    w.field_name = name
    w.field_type = pymupdf.PDF_WIDGET_TYPE_CHECKBOX
    w.rect = r
    w.fill_color = BLACK
    w.text_color = WHITE
    w.border_color = border
    w.border_width = 0.8
    # Created ticked so the reader generates the "on" appearance now; it
    # is turned off again once that stream has been corrected below.
    w.field_value = True
    return w


doc_map = json.load(io.open(os.path.join(SRC, "character-sheet-fields.json"),
                            encoding="utf-8"))
fields = doc_map["fields"]

pdf = pymupdf.open()
added = {"text": 0, "para": 0, "check": 0, "pip": 0}

for n in range(1, 6):
    page = pdf.new_page(width=612, height=792)
    art = os.path.join(PREVIEW, "20-below-character-sheet-p%d.png" % n)
    if not os.path.exists(art):
        raise SystemExit("run preview.py first - missing %s" % art)
    # The pages are photographic backgrounds under line art. As PNG they
    # come to 24 MB, which is not a file anyone wants emailed to them;
    # as JPEG they are a tenth of that and look the same on paper.
    buf = io.BytesIO()
    Image.open(art).convert("RGB").save(buf, "JPEG", quality=82, optimize=True)
    page.insert_image(pymupdf.Rect(0, 0, 612, 792), stream=buf.getvalue())

    for f in [x for x in fields if x["page"] == n]:
        kind = f["kind"]
        if kind in SKIP_KINDS or f["id"] == "page.number":
            continue
        border = hex_rgb(f.get("color"))

        if kind in ("text", "para"):
            # A field's type size is written in page units, same as the
            # art it sits in, so it converts like everything else.
            size = f.get("size") or min(f["h"] * 0.62, 40)
            if kind == "para":
                size = (f["h"] / max(f.get("lines", 1), 1)) * 0.52
            page.add_widget(text_widget(f["id"], rect(f["x"], f["y"], f["w"], f["h"]),
                                        max(size * PT, 5.5), kind == "para"))
            added[kind] += 1

        elif kind == "check":
            page.add_widget(check_widget(f["id"], rect(f["x"], f["y"], f["w"], f["h"]),
                                         border))
            added["check"] += 1

        elif kind in ("pips", "tiers"):
            # One box, one checkbox. A Level of 3 is three ticks, which is
            # what the printed sheet asks for anyway.
            size, gap = f["size"], f["gap"]
            for i in range(f["n"]):
                page.add_widget(check_widget(
                    "%s.%d" % (f["id"], i),
                    rect(f["x"] + i * (size + gap), f["y"], size, size),
                    border))
                added["pip"] += 1

# PyMuPDF draws a checkbox's tick in black regardless of the widget's
# text colour, and these boxes are filled black - so every tick was a
# black mark on a black square and the sheet looked like nothing was
# ever ticked. The glyph is repainted white in the stored appearance,
# which is what a reader shows when someone clicks the box.
ticks = 0
MARK_BLACK = "\nBT\n0 g\n"
MARK_WHITE = "\nBT\n1 g\n"
for page in pdf:
    for w in page.widgets():
        if w.field_type != pymupdf.PDF_WIDGET_TYPE_CHECKBOX:
            continue
        ref = pdf.xref_get_key(w.xref, "AP/N/Yes")
        if ref[0] == "xref":
            xref = int(ref[1].split()[0])
            stream = pdf.xref_stream(xref).decode("latin-1")
            if MARK_BLACK in stream:
                pdf.update_stream(xref, stream.replace(
                    MARK_BLACK, MARK_WHITE, 1).encode("latin-1"))
                ticks += 1
        # A reader that regenerates the appearance when someone clicks
        # reads the glyph colour from /DA, not from the stream above -
        # so both are set, and the tick is white either way.
        pdf.xref_set_key(w.xref, "DA", "(/ZaDb 0 Tf 1 g)")
        # Off by default, without regenerating the appearance just fixed.
        pdf.xref_set_key(w.xref, "AS", "/Off")
        pdf.xref_set_key(w.xref, "V", "/Off")

pdf.save(OUT, deflate=True, garbage=3)
pdf.close()

total = sum(added.values())
print("wrote %s" % os.path.basename(OUT))
print("  %d tick marks repainted white" % ticks)
print("  %.1f MB, %d fields" % (os.path.getsize(OUT) / 1048576.0, total))
for k in sorted(added):
    print("  %-6s %d" % (k, added[k]))
