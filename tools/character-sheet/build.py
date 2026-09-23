# -*- coding: utf-8 -*-
"""Build the whole character sheet: five pages of art, one field map.

The field map is the contract between the art and everything that fills
it - the Creator, the print variant, the fillable PDF, a shared character
URL, the web app. Art and map are emitted from the same numbers in the
same run, so they cannot drift.
"""
import hashlib, io, os, json, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(REPO, "Branding", "character-sheet")
INKSCAPE = r"C:\Program Files\Inkscape\bin\inkscape.com"

# page 1 has its own generator - it is built on the emblem's measured
# geometry rather than on the block stack the other four share
subprocess.check_call([sys.executable, os.path.join(HERE, "sheet300.py")])

sys.path.insert(0, HERE)
import page2, page3, page4, page5  # noqa: E402  (each writes its own SVG)
from sheetkit import W, H  # noqa: E402

fields = json.load(io.open(os.path.join(OUT, "character-sheet-page1-fields.json"),
                           encoding="utf-8"))
for p in (page2.FIELDS_P2, page3.FIELDS_P3, page4.FIELDS_P4, page5.FIELDS_P5):
    fields.extend(p)

# An id is unique within its page, not across the sheet: every page
# carries a page.number, and a repeated page carries a second copy of
# every slot it holds.
keys = [(f["page"], f["id"]) for f in fields]
dupes = sorted(set("p%d %s" % k for k in keys if keys.count(k) > 1))
if dupes:
    raise SystemExit("duplicate field ids: %s" % ", ".join(dupes))

# Page 3 is a template, not a fixed page: a character with more Gifts
# than it holds gets another copy of it, with the slot numbers offset.
# Everything downstream - the app, the print variant, the PDF - reads
# this rather than knowing about Gifts.
# The art and the map are rebuilt together, so a stamp taken from the map
# is a stamp on that build of the pages. The app hangs it off every image
# URL, which is what stops a browser pairing today's field positions with
# yesterday's picture - the field map is fetched fresh every time, an
# <img> never is, and the mismatch reads as a layout bug rather than a
# stale file.
stamp = hashlib.sha1(json.dumps(fields, sort_keys=True).encode()).hexdigest()[:10]

doc = {
    "width": W,
    "height": H,
    "pages": 5,
    "version": stamp,
    "repeat": [{"page": 3, "group": "gift", "slots": page3.SLOTS}],
    "fields": fields,
}
io.open(os.path.join(OUT, "character-sheet-fields.json"), "w", encoding="utf-8",
        newline="\n").write(json.dumps(doc, indent=1) + "\n")

# page 1 is copied to its numbered name so all five read the same way
src = io.open(os.path.join(OUT, "character-sheet-stats.svg"), encoding="utf-8").read()
io.open(os.path.join(OUT, "character-sheet-page1.svg"), "w", encoding="utf-8",
        newline="\n").write(src)

for n in range(1, 6):
    subprocess.check_call([INKSCAPE, os.path.join(OUT, "character-sheet-page%d.svg" % n),
                           "--export-type=png",
                           "--export-filename=%s" % os.path.join(
                               OUT, "character-sheet-page%d.png" % n),
                           "--export-width=2550", "--export-background-opacity=0"],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# The Creator reads the map and the vector pages, not the PNGs, and its
# backgrounds are the same art at screen size. Refreshing them here is
# what keeps the app from drifting behind the generator.
# Page 1's background is the emblem art as supplied, with the centre
# pentagon - which is generated here, not painted - composited onto it.
# Doing it in the build means the pentagon's stroke can change without
# anyone reopening Photoshop.
PAGE1_ART = os.path.join(OUT, "Character Sheet.png")
if os.path.exists(PAGE1_ART):
    try:
        from PIL import Image as _Image
        base = _Image.open(PAGE1_ART).convert("RGBA")
        pent = os.path.join(OUT, "character-sheet-pentagon.png")
        if os.path.exists(pent):
            base.alpha_composite(_Image.open(pent).convert("RGBA"))
        base.convert("RGB").save(os.path.join(OUT, "CS-BG-pg1.png"))
        print("page 1 background rebuilt from Character Sheet.png")
    except ImportError:
        print("Pillow missing - page 1 background left as it was")

APP = os.path.join(REPO, "app", "sheet")
os.makedirs(APP, exist_ok=True)
BACKGROUNDS = {1: "CS-BG-pg1.png", 2: "CS-BG-pg2.png", 3: "CS-BG-pg3.png",
               4: "CS-BG-pg4.png", 5: "CS-BG-pg2.png"}
for n in range(1, 6):
    shutil.copy(os.path.join(OUT, "character-sheet-page%d.svg" % n),
                os.path.join(APP, "page%d.svg" % n))
shutil.copy(os.path.join(OUT, "character-sheet-fields.json"),
            os.path.join(APP, "fields.json"))
try:
    from PIL import Image
    for n, name in BACKGROUNDS.items():
        src = os.path.join(OUT, name)
        if not os.path.exists(src):
            continue
        # Full size: the app renders a page at 2550 wide, so a half-size
        # background would be upscaled and soft behind crisp vector art.
        Image.open(src).convert("RGB").save(
            os.path.join(APP, "bg%d.jpg" % n), quality=78, optimize=True,
            progressive=True)
except ImportError:
    print("Pillow missing - app backgrounds left as they were")

kinds = {}
for f in fields:
    kinds[f["kind"]] = kinds.get(f["kind"], 0) + 1
print()
print("field map: %d fields across 5 pages" % len(fields))
for k in sorted(kinds):
    print("  %-6s %d" % (k, kinds[k]))
