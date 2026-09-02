# Fonts

The typefaces named in [the style guide](../../docs/style-guide.html), bundled
with the Brewer.

| Family | Used for |
|---|---|
| Montserrat | Body copy and headings on the page |
| Anton | Display headlines |
| Bebas Neue | Titles, labels and stamp callouts |
| Fraunces | Reserved: Backwater Static |
| Space Mono | Monospace, uppercase labels |

Latin subset only, `.woff2`, about 360 KB in total.

## Why bundled rather than linked

- The Brewer works with no network, and prints identically on every machine.
- No dependency on Google Fonts staying available or unchanged.
- **A creator cannot substitute a different face.** Everything made with this
  tool looks like the same product line, which is the point of the tool.

There is deliberately no way to load your own font.

## Licence

All five families are under the **SIL Open Font License 1.1** — see `OFL.txt`.
That permits bundling, embedding in a PDF, and commercial use, including in
products you sell. It does require that the fonts themselves are not sold on
their own, and that any modified version is not released under the original
reserved font names.

Sources: [Anton](https://fonts.google.com/specimen/Anton),
[Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue),
[Montserrat](https://fonts.google.com/specimen/Montserrat),
[Fraunces](https://fonts.google.com/specimen/Fraunces),
[Space Mono](https://fonts.google.com/specimen/Space+Mono).

## Replacing or adding a face

Drop the `.woff2` in here, add an `@font-face` to `fonts.css`, and reference it
from `brew.css`. Nothing else reads this directory.
