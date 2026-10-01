# -*- coding: utf-8 -*-
"""Put the reference sheets into the GM Guide, in the Scrivener manuscript.

Each sheet is an image at the end of the GM Guide chapter it belongs to, in
the order that chapter covers it (decided 2026-10-01; the map is SHEETS
below, and also recorded in the GM Guide outline). The images are rendered
from the GM Reference Guide PDF, which holds every sheet, GM and player, as
150 dpi JPEG set to the full width of the text block.

    python tools/embed-gm-sheets.py                  add any sheet that is missing
    python tools/embed-gm-sheets.py --replace        re-render every embedded sheet
    python tools/embed-gm-sheets.py --replace Ki "Status Effects"
                                                     re-render just those sheets
    python tools/embed-gm-sheets.py --check          report, change nothing

Rebuild the GM Reference Guide first (Branding/reference-binder/make_guide_pdf.py)
when a sheet has changed, or this embeds the old one again.

Every image carries a hidden marker, {\\v brew-sheet:<name>}, just ahead of
it. That is how a sheet is found again: adding skips a sheet whose marker is
already there, and replacing swaps only the picture that follows its marker,
leaving the sheet where it is and the text around it alone. A picture with no
marker is somebody else's and is never touched.

Scrivener must be closed. It holds the project in memory and writes it back
on quit, which would undo everything done here. Each content.rtf is backed up
before it changes, as content.rtf.bak-YYYYMMDD-HHMMSS beside it.
"""
import glob
import io
import os
import re
import shutil
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from scriv2brew import SCRIV, DATA   # noqa: E402

GUIDE = os.path.join(ROOT, "Branding", "20Below-GM-Reference-Guide.pdf")
BOOK = "GM Guide"
MARK = "brew-sheet:"
DPI = 150
QUALITY = 85

SHEETS = {
    "Chapter 01": ["How 20 Below Works"],
    "Chapter 03": ["Character Creation", "Elements and Sub-Stats", "Boons and Flaws", "Using a Gift",
                   "Resources Ladder", "The Resource Index"],
    "Chapter 04": ["Core Roll", "Advantage & Disadvantage", "Difficulty Chart", "Skills",
                   "Elements x Skills", "One Skill, Five Elements"],
    "Chapter 06": ["The Round", "Actions", "The Combat Flow", "Making an Attack", "Ki", "Weapons & Armor",
                   "Range & Movement", "Taking Damage", "The Vitals", "Status Effects", "Scars",
                   "Scars, continued"],
    "Chapter 07": ["Building an Encounter"],
    "Chapter 08": ["Stat Blocks", "Building a Creature", "Variant Templates"],
    "Chapter 10": ["The Fate Triangle", "Kotodama"],
    "Chapter 11": ["Hazards", "Materials", "Getting Around", "Chases and Travel"],
    "Chapter 13": ["Advancement"],
    "Chapter 14": ["Time"],
}


def scrivener_running():
    out = subprocess.run(["tasklist"], capture_output=True, text=True).stdout.lower()
    return "scrivener" in out


def chapters():
    """{map key: (uuid, binder title)} for the GM Guide's documents."""
    x = glob.glob(os.path.join(SCRIV, "*.scrivx"))[0]
    root = ET.parse(x).getroot()
    book = [it for it in root.iter("BinderItem")
            if it.find("Title") is not None and it.find("Title").text == BOOK]
    if len(book) != 1:
        sys.exit("expected one binder folder called %r, found %d" % (BOOK, len(book)))
    out = {}
    for it in book[0].find("Children").findall("BinderItem"):
        title = it.find("Title").text or ""
        for key in SHEETS:
            if title.startswith(key + " "):
                if key in out:
                    sys.exit("two GM Guide documents start with %r" % key)
                out[key] = (it.get("UUID"), title)
    missing = [k for k in SHEETS if k not in out]
    if missing:
        sys.exit("no GM Guide document starting: " + ", ".join(missing))
    return out


def guide_pages():
    import pymupdf
    if not os.path.exists(GUIDE):
        sys.exit("no GM Reference Guide at %s - build it first" % GUIDE)
    doc = pymupdf.open(GUIDE)
    pages = {t: p for _, t, p in doc.get_toc()}
    lost = [s for names in SHEETS.values() for s in names if s not in pages]
    if lost:
        sys.exit("not in the GM Reference Guide: " + ", ".join(lost))
    return doc, pages


def pict(doc, page_no, width_twips):
    pix = doc[page_no - 1].get_pixmap(dpi=DPI)
    jpg = pix.tobytes("jpeg", jpg_quality=QUALITY)
    hexed = jpg.hex()
    body = "\n".join(hexed[i:i + 128] for i in range(0, len(hexed), 128))
    return ("{\\pict\\jpegblip\\picw%d\\pich%d\\picwgoal%d\\pichgoal%d\n%s}"
            % (pix.width, pix.height, width_twips, round(width_twips * pix.height / pix.width), body)), len(jpg)


def group_end(s, start):
    """Index just past the {...} group opening at `start`, escapes respected."""
    depth, i = 0, start
    while i < len(s):
        c = s[i]
        if c == "\\":
            i += 2
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    raise ValueError("unbalanced group")


def text_width(raw):
    m = re.search(r"\\paperw(\d+)\\paperh\d+\\margl(\d+)\\margr(\d+)", raw)
    return int(m.group(1)) - int(m.group(2)) - int(m.group(3)) if m else 8640


def marked_picture(raw, name):
    """(start, end) of the picture group that follows a sheet's marker, or None."""
    tag = "{\\v %s%s}" % (MARK, name)
    at = raw.find(tag)
    if at < 0:
        return None
    p = raw.find("{\\pict", at + len(tag))
    # The picture must follow its marker directly; anything else in between
    # means the paragraph was edited, and guessing which picture is meant is
    # how the wrong one gets overwritten.
    if p < 0 or raw[at + len(tag):p].strip():
        sys.exit("found the marker for %r but no picture straight after it - fix it in Scrivener" % name)
    return p, group_end(raw, p)


def work(key, uuid, title, doc, pages, mode, only):
    path = os.path.join(DATA, uuid, "content.rtf")
    raw = io.open(path, encoding="latin1", newline="").read()
    width = text_width(raw)
    new = raw
    added, replaced, kb = [], [], 0
    for name in SHEETS[key]:
        span = marked_picture(new, name)
        if mode == "replace":
            if only and name not in only:
                continue
            if span is None:
                print("  %s: %s is not embedded yet - run without --replace to add it" % (title, name))
                continue
            pic, n = pict(doc, pages[name], width)
            new = new[:span[0]] + pic + new[span[1]:]
            replaced.append(name)
            kb += n
        elif span is None:
            if mode == "check":
                added.append(name)
                continue
            pic, n = pict(doc, pages[name], width)
            body = new.rstrip()
            if not body.endswith("}"):
                sys.exit("%s: content.rtf does not end with a closing brace" % title)
            # A page break, then the image centred on its own paragraph, with
            # the hidden marker that lets the next run find it again.
            new = (body[:-1].rstrip("\n")
                   + "\n\\par\\pard\\plain \\qc\\page\\ltrch\\loch {\\v %s%s}%s\n}" % (MARK, name, pic))
            added.append(name)
            kb += n
    if mode == "check":
        print("  %-40s %s" % (title, ("missing: " + ", ".join(added)) if added else "all %d in place" % len(SHEETS[key])))
        return 0
    if new == raw:
        if replaced:
            print("  %s: %s already current, nothing written" % (title, ", ".join(replaced)))
        return 0
    stamp = time.strftime("%Y%m%d-%H%M%S")
    shutil.copy2(path, path + ".bak-" + stamp)
    io.open(path, "w", encoding="latin1", newline="").write(new)
    did = ("added " + ", ".join(added)) if added else ("replaced " + ", ".join(replaced))
    print("  %s: %s (%d KB); backup content.rtf.bak-%s" % (title, did, kb // 1024, stamp))
    return len(added) + len(replaced)


def main(argv):
    mode = "add"
    if "--check" in argv:
        mode = "check"
    elif "--replace" in argv:
        mode = "replace"
    only = [a for a in argv if not a.startswith("--")]
    known = {s for names in SHEETS.values() for s in names}
    unknown = [a for a in only if a not in known]
    if unknown:
        sys.exit("not a sheet in the map: " + ", ".join(unknown))
    if mode != "check" and scrivener_running():
        sys.exit("Scrivener is open - close it first, or it will write over this on quit.")
    docs = chapters()
    doc, pages = guide_pages()
    n = sum(work(key, uuid, title, doc, pages, mode, only) for key, (uuid, title) in docs.items())
    if mode != "check":
        print("%d sheet%s %s" % (n, "" if n == 1 else "s", "replaced" if mode == "replace" else "added"))


if __name__ == "__main__":
    main(sys.argv[1:])
