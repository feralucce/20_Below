# Prepress

The Brewer's **Print / PDF** button produces an RGB PDF, because that is the
only thing a browser can produce. Print-on-demand services want something
stricter. DriveThruRPG, for example, asks for:

- **CMYK** for colour interiors and covers - not RGB
- **300 dpi** images
- **PDF/X-1a:2001 or PDF/X-3:2002** compliance
- text kept at least **0.5in** inside the page edge

The Brewer's **POD** layout already handles the last one, along with gutters
and a 0.125in bleed. This script handles the rest.

## What it does

`to-pdfx.ps1` runs Ghostscript to convert colour and stamp the PDF/X
metadata. It generates the PDF/X definition file itself, so there is nothing
to hand-edit.

**It does not move anything on the page.** Set the Brewer to POD layout
before printing and the geometry is already correct. This step only changes
colour and adds the compliance metadata.

## Requirements

[Ghostscript](https://ghostscript.com/releases/) — the script finds it on
PATH or under `Program Files\gs`.

## Use

```powershell
# colour interior, PDF/X-1a (the default)
.\to-pdfx.ps1 supplement.pdf

# black and white interior - pair with the Brewer's Greyscale palette
.\to-pdfx.ps1 supplement.pdf -Gray

# with the profile your printer actually asked for
.\to-pdfx.ps1 book.pdf -IccProfile "C:\profiles\USWebCoatedSWOP.icc" -Condition "CGATS TR 001"
```

Output defaults to `<name>-pdfx.pdf` beside the input.

| Switch | Meaning |
|---|---|
| `-Gray` | DeviceGray instead of CMYK |
| `-Version 1\|3` | PDF/X-1a:2001 (default) or PDF/X-3:2002 |
| `-IccProfile` | Output-intent profile to embed |
| `-Condition` | OutputConditionIdentifier recorded in the file |
| `-Title` | Document title; PDF/X requires one |

## About the ICC profile

With no `-IccProfile`, the script embeds the generic CMYK (or grey) profile
Ghostscript ships with. That produces a **valid** PDF/X file, and is fine for
proofing.

For an actual print run, use the profile your printer specifies — US POD is
usually SWOP (CGATS TR 001) or GRACoL. The bundled profile is generic, so
colours will shift relative to a real press profile. Pass both `-IccProfile`
and a matching `-Condition`; the identifier should name the condition the
profile actually represents.

## Verifying

The script checks that Ghostscript succeeded and wrote a file, but it does
not validate compliance. Before uploading:

- open the result and confirm the colour still looks right — CMYK has a
  smaller gamut than RGB, and saturated blues in particular shift
- check the page size includes the bleed if you exported in POD layout
- if your printer offers a preflight check, use it

## Notes

- `-dSAFER` is on, so the script explicitly permits reading just the one ICC
  profile. Nothing else outside the working directory is readable.
- Images are not downsampled. Ghostscript's presets would otherwise reduce
  them below print resolution.
- PDF/X-1a and X-3 are both PDF 1.3-based, so the output is written at that
  compatibility level. Transparency is flattened as a result — which is
  expected, and part of why X-1a is the safer choice for print.
