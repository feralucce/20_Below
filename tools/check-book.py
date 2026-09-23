# -*- coding: utf-8 -*-
"""Compare the web edition against rules/*.md.

    python tools/check-book.py

check-manuscript.py checks the Scrivener manuscript. Nothing checked the
book a reader actually gets, and for the chapters laid out in The Brewery
the manuscript is not even what that book is built from - the formatted
file is. A rules change could land in the rules file and the app, miss the
formatted chapter, and every existing check would still pass.

That is not hypothetical. Conjured Armory ran three different ways at once:
the rules file said Damage plus Gift Level uncapped, the printed chapter
said +1 capped at 5, and the manuscript said +2 capped at 10.

Two checks here:

  LEVELS    every Gift level row in rules/gifts.md has to appear in the
            Gifts chapter. The rows are the mechanics, they are written
            once, and they are quotable - so an exact match after
            normalising punctuation is a fair test and a missing row is a
            real answer rather than a style difference.

  WORDING   rules a change replaced, hunted across the whole book. Prose
            cannot be diffed by meaning, but a superseded sentence can be
            searched for by hand once and then for ever after by this.

Both are deliberately narrow. Neither can tell you the book is right; they
tell you it does not still say something the rules stopped saying.
"""
import io
import os
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEBBOOK = os.path.join(ROOT, "webbook")
RULES = os.path.join(ROOT, "rules")

# (what it is, the wording that must be gone, where to look - "" is anywhere)
RETIRED = [
    ("criticals double the damage dice",
     r"doubles? (your|the) damage dice|double its usual damage dice", ""),
    ("Conjured Armory capped at the weapon table",
     r"capped at the weapon table|capped at the system", ""),
    ("Conjured Armory's old Adder wording",
     r"Damage bonus \(Level 3", ""),
    ("Martial Artist on the old damage scale",
     r"[Uu]narmed Damage rises to \*\*(7|10)\*\*", ""),
    ("Elemental Aura rolling flat dice",
     r"[Cc]ontact damage rises to \*\*\dd10\*\*", ""),
    ("social dice as Leverage",
     r"Repeats decay|earn the ceiling", ""),
    ("Moira described as never attacking at all",
     r"never used as an attacking attribute", ""),
    # How to Play and Running the Game both taught improvised damage off a
    # 1-10 scale the tables had already left: a knife at 5, an anti-materiel
    # rifle at 10. Nothing had ever looked at either chapter.
    ("the old 1-10 improvised damage scale",
     r"a knife (?:or a handgun )?is \*{0,2}5|"
     r"anti-materiel rifle is \*{0,2}10|"
     r"One die per two meters", ""),
    ("a bare Windows path left where a diagram goes",
     r"C:\\\\", ""),
]

# Rules the book prints numbers for and has to explain somewhere.
REQUIRED = [
    ("the attack-dice rule", "gifts.md",
     r"Level plus half the sub-stat"),
    ("Long range imposes Disadvantage", "equipment.md",
     r"[Ll]ong\*{0,2} range imposes \*{0,2}Disadvantage"),
    ("what Reload means", "equipment.md",
     r"\*\*Reload\*\* is the action cost"),
    ("Conjured Armory's damage rule", "gifts.md",
     r"listed rating \*\*plus this Gift's Level\*\*"),
    ("the improvised damage scale, on the current tables", "how-to-play.md",
     r"a knife is 3, an anti-materiel rifle is 5"),
    ("the roll-curve diagram", "how-to-play.md",
     r"diagrams/roll-curve-comparison\.svg"),
    ("the critical-hit diagram", "how-to-play.md",
     r"diagrams/critical-hit-example\.svg"),
]


def norm(s):
    s = s.replace(u"’", "'").replace(u"‘", "'")
    s = s.replace(u"“", '"').replace(u"”", '"')
    s = s.replace(u"–", "-").replace(u"—", "-")
    s = s.replace(u"…", "...").replace(u"×", "x")
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)    # links to their text
    s = re.sub(r"<[^>]+>", " ", s)                     # html the layout adds
    s = re.sub(r"[^a-z0-9 ]+", " ", s.lower())
    return " ".join(s.split())


def read(*parts):
    return io.open(os.path.join(*parts), encoding="utf-8").read()


def gift_levels():
    """{gift: {level: text}} from rules/gifts.md."""
    out = {}
    gift = None
    for line in read(RULES, "gifts.md").splitlines():
        m = re.match(r"^###\s+(?!#)(.+?)\s*$", line)
        if m:
            gift = m.group(1).strip()
        elif gift and line.startswith("|"):
            cells = [c.strip() for c in line.strip("|").split("|")]
            if len(cells) == 2 and re.match(r"^[1-5]$", cells[0]):
                out.setdefault(gift, {})[cells[0]] = cells[1]
    return out


def main():
    problems = []
    checked = 0

    chapters = {n: read(WEBBOOK, n)
                for n in sorted(os.listdir(WEBBOOK)) if n.endswith(".md")}

    # -- LEVELS
    gifts = norm(chapters.get("gifts.md", ""))
    for gift, levels in sorted(gift_levels().items()):
        for lvl, text in sorted(levels.items()):
            checked += 1
            if norm(text) not in gifts:
                problems.append(
                    "gifts: %s Level %s is not in the chapter as the rules "
                    "write it" % (gift, lvl))

    # -- WORDING
    for what, pattern, where in RETIRED:
        for name, body in chapters.items():
            if where and name != where:
                continue
            checked += 1
            if re.search(pattern, body):
                problems.append("%s: %s - RETIRED WORDING STILL PRESENT"
                                % (name, what))

    for what, where, pattern in REQUIRED:
        checked += 1
        if not re.search(pattern, chapters.get(where, "")):
            problems.append("%s: %s - MISSING" % (where, what))

    print("web edition checks: %d" % checked)
    print()
    if problems:
        print("PROBLEMS  %d" % len(problems))
        for p in problems:
            print("  " + p)
    else:
        print("PROBLEMS  0 - the web edition agrees with rules/ on every "
              "check here")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
