# -*- coding: utf-8 -*-
"""Compare the manuscript's mechanical claims against rules/*.md.

    python tools/check-manuscript.py

The webbook merges tables out of rules/ automatically, so tabled data
cannot drift. Prose can, and does: the Glossary sat twelve entries behind
for weeks and the Gifts chapter taught a superseded damage scale for a day,
and every existing check reported success throughout. Nothing compares the
two by meaning, because nothing can.

What this does instead is check FACTS. Each entry below is a claim the
rules make, a chapter it has to be true in, and the shape it takes there.
A claim that cannot be found is reported; so is a chapter still carrying
the wording a rule replaced.

It is deliberately not exhaustive. It covers the mechanics that have
actually drifted, and the right response to a new drift is a new line here
rather than a promise to look harder next time.
"""
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scriv2brew import DATA, RUN, decode, chapter_uuid, BOOK       # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (chapter fragment, what it is, must appear, must NOT appear)
CLAIMS = [
    # --- Chapter 04, the combat engine
    ("Chapter 04", "Ki is strongest Element + 8", [r"strongest [Ee]lement\s*\+?\s*8"], []),
    ("Chapter 03", "Vitals are 5 plus a sub-stat",
     [r"5 (plus|\+) your Health"], []),
    ("Chapter 04", "social dice are Training Tiers", [r"Training Tier"],
     [r"[Ll]everage", r"[Ee]arn the ceiling", r"Repeats decay"]),
    ("Chapter 04", "critical sends half the dice through",
     [r"half of the Damage Dice", r"Klotho"], [r"doubles your damage dice"]),
    ("Chapter 04", "Moira attacks socially, never physically",
     [r"Moira never governs a Physical"], [r"never used as an attacking attribute"]),
    ("Chapter 04", "below-zero rest rules",
     [r"Short Rest gives you nothing", r"one Health Level, and only one"], []),
    ("Chapter 04", "Poise floor costs a Sanity", [r"resets to 0"], []),
    ("Chapter 04", "Dying is named", [r"\bDying\b"], []),
    ("Chapter 04", "Vitals is the collective term", [r"Vital"], []),

    # --- Chapter 02, the glossary
    ("Chapter 02", "Vitals entry", [r"Vitals\}"], []),
    ("Chapter 02", "Dying entry", [r"Dying\}"], []),
    ("Chapter 02", "critical hit entry is the new rule",
     [r"Half the attack"], [r"double its usual damage dice"]),
    ("Chapter 02", "a Round is 6 seconds", [r"6 seconds"], [r"about ten rounds"]),

    # --- Chapter 05, skills
    ("Chapter 05", "Ridicule exists", [r"Ridicule"], []),

    # --- Chapter 08, gifts
    ("Chapter 08", "Onslaught and Salvo exist", [r"Onslaught", r"Salvo"], []),

    # --- Chapter 11, equipment
    ("Chapter 11", "weapons top out at 5 dice", [], [r"\b10d10\b", r"\b7d10\b"]),
]


def chapter_text(frag):
    uuid, title = chapter_uuid(frag, within=BOOK)
    raw = io.open(os.path.join(DATA, uuid, "content.rtf"), encoding="utf-8").read()
    return raw, " ".join(decode(m.group(5)) for m in RUN.finditer(raw))


def main():
    cache = {}
    problems = []
    checked = 0
    for frag, what, must, must_not in CLAIMS:
        if frag not in cache:
            cache[frag] = chapter_text(frag)
        raw, plain = cache[frag]
        hay = raw + " " + plain
        for pat in must:
            checked += 1
            if not re.search(pat, hay):
                problems.append("%s: %s - MISSING %r" % (frag, what, pat))
        for pat in must_not:
            checked += 1
            if re.search(pat, hay):
                problems.append("%s: %s - STALE WORDING STILL PRESENT %r"
                                % (frag, what, pat))

    print("manuscript claims checked: %d" % checked)
    print()
    if problems:
        print("PROBLEMS  %d" % len(problems))
        for p in problems:
            print("  " + p)
    else:
        print("PROBLEMS  0 - the manuscript agrees with rules/ on every claim checked")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
