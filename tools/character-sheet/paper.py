# -*- coding: utf-8 -*-
"""Build the printable sheet: five pages, art over background, in grey.

    python tools/character-sheet/paper.py

The screen sheet is transparent art that the app lays over its own
background. The printed sheet has nobody to do that for it, so this does
it once and writes finished pages.

TWO HALVES, AND WHY THEY ARE SEPARATE

build_svgs() and check_monochrome() are the guard. They run the two
generators in paper mode and prove the result is the three neutrals and
nothing else. They need Inkscape for nothing and the PSD for nothing, so
build.py calls them on every screen build: add a coloured constant to
sheetkit and the screen build fails, rather than the colour waiting
quietly until somebody next makes a print sheet.

main() is the composite, and it does need the PSD and psd_tools. That is
why the import sits inside the function that uses it - so the guard costs
the screen build no dependency it did not already have.

WHERE EACH BACKGROUND COMES FROM

Page 1's is hand work. The author inverted it and took the colour out by
hand, and it carries a pentagram-strokes layer that exists nowhere else,
so this reads the real thing out of the print PSD rather than deriving
something close to it. The PSD is read, never written; it stays a design
file.

Pages 2-5 have no hand-made print background, so theirs is derived by the
same recipe the author used on page 1: invert the screen background, then
flatten it to grey. A screen background is near-black by design - mean
luminance around 7 of 255 - so inverting is what turns it into paper.
Page 5 has none of its own and borrows page 2's, as the app does.

CS-BG-pg1.png has the centre pentagon composited into it by build.py, so
deriving page 1's background the same way would print the pentagon twice,
once from the background and once from the paper art, which draws its own.
The PSD's copy of that layer is skipped here for the same reason.
"""
import io
import os
import re
import subprocess
import sys

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

# Ink, captions, paper. Derived in papertheme from the brand colours; named
# here so the check does not depend on importing a module that the page
# generators have already run in the other mode.
ALLOWED = ("#1F1F1F", "#646464", "#FFFFFF")


def paper_svg(n):
    return os.path.join(OUT, "character-sheet-page%d-paper.svg" % n)


def build_svgs():
    """Run both generators in paper mode. Returns the five SVG paths.

    Page 1 has its own generator; pages 2-5 write themselves on import.
    Both go through a subprocess because the caller has usually already
    imported the page modules in screen mode, and a module writes its
    page once, at import.
    """
    subprocess.check_call([sys.executable, os.path.join(HERE, "sheet300.py"),
                           "--paper"], stdout=subprocess.DEVNULL)
    subprocess.check_call(
        [sys.executable, "-c",
         "import sys; sys.path.insert(0, %r); "
         "import page2, page3, page4, page5" % HERE, "--paper"],
        stdout=subprocess.DEVNULL)
    return [paper_svg(n) for n in range(1, 6)]


def check_monochrome(paths):
    """Every colour in the paper art has to be one of the three neutrals.

    The printed sheet is black and white, and the only thing keeping it
    that way is that each palette name was switched. A constant added to
    sheetkit later, or a colour written straight into a page module, would
    print - and would look like a decision rather than an oversight.
    """
    allowed = set(c.upper() for c in ALLOWED)
    bad = []
    for p in paths:
        found = set(m.upper()
                    for m in re.findall(r"#[0-9A-Fa-f]{6}",
                                        io.open(p, encoding="utf-8").read()))
        for c in sorted(found - allowed):
            bad.append("%s: %s" % (os.path.basename(p), c))
    if bad:
        raise SystemExit(
            "the paper sheet is not black and white:\n  "
            + "\n  ".join(bad)
            + "\n\nEvery colour on a printed page has to be one of %s.\n"
              "A palette name was probably added without going through the\n"
              "PAPER switch in sheetkit.py or sheet300.py." % ", ".join(ALLOWED))
    return len(paths)


def rasterise(n):
    png = os.path.join(OUT, "character-sheet-page%d-paper.png" % n)
    subprocess.check_call(
        [INKSCAPE, paper_svg(n), "--export-type=png",
         "--export-filename=%s" % png, "--export-width=%d" % W,
         "--export-background-opacity=0"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    from PIL import Image
    return Image.open(png).convert("RGBA")


def psd_background():
    """Page 1's, out of the print PSD, flattened to grey."""
    from PIL import Image, ImageOps
    from psd_tools import PSDImage

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
    from PIL import Image, ImageOps
    im = Image.open(os.path.join(OUT, name)).convert("RGB")
    return ImageOps.grayscale(ImageOps.invert(im))


def main():
    paths = build_svgs()
    check_monochrome(paths)
    print("paper art: %d pages, %s only" % (len(paths), ", ".join(ALLOWED)))
    print()

    coloured_total = 0
    for n in range(1, 6):
        if n == 1:
            bg, source = psd_background(), "the print PSD"
        else:
            bg = derived_background(SCREEN_BG[n])
            source = "%s, inverted" % SCREEN_BG[n]

        page = bg.convert("RGBA")
        page.alpha_composite(rasterise(n))
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
