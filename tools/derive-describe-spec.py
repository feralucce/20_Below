# -*- coding: utf-8 -*-
"""Which Boons, Flaws and Gifts make the player define something?

    python tools/derive-describe-spec.py            # print the list
    python tools/derive-describe-spec.py --check    # fail if app/ disagrees

app/describe-spec.js decides which entries get a "describe it" field in
the character creator. That list has to match the rules text, and the
rules text moves - so this re-derives it rather than asking anybody to
remember.

The test is narrow on purpose: an entry qualifies when it makes the
player define something AT CREATION that the character then carries.
Alternate Form's form, Animal Friendship's Companion, Necromancy's
raised dead. All of those have an answer that belongs on the sheet.

It deliberately does NOT qualify on the word "choose" alone. Size
Change says "each use, choose one" and Iron Grip says "until you choose
to let go"; those are decisions made fresh in the moment, not facts
about the character. An earlier version of this matched them both and
would have put an empty field on half the book.

The prompts themselves live in app/describe-spec.js and are written by
hand - this only decides who gets one.
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Defining something, once, that sticks.
DEFINES = re.compile(
    r"chosen at creation|chosen once, at creation|chosen when constructed|"
    r"built once, at creation|defined per character|defined at creation|"
    r"at creation, spending|of your choice, chosen|chosen independently at "
    r"creation|chosen when you take this|named weapon system|"
    r"Choose what it is|Choose a feature|name one weapon Category|"
    r"named Skill|Name it with your GM|choose one voice-dependent|"
    r"a specific phrase|One specific humiliation|a lasting \*\*Animal",
    re.I)


def gifts():
    src = io.open(os.path.join(ROOT, "rules", "gifts.md"),
                  encoding="utf-8").read()
    out = []
    for block in re.split(r"\n(?=### )", src):
        m = re.match(r"### ([^\n]+)", block)
        if not m:
            continue
        name = m.group(1).strip()
        if DEFINES.search(block):
            out.append(name)
    return out


def table(fn, heading):
    src = io.open(os.path.join(ROOT, "rules", fn), encoding="utf-8").read()
    body = src.split(heading, 1)[1].split("\n## ", 1)[0]
    out = []
    for line in body.split("\n"):
        if not line.startswith("| ") or "---" in line:
            continue
        cells = [c.strip() for c in line.strip().strip("|").split(" | ")]
        if len(cells) < 2 or cells[0] in ("Boon", "Flaw"):
            continue
        if DEFINES.search(" | ".join(cells[1:])):
            out.append(cells[0])
    return out


found = {
    "gift": gifts(),
    "boon": table("boons.md", "## Boon List"),
    "flaw": table("flaws.md", "## Flaw List"),
}

if "--check" not in sys.argv:
    for kind in ("boon", "flaw", "gift"):
        print("%s (%d):" % (kind.upper(), len(found[kind])))
        for n in found[kind]:
            print("   " + n)
        print()
    raise SystemExit(0)

# --check: compare against what the app actually ships
spec_path = os.path.join(ROOT, "app", "describe-spec.js")
spec = io.open(spec_path, encoding="utf-8").read()
listed = {k: set(re.findall(r"^\s*'([^']+)':", block, re.M))
          for k, block in zip(
              ("boon", "flaw", "gift"),
              re.split(r"export const (?:BOON|FLAW|GIFT)_DESCRIBE\s*=", spec)[1:])}

bad = False
for kind in ("boon", "flaw", "gift"):
    want, have = set(found[kind]), listed.get(kind, set())
    for name in sorted(want - have):
        print("MISSING  %-5s %s - the rules ask for it, the app has no field"
              % (kind, name))
        bad = True
    for name in sorted(have - want):
        print("EXTRA    %-5s %s - the app asks, the rules no longer do"
              % (kind, name))
        bad = True

if bad:
    raise SystemExit(1)
print("app/describe-spec.js matches the rules: %d boons, %d flaws, %d gifts"
      % (len(found["boon"]), len(found["flaw"]), len(found["gift"])))
