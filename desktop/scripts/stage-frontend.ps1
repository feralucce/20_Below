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
