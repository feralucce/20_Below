# The character sheet

Five pages of art and one field map, generated together.

```bash
python tools/character-sheet/build.py
```

That writes, into `Branding/character-sheet/`:

- `character-sheet-page1.svg` ... `page5.svg` and matching transparent PNGs at 2550 x 3300
- `character-sheet-fields.json` - every named region on every page

Then copy the SVGs and the field map into `app/sheet/` for the Creator.

## Why a field map

The Creator does not know where anything sits on the page. It reads
`fields.json` and lays a live control over each named rectangle, so the
art and the app cannot drift: move a block in the generator, rebuild, and
the app follows without being edited.

The same map is what the white-textbox print variant, the fillable PDF, a
shared character URL and the local-storage web app all read. One contract,
five consumers.

A field is `{id, kind, page, x, y, w, h}` in the page's own 2550 x 3300
space, plus whatever that kind needs. The kinds:

| kind | what it is |
|---|---|
| `text` | a single line - a name, a number, a short list |
| `para` | a ruled block that wraps - Backstory, Notes, what a Gift does |
| `pips` | a run of boxes filled up to a value - Vitals, Levels |
| `tiers` | the Skill training boxes, which start at Trained rather than 1 |
| `check` | one box, on or off |
| `button` | a `-` or `+` glyph the art already draws, registered so a click lands on it |

`build.py` fails if two fields ever share an id.

## The pages

Page 1 is its own generator (`sheet300.py`): it is built on the emblem's
measured geometry rather than on a stack of blocks, because the emblem is
drawn rather than constructed and nothing about it is regular. Pages 2 to
5 share `sheetkit.py` - one margin, one top edge, one bottom edge, so all
five stack consistently. Every page ends its content at y 3138.

Block sizes came from the saved characters rather than from guesswork:
30 Skills taken at the top end, 31 Descriptors, six Boons, five Flaws,
seven Resources, six Gifts, 37 pieces of gear.

## Backgrounds

The art is transparent and composites over `Branding/character-sheet/CS-BG-pgN.png`.
Page 5 reuses page 2's. `app/sheet/bgN.jpg` are those same backgrounds at
screen size.
