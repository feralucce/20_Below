# -*- coding: utf-8 -*-
"""Fill docs/scars.html's rules sections from rules/rules.md.

The Scars page is the friendly version of rules.md#scars: how scars work,
how each kind heals, the sixty scars and how to make a new one. It used to
be written out by hand, and it fell a whole rules pass behind - it was
still teaching below-zero "Flaw-scars" weeks after scars stopped being
Flaws. So the rules half of the page is no longer written here at all. It
sits between markers, and this copies it out of the rules every time:

    <!-- rules:how -->       the opening of the Scars section
    <!-- rules:healing -->   "Healing a scar" and its table
    <!-- rules:physical -->  the Physical scars table
    <!-- rules:social -->    the Social scars table
    <!-- rules:mental -->    the Mental scars table
    <!-- rules:making -->    "Making a new scar"

each closed by its own <!-- /rules:NAME -->. Everything outside the markers
is the page's own - the cosmetic marks at 0 are flavour, not rules, and are
written there by hand.

    python tools/build-scars-page.py

It is not a markdown renderer. It handles what this one section uses:
paragraphs, bullet lists, pipe tables, bold, italic and links.
"""
import html
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RULES = os.path.join(ROOT, "rules", "rules.md")
PAGE = os.path.join(ROOT, "docs", "scars.html")


def section(md):
    """The text of rules.md's #### Scars section, up to the next heading."""
    m = re.search(r"^#### Scars\n(.*?)(?=^#{1,4} )", md, re.S | re.M)
    if not m:
        sys.exit("no '#### Scars' section in rules.md")
    return m.group(1).strip("\n")


def link(target):
    """A rules.md link, rewritten for a page that lives in docs/."""
    if target.startswith("#"):
        return "../rules/rules.html" + target
    m = re.match(r"([\w-]+)\.md(#.*)?$", target)
    if m:
        return "../rules/%s.html%s" % (m.group(1), m.group(2) or "")
    return target


def inline(text):
    out = html.escape(text, quote=False)
    out = re.sub(r"\[([^\]]+)\]\(([^)]+)\)",
                 lambda m: '<a href="%s">%s</a>' % (link(html.unescape(m.group(2))), m.group(1)), out)
    out = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"(?<![*\w])\*([^*]+)\*(?!\*)", r"<em>\1</em>", out)
    return out


def blocks(md):
    """Markdown -> HTML for paragraphs, bullet lists and tables."""
    out = []
    for chunk in re.split(r"\n\s*\n", md.strip()):
        lines = chunk.split("\n")
        if all(l.startswith("|") for l in lines):
            rows = [[c.strip() for c in l.strip().strip("|").split("|")] for l in lines]
            head, body = rows[0], [r for r in rows[2:]]
            out.append('<table class="scar-table">\n  <thead><tr>%s</tr></thead>\n  <tbody>\n%s\n  </tbody>\n</table>' % (
                "".join("<th>%s</th>" % inline(c) for c in head),
                "\n".join("    <tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in r) for r in body)))
        elif all(l.startswith("- ") for l in lines):
            out.append("<ul>\n%s\n</ul>" % "\n".join("  <li>%s</li>" % inline(l[2:]) for l in lines))
        else:
            out.append("<p>%s</p>" % inline(" ".join(lines)))
    return "\n".join(out)


def parts(sec):
    """Split the section into the pieces the page shows separately."""
    def between(start, end):
        a = sec.index(start)
        b = sec.index(end, a) if end else len(sec)
        return sec[a:b].strip()

    how = sec[:sec.index("**Healing a scar.**")].strip()
    healing = between("**Healing a scar.**", "**Physical scars**")
    tables = {}
    for kind in ("Physical", "Social", "Mental"):
        chunk = between("**%s scars**" % kind, None)
        t = re.search(r"(\|.*?)(?:\n\s*\n|$)", chunk, re.S).group(1)
        tables[kind.lower()] = t.strip()
    making = between("**Making a new scar.**", None)
    # On the page each of these has its own heading, so the bold lead-in
    # the rules open the paragraph with would say the same thing twice.
    healing = healing.replace("**Healing a scar.** ", "", 1)
    making = making.replace("**Making a new scar.** ", "", 1)
    return {"how": how, "healing": healing, "making": making, **tables}


def main():
    sec = section(io.open(RULES, encoding="utf-8").read().replace("\r\n", "\n"))
    page = io.open(PAGE, encoding="utf-8", newline="").read()
    crlf = "\r\n" in page
    page = page.replace("\r\n", "\n")
    for name, md in parts(sec).items():
        pat = re.compile(r"(<!-- rules:%s -->).*?(\n *<!-- /rules:%s -->)" % (name, name), re.S)
        if not pat.search(page):
            sys.exit("docs/scars.html has no <!-- rules:%s --> block" % name)
        page = pat.sub(lambda m: m.group(1) + "\n" + blocks(md) + m.group(2), page)
    io.open(PAGE, "w", encoding="utf-8", newline="").write(page.replace("\n", "\r\n") if crlf else page)
    print("filled docs/scars.html from rules.md#scars")


if __name__ == "__main__":
    main()
