# -*- coding: utf-8 -*-
"""Page 5: Scars, Backstory, Notes, Experience.

Scars are the one thing on the sheet the Creator cannot fill in, because
they are earned in play rather than bought at creation: every crossing of
a 0 or below-0 threshold on Health, Poise or Sanity adds one, and they
accumulate rather than replace. Each row carries a tick for the below-zero
case, where the scar brings a real Flaw until it heals.
"""
from sheetkit import *

# the three ways a character picks one up, in the order the Vitals sit on
# page 1
SCARS = [("BATTLE SCARS", C_OK), ("POISE SCARS", C_GOLD), ("MENTAL SCARS", C_AIR)]

open_page(5, 5, "The scars a character has picked up in play, their backstory, room for "
                "whatever else the table needs written down, and their Experience.")

# --- scars ----------------------------------------------------------------
sy = TOP
SH = sized(558, 624)
frame(MARGIN, sy, INNER, SH, RED, "SCARS",
      "AT 0 IT IS COSMETIC - BELOW 0 IT IS A FLAW UNTIL IT HEALS")
scol = (INNER - 96) / 3.0
for ci, (name, col) in enumerate(SCARS):
    x = MARGIN + 48 + ci * scol
    label(x, sy + 126, name, 34, mix(col, LIFT, 0.4), 3.6)
    label(x + scol - 132, sy + 126, "BELOW 0", 29, DIM, 3.0, "end")
    line(x, sy + 144, scol - 72, col, 0.35)
    for ri in range(7):
        y = sy + 204 + ri * sized(54, 65)
        key = name.split()[0].lower()
        line(x, y, scol - 168)
        field("scar.%s.%d.text" % (key, ri), "text", x, y - 42, scol - 168, 48,
              kindOf=key, slot=ri)
        box(x + scol - 132, y - 36, 45, RED, 3.9, 9, 0.8)
        field("scar.%s.%d.below" % (key, ri), "check", x + scol - 132, y - 36, 45, 45,
              kindOf=key, slot=ri, color=RED)

# --- backstory ------------------------------------------------------------
by = sized(882, 948)
BH = sized(1100, 1040)
frame(MARGIN, by, INNER, BH, GOLD, "BACKSTORY", "WHERE THEY CAME FROM")
BS_LINES = sized(16, 15)
field("backstory", "para", MARGIN + 48, by + 90, INNER - 96,
      BS_LINES * 60, lines=BS_LINES)
for i in range(BS_LINES):
    line(MARGIN + 48, by + 132 + i * 60, INNER - 96, RULE, 0.55)

# --- notes ----------------------------------------------------------------
ny = sized(2012, 2018)
NH = sized(946, 886)
frame(MARGIN, ny, INNER, NH, ACCENT, "NOTES", "EVERYTHING THE TABLE NEEDS WRITTEN DOWN")
N_LINES = sized(13, 12)
field("notes", "para", MARGIN + 48, ny + 90, INNER - 96,
      N_LINES * 60, lines=N_LINES)
for i in range(N_LINES):
    line(MARGIN + 48, ny + 132 + i * 60, INNER - 96, RULE, 0.55)

# --- experience -----------------------------------------------------------
xy = sized(2988, 2934)
XH = BOTTOM - xy
frame(MARGIN, xy, INNER, XH, GREEN, "EXPERIENCE")
for off, t in ((900, "EARNED"), (1350, "SPENT"), (1800, "AVAILABLE")):
    label(MARGIN + off, xy + 66, t, 30, DIM, 3.6)
    slot(MARGIN + off, xy + 84, 300, 48, GREEN)
    field("xp.%s" % t.lower(), "text", MARGIN + off, xy + 84, 300, 48, centre=True)

FIELDS_P5 = write("character-sheet-page5.svg", "blocks end %d" % (xy + XH))
