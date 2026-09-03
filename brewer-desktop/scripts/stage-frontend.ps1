# Builds a clean staging copy of just the files the Brewer desktop app
# actually needs to serve into src-tauri/frontend-dist, which
# tauri.conf.json's frontendDist points at. Run automatically by Tauri
# before each build/dev via beforeBuildCommand/beforeDevCommand.
#
# The app serves brew/index.html - the same page as the web Brewer at
# /brew/, so the two stay in step.
#
# It ships separately from the Character Creator on purpose: a player
# rolling up a character has no use for a page-layout tool, and the
# Brewer's fonts and example files are dead weight in that installer.
#
# The relative layout matters: brew/index.html loads the markdown renderer
# as ../vendor/marked.min.js and its Licence button opens ../license.html,
# so both have to land beside brew/ in the same shape here.

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$stagingDir = Join-Path $PSScriptRoot "..\src-tauri\frontend-dist"

if (Test-Path $stagingDir) {
    Remove-Item -Recurse -Force $stagingDir
}
New-Item -ItemType Directory -Path $stagingDir | Out-Null

foreach ($folder in @("brew", "vendor")) {
    $source = Join-Path $repoRoot $folder
    if (-not (Test-Path $source)) {
        throw "Missing source folder: $source"
    }
    Copy-Item -Path $source -Destination (Join-Path $stagingDir $folder) -Recurse -Force
}

$license = Join-Path $repoRoot "license.html"
if (-not (Test-Path $license)) {
    throw "Missing source file: $license"
}
Copy-Item -Path $license -Destination $stagingDir -Force

Write-Host "Staged frontend assets (brew/, vendor/, license.html) to $stagingDir"
