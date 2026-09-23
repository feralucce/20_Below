# -*- coding: utf-8 -*-
"""Page 3: Gifts, and nothing else.

A Gift is not a line item. It carries a Level, a Ki cost, what it
actually does at that Level, and the Adders and Limiters bought onto it -
so each one gets a card with six lines of room to say what it does,
because what a Gift does is a paragraph in the rules, not a phrase.

Five to a page. A character with more than five gets another copy of this
page: the app repeats it and offsets the slot numbers, which is why the
page number is a field rather than printed here.
"""
from sheetkit import *

SLOTS = 5
CARD_H = 528
PITCH = 546

open_page(3, 5, "The Gifts a character has: Level, Ki cost, what each one does, and the "
                "Adders and Limiters bought onto it.")

gy = TOP
GH = BOTTOM - gy
frame(MARGIN, gy, INNER, GH, MOIRA, "GIFTS",
      "GIFT CHECK: 2d10 UNDER CURRENT KI - FAIL AND IT COSTS 1 KI")

cx = MARGIN + 42
cw = INNER - 84
for i in range(SLOTS):
    cy = gy + 120 + i * PITCH
    frame(cx, cy, cw, CARD_H, mix(MOIRA, LIFT, 0.1), r=24)
    # name, Level, Ki per use
    label(cx + 36, cy + 66, "GIFT", 30, DIM, 3.6)
    line(cx + 132, cy + 48, 1020)
    field("gift.%d.name" % i, "text", cx + 132, cy + 6, 1020, 48, slot=i,
          rollColor=MOIRA)
    label(cx + 1230, cy + 66, "LEVEL", 30, DIM, 3.6)
    pips(cx + 1374, cy + 24, 5, 45, MOIRA, 12)
    field("gift.%d.level" % i, "pips", cx + 1374, cy + 24, 5 * 57 - 12, 45,
          slot=i, n=5, size=45, gap=12, color=MOIRA)
    label(cx + 1782, cy + 66, "KI", 30, DIM, 3.6)
    slot(cx + 1848, cy + 21, 108, 51, CYAN)
    field("gift.%d.ki" % i, "text", cx + 1848, cy + 21, 108, 51, slot=i, centre=True)
    label(cx + 1992, cy + 66, "PER USE", 30, DIM, 3.6)
    # what it does - six lines, because the rules text for a Level runs long
    label(cx + 36, cy + 120, "DOES", 30, DIM, 3.6)
    field("gift.%d.does" % i, "para", cx + 132, cy + 66, cw - 180, 288, slot=i, lines=6)
    for j in range(6):
        line(cx + 132, cy + 114 + j * 48, cw - 180)
    # adders and limiters, a row each
    label(cx + 36, cy + 432, "ADDERS", 30, mix(GREEN, LIFT, 0.3), 3.6)
    line(cx + 204, cy + 414, cw - 252)
    field("gift.%d.adders" % i, "text", cx + 204, cy + 372, cw - 252, 48, slot=i)
    label(cx + 36, cy + 480, "LIMITERS", 30, mix(RED, LIFT, 0.3), 3.6)
    line(cx + 240, cy + 462, cw - 288)
    field("gift.%d.limiters" % i, "text", cx + 240, cy + 420, cw - 288, 48, slot=i)

FIELDS_P3 = write("character-sheet-page3.svg",
                  "%d gift cards, last ends %d"
                  % (SLOTS, gy + 120 + (SLOTS - 1) * PITCH + CARD_H))
