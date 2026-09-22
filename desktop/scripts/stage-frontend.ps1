# Builds a clean staging copy of just the files the desktop app actually
# needs to serve into src-tauri/frontend-dist, which
# tauri.conf.json's frontendDist points at. Run automatically by Tauri
# before each build/dev via beforeBuildCommand/beforeDevCommand.
#
# Without this, frontendDist pointed at the repo root directly, which
# meant a real build embedded the entire .git history and the desktop
# app's own Rust project (src-tauri, icons, target artifacts) as web
# assets inside the shipped binary - harmless for local debug testing,
# not something to actually ship to a player.

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$stagingDir = Join-Path $PSScriptRoot "..\src-tauri\frontend-dist"

if (Test-Path $stagingDir) {
    Remove-Item -Recurse -Force $stagingDir
}
New-Item -ItemType Directory -Path $stagingDir | Out-Null

# vendor/ holds the markdown renderer app/index.html loads - it used to
# come from a CDN, which meant the installed app could not render its own
# rules text without an internet connection.
#
# The Brewery is deliberately not here. It ships as its own installer from
# brewer-desktop/, because a player creating a character has no use for a
# layout tool.
$folders = @("app", "rules", "vendor")

foreach ($folder in $folders) {
    $source = Join-Path $repoRoot $folder
    $dest = Join-Path $stagingDir $folder
    Copy-Item -Path $source -Destination $dest -Recurse -Force
}

# Three things in app/ are not part of the app. sheet-preview.html is a
# way to look at the sheet without walking the creator; sheet/sample is a
# real character it loads; and rowen-storm.html is one player's own sheet,
# served to him at a URL of his own. A real person's build has no business
# riding along in a download handed to strangers, whatever else is true of
# it - the page being public at its own address is not the same as it
# sitting on the disk of everyone who installs the creator.
$stagedApp = Join-Path $stagingDir "app"
foreach ($devOnly in @("sheet\sample", "sheet-preview.html", "rowen-storm.html")) {
    $path = Join-Path $stagedApp $devOnly
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path
        Write-Host "Excluded app/$devOnly from the staged frontend"
    }
}

# The list above is a list, and a list is only as good as whoever
# remembers to add to it. rowen-storm.html shipped in three releases
# because nobody did. So the rule is not the list: any staged page with a
# filed character built into it is one somebody wrote for a person, and
# it does not go in the installer.
#
# The signature is a character's own shape - the sub-stat block every
# build carries, next to one of the written fields only a real character
# has. The creator's own pages build a character at runtime and have
# neither written into the file, so they are untouched.
$stagedAppFull = (Resolve-Path $stagedApp).Path
$carriers = Get-ChildItem -Path $stagedApp -Filter *.html -Recurse -File | Where-Object {
    $text = Get-Content -Raw -LiteralPath $_.FullName
    $text -match '"subStats"\s*:' -and $text -match '"(?:backstory|finishingNotes|appearance)"\s*:\s*"[^"]'
}
foreach ($page in $carriers) {
    $rel = $page.FullName.Substring($stagedAppFull.Length).TrimStart('\')
    Remove-Item -Force $page.FullName
    Write-Host "Excluded app/$rel from the staged frontend - it carries a filed character"
}

# docs/ used to be staged whole, which put 6.7 MB of hero art and reference
# scans into the installer to serve three favicons - and dragged
# style-guide.html along with it, the one file in the creator's payload that
# mentioned another setting. The app links nothing else out of docs/: the
# references to advancement-reference.html in app/state.js are source
# comments, not URLs. Verified by grepping every 'docs' mention in app/.
$brand = Join-Path $repoRoot "docs\assets\brand"
if (-not (Test-Path $brand)) {
    throw "Missing source folder: $brand"
}
$brandDest = Join-Path $stagingDir "docs\assets\brand"
New-Item -ItemType Directory -Path $brandDest -Force | Out-Null
Copy-Item -Path (Join-Path $brand "*") -Destination $brandDest -Recurse -Force

Write-Host "Staged frontend assets ($($folders -join ', '), docs/assets/brand) to $stagingDir"
