# -*- coding: utf-8 -*-
"""Collect the Boon, Flaw and Resource descriptions the app can't reach.

    python tools/extract-flavour.py            # write rules/flavour.json
    python tools/extract-flavour.py --check    # fail if it is out of date

Gifts keep their description in rules/gifts.md, as the paragraph under
each `### Name`, so the character creator has always been able to show
them. Boons, Flaws and Resources are tables - name, cost, effect - with
nowhere for a description to live, so the app has only ever shown the
mechanical summary while the book carried the prose.

The prose itself lives in the Scrivener manuscript and reaches the print
chapters from there. This reads the print chapters, because they are
where the text already sits in a machine-readable shape: the first body
line of a `::: boon|flaw|resource Name` block is its description.

Nothing here is authored. Editing rules/flavour.json by hand is pointless
- the next run overwrites it. Edit the manuscript.

The guard that matters is the membership check: every entry in a rules
table must have a description, and every description must match an
entry. A renamed entry otherwise loses its prose silently, which is
precisely how Features nearly lost its describe-box answers.
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = (r"C:\Users\feral\OneDrive\Documents\20 Below Production documents"
       r"\PDF")
OUT = os.path.join(ROOT, "rules", "flavour.json")

# kind -> (print chapter, rules file, the heading its table follows).
# The headings are the ones app/parse/*.js passes to extractTableAfter,
# deliberately - if the app reads one table and this reads another, the
# membership check below is checking the wrong thing.
SOURCES = {
    "boon": ("06-boons.md", "boons.md", "## Boon List"),
    "flaw": ("09-flaws.md", "flaws.md", "## Flaw List"),
    "resource": ("07-resources.md", "resources.md", "## What a Resource Is"),
}


def table_names(fn, heading):
    """The first column of the rules table, which is what the app parses.

    Same rule as the app's extractTableAfter: the FIRST table following
    the heading, however far below it that falls. The Resource catalog
    sits several sections down from "What a Resource Is", so stopping at
    the next heading finds no table at all.
    """
    src = io.open(os.path.join(ROOT, "rules", fn), encoding="utf-8").read()
    if heading not in src:
        raise SystemExit("REFUSING - %s has no %r" % (fn, heading))
    after = src.split(heading, 1)[1].split("\n")
    out, started = [], False
    for line in after:
        if line.startswith("|"):
            started = True
            if "---" in line:
                continue
            name = line.strip().strip("|").split("|")[0].strip()
            if name and name not in ("Boon", "Flaw", "Resource"):
                out.append(name)
        elif started:
            break       # the table ended; a later one is a different table
    if not out:
        raise SystemExit("REFUSING - no table found after %r in %s"
                         % (heading, fn))
    return out


def flavours(kind, fn):
    """Block title -> its first body line.

    The title may carry a cost parenthetical ("Alertness (3, Lesser)").
    The name is everything before the FIRST " (" - no entry name contains
    one, while Special Movement's cost contains a second: "Special
    Movement (3 (Lesser), may be purchased multiple times)".
    """
    src = io.open(os.path.join(PDF, fn), encoding="utf-8").read()
    out = {}
    pattern = r"^::: %s (.+)$\n(.+)$" % kind
    for m in re.finditer(pattern, src, re.M):
        title, first = m.group(1).strip(), m.group(2).strip()
        name = title[:title.find(" (")].strip() if title.endswith(")") \
            else title
        if name.endswith("(continued)"):
            continue
        if first.startswith(("**", ":::", "|", "- ")):
            raise SystemExit("REFUSING - %s's first line is not a description:"
                             "\n  %s" % (name, first[:100]))
        if name in out:
            raise SystemExit("REFUSING - %r appears twice in %s" % (name, fn))
        out[name] = first
    return out



def equipment_names():
    """Every item in rules/weapons.md, across all of its tables.

    parseEquipment walks every table in the file and titles each by the
    nearest heading, so this has to as well. Reading one table would
    check 12 of 325 items and call it agreement.
    """
    src = io.open(os.path.join(ROOT, "rules", "weapons.md"),
                  encoding="utf-8").read()
    out = []
    for line in src.split("\n"):
        if not line.startswith("| ") or line.startswith("| -"):
            continue
        name = line.strip().strip("|").split("|")[0].strip()
        if name and name not in ("Item", "Weapon", "Armor", "Vehicle", "Level"):
            out.append(name)
    return out


def equipment_flavours():
    """Card title -> its first body line.

    An item title ends in a Wealth parenthetical, or in nothing at all
    for the few things that cost nothing. Stripping at the FIRST " ("
    would turn "Aerodyne (flying car)" into "Aerodyne", so only a
    trailing "(WR n)" comes off.
    """
    src = io.open(os.path.join(PDF, "11-equipment.md"), encoding="utf-8").read()
    out = {}
    for m in re.finditer(r"^::: item (.+)$\n(.+)$", src, re.M):
        title, first = m.group(1).strip(), m.group(2).strip()
        name = re.sub(r"\s*\(WR [0-6]\)$", "", title).strip()
        if first.startswith(("**", ":::", "|", "- ")):
            raise SystemExit("REFUSING - %s's first line is not a description:"
                             "\n  %s" % (name, first[:100]))
        if name in out:
            raise SystemExit("REFUSING - %r appears twice in the chapter" % name)
        out[name] = first
    return out


check = "--check" in sys.argv
data, problems = {}, []
for kind, (print_fn, rules_fn, heading) in sorted(SOURCES.items()):
    found = flavours(kind, print_fn)
    expected = table_names(rules_fn, heading)
    missing = [n for n in expected if n not in found]
    extra = [n for n in found if n not in expected]
    if missing:
        problems.append("%s: no description for %s" % (kind, missing))
    if extra:
        problems.append("%s: described but not in the rules table: %s"
                        % (kind, extra))
    data[kind] = {n: found[n] for n in expected if n in found}

# Equipment is not one table and its titles do not carry a cost, so it is
# collected separately and then checked exactly like the rest.
found = equipment_flavours()
expected = equipment_names()
missing = [n for n in expected if n not in found]
extra = [n for n in found if n not in expected]
if missing:
    problems.append("item: no description for %s" % missing)
if extra:
    problems.append("item: described but not in the rules table: %s" % extra)
data["item"] = {n: found[n] for n in expected if n in found}

if problems:
    raise SystemExit("REFUSING - the chapters and the rules disagree:\n  "
                     + "\n  ".join(problems))

text = json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
counts = ", ".join("%d %ss" % (len(v), k) for k, v in sorted(data.items()))

if check:
    have = io.open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
    if have != text:
        raise SystemExit("REFUSING - rules/flavour.json is out of date. Run:\n"
                         "      python tools/extract-flavour.py")
    print("rules/flavour.json is current: %s" % counts)
else:
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(text)
    print("rules/flavour.json written: %s" % counts)
