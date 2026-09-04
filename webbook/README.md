# Web Book

The web edition of the 20 Below Player's Guide — the same content as the print
manuscript, with web affordances in place of page references. Generated from the
manuscript.

**Do not hand-edit anything in this directory.** Files here are build output. Edits belong
in the manuscript.

Not to be confused with `rules/`, which is the machine-readable contract the character
creator parses and is authored separately. Changing a heading or table there breaks the
app silently — see `srd-compilation.md` in the private notes.

## Building it

```
python tools/scriv2web.py
```

Reads the Scrivener project and writes one markdown file per chapter plus `index.md`, each
with Jekyll front matter so the site renders it through `_layouts/webbook.html`.

Chapters are listed explicitly at the top of that script rather than discovered, because
publishing is a decision rather than a side effect of a chapter existing. **Chapter 13,
Running the Game, is deliberately absent** — it is a 400-word stub. Add it to the list when
it is written; nothing else needs changing.

## Prose from the book, tables from the rules

The manuscript stores a table as one dash-separated line per row, and those do not split
back into columns reliably: `Melee - - - - - 1` is four empty cells or five depending on how
you read it. So the generator takes the prose from the manuscript and rebuilds every table
from the matching one in `rules/*.md`, which holds the same data with real columns.

Only rows the book actually lists are emitted, in the book's order. This restores structure;
it does not add content.

## Not done yet

Cross-references are still plain text. "Covered in Skills" should link to the Skills chapter,
and "under Making an Attack" to that section. That needs a name-to-anchor index the generator
does not build yet.
