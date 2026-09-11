# -*- coding: utf-8 -*-
"""The Brewery's block syntax, for the web edition.

A port of brew/blocks.js. The Brewery renders a chapter for print; this
renders the same chapter for the site, from the same file, with the same
class names - so a block styled one way on the page is styled the same
way on screen, and neither has to be kept in step with the other by hand.

    ::: name[.variant] Optional title
    ...markdown...
    :::

Two deliberate differences from the JavaScript, both forced by the
renderer at the other end:

  Every div carries markdown="1". Kramdown leaves the inside of a block
  HTML element alone unless told otherwise, so without it a card's body
  arrives on the page as literal asterisks.

  A block's title is emitted as a paragraph rather than a bare span. A
  span alone on a line gets wrapped in a paragraph by kramdown, which
  puts an element between the card and its title - and the rules that
  tint a title are keyed on the card, so the title quietly loses its
  colour and falls back to the default accent. That failure looks
  deliberate, which is what makes it worth designing out.

The print-only markers - page and column breaks, the folio counter, the
ground and its seed - are stripped. A web page has no pages to break.
"""
import re

# From brew/blocks.js. A name not on this list is ignored rather than
# emitted, so a typo vanishes instead of leaving a dead class behind.
VARIANTS = ["pc", "ally", "npc", "danger", "text", "accent",
            "earth", "air", "fire", "water", "moira"]
LAYOUT_VARIANTS = ["difficulty"]

# Fenced code is lifted out before substitution and put back after, so a
# document can show its own syntax without this rewriting the example,
# and so a stray ::: inside a code sample cannot close a real block
# further down the page.
FENCE = re.compile(r"^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1?\2[ \t]*$", re.M)

BLOCK = re.compile(
    r"^:::[ \t]*([a-zA-Z][\w-]*)(?:\.([a-zA-Z][\w-]*))?[ \t]*(.*)$"
    r"([\s\S]*?)^:::[ \t]*$", re.M)

# Private-use characters as placeholder delimiters, for the same reason
# the JavaScript uses them: a block's body is trimmed before it is
# re-emitted, so a space-delimited placeholder would lose its delimiters
# and leak onto the page as literal text.
HOLD_A = u""
HOLD_B = u""

# Print-only. Everything the Brewery needs to lay a chapter out on paper
# and the web edition has no use for.
MARKER = re.compile(r"^\\(?:page|column|folio|seed|ground|cols)\b[^\n]*$", re.M)

TITLED = re.compile(r"^(.*?)\s*\(([^)]+)\)\s*$")
LEVEL = re.compile(r"^\*\*(\d+)\*\*\s*(.*)$", re.S)
SECTION = re.compile(r"^\*\*(Adders?|Limiters?)\*\*:?\s*$", re.I)


def esc(text):
    return (text.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;"))


def cls(base, variant):
    return "%s %s--%s" % (base, base, variant) if variant else base


def wrap(class_name, body, tag="div"):
    return '<%s class="%s" markdown="1">\n\n%s\n\n</%s>' % (
        tag, class_name, body.strip(), tag)


def title_line(text, class_name="block-title"):
    """A block's name.

    markdown="span" because a title is written in markdown like anything
    else - the Sub-Stat asides are titled "**Soak** (Earth)" - and a
    paragraph is a block element, whose insides kramdown leaves alone
    unless told otherwise. Without it the asterisks reach the reader.
    "span" rather than "1": a title is a line, not a passage, and asking
    for block-level parsing inside a paragraph invites a nested one.
    """
    return '<p class="%s" markdown="span">%s</p>' % (
        class_name, esc(text.strip()))


def paras(body):
    return [p for p in re.split(r"\n\s*\n", body.strip()) if p.strip()]


def split_flavour(body):
    """The opening paragraph, and everything after it.

    A block holding a single paragraph is all description and no flavour,
    which is what the print renderer decides too - so a one-paragraph
    entry never turns its only sentence into a flavour line.
    """
    ps = paras(body)
    if len(ps) > 1:
        return ps[0], "\n\n".join(ps[1:])
    return "", "\n\n".join(ps)


def plain(base, takes_title=True):
    """A card: an optional title, then the body."""
    def render(title, body, variant):
        head = (title_line(title) + "\n\n") if takes_title and title.strip() else ""
        return wrap(cls(base, variant), head + body.strip())
    return render


def render_skill(title, body, variant):
    """A skill entry. The Element is read out of the title rather than
    typed a second time as a variant, so the colour can never disagree
    with the word beside it."""
    m = TITLED.match(title.strip())
    name = (m.group(1) if m else title).strip()
    elem = m.group(2).strip() if m else ""
    key = elem.lower()
    flavour, rest = split_flavour(body)
    head = title_line(name)
    if elem:
        head = head[:-len("</p>")] + '<span class="block-pill">%s</span></p>' % esc(elem)
    parts = [head]
    if flavour:
        parts.append('<div class="skill-flavour" markdown="1">\n\n%s\n\n</div>'
                     % flavour)
    if rest:
        parts.append(rest)
    return wrap(cls("skill", key if key in VARIANTS else (variant or "")),
                "\n\n".join(parts))


def render_ladder(base, name_class, level_class, n_class):
    """The 1-5 entries: a name, a flavour line, then numbered levels."""
    def render(title, body, variant):
        flavour, rest = split_flavour(body)
        parts = [title_line(title, name_class)]
        if flavour:
            parts.append('<div class="%s-flavour" markdown="1">\n\n%s\n\n</div>'
                         % (base, flavour))
        for p in paras(rest):
            m = LEVEL.match(p.strip())
            if m:
                # The level's own number as a class, so the strip's rule can
                # climb with it - see the ladder rules in brew.css.
                parts.append(
                    '<div class="%s %s--%s" markdown="1">\n\n'
                    '<span class="%s">%s</span>%s\n\n</div>'
                    % (level_class, level_class, esc(m.group(1)),
                       n_class, esc(m.group(1)), m.group(2)))
            else:
                parts.append(p)
        return wrap(cls(base, variant), "\n\n".join(parts))
    return render


def render_gift(title, body, variant):
    """The largest entries in the book: five levels, plus Adders and
    Limiters, which are labelled runs rather than numbered ones."""
    flavour, rest = split_flavour(body)
    parts = [title_line(title, "gift-name")]
    if flavour:
        parts.append('<div class="gift-flavour" markdown="1">\n\n%s\n\n</div>'
                     % flavour)
    section = ""
    for p in paras(rest):
        t = p.strip()
        label = SECTION.match(t)
        if label:
            section = label.group(1).lower().rstrip("s")
            parts.append('<p class="gift-section">%s</p>' % esc(label.group(1)))
            continue
        lvl = LEVEL.match(t)
        if lvl:
            section = ""
            parts.append('<div class="gift-level gift-level--%s" markdown="1">'
                         '\n\n<span class="gift-n">%s</span>%s\n\n</div>'
                         % (esc(lvl.group(1)), esc(lvl.group(1)), lvl.group(2)))
            continue
        parts.append('<div class="gift-opt gift-opt--%s" markdown="1">\n\n%s\n\n</div>'
                     % (section, t) if section else p)
    return wrap(cls("gift", variant), "\n\n".join(parts))


def render_boon(title, body, variant):
    """A boon entry. The cost rides in the title's parenthetical."""
    m = TITLED.match(title.strip())
    name = (m.group(1) if m else title).strip()
    cost = m.group(2).strip() if m else ""
    flavour, rest = split_flavour(body)
    head = title_line(name, "boon-name")
    if cost:
        head = head[:-len("</p>")] + '<span class="boon-cost">%s</span></p>' % esc(cost)
    parts = [head]
    if flavour:
        parts.append('<div class="boon-flavour" markdown="1">\n\n%s\n\n</div>'
                     % flavour)
    for p in paras(rest):
        parts.append('<div class="boon-tier" markdown="1">\n\n%s\n\n</div>' % p.strip()
                     if p.strip().startswith("**Tier") else p)
    return wrap(cls("boon", variant), "\n\n".join(parts))


def render_stat(title, body, variant):
    """A stat block. The stat line is picked out by the middot the
    Adversary Index already uses, so an existing block pastes in with
    nothing to rewrite."""
    head = (title_line(title) + "\n\n") if title.strip() else ""
    lines = []
    for line in body.strip().split("\n"):
        if u" · " in line:
            lines.append('<div class="stat-line" markdown="1">\n\n%s\n\n</div>'
                         % line.strip())
        else:
            lines.append(line)
    return wrap(cls("stat", variant), head + "\n".join(lines))


def render_figure(title, body, variant):
    cap = ('\n\n<p class="caption">%s</p>' % esc(title.strip())) if title.strip() else ""
    return '<figure class="%s" markdown="1">\n\n%s%s\n\n</figure>' % (
        cls("figure", variant), body.strip(), cap)


# name -> (renderer, takes a title)
BLOCKS = {
    "wide":     (plain("wide", takes_title=False), False),
    "aside":    (plain("aside"), True),
    "box":      (plain("box"), True),
    "roll":     (plain("roll-box", takes_title=False), False),
    "gift":     (render_gift, True),
    "flaw":     (render_ladder("flaw", "flaw-name", "flaw-level", "flaw-n"), True),
    "resource": (render_ladder("resource", "resource-name",
                               "resource-level", "resource-n"), True),
    "boon":     (render_boon, True),
    "skill":    (render_skill, True),
    "stat":     (render_stat, True),
    "figure":   (render_figure, True),
}


def apply_blocks(md):
    """Every ::: block in `md`, rendered. Unknown names are left alone and
    stay visible, the way the Brewery leaves them: a block that did not
    render should look wrong, not disappear."""
    held = []

    def hold(m):
        held.append(m.group(0))
        return HOLD_A + str(len(held) - 1) + HOLD_B

    md = FENCE.sub(hold, md)

    # Repeated so a block nested inside another is handled too.
    for _pass in range(3):
        changed = [False]

        def sub(m):
            name, variant, title, body = m.groups()
            entry = BLOCKS.get(name.lower())
            if not entry:
                return m.group(0)
            render, takes_title = entry
            v = (variant or "").lower()
            if v not in VARIANTS and v not in LAYOUT_VARIANTS:
                v = ""
            changed[0] = True
            return render(title if takes_title else "", body, v)

        md = BLOCK.sub(sub, md)
        if not changed[0]:
            break

    return re.sub(HOLD_A + r"(\d+)" + HOLD_B,
                  lambda m: held[int(m.group(1))], md)


BLOCK_CLOSE = re.compile(r"^:::[ \t]*$")
BLOCK_OPEN_LINE = re.compile(r"^:::[ \t]*[a-zA-Z][\w-]*(?:\.[a-zA-Z][\w-]*)?[ \t]*(.*)$")
FENCE_LINE = re.compile(r"^\s*(`{3,}|~{3,})")


def merge_continuations(md):
    """Rejoin a block the print pagination had to cut in two.

    A block too tall for a sheet is split by The Brewery and reopened on
    the next page with "(continued)" after its name. That is the right
    answer on paper and a wrong one here: a web page does not end, so the
    reader would meet a card that stops for no visible reason and a second
    card announcing it continues something they never left.

    Print splits; the web puts it back. Both read the same file.

    Fence-aware, because a document may write ::: inside a code sample to
    document the syntax, and rewriting the example is not this tool's
    business.
    """
    lines = md.split("\n")
    out = []
    fence = None
    merged = 0
    i = 0
    while i < len(lines):
        line = lines[i]
        f = FENCE_LINE.match(line)
        if f:
            if not fence:
                fence = f.group(1)[0]
            elif f.group(1)[0] == fence:
                fence = None
            out.append(line)
            i += 1
            continue
        if not fence and BLOCK_CLOSE.match(line):
            # A close, then blank lines, then at most one page marker, then
            # blank lines - and if a continuation of that block follows, the
            # seam goes and the two bodies become one.
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and MARKER.match(lines[j]):
                j += 1
                while j < len(lines) and not lines[j].strip():
                    j += 1
            m = BLOCK_OPEN_LINE.match(lines[j]) if j < len(lines) else None
            if m and m.group(1).strip().endswith("(continued)"):
                out.append("")
                merged += 1
                i = j + 1
                continue
        out.append(line)
        i += 1
    return re.sub(r"\n{3,}", "\n\n", "\n".join(out)), merged


GROUND = re.compile(r"^\\ground[ \t]+([a-zA-Z][\w-]*)", re.M)


def read_ground(md):
    """The document-wide ground the chapter declares, if it declares one.

    Read before the markers are stripped, and handed to the page so the
    web edition stands on the same ground the printed chapter does. The
    alternative was picking one here, which would be this file deciding
    what a chapter looks like - and then a chapter that changed its mind
    would say so in one place and be ignored in the other.
    """
    m = GROUND.search(md)
    return m.group(1) if m else ""


def strip_markers(md):
    """Drop the print-only markers, and rejoin anything print had to cut.

    Returns (markdown, how many markers went, how many blocks rejoined).
    """
    md, merged = merge_continuations(md)
    out, n = MARKER.subn("", md)
    return re.sub(r"\n{3,}", "\n\n", out).strip() + "\n", n, merged


def classes_used(html):
    """Every block class the rendered chapter actually emits, so the build
    can check the stylesheet has a rule for each one. A block with no rule
    does not fail - it renders as a bare paragraph run, which is what the
    chapter looked like before it was a block."""
    found = set()
    for attr in re.findall(r'class="([^"]+)"', html):
        for name in attr.split():
            found.add(name)
    return found
