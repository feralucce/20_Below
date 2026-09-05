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
<title>Player's Quick Reference - 20 Below</title>
<meta name="description" content="The two-page 20 Below player reference: the core roll, the Difficulty ladder, Training Tiers, combat, Ki, Fate Tokens and conditions." />
<link rel="icon" type="image/x-icon" href="assets/brand/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="assets/brand/favicon-32.png" />
<link rel="apple-touch-icon" href="assets/brand/favicon-128.png" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0a1720; --panel: #12232e; --panel-border: #24404f;
    --text: #eaf5fb; --text-dim: #8fadbe; --accent: #3d84c4; --accent-dim: #1c3548;
    --water: #078F9B; --radius: 10px;
    font-family: "Segoe UI", system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); line-height: 1.5; }
  main { max-width: 1100px; margin: 0 auto; padding: 1.5rem 1.25rem 4rem; }
  h1 { font-family: "Bebas Neue", system-ui, sans-serif; font-size: 2.6rem;
       letter-spacing: 0.02em; margin: 1rem 0 0.25rem; }
  h2 { font-family: "Bebas Neue", system-ui, sans-serif; font-size: 1.7rem;
       letter-spacing: 0.02em; color: var(--water); margin: 1.75rem 0 0.5rem;
       border-bottom: 1px solid var(--panel-border); padding-bottom: 0.2rem; }
  h3 { font-family: "Bebas Neue", system-ui, sans-serif; font-size: 1.25rem;
       letter-spacing: 0.02em; margin: 0 0 0.4rem; color: var(--water); }
  p { margin: 0.6rem 0; }
  table { width: 100%; border-collapse: collapse; margin: 0.6rem 0 1rem;
          background: var(--panel); border: 1px solid var(--panel-border);
          border-radius: var(--radius); overflow: hidden; }
  th, td { text-align: left; padding: 0.4rem 0.7rem; border-bottom: 1px solid var(--panel-border);
           vertical-align: top; }
  thead th { background: var(--accent-dim); font-size: 0.85rem; text-transform: uppercase;
             letter-spacing: 0.04em; }
  tbody tr:last-child td { border-bottom: none; }
  td:first-child { white-space: nowrap; }
  .block { background: var(--panel); border: 1px solid var(--panel-border);
           border-left: 4px solid var(--water); border-radius: var(--radius);
           padding: 0.8rem 1rem; margin: 1rem 0; }
  .block.roll { text-align: center; font-size: 1.05rem; }
  .block.roll p { margin: 0.25rem 0; }
  .page-split { border: none; border-top: 2px dashed var(--panel-border); margin: 2.5rem 0 0; }
  .sheet-note { color: var(--text-dim); font-size: 0.9rem; }
  /* Two columns on a wide screen, one on a phone - it is a reference, not an essay. */
  @media (min-width: 900px) {
    .cols { column-count: 2; column-gap: 2.5rem; }
    .cols > h2 { break-after: avoid; }
    .cols > table, .cols > .block { break-inside: avoid; }
  }
  @media print {
    body { background: #fff; color: #000; }
    main { max-width: none; padding: 0; }
    h2, h3 { color: #000; }
    table, .block { background: #fff; border-color: #999; }
    thead th { background: #eee; }
    .page-split { break-after: page; border: none; margin: 0; }
    .no-print { display: none; }
  }
</style>
<link rel="stylesheet" href="/docs/assets/css/site-nav.css" />
</head>
<body>
{% include site-nav.html %}
<main id="main">
<p class="sheet-note no-print">Two pages, meant to be printed and kept at the table.
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
