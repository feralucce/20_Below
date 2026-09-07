# Builds a clean staging copy of just the files the Encounter Difficulty Calculator needs into
# src-tauri/frontend-dist, which tauri.conf.json's frontendDist points at.
# Run automatically by Tauri before each build/dev via
# beforeBuildCommand/beforeDevCommand.
#
# The app serves prep/index.html - the same page as the web tool at /prep/,
# so the two stay in step.
#
# It ships separately from the Battle Tracker on purpose: prep is the
# question asked the night before, and the Tracker is the fight happening
# now. A GM should not have to open a combat screen to size an encounter.
#
# The relative layout matters: prep/index.html imports the maths as
# ../app/combat/encounter.js, which in turn imports ../state.js, so app/
# has to land beside prep/ in the same shape here. Nothing else from app/
# is copied - the character creator's steps, parsers and vendor bundle are
# dead weight in this installer.

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$stagingDir = Join-Path $PSScriptRoot "..\src-tauri\frontend-dist"

if (Test-Path $stagingDir) {
    Remove-Item -Recurse -Force $stagingDir
}
New-Item -ItemType Directory -Path $stagingDir | Out-Null

# prep/ whole, then only the two modules it actually reaches for.
$prep = Join-Path $repoRoot "prep"
if (-not (Test-Path $prep)) {
    throw "Missing source folder: $prep"
}
Copy-Item -Path $prep -Destination (Join-Path $stagingDir "prep") -Recurse -Force

New-Item -ItemType Directory -Path (Join-Path $stagingDir "app\combat") -Force | Out-Null
foreach ($file in @("app\state.js", "app\combat\encounter.js")) {
    $source = Join-Path $repoRoot $file
    if (-not (Test-Path $source)) {
        throw "Missing source file: $source"
    }
    Copy-Item -Path $source -Destination (Join-Path $stagingDir $file) -Force
}

Write-Host "Staged frontend assets (prep/, app/state.js, app/combat/encounter.js) to $stagingDir"
