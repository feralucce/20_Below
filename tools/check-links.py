# -*- coding: utf-8 -*-
"""Check every cross-reference in rules/ - target AND destination.

    python tools/check-links.py

Two classes of problem, and the second is the one that hides:

  BROKEN   the file or the anchor does not exist. Loud, easy to find.

  MISLEAD  the anchor resolves, but to a heading that has nothing to do
           with the link's own words. "past what [Stamina](#poise)
           covers" is a working link to the wrong rule, and a checker
           that only asks "does #poise exist?" says everything is fine.

The second check is a heuristic and will raise things that are correct on
purpose - the book calls the Core Mechanic "the core roll" and links to it
that way. It prints those as REVIEW rather than failing on them, so the
list is worth reading rather than just passing.

Exits non-zero only on BROKEN.
"""
import glob
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RULES = os.path.join(ROOT, "rules")

# Words that carry no signal when matching link text against a heading.
NOISE = {
    "a", "an", "the", "of", "to", "and", "or", "for", "in", "on", "at", "by",
    "its", "it", "this", "that", "with", "from", "see", "your", "you", "own",
    "rule", "rules", "section", "below", "above", "here", "per", "as",
}


def slug(text):
    """GitHub's heading slug: lowercase, drop punctuation, spaces to dashes."""
    text = re.sub(r"\*\*|\*|`", "", text)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"[^a-z0-9 \-_]", "", text.strip().lower())
    return text.replace(" ", "-")


def words(text):
    text = re.sub(r"\*\*|\*|`", "", text.lower())
    return {w for w in re.findall(r"[a-z0-9]+", text) if w not in NOISE}


def headings(path):
    """anchor -> heading text, for one file."""
    out = {}
    for m in re.finditer(r"^#{1,6} +(.+?)\s*$", io.open(path, encoding="utf-8").read(), re.M):
        out[slug(m.group(1))] = re.sub(r"\*\*|\*|`", "", m.group(1)).strip()
    return out


def main():
    files = {os.path.basename(p): p for p in glob.glob(os.path.join(RULES, "*.md"))}
    heads = {name: headings(path) for name, path in files.items()}

    broken, mislead = [], []
    checked = 0

    for name, path in sorted(files.items()):
        text = io.open(path, encoding="utf-8").read()
        for m in re.finditer(r"\[([^\]]+)\]\(([^)\s]+)\)", text):
            label, target = m.group(1), m.group(2)
            if target.startswith(("http", "mailto", "../", "#!")):
                continue
            fn, _, anchor = target.partition("#")
            dest = fn or name
            checked += 1

            if fn and dest not in files:
                broken.append("%s: [%s](%s) - no such file" % (name, label, target))
                continue
            if not anchor:
                continue
            if anchor not in heads.get(dest, {}):
                broken.append("%s: [%s](%s) - no such heading" % (name, label, target))
                continue

            # The anchor resolves. Does it resolve where the words point?
            heading = heads[dest][anchor]
            lw, hw = words(label), words(heading)
            # A catalogue heading answers for every entry in it: linking the
            # Boon "Iron Will" to "Boon List" is right, and flagging all
            # forty of those buries the one link that is actually wrong.
            catalogue = heading.rstrip().lower().endswith((' list', ' tiers', ' content', ' triggers'))
            if lw and hw and not (lw & hw) and not catalogue:
                mislead.append("%s: [%s](%s)%s      lands on: %s"
                               % (name, label, target, os.linesep, heading))

    print("cross-references checked: %d" % checked)
    print()
    print("BROKEN  %d" % len(broken))
    for b in broken:
        print("  " + b)
    print()
    print("REVIEW  %d - the anchor resolves, but shares no word with the heading"
          % len(mislead))
    for m in mislead:
        print("  " + m)

    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
