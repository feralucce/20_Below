# -*- coding: utf-8 -*-
"""Build the bestiary book: Scrivener prose, then every creature.

Same split as the Player's Guide. The writing lives in the manuscript,
under Draft / Bestiary, and the creatures live in rules/*.md where the
apps read them live - so a stat correction reaches the book, the character
creator, the Battle Tracker and Encounter Prep from one edit, and nobody
maintains 194 stat blocks twice.

Nightmare Creatures are deliberately not here. They are urban-fantasy
archetypes rather than artefacts of this world, and belong to something
else; this book is real animals and the American folklore that turns out
to be true.

    python tools/build-bestiary.py

Writes brew/examples/bestiary.md, ready to open in the Brewery and print.
Chapters are picked up from the binder in binder order, so adding one in
Scrivener is enough - there is no list here to keep in step.
"""
import io
import os
import re
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scriv2brew import SCRIV, to_chunks   # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NL = chr(10)
BOOK = "Bestiary"

# The creature files this book is made of, in order.
SOURCES = [
    ("rules/adversary-index.md", "Adversaries"),
    ("rules/cryptids.md", "Cryptids"),
]

CARD = re.compile(
    r'<table class="adversary-card">\s*<tr>\s*<td markdown="1">([\s\S]*?)</td>\s*</tr>\s*</table>')

# Characters of content that fit one Letter page in two columns, measured
# against the real bestiary. Pages are packed by size rather than a fixed
# count: entries
# run from a three-line animal to a full stat block with traits, and a
# fixed count either wastes half a page or spills off the bottom.
PAGE_BUDGET = 2200
HEADING_COST = 400


def prose_documents():
    """Every document under the Bestiary folder, in binder order."""
    root = ET.parse(os.path.join(SCRIV, "20 Below Mansuscript.scrivx")).getroot()

    # Top-level items sit directly under <Binder>, nested ones under a
    # <Children> element, so a flat walk is simpler than either shape.
    matches = [b for b in root.iter("BinderItem")
               if b.find("Title") is not None
               and (b.find("Title").text or "").strip() == BOOK]
    if not matches:
        raise SystemExit("no %r folder in the binder" % BOOK)
    if len(matches) > 1:
        raise SystemExit("%r matches %d binder items - rename one" % (BOOK, len(matches)))
    folder = matches[0]

    out = []
    for item in folder.findall("./Children/BinderItem"):
        title = item.find("Title")
        out.append((item.get("UUID"), (title.text or "").strip() if title is not None else ""))
    return out


def paginate(blocks, opening_cost=HEADING_COST):
    """Pack blocks into pages by size.

    A heading left as the last thing on a page is pushed to the next one -
    a section title at the foot of a column with its text overleaf reads
    like a mistake, and costs nothing to avoid.
    """
    pages, page, used = [], [], opening_cost
    for b in blocks:
        if page and used + len(b) > PAGE_BUDGET:
            carried = []
            while page and page[-1].lstrip().startswith("#"):
                carried.insert(0, page.pop())
            if page:
                pages.append(page)
            page = list(carried)
            used = sum(len(c) for c in carried)
        page.append(b)
        used += len(b)
    if page:
        pages.append(page)
    return pages


def main():
    pages = []
    counts = []

    # ------------------------------------------------------------- prose
    docs = prose_documents()
    if not docs:
        print("  the Bestiary folder is empty - building the creatures alone")
    for uuid, title in docs:
        chunks = [c for c in to_chunks(uuid) if c.strip()]
        if not chunks:
            print("  %s: no text yet, skipped" % title)
            continue
        for page in paginate(chunks):
            pages.append((NL + NL).join(page))
        counts.append((title, len(chunks)))

    # --------------------------------------------------------- creatures
    total = 0
    skipped = []
    for rel, section in SOURCES:
        src = io.open(os.path.join(ROOT, rel), encoding="utf-8").read()
        blocks = []
        for m in CARD.finditer(src):
            inner = m.group(1).strip()
            head = re.search(r"^#{2,4}\s+(.+)$", inner, re.M)
            if not head:
                skipped.append("%s: a card with no heading" % rel)
                continue
            name = head.group(1).strip()
            body = inner[head.end():].strip()
            if " · " not in body:
                skipped.append("%s: %s - no stat line" % (rel, name))
                continue
            if re.search(r"^:::\s*$", body, re.M):
                skipped.append("%s: %s - contains a ::: line" % (rel, name))
                continue
            blocks.append("::: stat %s%s%s%s:::" % (name, NL, body, NL))
            total += 1

        for i, page in enumerate(paginate(blocks)):
            body = (NL + NL).join(page)
            pages.append(("# %s%s%s" % (section, NL + NL, body)) if i == 0 else body)
        counts.append((section, len(blocks)))

    doc = NL.join([
        "# Bestiary",
        "",
        "The creatures are generated from the rules files and the prose from the "
        "manuscript, by `tools/build-bestiary.py`. Re-run it after either changes.",
        "",
    ] + [line for p in pages for line in ("\\page", "", p, "")])

    out = os.path.join(ROOT, "brew", "examples", "bestiary.md")
    io.open(out, "w", encoding="utf-8", newline=NL).write(doc)

    print("wrote brew/examples/bestiary.md")
    for title, n in counts:
        print("  %-28s %4d blocks" % (title, n))
    print("  %-28s %4d creatures, %d pages" % ("", total, len(pages)))
    if skipped:
        print("skipped %d:" % len(skipped))
        for s in skipped:
            print("  " + s)


if __name__ == "__main__":
    main()
