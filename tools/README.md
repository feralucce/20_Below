# tools

Manuscript to Brewery. Takes a chapter out of the Scrivener project and turns
it into the markdown The Brewery lays out, with page breaks that are measured
rather than guessed.

## Why it is two steps

Pagination in The Brewery is manual on purpose - browsers will not reflow
content into fixed-size sheets, so the author says where a page ends
(`brew/render.js`). Any break chosen by word count is a guess, and a page that
overruns is silently clipped in print.

So the split is: Python reads the RTF and produces content in order; the
browser does the pagination, because only the real renderer knows how tall a
page actually is. The second step asks it, after every paragraph added,
whether the page has outgrown the sheet - the same test `brew/main.js` uses to
draw its red warning bar.

## Running it

```
python tools/scriv2brew.py "Chapter 12"
```

Matches the chapter by a fragment of its binder title, and writes to `build/`:

- `<slug>.chunks.json` - the chapter as ordered chunks, the paginator's input
- `<slug>.unpaged.md` - the same content as one long markdown file, readable
  on its own, no page breaks

Then serve the repo and open:

```
tools/paginate.html?src=../build/<slug>.chunks.json
```

It packs the chunks into pages, renders the result, and reports how many pages
came out and whether any still overflow. **Copy markdown** puts the finished
document on the clipboard for pasting into The Brewery; **Download .md** saves
it. The pages render underneath so you can see what you are about to paste.

## What the converter can and cannot know

The manuscript uses exactly one heading style (28pt bold) and one body style,
so heading *level* is not in the file - it comes from a rule:

- the first heading in a chapter is the chapter title (`#`)
- every other heading is a section (`##`)
- an all-bold paragraph sitting directly above indented rows is a sub-label
  (`###`)

Bold and italic runs are preserved as `**` and `*`. Indented rows become
bulleted lists, not tables: the source has no header row, markdown requires
one, and inventing column names is worse than a list that always renders.

## What it does not do yet

- **Entry blocks.** Chapters 5-9 and 11 are entry-shaped - Skills, Boons,
  Resources, Gifts, Flaws, Equipment - and would want `::: skill`, `::: gift`
  and the rest. Chapter 8's Gifts also order Adders and Limiters *before* their
  levels, where the `gift` block wants them after. That is a per-chapter
  transform, not a general rule.
- **Tables.** The manuscript's weapon tables come through as flattened
  dash-separated lines that do not split back into columns reliably.
  `rules/weapons.md` holds the same data as clean parseable tables - take them
  from there rather than reconstructing them from the prose.
