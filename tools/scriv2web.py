# -*- coding: utf-8 -*-
"""Manuscript -> the web edition, in webbook/.

The book is the source. webbook/ is build output and is never hand-edited -
edits belong in the Scrivener project, and this regenerates from it.

Not to be confused with rules/, which is the machine-readable contract the
character creator parses and is authored separately. The two say the same
things in different registers, and only rules/ can break the app.

Emits one markdown file per chapter with Jekyll front matter, so the site
renders it through _layouts/webbook.html the same way rules/ renders through
_layouts/rules.html. Chapters are listed explicitly rather than discovered:
publishing is a decision, not a side effect of a chapter existing.

    python tools/scriv2web.py
"""
import io, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
NL = chr(10)
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "webbook")

sys.path.insert(0, HERE)
from scriv2brew import BOOK, chapter_uuid, to_chunks   # noqa: E402
from brewblocks import (apply_blocks, strip_markers, classes_used,
                        read_ground)  # noqa: E402

# Chapters that have been laid out in The Brewery.
#
# For these the formatted file is the source, not the manuscript. The
# blocks in it - which Nature is a card, which Sub-Stat carries which
# Element's colour - are decisions somebody made while looking at the
# page, and they are made once. Rebuilding them here from the shape of
# the prose was the alternative, and it means the same decision written
# twice in two languages, with nothing keeping the two in step.
#
# The prose is still the manuscript's: these files are generated from it
# by scriv2brew.py and then laid out. What is added here is arrangement.
#
# A chapter is listed only once it has actually been laid out. Chapter 2
# is deliberately absent: its formatted copy has no blocks yet, while the
# web edition already sets all 75 definitions as cards, so reading the
# formatted file would take branding away rather than carry it across.
BREW_DIR = r"C:\Users\feral\OneDrive\Documents\20 Below Production documents\PDF"
FORMATTED = {
    "introduction":         "01-introduction.md",
    "creating-a-character": "03-creating-a-character.md",
    "skills":               "05-skills.md",
    "advancement":          "12-advancement.md",
    "boons":                "06-boons.md",
    "resources":            "07-resources.md",
    "gifts":                "08-gifts.md",
    "flaws":                "09-flaws.md",
    "fate":                 "10-fate.md",
    "equipment":            "11-equipment.md",
}

# (binder fragment, url slug, nav section, page title)
#
# Chapter 13 is deliberately absent. It is a 400-word stub, and the web
# edition should not publish a chapter that is visibly unwritten. Add it here
# when it is finished; nothing else needs changing.
#
# The fifth field is the contents-page blurb. It is written here rather than
# lifted from the chapter's opening line, because an opening line is written
# to be read after the heading, not instead of it.
CHAPTERS = [
    ("Chapter 01", "introduction",         "start",   "Introduction",
     "What the game is about: the people who look at the man behind the curtain, and what they can do once they have."),
    ("Chapter 02", "glossary",             "start",   "Glossary",
     "Every term the rest of the book leans on, defined once and kept short. Skim it before you build, then flip back whenever you need it."),
    ("Chapter 03", "creating-a-character", "start",   "Creating a Character",
     "Fifteen steps, most of them a few seconds long, in an order that keeps you from painting yourself into a corner."),
    ("Chapter 04", "how-to-play",          "start",   "How to Play",
     "Two dice mechanics. The Core Roll handles almost everything; the second one only comes up when something is trying to hurt you."),
    ("Chapter 05", "skills",               "options", "Skills",
     "Elements are what you are made of. Skills are what you have actually done with it - the training, the hours, the scar tissue."),
    ("Chapter 06", "boons",                "options", "Boons",
     "Small permanent pieces of good luck. The quiet part of a character, and the quiet part decides more scenes than you would think."),
    ("Chapter 07", "resources",            "options", "Resources",
     "What you have, who you know, and what picks up when you call. Rated in Levels, where a higher Level is the same Resource reaching further."),
    ("Chapter 08", "gifts",                "options", "Gifts",
     "The thing your character can do that other people cannot. Narrow on purpose, five defined levels each, and what it looks like is your setting's business."),
    ("Chapter 09", "flaws",                "options", "Flaws",
     "You promise the table your character will make things harder for themselves. The system promises to pay you for it."),
    ("Chapter 10", "fate",                 "combat",  "Fate",
     "Nature, Tokens and Ki: where the thumb on the scale comes from, and what it costs to press."),
    ("Chapter 11", "equipment",            "combat",  "Weapons & Equipment",
     "The part of your character you can lose in a river. Dice you are carrying, and Soak you did not have to be born with."),
    ("Chapter 12", "advancement",          "options", "Advancement",
     "You earn XP for playing and spend it on whatever you like, in whatever order. No classes, no levels, nothing telling you what comes next."),
    ("Chapter 13", "running-the-game",     "gm",      "Running the Game",
     "For the person behind the screen. Setting Difficulty, ruling on the fly, running the consensus, and what to do with the pile of Fate Tokens the players keep handing you."),
]

BANNER = ("<!-- Generated by tools/scriv2web.py from the Scrivener manuscript.\n"
          "     Do not hand-edit: the next run overwrites it. Edit the book. -->\n")

# A formatted chapter has two upstreams, and saying only "the manuscript"
# would send anyone fixing the layout to the wrong one.
BANNER_FORMATTED = (
    "<!-- Generated by tools/scriv2web.py from %s - the chapter as it is\n"
    "     laid out for print, with the page breaks taken out. Prose edits\n"
    "     belong in the Scrivener manuscript; layout edits belong in that\n"
    "     file, in The Brewery. Do not hand-edit this: it is overwritten. -->\n")


def rules_tables(path):
    """Every markdown table in a rules file, indexed by its first column.

    Returns [(header, separator, {first_cell_lower: row_line})] in file order.
    """
    tables = []
    header = sep = None
    rows = {}
    for line in io.open(path, encoding="utf-8"):
        line = line.rstrip("\n")
        if line.startswith("|"):
            cells = [c.strip() for c in line.strip("|").split("|")]
            if header is None:
                header = line
            elif sep is None and set(line.replace("|", "").strip()) <= set("-: "):
                sep = line
            elif cells and cells[0]:
                rows[cells[0].lower()] = line
        else:
            if header and sep and rows:
                tables.append((header, sep, rows))
            header = sep = None
            rows = {}
    if header and sep and rows:
        tables.append((header, sep, rows))
    return tables


ROW = re.compile(r"^\*\*([^*\n]+)\*\* - ")


def row_name(chunk):
    """The item name, if this chunk is a flattened table row.

    Anchored on purpose. Testing for '** - ' anywhere in the text also matches
    ordinary prose that happens to bold a term and use a dash later in the
    sentence, and one of those swallowed the entire weapons table.
    """
    if "\n" in chunk:
        return None
    m = ROW.match(chunk)
    if not m:
        return None
    name = m.group(1).strip().lower()
    # A purely numeric key is not a name, it is a position, and every numbered
    # table in the project shares it. Matching on one spliced the adversary
    # index's mutation table into 49 Gifts, whose level lines open "**1**".
    if not name or name.strip(".").isdigit():
        return None
    return name


def restore_tables(chunks, tables):
    """Rebuild flattened rows as real tables, using the rules file's headers.

    The manuscript stores its tables as one dash-separated line per row, and
    those do not split back into columns reliably - "Melee - - - - - 1" is
    four empty cells or five depending on how you read it. rules/*.md holds
    the same data as proper tables, so the columns come from there. Only rows
    the book actually lists are emitted, in the book's order: this restores
    structure, it does not add content.
    """
    def table_for(name):
        for t in tables:
            if name in t[2]:
                return t
        return None

    out = []
    built = None          # (header, sep, [row lines]) currently being filled
    owner = None          # the table those rows came from

    def flush():
        if built and len(built) > 2:
            out.append("\n".join(built))

    for chunk in chunks:
        name = row_name(chunk)
        found = table_for(name) if name else None
        if found is None:
            # Not a row of any table we know - a gear package, or prose.
            flush(); built = owner = None
            out.append(chunk)
            continue
        if found is not owner:
            flush()
            owner = found
            built = [found[0], found[1]]
        built.append(found[2][name])
    flush()

    # The manuscript's own header row survives the flattening as prose - a
    # line like "**Option** - Cost - Effect" sitting above the table it used
    # to head. Drop it where the table right below already says the same.
    cleaned = []
    for j, chunk in enumerate(out):
        nxt = out[j + 1] if j + 1 < len(out) else ""
        name = row_name(chunk)
        if name and nxt.startswith("|"):
            first_cell = nxt.split("\n")[0].strip("|").split("|")[0].strip().lower()
            if name == first_cell:
                continue
        cleaned.append(chunk)
    return cleaned


# An entry as the book writes it: "**Amnesia (= Level).** *flavour line*",
# then its description, then any "**1**..**5**" level lines. The same shape
# The Brewery's entry blocks render, so the web edition renders it the same
# way - flavour set apart, the whole thing boxed.
ENTRY = re.compile(r"^\*\*([^*]+?)\.\*\*\s+\*(.+)\*$")
NAME_TAG = re.compile(r"^(.*?)\s*\(([^()]*)\)\s*$")


def wrap_entries(chunks):
    """Box each entry, so a reader can see where one stops and the next starts."""
    out = []
    i = 0
    while i < len(chunks):
        m = ENTRY.match(chunks[i])
        if not m:
            out.append(chunks[i]); i += 1; continue
        name, flavour = m.group(1).strip(), m.group(2).strip()
        tag = ""
        nt = NAME_TAG.match(name)
        if nt:
            name, tag = nt.group(1).strip(), nt.group(2).strip()
        i += 1
        body = []
        while i < len(chunks) and not chunks[i].startswith("#") and not ENTRY.match(chunks[i]):
            body.append(chunks[i]); i += 1
        head = '<p class="entry-head"><span class="entry-name">%s</span>%s</p>' % (
            name, ('<span class="entry-tag">%s</span>' % tag) if tag else "")
        card = ['<div class="entry" markdown="1">', head,
                '<p class="entry-flavour">%s</p>' % flavour]
        if body:
            card.append("")
            card.append("\n\n".join(body))
        card.append("</div>")
        out.append("\n".join(card))
    return out


GLOSS = re.compile(r"^\*\*([^*]+)\*\*:\s*(.+)$", re.S)


def gloss_cards(chunks):
    """Every glossary term as a water aside - name, then definition.

    The chapter was 75 paragraphs of bold-lead prose in a single column,
    which reads as one unbroken block however good the definitions are.
    Same treatment as the netbook's contents cards: a water left rule and
    a Bebas term, with the definition kept at full contrast against the
    panel rather than tinted.

    Only paragraphs shaped exactly like an entry are wrapped, so the
    chapter's opening prose passes through untouched.
    """
    out = []
    for chunk in chunks:
        m = GLOSS.match(chunk.strip()) if not chunk.startswith("#") else None
        if not m:
            out.append(chunk)
            continue
        term, definition = m.group(1).strip(), m.group(2).strip()
        out.append(NL.join([
            '<div class="gloss" markdown="1">',
            '<span class="gloss-term">%s</span>' % term,
            "",
            definition,
            "</div>",
        ]))
    return out


def gift_lists(path):
    """Per Gift, its Adders and Limiters as the rules file bullets them.

    The manuscript runs all three Adders together in one paragraph, so on the
    page they arrive as a wall - "...no Ki cost. **Silent Landing** (Lesser,
    3 pts): land without...". Splitting that back apart by punctuation is
    guesswork; rules/gifts.md already has them as a list, one per line.
    """
    text = io.open(path, encoding="utf-8").read()
    out = {}
    for section in text.split("\n### ")[1:]:
        name = section.split("\n", 1)[0].strip()
        lists = {}
        # Bulleted labels, and the tabled ones. "Pool by Level" is keyed 1..5,
        # which is why the general table restorer will not touch it - every
        # numbered table in the project shares those keys. Here the Gift is
        # known by name, so its own table is unambiguous.
        # The Level ladder, taken from the Gift's own "| Level | Effect |"
        # table. The manuscript keeps a second copy of every ladder as
        # "**2** - Damage rises to..." paragraphs, and because those are not
        # tables the general restorer never touched them: the whole Attack
        # Dice rewrite sat in this file for a day without reaching a reader.
        # Levels are mechanics and belong to rules/gifts.md; the flavour,
        # Adders and Limiters prose stays the manuscript's.
        rows = re.findall(r"^\| ([1-5]) \| (.+?) \|\s*$", section, re.M)
        if rows:
            lists["Levels"] = "\n\n".join(
                "**%s** - %s" % (n, body.strip()) for n, body in rows)

        for label in ("Adders", "Limiters", "Pool by Level", "Build menu"):
            m = re.search(r"^\*\*%s\*\*:?\s*$" % re.escape(label), section, re.M)
            if not m:
                continue
            block = []
            for line in section[m.end():].split("\n"):
                if line.startswith("- ") or line.startswith("|"):
                    block.append(line)
                elif block and line.strip():
                    break
            if block:
                lists[label] = "\n".join(block)
        out[name] = lists
    return out


LABELS = ("Adders", "Limiters", "Pool by Level", "Build menu")
POOL_ROW = re.compile(r"^\*\*\d+\*\*\s*-\s*\d+\s*points\.?$")
# A Gift's Level lines open "**1** - ..." and sit after the Limiters.
LEVEL_LINE = re.compile(r"^\*\*\d+\*\*")


def relist(body, lists):
    """Swap what the manuscript flattened for the rules file's own version.

    Each label owns a different amount of what follows it, so each is consumed
    on its own terms: Adders and Limiters are one run-together paragraph, the
    pool is five numbered lines, the build menu is a table. Consuming by "skip
    until the next label" instead would swallow the Gift's level lines, which
    sit after the Limiters with nothing to mark where they start.
    """
    out = []
    i = 0
    while i < len(body):
        chunk = body[i]
        label = chunk.strip("*: ").strip()
        # The Level ladder has no label above it - it just starts. So it is
        # recognised by shape, and the whole run of numbered lines is handed
        # over to the rules file's version in one go.
        if LEVEL_LINE.match(chunk) and lists.get("Levels"):
            out.append(lists["Levels"])
            while i < len(body) and LEVEL_LINE.match(body[i]):
                i += 1
            continue
        if not (chunk.startswith("**") and label in LABELS and lists.get(label)):
            out.append(chunk); i += 1
            continue
        out.append(chunk)
        out.append(lists[label])
        i += 1
        if label in ("Adders", "Limiters"):
            # The manuscript used to run every entry together in one
            # paragraph; each now gets its own. Consume all of them, and stop
            # at the next label or at the Gift's numbered Level lines, which
            # open with bold too and must survive.
            while (i < len(body)
                   and body[i].startswith("**")
                   and body[i].strip("*: ").strip() not in LABELS
                   and not LEVEL_LINE.match(body[i])):
                i += 1
        elif label == "Pool by Level":  # noqa: E501 - branch continues below
            while i < len(body) and POOL_ROW.match(body[i]):
                i += 1
        elif label == "Build menu":
            while i < len(body) and (
                body[i].startswith("|")
                or (body[i].startswith("**") and " - " in body[i]
                    and "\n" not in body[i] and not POOL_ROW.match(body[i]))
            ):
                i += 1
    # A Gift written into the manuscript as prose only, with no ladder under
    # it, still gets its ladder: the rules file is where Levels live, so a new
    # entry needs its flavour and its Adders written here and nothing else.
    if lists.get("Levels") and not any(LEVEL_LINE.match(c) for c in body):
        out.append(lists["Levels"])
    return out


def wrap_headed_entries(chunks, after, lists_by_name=None):
    """Box every "## Name" section following `after`, one card each.

    Gifts are not written like Skills or Boons - each is a heading with its
    flavour, Adders, Limiters and levels beneath it, not a single bolded
    lead-in. So they are boxed by section instead, in the same card, and the
    heading stays a real heading inside it: the anchor keeps working and the
    chapter still has an outline.
    """
    try:
        start = chunks.index(after)
    except ValueError:
        return chunks
    out = chunks[:start + 1]
    i = start + 1
    while i < len(chunks):
        if not chunks[i].startswith("## "):
            out.append(chunks[i]); i += 1; continue
        head = chunks[i]
        i += 1
        body = []
        while i < len(chunks) and not chunks[i].startswith("## "):
            body.append(chunks[i]); i += 1
        if lists_by_name:
            body = relist(body, lists_by_name.get(head[3:].strip(), {}))
        card = ['<div class="entry entry-headed" markdown="1">', "", head, ""]
        if body and body[0].startswith("*") and body[0].endswith("*") and "\n" not in body[0]:
            card.append('<p class="entry-flavour">%s</p>' % body[0].strip("*").strip())
            body = body[1:]
        if body:
            card.append("")
            card.append("\n\n".join(body))
        card.append("</div>")
        out.append("\n".join(card))
    return out


def count_cards(chunks, css_class):
    """How many cards of one kind a chapter ended up with."""
    needle = '<div class="' + css_class
    return sum(c.count(needle) for c in chunks)


def esc_html(text):
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def yaml_quote(text):
    return '"' + text.replace('\\', '\\\\').replace('"', '\\"') + '"'


# A link to another rules file, which is what the merged tables are full
# of. [Advantage](rules.md#advantage--disadvantage) is a good link inside
# rules/ and a dead one here: the webbook serves .html pages, so there is
# no rules.md at the other end and the reader gets a 404.
SOURCE_LINK = re.compile(r'\[([^\]]+)\]\([a-z0-9_-]+\.md(?:#[^)]*)?\)')


def unlink_sources(page):
    """Turn links to rules/ source files into plain bold text.

    Not rewritten to the webbook page that holds the same rule, tempting
    as that is: the webbook's headings come from the manuscript and the
    anchors come from rules/, so only some of them line up. Half of these
    would land somewhere useful and half would land on a 404, which is
    worse than none of them doing anything - a link that works sometimes
    teaches a reader to trust it.

    Bold is what the book's own introduction says marks a defined term, so
    the words keep meaning what they meant."""
    return SOURCE_LINK.subn(r'**\1**', page)[0], len(SOURCE_LINK.findall(page))


def body_of(chunks):
    """Everything but the chapter title - the layout renders that from the
    front matter, so leaving it in would print the heading twice."""
    out = list(chunks)
    if out and out[0].startswith("# "):
        out = out[1:]
    return "\n\n".join(out).strip() + "\n"


def main():
    os.makedirs(OUT, exist_ok=True)
    # Tables come from the rules files, prose from the manuscript - the split
    # webbook/README.md describes. Every rules file is offered, so a chapter
    # that flattens a table anywhere can find its columns.
    # Scoped per chapter, not pooled. A chapter should only ever be able to
    # pull tables out of the rules file that covers the same subject; letting
    # every file compete invites a match from somewhere unrelated.
    sources = {
        "equipment": ["weapons.md"],
        "gifts":     ["gifts.md"],
        "fate":      ["fate.md"],
        "flaws":     ["flaws.md"],
        "boons":     ["boons.md"],
        "skills":    ["skills.md"],
        "resources": ["resources.md"],
        "how-to-play":          ["rules.md"],
        "creating-a-character": ["character-creation.md"],
        "advancement":          ["costs.md"],
        "running-the-game":     ["rules.md", "fate.md"],
        "glossary":             ["glossary.md"],
        "introduction":         [],
    }
    rules_dir = os.path.join(ROOT, "rules")
    tables_for = {}
    for slug, names in sources.items():
        acc = []
        for name in names:
            path = os.path.join(rules_dir, name)
            if os.path.exists(path):
                acc.extend(rules_tables(path))
        tables_for[slug] = acc
    written = []
    # Transforms that ran and produced nothing. None of them raise, so
    # without this the build reads as entirely successful.
    hollow = []

    # Chapters read from their formatted copy, for the build summary.
    formatted = []
    counts = {"unlinked": 0}

    def emit(i, slug, section, title, body, banner=BANNER, ground=''):
        """One chapter's page: front matter, the banner, then the body.

        Shared by both sources. A chapter's navigation and its title are
        the site's business whichever source the words came from, and
        that difference stops here.
        """
        front = [
            "---",
            "layout: webbook",
            "title: " + yaml_quote(title),
            "chapter: %d" % (i + 1),
            "nav_section: " + section,
        ]
        # The ground the printed chapter stands on, carried over so
        # the page behind the words is the same one.
        if ground:
            front.append("ground: " + ground)
        if i:
            front.append("prev_url: /webbook/%s.html" % CHAPTERS[i - 1][1])
            front.append("prev_title: " + yaml_quote(CHAPTERS[i - 1][3]))
        if i + 1 < len(CHAPTERS):
            front.append("next_url: /webbook/%s.html" % CHAPTERS[i + 1][1])
            front.append("next_title: " + yaml_quote(CHAPTERS[i + 1][3]))
        front.append("---")

        page, dead = unlink_sources(
            NL.join(front) + NL + banner + NL + body)
        counts["unlinked"] += dead
        io.open(os.path.join(OUT, slug + ".md"), "w",
                encoding="utf-8", newline=NL).write(page)

    # Block classes the stylesheet has a rule for. A block with no rule
    # does not fail - it renders as an undecorated run of paragraphs,
    # which is what the chapter looked like before it was blocked, so the
    # build reads as a success and the page reads as unstyled.
    styled = set(re.findall(r"\.([a-z][\w-]*)",
                            io.open(os.path.join(ROOT, "_layouts",
                                                 "webbook.html"),
                                    encoding="utf-8").read()))

    for i, (frag, slug, section, title, _blurb) in enumerate(CHAPTERS):
        if slug in FORMATTED:
            path = os.path.join(BREW_DIR, FORMATTED[slug])
            raw = io.open(path, encoding="utf-8").read()
            ground = read_ground(raw)
            stripped, markers, rejoined = strip_markers(raw)
            # The chapter's own H1. The layout prints the title from front
            # matter, so leaving it would set the heading twice.
            stripped = re.sub(r"\A#[ \t][^\n]*\n+", "", stripped)
            body = apply_blocks(stripped)
            binder_title = title
            chunks = [c for c in re.split(r"\n\s*\n", body) if c.strip()]
            unstyled = sorted(
                c for c in classes_used(body)
                if c not in styled and not c.startswith("block-"))
            if unstyled:
                hollow.append(
                    "%s: no stylesheet rule for %s - the block renders as "
                    "plain paragraphs, which looks like ordinary prose "
                    "rather than like a fault"
                    % (slug, ", ".join("." + c for c in unstyled)))
            if not markers:
                hollow.append(
                    "%s: no page markers found in %s - is it really the "
                    "formatted copy?" % (slug, FORMATTED[slug]))
            formatted.append((slug, markers, body.count('<div class='), rejoined))
            body = body.strip() + "\n"
            written.append((binder_title, slug, len(chunks),
                            sum(len(c.split()) for c in chunks)))
            emit(i, slug, section, title, body,
                 BANNER_FORMATTED % FORMATTED[slug], ground)
            continue

        uuid, binder_title = chapter_uuid(frag, within=BOOK)
        chunks = to_chunks(uuid)
        chunks = restore_tables(chunks, tables_for.get(slug, []))
        chunks = wrap_entries(chunks)
        if slug == "glossary":
            chunks = gloss_cards(chunks)
            # Dispatched by name, so it is meant to find terms. Zero means
            # the entry shape moved, not that the chapter has none.
            if not count_cards(chunks, "gloss"):
                hollow.append(
                    "glossary: gloss_cards wrapped nothing - has the "
                    "**Term**: definition shape changed?")
        if slug == "gifts":
            by_name = gift_lists(os.path.join(ROOT, "rules", "gifts.md"))
            # A Gift added to rules/gifts.md and never written into the
            # manuscript is simply absent from the book, silently. Onslaught
            # and Salvo shipped that way. Levels now come from the rules
            # file, but a whole entry still needs its prose written here.
            in_book = {c[3:].strip() for c in chunks if c.startswith("## ")}
            absent = sorted(n for n in by_name if n not in in_book
                            and n != "Attack Dice")
            if absent:
                hollow.append(
                    "gifts: in rules/gifts.md but not in the manuscript, so "
                    "not in the book - " + ", ".join(absent))
            chunks = wrap_headed_entries(chunks, "## The Gift List", by_name)
            # wrap_headed_entries swallows a missing heading and hands back
            # the chapter untouched, so the miss is caught here instead.
            if not count_cards(chunks, "entry entry-headed"):
                hollow.append(
                    "gifts: wrap_headed_entries boxed nothing - is the "
                    "heading still \"## The Gift List\"?")
        emit(i, slug, section, title, body_of(chunks))
        written.append((binder_title, slug, len(chunks), sum(len(c.split()) for c in chunks)))

    # The contents page.
    # cover: true swings the layout into its front-door arrangement - the
    # cover art beside the title, rather than a heading on its own. The
    # lede rides in front matter because it belongs inside that block,
    # above the generated body.
    lines = [
        "---",
        "layout: webbook",
        'title: "The Player\'s Guide"',
        "nav_section: start",
        "cover: true",
        "lede: >-",
        "  The whole book, chapter by chapter. The same text as the print",
        "  edition - the manuscript is the source, and this is generated",
        "  from it.",
        "---",
        BANNER.rstrip("\n"),
        "",
        "",
    ]
    # Contents cards, in the Brewery's aside.water style: the colour tints the
    # rule and the title, never the fill, so the blurb keeps full contrast.
    # The whole card is the link, so the target is a card rather than a word.
    lines.append('<div class="toc">')
    for i, (_frag, slug, _sec, title, blurb) in enumerate(CHAPTERS):
        # markdown="0" so kramdown leaves the card alone. An anchor is
        # span-level, and without this kramdown re-wraps the card's guts in
        # paragraphs and closes the link in the wrong place.
        lines.append('<div class="aside aside--water toc-card" markdown="0">')
        lines.append('<span class="block-title"><span class="toc-num">%d</span>'
                     '<a href="/webbook/%s.html">%s</a></span>'
                     % (i + 1, slug, esc_html(title)))
        lines.append("<p>%s</p>" % esc_html(blurb))
        lines.append("</div>")
    lines.append("</div>")
    lines.append("")
    io.open(os.path.join(OUT, "index.md"), "w", encoding="utf-8", newline="\n").write(
        "\n".join(lines))

    if hollow:
        print("")
        for note in hollow:
            print("  HOLLOW  %s" % note)

    total = sum(w for _, _, _, w in written)
    print("%d chapters -> %s" % (len(written), OUT))
    for t, slug, n, w in written:
        print("  %-34s %-22s %5d chunks %6d words" % (t, slug + ".md", n, w))
    print("  %-57s %6d words total" % ("", total))
    print("  index.md")
    for slug, markers, blocks, rejoined in formatted:
        print("  %-34s %d blocks, %d print markers dropped%s"
              % (FORMATTED[slug], blocks, markers,
                 ", %d rejoined across a page break" % rejoined if rejoined else ""))
    if counts["unlinked"]:
        print("  %d link(s) to rules/ source files turned into bold text - see"
              " unlink_sources()" % counts["unlinked"])


if __name__ == "__main__":
    main()
