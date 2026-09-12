# -*- coding: utf-8 -*-
"""Build docs/player-quick-reference.html from the Brewery source.

One source, two outputs. brew/examples/player-quick-reference.md is the
printable two-page sheet the Brewery lays out; this renders the same file
as a web page so the two can't drift apart. Everything the sheet says has
to be true in both places, and the way to guarantee that is to only write
it once.

    python tools/build-quick-reference.py

Handles the Brewery's own block syntax (::: roll, ::: box, ::: wide) and
its \\page marker, plus enough markdown for tables, bold and headings. It
is not a general markdown renderer and does not try to be - it renders
this one file.
"""
import io
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "brew", "examples", "player-quick-reference.md")
OUT = os.path.join(ROOT, "docs", "player-quick-reference.html")

def inline(text):
    text = (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*]+?)\*(?!\*)", r"<em>\1</em>", text)
    return text

def render(md):
    out, lines, i = [], md.split("\n"), 0
    while i < len(lines):
        line = lines[i].rstrip()

        if line.startswith("\\page"):
            out.append('<hr class="page-split" />')
            i += 1
            continue

        # ::: block Title ... :::
        m = re.match(r"^::: *([a-z]+)(?:\.([a-z]+))? *(.*)$", line)
        if m:
            kind, variant, title = m.group(1), m.group(2), m.group(3).strip()
            body, i = [], i + 1
            while i < len(lines) and not lines[i].startswith(":::"):
                body.append(lines[i])
                i += 1
            i += 1
            cls = kind + (" " + kind + "--" + variant if variant else "")
            out.append('<div class="block %s">' % cls)
            if title:
                out.append("<h3>%s</h3>" % inline(title))
            if kind == "roll":
                # A roll block is a stack of lookup lines, not a paragraph.
                # Each line stands on its own, the way the Brewery sets it.
                for b in body:
                    if b.strip():
                        out.append("<p>%s</p>" % inline(b.strip()))
            else:
                out.extend(render("\n".join(body)))
            out.append("</div>")
            continue

        if line.startswith("|"):
            rows, i = [], i
            while i < len(lines) and lines[i].startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            sep = 1 if len(rows) > 1 and set("".join(rows[1]).replace(" ", "")) <= set("-:") else 0
            out.append("<table>")
            if sep and any(c for c in rows[0]):
                out.append("<thead><tr>" + "".join("<th>%s</th>" % inline(c) for c in rows[0]) + "</tr></thead>")
            out.append("<tbody>")
            for r in rows[(sep + 1) if sep else 0:]:
                out.append("<tr>" + "".join("<td>%s</td>" % inline(c) for c in r) + "</tr>")
            out.append("</tbody></table>")
            continue

        m = re.match(r"^(#{1,3}) +(.*)$", line)
        if m:
            lvl = len(m.group(1))
            out.append("<h%d>%s</h%d>" % (lvl, inline(m.group(2)), lvl))
            i += 1
            continue

        if line.strip():
            para, i = [], i
            while i < len(lines) and lines[i].strip() and not lines[i].startswith(("|", "#", ":::", "\\")):
                para.append(lines[i].strip())
                i += 1
            out.append("<p>%s</p>" % inline(" ".join(para)))
            continue

        i += 1
    return out

HEAD = """---
nav_section: start
---
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>20 Below at a Glance</title>
<meta name="description" content="The 20 Below player reference: the core roll, the Difficulty ladder, Training Tiers, combat, Ki, Fate Tokens and conditions." />
<style>
  /* Everything general - colour, type, tables, blocks, the
     two-column sheet layout, print - is in 20below.css. Only
     what is particular to this sheet lives here. */
  /* The Difficulty ladder, hardest to easiest. Decoration only - the
     name column carries the rung, so it survives greyscale and
     anyone the colour does not reach. */
  /* Fixed layout splits three columns into equal thirds, and the first
     one holds a single digit. Naming the narrow two lets each example
     set on one line, which is the difference between this sheet being
     three pages and four. */
  /* A lookup table carries tighter rows than body copy. This one is read
     a line at a time mid-roll, not left to right, and the extra leading
     only costs page count. */
  .wide--difficulty td,.wide--difficulty th{padding-top:.14em;padding-bottom:.14em}
  .wide--difficulty td:first-child,.wide--difficulty th:first-child{width:11%}
  .wide--difficulty td:nth-child(2),.wide--difficulty th:nth-child(2){width:22%}
  .wide--difficulty tbody tr:nth-child(1){background:hsla(356,72%,48%,.13)}
  .wide--difficulty tbody tr:nth-child(1) td:first-child{background:hsla(356,72%,48%,.42);border-left:5px solid hsla(356,72%,46%,.95)}
  .wide--difficulty tbody tr:nth-child(2){background:hsla(8,72%,48%,.13)}
  .wide--difficulty tbody tr:nth-child(2) td:first-child{background:hsla(8,72%,48%,.42);border-left:5px solid hsla(8,72%,46%,.95)}
  .wide--difficulty tbody tr:nth-child(3){background:hsla(20,72%,48%,.13)}
  .wide--difficulty tbody tr:nth-child(3) td:first-child{background:hsla(20,72%,48%,.42);border-left:5px solid hsla(20,72%,46%,.95)}
  .wide--difficulty tbody tr:nth-child(4){background:hsla(32,72%,48%,.13)}
  .wide--difficulty tbody tr:nth-child(4) td:first-child{background:hsla(32,72%,48%,.42);border-left:5px solid hsla(32,72%,46%,.95)}
  .wide--difficulty tbody tr:nth-child(5){background:hsla(44,72%,48%,.13)}
  .wide--difficulty tbody tr:nth-child(5) td:first-child{background:hsla(44,72%,48%,.42);border-left:5px solid hsla(44,72%,46%,.95)}
  .wide--difficulty tbody tr:nth-child(6){background:hsla(56,72%,48%,.13)}
  .wide--difficulty tbody tr:nth-child(6) td:first-child{background:hsla(56,72%,48%,.42);border-left:5px solid hsla(56,72%,46%,.95)}
  .wide--difficulty tbody tr:nth-child(7){background:hsla(72,72%,48%,.13)}
  .wide--difficulty tbody tr:nth-child(7) td:first-child{background:hsla(72,72%,48%,.42);border-left:5px solid hsla(72,72%,46%,.95)}
  .wide--difficulty tbody tr:nth-child(8){background:hsla(88,72%,48%,.13)}
  .wide--difficulty tbody tr:nth-child(8) td:first-child{background:hsla(88,72%,48%,.42);border-left:5px solid hsla(88,72%,46%,.95)}
  .wide--difficulty tbody tr:nth-child(9){background:hsla(104,72%,48%,.13)}
  .wide--difficulty tbody tr:nth-child(9) td:first-child{background:hsla(104,72%,48%,.42);border-left:5px solid hsla(104,72%,46%,.95)}
  .wide--difficulty tbody tr:nth-child(10){background:hsla(120,72%,48%,.13)}
  .wide--difficulty tbody tr:nth-child(10) td:first-child{background:hsla(120,72%,48%,.42);border-left:5px solid hsla(120,72%,46%,.95)}
  .wide--difficulty tbody tr:nth-child(11){background:hsla(136,72%,48%,.13)}
  .wide--difficulty tbody tr:nth-child(11) td:first-child{background:hsla(136,72%,48%,.42);border-left:5px solid hsla(136,72%,46%,.95)}
</style>
{% include brand-head.html %}
</head>
<body>
{% include site-nav.html %}
<main id="main">
<p class="sheet-note no-print">Four pages, meant to be printed and kept at the table.
Everything here is also in the book - this is only the part you look up mid-roll.
Generated from the same source the printed sheet uses.</p>
"""

TAIL = """</main>
<script src="/docs/assets/js/site-nav.js"></script>
</body>
</html>
"""

def main():
    md = io.open(SRC, encoding="utf-8").read()
    html = render(md)
    # wrap each page in a two-column flow
    body = "\n".join(html).replace(
        '<hr class="page-split" />', '</div>\n<hr class="page-split" />\n<div class="cols">')
    body = '<div class="cols">' + body + "</div>"
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(HEAD + body + TAIL)
    print("wrote %s" % os.path.relpath(OUT, ROOT))
    print("  %d source lines -> %d html lines" % (len(md.split("\n")), len(html)))

main()
