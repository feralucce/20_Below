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
# The Brewer is deliberately not here. It ships as its own installer from
# brewer-desktop/, because a player creating a character has no use for a
# layout tool.
$folders = @("app", "rules", "docs", "vendor")

foreach ($folder in $folders) {
    $source = Join-Path $repoRoot $folder
    $dest = Join-Path $stagingDir $folder
    Copy-Item -Path $source -Destination $dest -Recurse -Force
}

Write-Host "Staged frontend assets ($($folders -join ', ')) to $stagingDir"
