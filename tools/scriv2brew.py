# -*- coding: utf-8 -*-
"""Scrivener chapter -> Brewery markdown.

Reads one chapter's content.rtf and emits the markdown The Brewery renders,
preserving bold and italic runs rather than flattening them the way a plain
text dump does.

The manuscript uses exactly one heading style (28pt bold) and one body style
(24pt), so heading LEVEL cannot be read off the file - it has to come from a
rule. Here: the first heading in the chapter is the chapter title (#), every
other heading is a section (##), and a body paragraph that is entirely bold
and sits directly above indented rows is a sub-label (###).

Page breaks are deliberately NOT inserted here. Pagination is manual in the
Brewery by design, and guessing at it blind produces pages that overflow;
paginate.html packs these chunks against the real renderer instead.
"""
import io, os, re, json, sys, xml.etree.ElementTree as ET

SCRIV = r"C:\Users\feral\OneDrive\Documents\20 Below Manuscript\20 Below Mansuscript.scriv"
DATA = os.path.join(SCRIV, "Files", "Data")

RUN = re.compile(r"\{\\f(\d+)\\fs(\d+)\\b(\d)\\i(\d) ?(.*?)\}", re.S)


def chapter_uuid(title_fragment):
    r = ET.parse(os.path.join(SCRIV, "20 Below Mansuscript.scrivx")).getroot()
    for b in r.iter("BinderItem"):
        t = b.find("Title")
        if t is not None and title_fragment.lower() in (t.text or "").lower():
            return b.get("UUID"), t.text
    raise SystemExit("no chapter matching %r" % title_fragment)


def decode(text):
    """RTF escapes -> characters."""
    text = re.sub(r"\\u(-?\d+)\\'[0-9a-fA-F]{2}", lambda m: chr(int(m.group(1)) % 65536), text)
    text = re.sub(r"\\u(-?\d+) ?\??", lambda m: chr(int(m.group(1)) % 65536), text)
    text = re.sub(r"\\'([0-9a-fA-F]{2})", lambda m: chr(int(m.group(1), 16)), text)
    text = text.replace(r"\tab ", "\t").replace(r"\tab", "\t")
    # Scrivener sprinkles character-set control words through its runs -
    # \loch \hich \dbch \af0 \uc1 and their friends. They carry no text, but
    # left alone they read as literal gibberish mid-sentence. Anything still
    # shaped like a control word at this point is one of those. Escaped braces
    # are not (\{ is not a letter), so they survive to the line below.
    # A soft break inside a paragraph is real content - it is how the
    # manuscript separates a heading from the text under it when the two share
    # one paragraph. Convert it before the sweep below, or the sweep deletes it
    # and the two run together as "Writing Your Own NatureIf none of the...".
    text = text.replace(r"\line ", "\n").replace(r"\line", "\n")
    text = re.sub(r"\\[a-zA-Z]+-?\d*[ ]?", "", text)
    text = text.replace(r"\{", "{").replace(r"\}", "}").replace("\\\\", "\\")
    return text


def paragraphs(rtf):
    """[(is_heading, [(bold, italic, text), ...]), ...]

    A paragraph that opens at heading size and then continues at body size is
    two things sharing one paragraph, and the manuscript does that - a heading
    with its opening line tucked under it behind a soft break. Split it, or the
    whole paragraph renders as one enormous heading.
    """
    body = rtf.split("\\cf0\n", 1)[-1]
    out = []
    for chunk in re.split(r"\\par\b", body):
        head, rest = [], []
        for f, fs, b, i, txt in RUN.findall(chunk):
            if not txt.strip() and "\t" not in decode(txt):
                continue
            run = (b == "1", i == "1" or f == "2", decode(txt))
            (head if (fs == "28" and not rest) else rest).append(run)
        if head:
            out.append((True, head))
        if rest:
            out.append((False, rest))
    return out


def emphasise(runs):
    """Runs -> markdown, merging adjacent runs that share emphasis."""
    parts = []
    for bold, ital, text in runs:
        if not text:
            continue
        mark = "**" if bold else ("*" if ital else "")
        if parts and parts[-1][0] == mark:
            parts[-1][1] += text
        else:
            parts.append([mark, text])
    out = []
    for mark, text in parts:
        if mark and text.strip():
            lead = len(text) - len(text.lstrip())
            trail = len(text) - len(text.rstrip())
            out.append(text[:lead] + mark + text.strip() + mark + (text[len(text) - trail:] if trail else ""))
        else:
            out.append(text)
    return "".join(out)


def to_chunks(uuid):
    rtf = io.open(os.path.join(DATA, uuid, "content.rtf"), encoding="utf-8", errors="replace").read()
    paras = paragraphs(rtf)
    chunks = []
    seen_title = False
    i = 0
    while i < len(paras):
        heading, runs = paras[i]
        raw = emphasise(runs)
        text = raw.strip()
        if not text:
            i += 1
            continue
        if heading:
            plain = "".join(r[2] for r in runs).strip()
            chunks.append(("# " if not seen_title else "## ") + plain)
            seen_title = True
            i += 1
            continue
        # A run of indented rows becomes a list. Not a table: the source has
        # no header row, and markdown needs one - inventing column names is
        # worse than a list that always renders correctly.
        if raw.startswith("\t"):
            rows = []
            while i < len(paras) and not paras[i][0]:
                t = emphasise(paras[i][1])
                if not t.startswith("\t"):
                    break
                cells = [c.strip() for c in t.strip().split("\t") if c.strip()]
                rows.append("- " + " - ".join(cells))
                i += 1
            chunks.append("\n".join(rows))
            continue
        # an all-bold paragraph directly above indented rows is a sub-label
        all_bold = all(r[0] for r in runs if r[2].strip())
        next_indented = i + 1 < len(paras) and not paras[i + 1][0] and emphasise(paras[i + 1][1]).startswith("\t")
        if all_bold and next_indented:
            chunks.append("### " + "".join(r[2] for r in runs).strip())
            i += 1
            continue
        chunks.append(text)
        i += 1
    return chunks


if __name__ == "__main__":
    frag = sys.argv[1] if len(sys.argv) > 1 else "Chapter 12"
    uuid, title = chapter_uuid(frag)
    chunks = to_chunks(uuid)

    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    build = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "build")
    os.makedirs(build, exist_ok=True)

    chunks_path = os.path.join(build, slug + ".chunks.json")
    io.open(chunks_path, "w", encoding="utf-8").write(
        json.dumps({"title": title, "chunks": chunks}, ensure_ascii=False, indent=1))

    # An un-paginated copy, readable on its own and the input paginate.html
    # packs. Page breaks are NOT guessed here - see the module docstring.
    flat_path = os.path.join(build, slug + ".unpaged.md")
    io.open(flat_path, "w", encoding="utf-8", newline="\n").write("\n\n".join(chunks) + "\n")

    words = sum(len(c.split()) for c in chunks)
    print(f"{title}: {len(chunks)} chunks, {words} words")
    print("  " + chunks_path)
    print("  " + flat_path)
    print("\nNext: serve the repo and open")
    print(f"  tools/paginate.html?src=../build/{slug}.chunks.json")
