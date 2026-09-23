# -*- coding: utf-8 -*-
"""Write a corrected paragraph back into the Scrivener manuscript.

scriv2brew.py reads the manuscript and scriv2web.py publishes it, but for a
chapter that has been laid out in The Brewery the formatted file becomes the
source and the manuscript stops being read at all. Every correction made
after layout lands in the formatted file and never goes home, and the
manuscript quietly falls behind - Chapter 08 was two revisions back on Gift
damage, still teaching a scale the game had replaced twice.

Nothing existed to write the other way. This is that: replace, insert or
delete a paragraph in a chapter's content.rtf, matched by a distinctive
piece of its text.

It is deliberately narrow. It swaps the text runs inside a paragraph and
leaves that paragraph's own properties alone, because those properties are
what make a Gift's level rows sit indented under the one above - rebuilding
them from a guess turns a list back into flat prose. An inserted paragraph
borrows the properties of the one it is inserted after, for the same reason.

Any match that is not unique is refused. A patcher that guesses which of two
paragraphs you meant is worse than no patcher.

Scrivener must be closed. It holds the project in memory and writes it back
on quit, which would undo everything done here.

    from scrivpatch import Chapter
    ch = Chapter("Chapter 08")
    ch.replace("It deals its normal listed Damage", "**1** - ... new text")
    ch.save()
"""
import io
import os
import re
import shutil
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from scriv2brew import DATA, RUN, decode, chapter_uuid, BOOK   # noqa: E402

# The manuscript's three run styles, as Scrivener writes them. Body text is
# f0, bold is f1, italic is f2 - the font table names f2 SitkaTextItalic
# rather than setting \i on f0, which is why bold and italic do not compose.
PLAIN = r"{\f0\fs24\b0\i0 %s}"
BOLD = r"{\f1\fs24\b1\i0 %s}"
ITALIC = r"{\f2\fs24\b0\i1 %s}"
HEADING = r"{\f1\fs28\b1\i0 %s}"

# Properties for a paragraph that has no neighbour to borrow from. These
# open with \par because that is what a paragraph is: props_of() returns
# the same span, and a constant that left it out silently produced one
# giant paragraph instead of four.
BODY_PROPS = r"\par\pard\plain \sa180\sb180\ltrch\loch "
HEAD_PROPS = (r"\par\pard\plain \tx0\tx360\tx720\tx1080\tx1440\tx1800\tx2160"
              r"\tx2880\tx3600\tx4320\sa120\sb300\sl264\slmult1\ltrch\loch ")


def encode(text):
    r"""Text -> RTF. Non-ASCII goes out as \uNNNN plus a cp1252 fallback.

    The file declares \ansicpg1252\uc1, so every \u must be followed by
    exactly one substitute byte for readers that do not understand it.
    """
    out = []
    for ch in text:
        if ch in "\\{}":
            out.append("\\" + ch)
        elif ord(ch) < 128:
            out.append(ch)
        else:
            try:
                fallback = r"\'%02x" % ord(ch.encode("cp1252"))
            except UnicodeEncodeError:
                fallback = "?"
            out.append(r"\u%d%s" % (ord(ch), fallback))
    return "".join(out)


def runs(md, heading=False):
    """**bold** and *italic* -> a run sequence. Everything else is body."""
    if heading:
        return HEADING % encode(md)
    out = []
    for piece in re.split(r"(\*\*[^*]+\*\*|\*[^*]+\*)", md):
        if not piece:
            continue
        if piece.startswith("**") and piece.endswith("**"):
            out.append(BOLD % encode(piece[2:-2]))
        elif piece.startswith("*") and piece.endswith("*"):
            out.append(ITALIC % encode(piece[1:-1]))
        else:
            out.append(PLAIN % encode(piece))
    return "".join(out)


class NotUnique(Exception):
    pass


class Chapter(object):
    def __init__(self, fragment):
        self.fragment = fragment
        uuid, self.title = chapter_uuid(fragment, within=BOOK)
        self.path = os.path.join(DATA, uuid, "content.rtf")
        self.raw = io.open(self.path, encoding="utf-8").read()
        self.log = []

    # -- locating -------------------------------------------------------
    def _span(self, needle):
        """(start, runs_start, end) for the paragraph containing `needle`.

        start is the index of the newline that opens the paragraph, so an
        insert or delete carries the separator with it and cannot leave a
        stray break behind. runs_start is where this paragraph's properties
        end and its first run begins.
        """
        hits = [m.start() for m in re.finditer(re.escape(needle), self.raw)]
        if len(hits) != 1:
            raise NotUnique("%r matches %d times in %s"
                            % (needle, len(hits), self.fragment))
        i = hits[0]
        start = self.raw.rfind("\n\\par", 0, i)
        if start < 0:
            raise NotUnique("%r is not inside a paragraph" % needle)
        end = self.raw.find("\n\\par", i)
        if end < 0:
            end = len(self.raw)
        brace = self.raw.find("{", start)
        if brace < 0 or brace > end:
            raise NotUnique("%r sits in a paragraph with no runs" % needle)
        return start, brace, end

    def paragraphs(self):
        """Every paragraph as (start, runs_start, end, text), in order.

        Offered because matching by a snippet of text does not scale to a
        chapter-wide sync: fifty Gifts all say "Dice rise to", and the one
        you want is identified by where it sits, not by what it says.
        """
        out = []
        bounds = [m.start() for m in re.finditer(r"\n\\par", self.raw)]
        bounds.append(len(self.raw))
        for i in range(len(bounds) - 1):
            s, e = bounds[i], bounds[i + 1]
            brace = self.raw.find("{", s)
            if brace < 0 or brace > e:
                continue
            text = " ".join(decode(m.group(5))
                            for m in RUN.finditer(self.raw[s:e]))
            out.append((s, brace, e, text.strip()))
        return out

    def replace_at(self, span, md, note=""):
        """Swap the runs of one span from paragraphs(). Back-to-front only."""
        _, brace, end, text = span
        self.log.append(("replace", (note or text)[:64]))
        self.raw = self.raw[:brace] + runs(md) + self.raw[end:]
        return self

    def props_of(self, needle):
        """This paragraph's property string, minus the leading newline."""
        start, brace, _ = self._span(needle)
        return self.raw[start + 1:brace]

    def text_of(self, needle):
        s, _, e = self._span(needle)
        return " ".join(decode(m.group(5))
                        for m in RUN.finditer(self.raw[s:e])).strip()

    # -- editing --------------------------------------------------------
    def replace(self, needle, md, heading=False):
        """Swap this paragraph's text. Its properties are left alone."""
        s, brace, e = self._span(needle)
        self.log.append(("replace", self.text_of(needle)[:64]))
        self.raw = self.raw[:brace] + runs(md, heading) + self.raw[e:]
        return self

    def substitute(self, old, new, note=""):
        """Swap a run of plain text in place, touching nothing around it.

        replace() rebuilds a whole paragraph, which means rebuilding its
        bold and italic runs from markdown - and anything the flattened
        text lost on the way out is lost on the way back in. Changing
        four numbers in a paragraph does not need that: this edits the
        characters and leaves every run boundary, every curly quote and
        every style exactly where it was.

        Only for text that sits inside a single run. A phrase spanning a
        bold boundary is not there to be found, and the uniqueness check
        will say so rather than half-apply it.
        """
        enc_old, enc_new = encode(old), encode(new)
        n = self.raw.count(enc_old)
        if n != 1:
            raise NotUnique("%r matches %d times in %s (spanning a bold run?)"
                            % (old, n, self.fragment))
        self.log.append(("substitute", (note or old)[:64]))
        self.raw = self.raw.replace(enc_old, enc_new, 1)
        return self

    def delete(self, needle):
        s, _, e = self._span(needle)
        self.log.append(("delete", self.text_of(needle)[:64]))
        self.raw = self.raw[:s] + self.raw[e:]
        return self

    def insert_after(self, needle, paras, props=None):
        """paras: a string, or (text, heading_bool), or (text, heading, props).

        Each new paragraph borrows the properties of the one named by
        `needle` unless `props` overrides them, so a row inserted into a
        list stays in the list and a paragraph after body text stays body.
        A new section is a heading followed by body, which is two different
        property sets in one call - hence the third element.
        """
        _, _, e = self._span(needle)
        carry = props if props is not None else self.props_of(needle)
        built = []
        for p in paras:
            if not isinstance(p, tuple):
                p = (p,)
            md = p[0]
            head = p[1] if len(p) > 1 else False
            own = p[2] if len(p) > 2 else carry
            built.append("\n" + own + runs(md, head))
        self.log.append(("insert %d after" % len(paras),
                         self.text_of(needle)[:64]))
        self.raw = self.raw[:e] + "".join(built) + self.raw[e:]
        return self

    # -- writing --------------------------------------------------------
    def save(self, dry_run=False):
        if not self.log:
            print("%s: nothing to do" % self.fragment)
            return
        # Braces have to balance or Scrivener will not open the file.
        if self.raw.count("{") != self.raw.count("}"):
            raise ValueError("unbalanced braces - refusing to write %s"
                             % self.path)
        print("%s  (%d edits)" % (self.fragment, len(self.log)))
        for what, where in self.log:
            print("    %-18s %s..." % (what, where))
        if dry_run:
            print("    [dry run - not written]")
            return
        bak = self.path + time.strftime(".bak-%Y%m%d-%H%M%S")
        shutil.copy2(self.path, bak)
        io.open(self.path, "w", encoding="utf-8", newline="\n").write(self.raw)
        print("    written; previous copy kept as %s" % os.path.basename(bak))
