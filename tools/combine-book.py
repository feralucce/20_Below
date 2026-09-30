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
  - A chapter's own \\cols becomes cols= on every one of its breaks. The
    packer copies cols onto the sheets it spills, so that holds on re-packing.
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
"""
import glob
import io
import os
import re
import sys

PDF_DIR = r"C:\Users\feral\OneDrive\Documents\20 Below Production documents\PDF"
OUT = os.path.join(PDF_DIR, "20 Below Player's Guide.md")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COVER = os.path.join(ROOT, "Branding", "20Below-cover-print.png")
FINAL = os.path.join(PDF_DIR, "20 Below Player's Guide - Playtest.pdf")

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
        cols = settings.get("cols")
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
            add = ["chapter"] + (["folio=1"] if chapter_one else [])
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
            if cols:
                add.append("cols=%s" % cols)
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
    offset = len(writer.pages)
    for p in reader.pages:
        writer.add_page(p)

    squash = lambda s: re.sub(r"\W+", "", (s or "").lower())
    texts = [squash(p.extract_text()) for p in reader.pages]
    at = 0
    missing = []
    for title in titles:
        key = squash(re.sub(r"^Chapter \d+:\s*", "", title))
        hit = next((k for k in range(at, len(texts)) if key and key in texts[k]), None)
        if hit is None:
            missing.append(title)
            continue
        writer.add_outline_item(re.sub(r"^Chapter \d+:\s*", "", title), hit + offset)
        at = hit + 1
    with open(FINAL, "wb") as fh:
        writer.write(fh)
    print("wrote %s - %d pages" % (FINAL, len(writer.pages)))
    if missing:
        print("no page found for: " + ", ".join(missing) + " (no bookmark added)")


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "pdf":
        finish(sys.argv[2])
    else:
        build()
