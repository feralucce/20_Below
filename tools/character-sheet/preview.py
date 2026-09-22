# -*- coding: utf-8 -*-
"""Flatten the five pages into something you can hand somebody.

    python tools/character-sheet/preview.py

Writes Branding/character-sheet/preview/ - a PNG per page at 300 dpi and
one PDF of all five, blank, for showing players what the sheet is.

The page number is a field the app fills, because a character with more
Gifts than one page holds gets another page and the count is only known
once a character is in front of you. A blank sheet has no app to fill it
and a fixed five pages, so it is drawn on here.
"""
import io, os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(REPO, "Branding", "character-sheet")
OUT = os.path.join(SRC, "preview")

W, MARGIN = 2550, 117
BACKGROUNDS = {1: "CS-BG-pg1.png", 2: "CS-BG-pg2.png", 3: "CS-BG-pg3.png",
               4: "CS-BG-pg4.png", 5: "CS-BG-pg2.png"}
DIM = (143, 173, 190)

os.makedirs(OUT, exist_ok=True)


def page_number_font():
    for name in ("segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, 33)
        except OSError:
            continue
    return ImageFont.load_default()


font = page_number_font()
pages = []

for n in range(1, 6):
    bg = Image.open(os.path.join(SRC, BACKGROUNDS[n])).convert("RGBA")
    art = Image.open(os.path.join(SRC, "character-sheet-page%d.png" % n)).convert("RGBA")
    bg.alpha_composite(art)
    flat = bg.convert("RGB")

    # right-aligned where the field sits, letter-spaced to match the rest
    label = "PAGE %d OF 5" % n
    draw = ImageDraw.Draw(flat)
    spaced = " ".join(label)
    width = draw.textlength(spaced, font=font)
    draw.text((W - MARGIN - width, 150), spaced, font=font, fill=DIM)

    flat.save(os.path.join(OUT, "20-below-character-sheet-p%d.png" % n))
    pages.append(flat)

pdf = os.path.join(OUT, "20-below-character-sheet.pdf")
pages[0].save(pdf, save_all=True, append_images=pages[1:], resolution=300.0)

for name in sorted(os.listdir(OUT)):
    size = os.path.getsize(os.path.join(OUT, name)) / 1048576.0
    print("%-40s %.1f MB" % (name, size))
