<#
.SYNOPSIS
  Convert a PDF exported from the Brewery into a CMYK (or
  greyscale) PDF/X file suitable for print-on-demand upload.

.DESCRIPTION
  The Brewery's "Print / PDF" button produces an RGB PDF, because that
  is all a browser can produce. Print-on-demand services want CMYK and
  PDF/X compliance - DriveThruRPG asks for PDF/X-1a:2001 or
  PDF/X-3:2002, CMYK for colour interiors, and 300 dpi images.

  This does that conversion with Ghostscript. It writes the PDF/X
  definition file itself, so there is nothing to hand-edit.

  What it does NOT do: add bleed or move anything on the page. Set the
  Brewery to POD layout before printing and the geometry is already
  right. This step only converts colour and stamps the PDF/X metadata.

.PARAMETER Path
  The RGB PDF to convert.

.PARAMETER Output
  Where to write the result. Defaults to <input>-pdfx.pdf.

.PARAMETER Gray
  Convert to DeviceGray instead of CMYK. Use this for the Brewery's
  Greyscale palette, when the interior is being printed black and white.

.PARAMETER Version
  1 for PDF/X-1a:2001 (default, the stricter and safer of the two),
  or 3 for PDF/X-3:2002.

.PARAMETER IccProfile
  Path to the CMYK ICC profile to embed as the output intent. Defaults
  to the generic CMYK profile Ghostscript ships with, which is enough
  to produce a valid file. For a real print run, get the profile your
  printer asks for - US POD is usually SWOP (CGATS TR 001) or GRACoL -
  and pass it here.

.PARAMETER Condition
  The OutputConditionIdentifier recorded in the file. Should name the
  condition your ICC profile actually represents.

.PARAMETER Title
  Document title recorded in the PDF. PDF/X requires one.

.EXAMPLE
  .\to-pdfx.ps1 supplement.pdf

.EXAMPLE
  .\to-pdfx.ps1 supplement.pdf -Gray -Title "Backwater Static"

.EXAMPLE
  .\to-pdfx.ps1 book.pdf -IccProfile "C:\profiles\USWebCoatedSWOP.icc" -Condition "CGATS TR 001"
#>
[CmdletBinding()]
param(
  # NB: not named $Input - that is a PowerShell automatic variable and
  # binding to it silently fails.
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Path,

  [Parameter(Position = 1)]
  [string]$Output,

  [switch]$Gray,

  [ValidateSet(1, 3)]
  [int]$Version = 1,

  [string]$IccProfile,

  [string]$Condition = "CGATS TR 001",

  [string]$Title
)

$ErrorActionPreference = "Stop"

# ---- locate Ghostscript -----------------------------------------------
function Find-Ghostscript {
  $cmd = Get-Command gswin64c, gswin32c, gs -ErrorAction SilentlyContinue |
         Select-Object -First 1
  if ($cmd) { return $cmd.Source }
  $found = Get-ChildItem "$env:ProgramFiles\gs", "${env:ProgramFiles(x86)}\gs" `
             -Filter "gswin*c.exe" -Recurse -ErrorAction SilentlyContinue |
           Sort-Object FullName -Descending | Select-Object -First 1
  if ($found) { return $found.FullName }
  throw "Ghostscript not found. Install it from https://ghostscript.com/releases/ and re-run."
}

$gs = Find-Ghostscript
$gsRoot = Split-Path (Split-Path $gs -Parent) -Parent

# ---- resolve paths ----------------------------------------------------
if (-not (Test-Path -LiteralPath $Path)) { throw "No such file: $Path" }
$inFull = (Resolve-Path -LiteralPath $Path).Path

if (-not $Output) {
  $Output = [IO.Path]::Combine(
    [IO.Path]::GetDirectoryName($inFull),
    [IO.Path]::GetFileNameWithoutExtension($inFull) + "-pdfx.pdf")
}
if (-not $Title) { $Title = [IO.Path]::GetFileNameWithoutExtension($inFull) }

if (-not $IccProfile) {
  $IccProfile = if ($Gray) { "$gsRoot\iccprofiles\default_gray.icc" }
                else       { "$gsRoot\iccprofiles\default_cmyk.icc" }
  Write-Host "Using Ghostscript's bundled profile. For a real print run, pass -IccProfile with the profile your printer asks for." -ForegroundColor DarkYellow
}
if (-not (Test-Path -LiteralPath $IccProfile)) { throw "No such ICC profile: $IccProfile" }
$iccFull = (Resolve-Path -LiteralPath $IccProfile).Path

$strategy  = if ($Gray) { "Gray" } else { "CMYK" }
$model     = if ($Gray) { "/DeviceGray" } else { "/DeviceCMYK" }
$components = if ($Gray) { 1 } else { 4 }

# ---- write the PDF/X definition ---------------------------------------
# Ghostscript needs this prefix file to stamp the version and embed the
# output intent. Generated here so nothing has to be edited by hand.
# PostScript strings are ( ) delimited, so those characters are escaped.
function Esc-PS([string]$s) { $s -replace '\\', '\\\\' -replace '\(', '\(' -replace '\)', '\)' }

$defPath = [IO.Path]::GetTempFileName() + ".ps"
$versionString = if ($Version -eq 1) { "PDF/X-1a:2001" } else { "PDF/X-3:2002" }

@"
%!
[ /GTS_PDFXVersion ($versionString)
  /Title ($(Esc-PS $Title))
  /Trapped /False
/DOCINFO pdfmark

[/_objdef {icc_PDFX} /type /stream /OBJ pdfmark
[{icc_PDFX} << /N $components >> /PUT pdfmark
[{icc_PDFX} ($(Esc-PS $iccFull.Replace('\','/'))) (r) file /PUT pdfmark

[/_objdef {OutputIntent_PDFX} /type /dict /OBJ pdfmark
[{OutputIntent_PDFX} <<
  /Type /OutputIntent
  /S /GTS_PDFX
  /OutputCondition ($(Esc-PS $Condition))
  /Info ($(Esc-PS $Condition))
  /OutputConditionIdentifier ($(Esc-PS $Condition))
  /RegistryName (http://www.color.org)
  /DestOutputProfile {icc_PDFX}
>> /PUT pdfmark
[{Catalog} <</OutputIntents [ {OutputIntent_PDFX} ]>> /PUT pdfmark
"@ | Set-Content -LiteralPath $defPath -Encoding ascii

# ---- convert ----------------------------------------------------------
$args = @(
  "-dBATCH", "-dNOPAUSE", "-dSAFER", "-dQUIET",
  # SAFER confines file reads to the working directory, and the ICC
  # profile is usually outside it. Permit exactly that one file.
  "--permit-file-read=$iccFull",
  "-sDEVICE=pdfwrite",
  "-dPDFX=$Version",
  "-dCompatibilityLevel=1.3",          # PDF/X-1a and X-3 are 1.3-based
  "-sColorConversionStrategy=$strategy",
  "-dProcessColorModel=$model",
  "-dOverrideICC=true",
  # keep images at print resolution rather than Ghostscript's defaults
  "-dDownsampleColorImages=false",
  "-dDownsampleGrayImages=false",
  "-dDownsampleMonoImages=false",
  "-dAutoFilterColorImages=false",
  "-dAutoFilterGrayImages=false",
  "-dColorImageFilter=/FlateEncode",
  "-dGrayImageFilter=/FlateEncode",
  "-dEmbedAllFonts=true",
  "-dSubsetFonts=true",
  "-sOutputFile=$Output",
  $defPath,
  $inFull
)

Write-Host "Ghostscript : $gs"
Write-Host "Profile     : $iccFull"
Write-Host "Target      : $versionString, $strategy"
Write-Host "Output      : $Output"

& $gs @args
$code = $LASTEXITCODE
Remove-Item -LiteralPath $defPath -Force -ErrorAction SilentlyContinue

if ($code -ne 0) { throw "Ghostscript exited with code $code." }
if (-not (Test-Path -LiteralPath $Output)) { throw "Ghostscript reported success but wrote no file." }

$size = [math]::Round((Get-Item -LiteralPath $Output).Length / 1MB, 2)
Write-Host "Done. $size MB" -ForegroundColor Green
Write-Host "Check the result before uploading - open it and confirm the colour looks right." -ForegroundColor DarkYellow
