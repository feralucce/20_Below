# -*- coding: utf-8 -*-
"""Build a clickable local copy of the whole site into _preview/.

GitHub Pages runs Jekyll; this machine has no Ruby, so a plain file
server shows Liquid tags as text and half the site does not exist at
all - the web book and the rules pages are markdown that Jekyll turns
into HTML on push. This does that work locally, so the site can be
looked at before it goes anywhere.

It implements only the Liquid these pages actually use: {{ content }},
{{ page.foo }}, {% if %}/{% else %}/{% endif %}, {% include %}, and the
one filter chain in _layouts/rules.html. That is not a Jekyll clone and
it is not trying to be.

    python tools/preview-site.py

Then serve the repository root and open /_preview/index.html.
_preview/ is throwaway and rebuilt from scratch every run.

ONE REAL DIFFERENCE, worth knowing before trusting what you see: Jekyll
renders markdown with kramdown and this uses python-markdown. They
disagree in places that matter to this project - attribute lists, and
what `markdown="1"` does to the inside of a div. A page that looks
right here can still be wrong in production. Layout, colour and type
are safe to judge from this; the fine structure of a web book chapter
is not.
"""
import io
import os
import re
import shutil

import markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "_preview")
INCLUDES = os.path.join(ROOT, "_includes")
LAYOUTS = os.path.join(ROOT, "_layouts")

# _config.yml assigns these by path, rather than every file repeating it.
LAYOUT_BY_DIR = {"rules": "rules", "webbook": "webbook"}

SKIP_DIRS = {".git", "_preview", "_includes", "_layouts", "node_modules",
             "brewer-desktop", "desktop", "Sale Packages", "Branding",
             "New Website", "New reference", ".claude"}


# ---------------------------------------------------------------- front matter

def split_front_matter(text):
    """(dict, body). Only the scalar keys these pages use - enough for
    a title and a couple of navigation links, not a YAML parser."""
    if not text.startswith("---"):
        return {}, text
    _, fm, body = text.split("---", 2)
    data = {}
    for line in fm.splitlines():
        if ":" not in line or line.strip().startswith("#"):
            continue
        key, _, val = line.partition(":")
        val = val.strip().strip('"').strip("'")
        if val:
            data[key.strip()] = val
    return data, body


# ---------------------------------------------------------------- liquid

def liquid(text, page, content, includes):
    """The small subset of Liquid these layouts use."""
    for name, body in includes.items():
        text = text.replace("{%% include %s %%}" % name, body)

    # {% if page.x %}A{% else %}B{% endif %}, innermost first so that
    # nesting resolves without a parser.
    pattern = re.compile(
        r"\{%\s*if\s+([^%]+?)\s*%\}((?:(?!\{%\s*if\b).)*?)"
        r"(?:\{%\s*else\s*%\}((?:(?!\{%\s*if\b).)*?))?\{%\s*endif\s*%\}", re.S)

    def truthy(expr):
        return any(page.get(t.strip().replace("page.", ""))
                   for t in expr.split(" or "))

    while True:
        new = pattern.sub(lambda m: m.group(2) if truthy(m.group(1))
                          else (m.group(3) or ""), text)
        if new == text:
            break
        text = new

    # The one filter chain on the site, in _layouts/rules.html.
    text = re.sub(
        r'\{\{\s*page\.name\s*\|\s*remove:\s*"\.md"\s*\|\s*replace:\s*"-",\s*" "\s*\|\s*capitalize\s*\}\}',
        lambda m: page.get("name", "").replace(".md", "").replace("-", " ").capitalize(),
        text)

    text = text.replace("{{ content }}", content)
    text = re.sub(r"\{\{\s*page\.([\w-]+)\s*\}\}",
                  lambda m: str(page.get(m.group(1), "")), text)

    # Anything left is Liquid this does not implement. Leaving braces
    # on the page would read as a fault in the site rather than in here.
    text = re.sub(r"\{%.*?%\}", "", text)
    text = re.sub(r"\{\{.*?\}\}", "", text)
    return text


# ---------------------------------------------------------------- sources

def load(directory, suffix=".html"):
    out = {}
    if not os.path.isdir(directory):
        return out
    for name in sorted(os.listdir(directory)):
        if name.endswith(suffix):
            out[name] = io.open(os.path.join(directory, name),
                                encoding="utf-8").read()
    return out


def sources():
    """Every file Jekyll would build: .html with front matter, and .md
    anywhere the config gives a layout."""
    found = []
    for base, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in sorted(files):
            if not f.endswith((".html", ".md")):
                continue
            rel = os.path.relpath(os.path.join(base, f), ROOT).replace("\\", "/")
            top = rel.split("/")[0]
            head = io.open(os.path.join(base, f), encoding="utf-8").read(4)
            # A page is front matter, or markdown somewhere _config.yml
            # gives a layout - rules/*.md carry no front matter and are
            # still rendered in production. README.md is the exception:
            # Jekyll excludes it by default, which is why
            # /webbook/README.html is a 404 on the live site while
            # /rules/skills.html is not.
            if f == "README.md":
                continue
            if head.startswith("---") or (f.endswith(".md") and top in LAYOUT_BY_DIR):
                found.append(rel)
    return sorted(found)


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    includes = {k: re.sub(r"\{%-?\s*comment.*?endcomment\s*-?%\}", "", v,
                          flags=re.S).strip()
                for k, v in load(INCLUDES).items()}
    layouts = load(LAYOUTS)
    md = markdown.Markdown(extensions=["tables", "attr_list", "md_in_html",
                                       "fenced_code", "toc", "sane_lists"])

    built, skipped = [], []
    for rel in sources():
        raw = io.open(os.path.join(ROOT, rel), encoding="utf-8").read()
        page, body = split_front_matter(raw)
        page.setdefault("name", rel.rsplit("/", 1)[-1])

        top = rel.split("/")[0]
        layout = page.get("layout") or LAYOUT_BY_DIR.get(top)

        if rel.endswith(".md"):
            md.reset()
            body = md.convert(body)
            out_rel = rel[:-3] + ".html"
        else:
            out_rel = rel

        if layout:
            shell = layouts.get(layout + ".html")
            if not shell:
                skipped.append(rel + " (no layout %s)" % layout)
                continue
            body = liquid(shell, page, body, includes)
        else:
            body = liquid(body, page, "", includes)

        # The copy sits at the same depth as the original, but relative
        # paths were written for the original's URL, so make them
        # absolute rather than guess.
        prefix = "/" + rel.rsplit("/", 1)[0] + "/" if "/" in rel else "/"
        body = re.sub(r'(src|href)="(?!/|https?:|#|mailto:|data:)',
                      r'\1="%s' % prefix, body)

        dest = os.path.join(OUT, out_rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        io.open(dest, "w", encoding="utf-8", newline="\n").write(body)
        built.append(out_rel)

    # Second pass: keep links inside the preview, but only where the
    # preview has the page. A link this cannot satisfy is left pointing
    # at production, because a 404 here reads as a fault in the site.
    have = set(built)
    for rel in built:
        p = os.path.join(OUT, rel)
        s = io.open(p, encoding="utf-8").read()
        s = re.sub(r'href="(/[^"#?]*\.html)((?:#|\?)[^"]*)?"',
                   lambda m: 'href="/_preview%s%s"' % (m.group(1), m.group(2) or "")
                   if m.group(1).lstrip("/") in have else m.group(0), s)
        io.open(p, "w", encoding="utf-8", newline="\n").write(s)

    print("built %d pages into _preview/" % len(built))
    for s in skipped:
        print("  skipped %s" % s)
    print("serve the repository root, then open /_preview/index.html")
    print("NOTE: markdown here is python-markdown, not kramdown - judge")
    print("      layout and colour from this, not fine chapter structure.")


main()
