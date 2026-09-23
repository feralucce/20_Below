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

    # More of Chapter 08. These are the drifts the manuscript actually had:
    # it was two revisions behind on Gift damage, teaching a scale the game
    # had replaced twice, and none of the checks above could see it because
    # none of them looked at a level row.
    ("Chapter 08", "Conjured Armory throws and recalls",
     [r"throw the conjured weapon"],
     [r"capped at the system", r"capped at the weapon table",
      r"Damage bonus \(Level 3"]),
    ("Chapter 08", "the attack-dice rule is stated once",
     [r"Level plus half the sub-stat"], []),
    ("Chapter 08", "Martial Artist is on the weapon damage scale",
     [], [r"[Uu]narmed Damage rises to .{0,14}\b(7|10)\b"]),
    ("Chapter 08", "Elemental Aura scales with Ferocity",
     [], [r"[Cc]ontact damage rises to .{0,8}\dd10"]),
    ("Chapter 08", "Limiters are permanent",
     [], [r"bought off later with XP"]),
    ("Chapter 08", "Onslaught and Salvo carry their levels",
     [r"attack anything in .{0,14}Melee", r"attack one target out to"], []),

    # --- Chapter 12, advancement
    ("Chapter 12", "criticals send half the dice through, not double",
     [], [r"doubles? the damage dice", r"doubles? your damage dice"]),

    # --- Chapter 11, equipment
    ("Chapter 11", "weapons top out at 5 dice", [], [r"\b10d10\b", r"\b7d10\b"]),
    ("Chapter 11", "the range bands are explained",
     [r"[Ll]ong.{0,6} range imposes"], []),
    ("Chapter 11", "Reload is explained",
     [r"Reload.{0,6} is the action cost"], []),

    # --- Chapters 04 and 13, improvised damage
    # Both taught hazards off a 1-10 scale the weapon tables had left
    # behind: a knife at 5, an anti-materiel rifle at 10, and a fall
    # capable of twice the worst a gun could do. Neither chapter had
    # anything checking it.
    ("Chapter 04", "hazards are on the current damage scale",
     [r"a knife is 3, an anti-materiel rifle is 5",
      r"One die per four meters"],
     [r"a knife is 5", r"anti-materiel rifle is 10",
      r"One die per two meters", r"Five dice at city speed"]),
    ("Chapter 13", "improvised damage is on the current scale",
     [r"A knife or a handgun is 3"],
     [r"A knife or a handgun is 5",
      r"anti-materiel rifle is 10"]),
    ("Chapter 04", "no bare file paths where a diagram goes",
     [], [r"C:\\\\"]),
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
