# Builds a clean staging copy of just the files the desktop app actually
# needs to serve (app/, rules/, docs/) into src-tauri/frontend-dist, which
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

foreach ($folder in @("app", "rules", "docs")) {
    $source = Join-Path $repoRoot $folder
    $dest = Join-Path $stagingDir $folder
    Copy-Item -Path $source -Destination $dest -Recurse -Force
}

Write-Host "Staged frontend assets (app/, rules/, docs/) to $stagingDir"
