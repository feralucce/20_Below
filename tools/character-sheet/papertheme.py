# -*- coding: utf-8 -*-
"""The print palette, in one place for all five pages.

Page 1 has its own generator - it is built on the emblem's measured
geometry rather than on the block stack the other four share - so the two
halves of the sheet define their colours separately. That is fine for the
screen build, where both are copying the same brand hexes. It is not fine
for the paper build: two definitions of "the ink" is two inks, and the
day one of them is retuned the sheet prints in two greys and nobody sees
it until it is on paper.

So the paper palette lives here and both import it.

Four names carry the inversion, and the drawing code reads them instead
of hard-coding a colour:

    SHADE    what a panel or a box is filled with, before opacity
    ONPANEL  text sitting on a panel
    LIFT     what an accent is mixed toward to be readable against the
             background - every mix(col, LIFT, k) call is doing that
    INK      the line and the type

Opacities are not here. How solid a box is depends on what the box is
for, and the two generators draw different furniture.
"""
import sys

# Both generators are run as scripts, so the flag is read the same way in
# each and neither has to be told by the other.
PAPER = "--paper" in sys.argv

WHITE = "#FFFFFF"
SLATE = "#12232E"        # the brand's dark slate, what the screen builds use


def neutral(col):
    """The grey of the same weight as a brand colour, with no hue left.

    The printed sheet is black and white, so an ink with a hue in it is a
    colour pretending not to be: the slate is 44% saturated, which a mono
    printer flattens to grey anyway and a colour press reproduces with
    cyan and magenta. Matching the perceived lightness rather than picking
    a grey keeps the page's weight exactly where the screen version put
    it, and keeps the two linked - retune the brand colour and the print
    ink follows it in weight without following it in hue.
    """
    r, g, b = [int(col[i:i + 2], 16) for i in (1, 3, 5)]
    v = int(round(0.299 * r + 0.587 * g + 0.114 * b))
    return "#%02X%02X%02X" % (v, v, v)


INK = neutral(SLATE)             # #1F1F1F
MUTED = neutral("#5A6672")       # #646464, captions and secondary labels

SHADE = WHITE if PAPER else "#01050A"
ONPANEL = INK if PAPER else WHITE
LIFT = INK if PAPER else WHITE


def sized(screen, printed):
    """Pick a number per build.

    The screen sheet renders text into its rows; the printed one is
    written on by hand and needs more room between them. The page height
    does not move, so the printed sheet keeps fewer rows - and the screen
    sheet keeps all of its slots, which is why this is a fork rather than
    a single new number. It also means the field map does not change, so
    nothing a character has saved is lost.
    """
    return printed if PAPER else screen


def on_paper(col):
    """An accent becomes ink on paper, and is left alone on screen.

    What told the Elements apart on screen is told by the label and the
    line weight on paper, so there is no hue left to preserve. Called
    once per palette name rather than at each of the sites that use one.
    """
    return INK if PAPER else col
