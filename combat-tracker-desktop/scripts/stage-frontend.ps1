# Builds a clean staging copy of just the files the Combat Tracker desktop
# app actually needs to serve into src-tauri/frontend-dist, which
# tauri.conf.json's frontendDist points at. Run automatically by Tauri
# before each build/dev via beforeBuildCommand/beforeDevCommand.
#
# The app serves tracker/index.html - the same page as the standalone web
# tracker at /tracker/ and the Owlbear extension, so all three stay in
# step. It replaced gm-app/'s separate three-screen UI in 2026-09.
#
# The relative layout matters: tracker/index.html imports the engine as
# ../app/combat/model.js, and model.js imports ../state.js and
# ../roller/core.js in turn, so those have to land in the same shape here.
#
# The Library reads the bestiary from ../rules/ the way the site does, so
# the three creature files ship with the app and it opens offline.

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$stagingDir = Join-Path $PSScriptRoot "..\src-tauri\frontend-dist"

if (Test-Path $stagingDir) {
    Remove-Item -Recurse -Force $stagingDir
}
New-Item -ItemType Directory -Path $stagingDir | Out-Null

$files = @(
    "tracker\index.html",
    "app\state.js",
    "app\roller\core.js",
    "app\combat\model.js",
    "app\media.js",
    "app\combat\library.js",
    "app\parse\creatures.js",
    "rules\adversary-index.md",
    "rules\cryptids.md",
    "rules\nightmare-creatures.md",
    "app\ui.js",
    "app\roller\damage.js",
    "app\roller\giftCheck.js",
    "app\roller\resourceCheck.js",
    "app\steps\roller-panel.js",
    "app\sheet\panels.js",
    "app\sheet\sheet-model.js",
    "vendor\marked.min.js"
)

foreach ($f in $files) {
    $src = Join-Path $repoRoot $f
    if (-not (Test-Path $src)) {
        throw "Missing source file: $src"
    }
    $dst = Join-Path $stagingDir $f
    New-Item -ItemType Directory -Path (Split-Path $dst) -Force | Out-Null
    Copy-Item -Path $src -Destination $dst -Force
}

# The Creator's rules, baked, for rolling a character's Skills and Gifts
# with nothing fetched.
node (Join-Path $repoRoot "scripts\bake-rules-data.mjs") (Join-Path $stagingDir "tracker\rules-data.json")
if ($LASTEXITCODE -ne 0) { throw "Baking the rules failed" }

Write-Host "Staged frontend assets (tracker/, the engine, the library and the bestiary) to $stagingDir"
