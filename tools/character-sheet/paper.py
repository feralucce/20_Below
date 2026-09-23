# -*- coding: utf-8 -*-
"""Build the printable sheet: five pages, art over background, in grey.

    python tools/character-sheet/paper.py

The screen sheet is transparent art that the app lays over its own
background. The printed sheet has nobody to do that for it, so this does
it once and writes finished pages.

WHERE EACH BACKGROUND COMES FROM

Page 1's is hand work. The author inverted it and took the colour out by
hand, and it carries a pentagram-strokes layer that exists nowhere else,
so this reads the real thing out of the print PSD rather than deriving
something close to it. The PSD is read, never written; it stays a design
file.

Pages 2-5 have no hand-made print background, so theirs is derived by the
same recipe the author used on page 1: invert the screen background, then
flatten it to grey. A screen background is near-black by design - mean
luminance around 7 of 255 - so inverting it is what turns it into paper.

Page 5 has no background of its own and borrows page 2's, which is the
arrangement the app already uses.

WHY PAGE 1 IS NOT DERIVED THE SAME WAY

CS-BG-pg1.png has the centre pentagon composited into it by build.py, so
deriving page 1's background from it would print the pentagon twice - once
in the background and once from the paper art, which draws its own. The
PSD's copy of that layer is skipped here for the same reason.

EVERYTHING COMES OUT GREY

The art already is: the generators write in three neutrals and nothing
else. The backgrounds are flattened on the way through, and the build
refuses to write a page with any colour left in it.
"""
import io
import os
import subprocess
import sys

from PIL import Image, ImageOps
from psd_tools import PSDImage

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(REPO, "Branding", "character-sheet")
PSD = os.path.join(OUT, "Character Sheet-bw-print.psd")
INKSCAPE = r"C:\Program Files\Inkscape\bin\inkscape.com"

W, H = 2550, 3300

# Layers the printed page supplies itself.
SKIP = ("character-sheet-page1",      # replaced by the current build
        "character-sheet-pentagon")   # the paper art draws its own

# Pages 2-5 derive theirs. Page 5 borrows page 2's, as the app does.
SCREEN_BG = {2: "CS-BG-pg2.png", 3: "CS-BG-pg3.png",
             4: "CS-BG-pg4.png", 5: "CS-BG-pg2.png"}


def build_art():
    """Run both generators in paper mode and rasterise all five pages."""
    subprocess.check_call([sys.executable, os.path.join(HERE, "sheet300.py"),
                           "--paper"], stdout=subprocess.DEVNULL)
    subprocess.check_call(
        [sys.executable, "-c",
         "import sys; sys.path.insert(0, %r); "
         "import page2, page3, page4, page5" % HERE,
         "--paper"], stdout=subprocess.DEVNULL)

    pages = {}
    for n in range(1, 6):
        svg = os.path.join(OUT, "character-sheet-page%d-paper.svg" % n)
        png = os.path.join(OUT, "character-sheet-page%d-paper.png" % n)
        subprocess.check_call(
            [INKSCAPE, svg, "--export-type=png", "--export-filename=%s" % png,
             "--export-width=%d" % W, "--export-background-opacity=0"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        pages[n] = Image.open(png).convert("RGBA")
    return pages


def psd_background():
    """Page 1's, out of the print PSD, flattened to grey."""
    psd = PSDImage.open(PSD)
    page = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    for layer in psd:
        if layer.name in SKIP or not layer.visible:
            continue
        im = layer.composite()
        if im is None:
            continue
        im = im.convert("RGBA")
        if layer.opacity < 255:
            a = im.split()[3].point(lambda v, o=layer.opacity: v * o // 255)
            im.putalpha(a)
        # A layer can hang off the top or left of the page; crop what falls
        # outside rather than sliding it back on, which would move the art.
        x, y = layer.offset
        if x < 0 or y < 0:
            im = im.crop((max(0, -x), max(0, -y), im.width, im.height))
            x, y = max(0, x), max(0, y)
        im = im.crop((0, 0, min(im.width, W - x), min(im.height, H - y)))
        page.alpha_composite(im, dest=(x, y))
    return ImageOps.grayscale(page.convert("RGB"))


def derived_background(name):
    """A screen background turned into paper: invert, then grey."""
    im = Image.open(os.path.join(OUT, name)).convert("RGB")
    return ImageOps.grayscale(ImageOps.invert(im))


def main():
    art = build_art()
    print()
    coloured_total = 0
    for n in range(1, 6):
        if n == 1:
            bg = psd_background()
            source = "the print PSD"
        else:
            bg = derived_background(SCREEN_BG[n])
            source = "%s, inverted" % SCREEN_BG[n]

        page = bg.convert("RGBA")
        page.alpha_composite(art[n])
        page = page.convert("RGB")

        out = os.path.join(OUT, "character-sheet-page%d-print.png" % n)
        page.save(out, dpi=(300, 300))

        coloured = sum(page.convert("HSV").split()[1].histogram()[1:])
        coloured_total += coloured
        print("page %d  %-26s %5.1f MB  colour left: %d"
              % (n, source, os.path.getsize(out) / 1e6, coloured))

    print()
    if coloured_total:
        raise SystemExit("not black and white - %d coloured pixels"
                         % coloured_total)
    print("five pages, 2550 x 3300 at 300dpi, no colour anywhere")


if __name__ == "__main__":
    main()
