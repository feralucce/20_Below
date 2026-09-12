# -*- coding: utf-8 -*-
"""Move a page onto docs/assets/css/20below.css.

Every page on this site carried its own copy of the brand: the same
tokens, the same table and panel rules, the same hub components,
re-typed in a <style> block. Copies drift, and these had - five hub
pages shared one block except for a wordmark cap that had gone out of
step on one of them, and nobody could have seen it without diffing.

A conversion is three moves:

  1. The favicon and font <link> tags become {% include brand-head.html %}.
  2. Rule blocks that say exactly what the shared sheet already says
     are deleted.
  3. Everything else stays.

Step 2 splits the difference between two things that look alike.

Element rules and tokens - :root, body, main, h1, table - ARE the
brand, and where a page's copy has drifted from the shared sheet, the
drift is what we are here to remove. Those go unconditionally.

Component classes are not so simple. license.html has an `.intro`
that is left-aligned body copy at 1.05rem; the hub pages use the same
class name for a centred lede. The reference sheets' `.note` is a
subtitle under the title; the hubs' is a footer rule. Same words,
different things. So the hub components are scoped to
<body class="hub"> in the stylesheet, dropped only from the five hub
pages, and left alone everywhere else.

An earlier pass of this script deleted license.html's `.intro` on the
strength of the name alone, and the page came back centred.

    python tools/adopt-shared-css.py --check      # report, change nothing
    python tools/adopt-shared-css.py --verbose    # say what was kept and why
    python tools/adopt-shared-css.py              # apply

Re-running is safe: a page that already has the include is skipped.
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "docs", "assets", "css", "20below.css")

# The hub pages, the reference sheets, and the one-off pages built the
# same way. Deliberately absent, each for its own reason:
#
#   docs/style-guide.html     is where these tokens come from
#   docs/character-sheet.html carries its own Element palette, which is
#   app/style.css             a decision rather than a duplication
#   index.html, home.html     the front-page hero system
#   _layouts/webbook.html     the book's web edition, which tracks
#                             brew.css rather than the site
PAGES = [
    "rules-hub.html",
    "downloads.html",
    "character-options.html",
    "combat-equipment.html",
    "gm-references.html",
    "license.html",
    "docs/advancement-reference.html",
    "docs/changelog.html",
    "docs/combat-flow-reference.html",
    "docs/creation-wealth-reference.html",
    "docs/louis-reference-chart.html",
    "docs/scars.html",
    "docs/status-effects.html",
]

INCLUDE = "{% include brand-head.html %}"

# The five pages that are the same page with different links in it.
# Only these carry <body class="hub">, and only on these are the hub
# components duplicates rather than the page's own.
HUBS = {"rules-hub.html", "downloads.html", "character-options.html",
        "combat-equipment.html", "gm-references.html"}

# The brand itself. A page's copy of these goes whether or not it has
# drifted - the drift is the thing being removed.
BRAND = re.compile(
    r"^(:root|\*|body|main|header|h1|h2|h3|p|a|code|kbd"
    r"|table|th|td|thead th|tbody tr:last-child td|td:first-child"
    r"|h1:first-child|\.block|\.page-split|\.cols)$")

# Scoped to .hub in the stylesheet, so they are only duplicates there.
HUB_PARTS = re.compile(
    r"^(main > header|main > header h1|\.eyebrow|\.subtitle|\.intro|\.wordmark"
    r"|\.cta|\.cta a|\.cta a:hover|\.cta-meta|\.doc-list|\.doc-card"
    r"|\.doc-card:hover|\.doc-card\.soon|\.doc-card\.soon:hover"
    r"|\.doc-card \.name|\.doc-card \.desc|\.note)$")


def top_level_blocks(css):
    """Split a stylesheet into top-level rule blocks, counting braces
    rather than splitting on them - a media query holds its own."""
    blocks, depth, start = [], 0, 0
    for i, ch in enumerate(css):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                blocks.append(css[start:i + 1])
                start = i + 1
    return blocks


def split_rule(block):
    """(selector, {property: value}) for a flat rule block, or None if
    it is anything more complicated - a media query, a nest. Those are
    never dropped."""
    m = re.match(r"\s*([^{}]+)\{([^{}]*)\}\s*$", block, re.S)
    if not m:
        return None
    sel = " ".join(m.group(1).split())
    decls = {}
    for part in m.group(2).split(";"):
        if ":" not in part:
            continue
        prop, _, val = part.partition(":")
        decls[prop.strip()] = " ".join(val.split())
    return sel, decls


def shared_rules():
    """What 20below.css says, as {selector: {property: value}}. Layer
    wrappers and media queries are flattened away, so a page rule is
    compared against the declaration that would actually reach it."""
    css = io.open(SHEET, encoding="utf-8").read()
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    rules = {}

    def walk(text):
        for block in top_level_blocks(text):
            m = re.match(r"\s*(@layer|@media)[^{]*\{(.*)\}\s*$", block, re.S)
            if m:
                walk(m.group(2))
                continue
            r = split_rule(block)
            if r:
                for sel in r[0].split(","):
                    rules.setdefault(" ".join(sel.split()), {}).update(r[1])

    walk(css)
    return rules


SHARED = shared_rules()


def is_duplicate(block, is_hub):
    """True when the shared sheet covers this block, so the page need
    not carry it.

    Anything that is not a plain rule - a media query, a keyframes
    block - is never dropped: it is not something this sheet claims."""
    r = split_rule(block)
    if not r or not r[1]:
        return False
    sel = r[0]
    if BRAND.match(sel):
        return True
    if is_hub and HUB_PARTS.match(sel):
        return True
    return False


def convert(rel, apply, verbose):
    path = os.path.join(ROOT, rel)
    src = io.open(path, encoding="utf-8").read()
    if INCLUDE in src:
        return (rel, "already converted", 0, 0, None, [])

    m = re.search(r"<style>(.*?)</style>", src, re.S)
    if not m:
        return (rel, "no <style> block", 0, 0, None, [])

    is_hub = rel in HUBS
    blocks = top_level_blocks(m.group(1))
    measure, kept, kept_names = None, [], []
    for b in blocks:
        r = split_rule(b)
        # The measure is the one thing in `main` that is this page's
        # decision rather than the brand's, so it survives as a token.
        if r and r[0] == "main":
            w = re.search(r"max-width:\s*([\d.]+(?:px|rem|em|ch|vw))", b)
            if w:
                measure = w.group(1)
        if is_duplicate(b, is_hub):
            continue
        kept.append(b)
        if r:
            kept_names.append(r[0])

    css = "\n".join(b.strip("\n") for b in kept)
    if measure:
        css = ("  /* This page's own measure - how wide its text column\n"
               "     runs is a decision about this page, not the brand. */\n"
               "  :root { --measure: %s; }\n\n" % measure) + css

    if css.strip():
        style = ("<style>\n"
                 "  /* Colour, type and the shared components live in\n"
                 "     docs/assets/css/20below.css. What is left here is\n"
                 "     this page's own. */\n" + css + "\n</style>")
    else:
        style = "<!-- No page-specific CSS: it is all in 20below.css. -->"

    out = src[:m.start()] + style + src[m.end():]
    links = re.search(r'[ \t]*<link rel="icon".*?(?=<style>|<!-- No page-specific)',
                      out, re.S)
    if links:
        out = out[:links.start()] + out[links.end():]
    anchor = "<style>" if css.strip() else "<!-- No page-specific"
    out = out.replace(anchor, INCLUDE + "\n" + anchor, 1)
    out = re.sub(r'[ \t]*<link rel="stylesheet" href="/docs/assets/css/site-nav\.css"[^>]*>\n',
                 "", out)

    # The hub components are scoped to this class, so the five pages
    # that own them have to say so.
    if is_hub:
        if re.search(r"<body[^>]*\bclass=", out):
            out = re.sub(r'(<body[^>]*class=")', r'\1hub ', out, count=1)
        else:
            out = out.replace("<body", '<body class="hub"', 1)
        if 'class="hub' not in out:
            raise SystemExit("REFUSING - %s: the hub class did not land" % rel)

    if INCLUDE not in out:
        raise SystemExit("REFUSING - %s: the include did not land" % rel)
    if out.count("<style>") > 1:
        raise SystemExit("REFUSING - %s: more than one style block" % rel)

    if apply:
        io.open(path, "w", encoding="utf-8", newline="\n").write(out)
    return (rel, "converted", len(blocks), len(kept), measure, kept_names)


def main():
    apply = "--check" not in sys.argv
    verbose = "--verbose" in sys.argv
    print("%-40s %-16s %6s %6s %8s" % ("page", "", "blocks", "kept", "measure"))
    before = after = 0
    for rel in PAGES:
        rel_, note, n, kept, measure, names = convert(rel, apply, verbose)
        before += n
        after += kept
        print("%-40s %-16s %6s %6s %8s"
              % (rel_, note, n or "-", kept if n else "-", measure or "shared"))
        if verbose and names:
            print("      kept: %s" % ", ".join(names))
    print()
    print("%d rule blocks in, %d out - %d said exactly what the shared sheet says."
          % (before, after, before - after))
    if not apply:
        print("(--check: nothing written)")


main()
