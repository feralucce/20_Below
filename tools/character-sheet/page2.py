# -*- coding: utf-8 -*-
"""Page 2: Descriptors, Skills, Boons, Flaws, Resources.

Block sizes come from the saved characters rather than from guesswork: 31
Descriptors at the top end, 30 Skills taken, six Boons, five Flaws, seven
Resources.
"""
from sheetkit import *

# left column, then right column - the pair that shares an Element sits
# across from itself
DESCRIPTORS = [
    [("ATROPOS", MOIRA), ("INITIATIVE", AIR), ("FEROCITY", FIRE),
     ("STAMINA", WATER), ("SOAK", EARTH)],
    [("KLOTHO", MOIRA), ("PSYCHE", AIR), ("PRESENCE", FIRE),
     ("HEALTH", WATER), ("POTENCE", EARTH)],
]

open_page(2, 5, "Descriptors by sub-stat, the Skill list with its training tiers, and the "
                "Boons, Flaws and Resources a character carries.")

# --- descriptors ----------------------------------------------------------
dy = TOP
DH = 576
frame(MARGIN, dy, INNER, DH, MOIRA, "DESCRIPTORS",
      "ONE PER SUB-STAT POINT - ARGUE A DIFFERENT ELEMENT WITH ONE")
colw = (INNER - 96) / 2.0
for ci, col in enumerate(DESCRIPTORS):
    x = MARGIN + 48 + ci * colw
    for ri, (name, c) in enumerate(col):
        # A sub-stat can earn five Descriptors, which is more than one
        # line holds, so each gets two and sits straight after its name
        # rather than across a gap with a rule in it.
        top = dy + 144 + ri * 90
        label(x, top + 30, name, 33, mix(c, LIFT, 0.45), 3.6)
        field("descriptors.%s" % name.title(), "para",
              x + 234, top, colw - 282, 66, sub=name.title(), lines=2)

# --- skills ---------------------------------------------------------------
sy = 900
SH = sized(1002, 961)
frame(MARGIN, sy, INNER, SH, GREEN, "SKILLS", "TICK TRAINED AND UP")
lx = MARGIN + 42
label(lx, sy + 120, "TIER", 31, DIM, 3.6)
for i, t in enumerate(("2 TRAINED", "3 ADEPT", "4 EXPERT", "5 MASTER")):
    box(lx + 126 + i * 300, sy + 90, 36, GREEN, 4.2, 8)
    label(lx + 177 + i * 300, sy + 120, t, 31, mix(GREEN, LIFT, 0.4), 3.0)
label(MARGIN + INNER - 42, sy + 120, "UNTRAINED AND NOVICE STAY BLANK", 30, DIM, 3.0, "end")
line(MARGIN + 42, sy + 144, INNER - 84, GREEN, 0.35)

scol = (INNER - 96) / 3.0
for ci in range(3):
    for ri in range(sized(15, 12)):
        x = MARGIN + 48 + ci * scol
        y = sy + 216 + ri * sized(54, 65)
        n = ci * sized(15, 12) + ri
        line(x, y, scol - 276, RULE, 0.5)
        field("skill.%d.name" % n, "text", x, y - 42, scol - 276, 48, slot=n,
              rollColor=GREEN)
        for j in range(4):
            box(x + scol - 252 + j * 60, y - 30, 36, GREEN, 3.6, 8, 0.72)
        field("skill.%d.tier" % n, "tiers", x + scol - 252, y - 30, 4 * 60 - 24, 36,
              slot=n, n=4, base=2, size=36, gap=24, color=GREEN)

# --- boons and flaws ------------------------------------------------------
bf = sized(1932, 1891)
BFH = sized(570, 571)
# Boons carry a name and a points box; Flaws carry a name, five Level
# pips, and - for a Secret or a Notable Appearance - what it actually is.
# So the width is split where the writing is, not down the middle.
bw = (INNER - 48) * 0.42
fw = (INNER - 48) - bw
frame(MARGIN, bf, bw, BFH, CYAN, "BOONS", "NO LEVELS")
label(MARGIN + 42, bf + 120, "TRAIT", 30, DIM, 3.6)
label(MARGIN + bw - 109, bf + 120, "POINTS", 30, DIM, 3.6, "middle")
line(MARGIN + 42, bf + 138, bw - 84, CYAN, 0.35)
for i in range(sized(7, 6)):
    y = bf + 204 + i * sized(54, 65)
    line(MARGIN + 48, y, bw - 240)
    field("boon.%d.name" % i, "text", MARGIN + 48, y - 42, bw - 240, 48, slot=i)
    box(MARGIN + bw - 132, y - 33, 45, CYAN, 3.9, 9)
    field("boon.%d.points" % i, "text", MARGIN + bw - 132, y - 33, 45, 45,
          slot=i, centre=True)

fx = MARGIN + bw + 48
frame(fx, bf, fw, BFH, RED, "FLAWS", "LEVEL 1 - 5, AND WHAT IT IS")
label(fx + 42, bf + 120, "TRAIT", 30, DIM, 3.6)
label(fx + fw - 42, bf + 120, "LEVEL", 30, DIM, 3.6, "end")
line(fx + 42, bf + 138, fw - 84, RED, 0.35)
for i in range(sized(7, 6)):
    y = bf + 204 + i * sized(54, 65)
    line(fx + 48, y, fw - 378)
    # The name carries what the Flaw is as well as its name, so it is set
    # a size down: "Notable Appearance - burn scarring down his jaw" has
    # to fit on the line it is written on.
    field("flaw.%d.name" % i, "text", fx + 48, y - 42, fw - 378, 48, slot=i, size=29)
    pips(fx + fw - 330, y - 33, 5, 45, RED, 12)
    field("flaw.%d.level" % i, "pips", fx + fw - 330, y - 33, 5 * 57 - 12, 45,
          slot=i, n=5, size=45, gap=12, color=RED)

# --- resources ------------------------------------------------------------
ry = sized(2532, 2492)
RH = BOTTOM - ry
frame(MARGIN, ry, INNER, RH, GOLD, "RESOURCES",
      "LEVEL IS WHAT YOU BOUGHT - NOW IS WHAT IS LEFT THIS MONTH")
heads(MARGIN, ry + 126, ((42, "RESOURCE"), (1236, "LEVEL 1 - 5"),
                         (1866, "NOW"), (2022, "SPENT")))
line(MARGIN + 42, ry + 144, INNER - 84, GOLD, 0.35)
for i in range(sized(8, 7)):
    y = ry + 204 + i * sized(52, 65)
    line(MARGIN + 48, y, 1140)
    field("resource.%d.name" % i, "text", MARGIN + 48, y - 42, 1140, 48, slot=i,
          rollColor=GOLD)
    pips(MARGIN + 1236, y - 33, 5, 45, GOLD, 12)
    field("resource.%d.level" % i, "pips", MARGIN + 1236, y - 33, 5 * 57 - 12, 45,
          slot=i, n=5, size=45, gap=12, color=GOLD)
    box(MARGIN + 1866, y - 36, 48, GOLD, 4.2, 9)
    field("resource.%d.now" % i, "text", MARGIN + 1866, y - 36, 48, 48,
          slot=i, centre=True)
    box(MARGIN + 2040, y - 36, 48, DIM, 4.2, 9)
    field("resource.%d.spent" % i, "check", MARGIN + 2040, y - 36, 48, 48,
          slot=i, color=DIM)

FIELDS_P2 = write("character-sheet-page2.svg", "blocks end %d" % (ry + RH))
