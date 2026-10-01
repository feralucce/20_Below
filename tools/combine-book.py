# -*- coding: utf-8 -*-
"""The Player's Guide as one Brewery document, and then as one PDF.

The book is fourteen Brewery files - the front matter and thirteen chapters -
and each carries its own document settings: \\folio start=N to carry the page
count across files, \\seed, \\ground, and in one case \\cols. The playtest
ships as a single PDF, so this stitches them into one document the Brewery
can export in one go.

Document settings are whole-file in the Brewery - the last one written wins -
so they can't simply be concatenated. What this does with them:

  - One header: the front matter's \\folio start=i (roman), the shared \\seed,
    and the chapters' \\ground. The per-chapter \\folio start lines go, so the
    count runs on by itself; Chapter 1's opening break restarts it at 1.
  - Every chapter opens on its own page, and that break is written as
    \\page chapter. The flag means nothing to the renderer; it is there so the
    break carries an option, which is what makes Remove breaks keep it and
    Add page breaks treat it as a fixed point.
  - A chapter's own \\cols becomes cols= on its opening break only. The packer
    copies cols onto every sheet it spills, so that holds on re-packing - and
    the chapter's other breaks stay bare, so Remove breaks takes them out. A
    break carrying an option is one it keeps, and the old hand-set pages
    would survive every re-pack as the short pages this book keeps showing.
    The exception is Gifts (TWO_COLUMNS below): its \\cols 1 is ignored here,
    so it sets in two columns like the rest of the book.
  - A file with no \\ground of its own (the front matter) gets bg=none on the
    breaks that don't choose a ground, so the chapters' ground doesn't spread
    onto pages that were plain.
  - Every \\seed must match, or the book's backgrounds won't read as one set.
    A mismatch stops the build.

The chapter files stay the source. The combined file is output: rebuild it
after changing a chapter, and don't edit it.

    python tools/combine-book.py                  build the combined document
    python tools/combine-book.py pdf EXPORT.pdf   add the cover and chapter
                                                  bookmarks to the Brewery's export
    python tools/combine-book.py contents EXPORT.pdf
                                                  write each chapter's printed page
                                                  number into the contents page, then
                                                  rebuild. Numbers don't change the
                                                  layout, but the export is stale until
                                                  you export it again.
"""
import glob
import io
import os
import re
import shutil
import sys

PDF_DIR = r"C:\Users\feral\OneDrive\Documents\20 Below Production documents\PDF"
OUT = os.path.join(PDF_DIR, "20 Below Player's Guide.md")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COVER = os.path.join(ROOT, "Branding", "20Below-cover-print.png")
FINAL = os.path.join(PDF_DIR, "20 Below Player's Guide - Playtest.pdf")

# Chapters whose own \cols line is ignored, so they set in the book's default two
# columns. Gifts is written for one, but in the combined book one column costs 13
# more sheets, twice the half-empty pages, three more clipped pages, and lines of
# 100 characters (tested 2026-09-30, Digital output). The chapter file is left as
# it is; this only changes the combined copy.
TWO_COLUMNS = {"08-gifts.md"}

DIRECTIVE = re.compile(r"^\\(folio|seed|ground|cols)\b[ \t]*(.*)$")
PAGE = re.compile(r"^\\page\b[ \t]*(.*)$")
FENCE = re.compile(r"^\s*(```+|~~~+)")
H1 = re.compile(r"^# (.+?)\s*$")


def sources():
    """Front matter first, then the chapters by number. Backups (.before-*) and
    the combined file itself are not chapters."""
    files = [f for f in glob.glob(os.path.join(PDF_DIR, "*.md"))
             if re.match(r"\d\d(\.\d)?-", os.path.basename(f))]
    return sorted(files, key=lambda f: os.path.basename(f))


def read(path):
    return io.open(path, encoding="utf-8").read().replace("\r\n", "\n")


def split_directives(text):
    """Lines, and the file's document settings, with the settings lines removed.
    Lines inside fenced code blocks are content, never settings."""
    out, settings, fence = [], {}, None
    for line in text.split("\n"):
        f = FENCE.match(line)
        if f:
            fence = None if fence else f.group(1)[0]
        m = None if fence else DIRECTIVE.match(line)
        if m:
            settings[m.group(1)] = m.group(2).strip()
        else:
            out.append(line)
    return out, settings


def with_options(marker_opts, add):
    """Add options to a \\page marker's option string, never overriding what it
    already says."""
    have = set(re.findall(r"([a-zA-Z][\w-]*)\s*=", marker_opts))
    have |= set(w for w in re.sub(r"[a-zA-Z][\w-]*\s*=\s*(\"[^\"]*\"|\S+)", " ", marker_opts).split())
    extra = [a for a in add if a.split("=")[0] not in have]
    return (marker_opts + " " + " ".join(extra)).strip()


def build():
    files = sources()
    parts, seeds, grounds, titles = [], set(), set(), []
    folio_start = None
    for i, path in enumerate(files):
        name = os.path.basename(path)
        lines, settings = split_directives(read(path))
        if "seed" in settings:
            seeds.add(settings["seed"])
        if "ground" in settings:
            grounds.add(settings["ground"])
        if i == 0:
            folio_start = settings.get("folio", "start=i")
        front = name.startswith("00")
        chapter_one = name.startswith("01-")
        cols = None if name in TWO_COLUMNS else settings.get("cols")
        plain = "ground" not in settings

        # The page each part opens on.
        body = list(lines)
        while body and not body[0].strip():
            body.pop(0)
        if not front:
            if body and PAGE.match(body[0]):
                opener = PAGE.match(body.pop(0)).group(1)
            else:
                opener = ""
            add = ["chapter"] + (["cols=%s" % cols] if cols else []) + (["folio=1"] if chapter_one else [])
            body.insert(0, "\\page " + with_options(opener, add))

        fence = None
        for j, line in enumerate(body):
            f = FENCE.match(line)
            if f:
                fence = None if fence else f.group(1)[0]
            m = None if fence else PAGE.match(line)
            if not m:
                continue
            add = []
            if plain and "bg=" not in m.group(1):
                add.append("bg=none")
            if add:
                body[j] = ("\\page " + with_options(m.group(1), add)).rstrip()

        title = next((H1.match(l).group(1) for l in body if H1.match(l)), name)
        titles.append((name, title))
        parts.append("<!-- %s -->\n\n%s" % (name, "\n".join(body).strip()))

    if len(seeds) > 1:
        sys.exit("the files don't share one \\seed (%s) - make them match first" % ", ".join(sorted(seeds)))
    if len(grounds) > 1:
        sys.exit("the chapters use different \\ground lines (%s) - one book, one ground" % ", ".join(sorted(grounds)))

    # The note can't open the file: anything but settings before the first
    # \page makes a page of its own, and the book would start with a blank.
    # After the title page's break it renders as nothing.
    note = ("<!--\n"
            "  The Player's Guide as one document, for exporting the playtest PDF.\n"
            "  Built by tools/combine-book.py from the files in this folder - don't edit it,\n"
            "  change the chapter and rebuild. Paginate in the chapter files; here, Add page\n"
            "  breaks only packs what's inside each chapter, and every chapter still opens\n"
            "  on its own page.\n"
            "-->")
    first = parts[0].split("\n")
    at = next(k for k, l in enumerate(first) if PAGE.match(l))
    parts[0] = "\n".join(first[:at + 1] + ["", note] + first[at + 1:])
    parts[0] = re.sub(r"^<!-- 00[^>]*-->\n\n", "", parts[0])
    header = ["\\folio " + folio_start]
    if seeds:
        header.append("\\seed " + seeds.pop())
    if grounds:
        header.append("\\ground " + grounds.pop())
    text = "\n".join(header) + "\n\n" + "\n\n".join(parts).rstrip() + "\n"
    text = re.sub(r"\n{3,}", "\n\n", text)
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(text)
    print("wrote %s" % OUT)
    for name, title in titles:
        print("  %-28s %s" % (name, title))
    return titles


def chapter_pages(reader, titles):
    """Where each chapter opens in an export: {title: page index}. A chapter page
    is one whose text begins with the chapter's title; the search starts after the
    contents page, which names every chapter and would otherwise match first."""
    squash = lambda s: re.sub(r"\W+", "", (s or "").lower())
    texts = [squash(p.extract_text()) for p in reader.pages]
    at = next((k + 1 for k, t in enumerate(texts) if t.startswith("contents")), 0)
    found = {}
    for title in titles:
        key = squash(title)
        hit = next((k for k in range(at, len(texts)) if key and texts[k].startswith(key)), None)
        if hit is not None:
            found[title] = hit
            at = hit + 1
    return found


def write_contents(folios):
    """Put printed page numbers into the contents table in the front matter.
    `folios` maps a chapter's number (1-13) to its page."""
    path = os.path.join(PDF_DIR, "00.1-front-matter.md")
    raw = io.open(path, encoding="utf-8", newline="").read()
    crlf = "\r\n" in raw
    s = raw.replace("\r\n", "\n")
    changed = 0
    for n, page in folios.items():
        s, k = re.subn(r"(?m)^\| %d \| ([^|\n]+) \| [^|\n]* \|$" % n,
                       lambda m: "| %d | %s | %s |" % (n, m.group(1), page), s)
        changed += k
    if changed != len(folios):
        sys.exit("expected %d contents rows, matched %d - is the table the 13-chapter list?" % (len(folios), changed))
    io.open(path, "w", encoding="utf-8", newline="").write(s.replace("\n", "\r\n") if crlf else s)
    return changed


def contents(export):
    from pypdf import PdfReader

    chapters = [t for n, t in build() if not n.startswith("00")]
    reader = PdfReader(export)
    found = chapter_pages(reader, chapters)
    first = found.get(chapters[0])
    if first is None:
        sys.exit("couldn't find Chapter 1 in the export, so there's nothing to count from")
    missing = [t for t in chapters if t not in found]
    if missing:
        sys.exit("no page found for: " + ", ".join(missing))
    folios = {i + 1: found[t] - first + 1 for i, t in enumerate(chapters)}
    write_contents(folios)
    build()
    for i, t in enumerate(chapters):
        print("  %2d  %-28s %s" % (i + 1, re.sub(r"^Chapter \d+:\s*", "", t), folios[i + 1]))
    print("contents written. Export again to put them on the page.")


# The player reference sheets, as full pages at the end of the chapter each
# one belongs to, in the order the chapter teaches them. They come from the
# Quick Reference Guide, which is the same sheets already laid out at this
# page size, and carry no folio - the contents page counts the book's own
# pages, and a plate between them doesn't change those numbers.
QUICK_REF = os.path.join(ROOT, "Branding", "20Below-Quick-Reference-Guide.pdf")
CHAPTER_SHEETS = {
    "Introduction": ["How 20 Below Works"],
    "Creating a Character": ["Character Creation", "Elements and Sub-Stats"],
    "How to Play": [
        "Core Roll", "Advantage & Disadvantage", "Difficulty Chart",   # Rolling the Dice
        "Making an Attack",                                            # Attacks
        "Ki",
        "Taking Damage", "The Vitals", "Scars", "Scars, continued",    # Harm and Recovery
        "Time",
        "The Round", "Actions", "The Combat Flow",                     # Combat
        "Range & Movement", "Getting Around", "Chases and Travel",     # Movement
        "Status Effects", "Hazards",                                   # Conditions and Hazards
    ],
    "Skills": ["Skills", "Elements x Skills", "One Skill, Five Elements"],
    "Boons": ["Boons and Flaws"],
    "Resources": ["Resources Ladder", "The Resource Index"],
    "Gifts": ["Using a Gift"],
    "Fate": ["The Fate Triangle", "Kotodama"],
    "Weapons & Equipment": ["Weapons & Armor"],
    "Advancement": ["Advancement"],
}


def chapter_name(title):
    return re.sub(r"^Chapter \d+:\s*", "", title)


def sheet_pages():
    """{sheet title: page} from the Quick Reference Guide's own bookmarks."""
    from pypdf import PdfReader
    if not os.path.exists(QUICK_REF):
        print("no Quick Reference Guide at %s - sheets left out" % QUICK_REF)
        return {}
    guide = PdfReader(QUICK_REF)
    out = {}

    def walk(items):
        for it in items:
            if isinstance(it, list):
                walk(it)
            else:
                out.setdefault(it.title, guide.pages[guide.get_destination_page_number(it)])
    walk(guide.outline)
    wanted = [s for names in CHAPTER_SHEETS.values() for s in names]
    lost = [s for s in wanted if s not in out]
    if lost:
        sys.exit("not in the Quick Reference Guide: " + ", ".join(lost))
    return out


def add_sheets(writer, sheets, title):
    """Append a chapter's sheets; returns [(sheet title, page index)]."""
    added = []
    for name in CHAPTER_SHEETS.get(chapter_name(title), []) if sheets else []:
        writer.add_page(sheets[name])
        added.append((name, len(writer.pages) - 1))
    return added


def finish(export):
    """Cover first, then the Brewery's export, with a bookmark per chapter.
    A chapter's page is the first one, after the last chapter's, whose text
    carries its title."""
    from PIL import Image
    from pypdf import PdfReader, PdfWriter

    titles = [t for n, t in build() if not n.startswith("00")]
    reader = PdfReader(export)
    writer = PdfWriter()
    if os.path.exists(COVER):
        w = float(reader.pages[0].mediabox.width)
        h = float(reader.pages[0].mediabox.height)
        tmp = FINAL + ".cover.pdf"
        img = Image.open(COVER).convert("RGB")
        img.save(tmp, "PDF", resolution=img.width / (w / 72.0))
        cover = PdfReader(tmp).pages[0]
        cover.scale_to(w, h)
        writer.add_page(cover)
        os.remove(tmp)
    found = chapter_pages(reader, titles)
    missing = [t for t in titles if t not in found]
    sheets = sheet_pages()
    # Which chapter each export page belongs to, so a chapter's sheets go in
    # after its last page and before the next chapter opens.
    starts = sorted((found[t], t) for t in titles if t in found)
    ends = {t: (starts[k + 1][0] if k + 1 < len(starts) else len(reader.pages))
            for k, (_, t) in enumerate(starts)}
    opens_at = {i: t for t, i in found.items()}
    placed, moved = {}, {}
    for i, p in enumerate(reader.pages):
        for t, end in ends.items():
            if end == i:
                placed[t] = add_sheets(writer, sheets, t)
        writer.add_page(p)
        if i in opens_at:
            moved[opens_at[i]] = len(writer.pages) - 1
    for t, end in ends.items():
        if end == len(reader.pages):
            placed[t] = add_sheets(writer, sheets, t)

    for title in titles:
        if title in moved:
            parent = writer.add_outline_item(chapter_name(title), moved[title])
            for name, page in placed.get(title, []):
                writer.add_outline_item(name, page, parent=parent)
    print("%d reference sheets placed in their chapters" % sum(len(v) for v in placed.values()))
    with open(FINAL, "wb") as fh:
        writer.write(fh)
    # Repacked without loss - every page renders identically, about a tenth
    # smaller. The fonts are subset already and the hex grounds are unique
    # to each page, so this is as small as it gets without changing the art.
    import pymupdf
    squeezed = FINAL + ".squeezed.pdf"
    doc = pymupdf.open(FINAL)
    doc.save(squeezed, garbage=4, deflate=True, deflate_images=True, deflate_fonts=True, use_objstms=1)
    doc.close()
    os.replace(squeezed, FINAL)
    print("wrote %s - %d pages, %d KB" % (FINAL, len(writer.pages), os.path.getsize(FINAL) // 1024))
    # Every finished deliverable also lands in the one folder they're collected in.
    deliver = os.path.join(ROOT, "00000-deliverables")
    os.makedirs(deliver, exist_ok=True)
    shutil.copy2(FINAL, deliver)
    print("copied to %s" % deliver)
    # And the website's copy, so the download can't fall behind the book.
    # It goes live when it's committed and pushed, not before.
    site = os.path.join(ROOT, "docs", "assets", "downloads", "20Below-Players-Guide-Playtest.pdf")
    shutil.copy2(FINAL, site)
    print("copied to %s (commit and push to publish)" % site)
    if missing:
        print("no page found for: " + ", ".join(missing) + " (no bookmark added)")


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "pdf":
        finish(sys.argv[2])
    elif len(sys.argv) > 2 and sys.argv[1] == "contents":
        contents(sys.argv[2])
    else:
        build()
