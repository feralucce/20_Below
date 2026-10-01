# -*- coding: utf-8 -*-
"""Render the reference sheets' web images from their SVGs.

Every sheet on the GM References page is shown as docs/assets/portfolio/
<name>.webp (1400 x 1812) with a <name>-thumb.webp (560 x 725) in the grid.
Those were made by hand, sheet by sheet, and one of them fell behind its
SVG for a week without anything noticing. This makes them from the SVG,
in headless Chrome so the sheet's own fonts render, every time.

Which image belongs to which SVG comes from the two places that already
say so: the guide builder's sheet list (title -> SVG) and the GM
References page (title -> image). A sheet in one and not the other is
reported rather than guessed.

    python tools/build-sheet-images.py                 every sheet
    python tools/build-sheet-images.py Ki "Status Effects"
    python tools/build-sheet-images.py --stale         only sheets whose SVG is newer than its image
"""
import html
import importlib.util
import io
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BRANDING = os.path.join(ROOT, "Branding")
PORTFOLIO = os.path.join(ROOT, "docs", "assets", "portfolio")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
FULL, THUMB = (1400, 1812), (560, 725)


def sheets():
    """{title: svg path} from make_guide_pdf.py's PLAYER and GM lists."""
    spec = importlib.util.spec_from_file_location(
        "mg", os.path.join(BRANDING, "reference-binder", "make_guide_pdf.py"))
    mg = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mg)
    out = {}
    for _, group in mg.PLAYER + mg.GM:
        for title, rel in group:
            out.setdefault(title, os.path.normpath(os.path.join(BRANDING, rel)))
    return out


def images():
    """{title: image basename} from the GM References page's sheet cards."""
    page = io.open(os.path.join(ROOT, "gm-references.html"), encoding="utf-8").read()
    out = {}
    for m in re.finditer(r'href="/docs/assets/portfolio/([\w-]+)\.webp".*?<div class="name">(.*?)</div>', page):
        out[html.unescape(m.group(2)).replace("\u00d7", "x").strip()] = m.group(1)
    return out


def norm(t):
    return re.sub(r"[^a-z0-9]+", " ", t.lower().replace("&", "and")).strip()


def render(svg, png, tmp):
    page = os.path.join(tmp, "sheet.html")
    io.open(page, "w", encoding="utf-8").write(
        "<!doctype html><html><body style='margin:0;background:#0A131C'>"
        "<img src='file:///%s' style='width:%dpx;height:%dpx;display:block'></body></html>"
        % (svg.replace("\\", "/"), FULL[0], FULL[1]))
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--hide-scrollbars",
                    "--user-data-dir=" + os.path.join(tmp, "profile"), "--window-size=%d,%d" % FULL,
                    "--screenshot=" + png, "file:///" + page.replace("\\", "/")], capture_output=True, timeout=120)
    if not os.path.exists(png):
        sys.exit("Chrome did not render " + svg)


def main(argv):
    by_svg = sheets()
    by_img = {norm(t): name for t, name in images().items()}
    pairs, lost = {}, []
    for title, svg in by_svg.items():
        name = by_img.get(norm(title))
        if name:
            pairs[title] = (svg, name)
        else:
            lost.append(title)
    if lost:
        print("not on the GM References page (skipped): " + ", ".join(lost))
    want = [a for a in argv if not a.startswith("--")]
    unknown = [w for w in want if w not in pairs]
    if unknown:
        sys.exit("no such sheet: " + ", ".join(unknown))
    todo = want or list(pairs)
    if "--stale" in argv:
        todo = [t for t in todo if not os.path.exists(os.path.join(PORTFOLIO, pairs[t][1] + ".webp"))
                or os.path.getmtime(pairs[t][0]) > os.path.getmtime(os.path.join(PORTFOLIO, pairs[t][1] + ".webp"))]
    tmp = tempfile.mkdtemp()
    for title in todo:
        svg, name = pairs[title]
        png = os.path.join(tmp, name + ".png")
        render(svg, png, tmp)
        im = Image.open(png).convert("RGB")
        if im.size != FULL:
            im = im.resize(FULL, Image.LANCZOS)
        im.save(os.path.join(PORTFOLIO, name + ".webp"), "WEBP", quality=82, method=6)
        im.resize(THUMB, Image.LANCZOS).save(os.path.join(PORTFOLIO, name + "-thumb.webp"), "WEBP", quality=80, method=6)
        os.remove(png)
        print("  %-28s -> %s.webp + thumb" % (title, name))
    print("%d sheet image%s written" % (len(todo), "" if len(todo) == 1 else "s"))


if __name__ == "__main__":
    main(sys.argv[1:])
