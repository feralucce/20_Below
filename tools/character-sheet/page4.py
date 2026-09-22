# -*- coding: utf-8 -*-
"""Page 4: Weapons, Armour, Equipment.

Armour gets its own block rather than a row in the gear list, because it
has a Zone, a Hardness and Health Levels of its own that get ticked off
until it breaks. Equipment is the catch-all underneath: 81 slots, which
covers the 37 gear purchases on the heaviest saved character.
"""
from sheetkit import *

open_page(4, 5, "The weapons and armour a character carries, and everything else in their "
                "hands or on their back.")

# --- weapons --------------------------------------------------------------
wy = TOP
WH = 720
frame(MARGIN, wy, INNER, WH, FIRE, "WEAPONS")
heads(MARGIN, wy + 126, ((48, "WEAPON"), (1010, "DAMAGE"), (1260, "RANGE N / L"),
                         (1660, "AMMO"), (1960, "RELOAD")))
line(MARGIN + 42, wy + 144, INNER - 84, FIRE, 0.35)
for i in range(10):
    y = wy + 204 + i * 54
    for off, wid, key in ((48, 920, "name"), (1010, 210, "damage"), (1260, 360, "range"),
                          (1660, 250, "ammo"), (1960, 260, "reload")):
        line(MARGIN + off, y, wid)
        field("weapon.%d.%s" % (i, key), "text", MARGIN + off, y - 42, wid, 48, slot=i)

# --- armour ---------------------------------------------------------------
ay = 1044
AH = 450
frame(MARGIN, ay, INNER, AH, STEEL, "ARMOUR",
      "HARDNESS IS THE DAMAGE THRESHOLD - ARMOUR HEALTH IS REMOVED BEFORE YOURS")
heads(MARGIN, ay + 126, ((48, "ITEM"), (900, "BODY"), (1020, "HEAD"), (1140, "HARDNESS"),
                         (1350, "ARMOUR HEALTH LEVELS"), (1950, "BROKEN")))
line(MARGIN + 42, ay + 144, INNER - 84, STEEL, 0.35)
for i in range(5):
    y = ay + 204 + i * 54
    line(MARGIN + 48, y, 800)
    field("armour.%d.name" % i, "text", MARGIN + 48, y - 42, 800, 48, slot=i)
    box(MARGIN + 912, y - 36, 45, STEEL, 4.2, 9)
    field("armour.%d.body" % i, "check", MARGIN + 912, y - 36, 45, 45,
          slot=i, color=STEEL)
    box(MARGIN + 1032, y - 36, 45, STEEL, 4.2, 9)
    field("armour.%d.head" % i, "check", MARGIN + 1032, y - 36, 45, 45,
          slot=i, color=STEEL)
    slot(MARGIN + 1176, y - 39, 96, 51, STEEL)
    field("armour.%d.hardness" % i, "text", MARGIN + 1176, y - 39, 96, 51,
          slot=i, centre=True)
    pips(MARGIN + 1350, y - 36, 5, 45, STEEL, 12)
    field("armour.%d.health" % i, "pips", MARGIN + 1350, y - 36, 5 * 57 - 12, 45,
          slot=i, n=5, size=45, gap=12, color=STEEL)
    box(MARGIN + 1962, y - 36, 45, RED, 4.2, 9)
    field("armour.%d.broken" % i, "check", MARGIN + 1962, y - 36, 45, 45,
          slot=i, color=RED)

# --- equipment ------------------------------------------------------------
qy = 1524
QH = BOTTOM - qy
frame(MARGIN, qy, INNER, QH, GOLD, "EQUIPMENT")
qcol = (INNER - 96) / 3.0
for ci in range(3):
    for ri in range(27):
        gx, gy_ = MARGIN + 48 + ci * qcol, qy + 150 + ri * 54
        line(gx, gy_, qcol - 72)
        field("gear.%d" % (ci * 27 + ri), "text", gx, gy_ - 42, qcol - 72, 48,
              slot=ci * 27 + ri)

FIELDS_P4 = write("character-sheet-page4.svg", "blocks end %d" % (qy + QH))
