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
WH = sized(720, 689)
frame(MARGIN, wy, INNER, WH, FIRE, "WEAPONS")
# Kit picked up in play goes on where it goes on the sheet, not in a
# toolbar at the bottom of the page.
action(MARGIN + INNER - 42 - 300, wy + 18, 300, 66, FIRE, "+ ADD WEAPON", "weapon.add")
heads(MARGIN, wy + 126, ((48, "WEAPON"), (1010, "DAMAGE"), (1260, "RANGE N / L"),
                         (1660, "AMMO"), (1960, "RELOAD")))
line(MARGIN + 42, wy + 144, INNER - 84, FIRE, 0.35)
for i in range(sized(10, 8)):
    y = wy + 204 + i * sized(54, 65)
    for off, wid, key in ((48, 920, "name"), (1010, 210, "damage"), (1260, 360, "range"),
                          (1660, 250, "ammo"), (1960, 260, "reload")):
        line(MARGIN + off, y, wid)
        field("weapon.%d.%s" % (i, key), "text", MARGIN + off, y - 42, wid, 48,
              slot=i, **({"rollColor": FIRE} if key == "name" else {}))

# --- armour ---------------------------------------------------------------
ay = sized(1044, 1013)
AH = sized(450, 494)
frame(MARGIN, ay, INNER, AH, STEEL, "ARMOUR")
action(MARGIN + INNER - 42 - 300, ay + 18, 300, 66, STEEL, "+ ADD ARMOUR",
       "armour.add")
heads(MARGIN, ay + 126, ((48, "ITEM"), (1140, "HARDNESS"),
                         (1350, "ARMOUR HEALTH LEVELS"), (1950, "BROKEN")))
# Four Zones since 2026-09-24, so their headings run a size down to fit over a checkbox each.
# Each heading is centred on its own checkbox; the numbers are the box centres.
ZONE_COLS = ((700, "C. MASS", "com"), (820, "HEAD", "head"), (940, "ARMS", "arms"), (1060, "LEGS", "legs"))
for zc, zl, _ in ZONE_COLS:
    label(MARGIN + zc + 1.2, ay + 126, zl, 24, DIM, 2.4, "middle")
line(MARGIN + 42, ay + 144, INNER - 84, STEEL, 0.35)
for i in range(5):
    y = ay + 204 + i * sized(54, 65)
    line(MARGIN + 48, y, 560)
    field("armour.%d.name" % i, "text", MARGIN + 48, y - 42, 560, 48, slot=i)
    for zc, _, key in ZONE_COLS:
        box(MARGIN + zc - 22.5, y - 36, sized(45, 48), STEEL, 4.2, 9)
        field("armour.%d.%s" % (i, key), "check", MARGIN + zc - 22.5, y - 36, 45, 45,
              slot=i, color=STEEL)
    slot(MARGIN + 1176, y - 39, 96, 51, STEEL)
    field("armour.%d.hardness" % i, "text", MARGIN + 1176, y - 39, 96, 51,
          slot=i, centre=True)
    # Six, not five: the heaviest suits in the book carry 6 Health Levels.
    pips(MARGIN + 1350, y - 36, 6, sized(45, 48), STEEL, sized(12, 9))
    field("armour.%d.health" % i, "pips", MARGIN + 1350, y - 36, 6 * 57 - 12, 45,
          slot=i, n=6, size=45, gap=12, color=STEEL)
    # Armour takes damage one Level an attack, so it gets the Vitals' -
    # and +. Screen only: on paper the pips are crossed off by hand.
    for gx, glyph, key in ((1740, "-", "minus"), (1830, "+", "plus")):
        if not PAPER:
            label(MARGIN + gx, y, glyph, 42, DIM, 0, "middle")
        field("armour.%d.health.%s" % (i, key), "button", MARGIN + gx - 30, y - 45,
              60, 60, slot=i)
    box(MARGIN + 1962, y - 36, sized(45, 48), RED, 4.2, 9)
    field("armour.%d.broken" % i, "check", MARGIN + 1962, y - 36, 45, 45,
          slot=i, color=RED)

# --- equipment ------------------------------------------------------------
qy = sized(1524, 1537)
QH = BOTTOM - qy
frame(MARGIN, qy, INNER, QH, GOLD, "EQUIPMENT")
action(MARGIN + INNER - 42 - 330, qy + 18, 330, 66, GOLD, "+ ADD EQUIPMENT",
       "equipment.add")
qcol = (INNER - 96) / 3.0
for ci in range(3):
    for ri in range(sized(27, 22)):
        gx, gy_ = MARGIN + 48 + ci * qcol, qy + 150 + ri * sized(54, 65)
        line(gx, gy_, qcol - 72)
        field("gear.%d" % (ci * sized(27, 22) + ri), "text", gx, gy_ - 42,
              qcol - 72, 48, slot=ci * sized(27, 22) + ri)

FIELDS_P4 = write("character-sheet-page4.svg", "blocks end %d" % (qy + QH))
