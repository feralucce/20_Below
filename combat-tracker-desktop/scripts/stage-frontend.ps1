# Builds a clean staging copy of just the files the Combat Tracker desktop
# app actually needs to serve (gm-app/, plus the app/ modules it imports:
# ui.js, state.js, roller/) into src-tauri/frontend-dist, which
# tauri.conf.json's frontendDist points at. Run automatically by Tauri
# before each build/dev via beforeBuildCommand/beforeDevCommand. Same
# pattern as desktop/scripts/stage-frontend.ps1, scoped to what gm-app.js
# and gm-state.js actually import instead of the whole app/ tree.

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$stagingDir = Join-Path $PSScriptRoot "..\src-tauri\frontend-dist"

if (Test-Path $stagingDir) {
    Remove-Item -Recurse -Force $stagingDir
}
New-Item -ItemType Directory -Path $stagingDir | Out-Null

Copy-Item -Path (Join-Path $repoRoot "gm-app") -Destination (Join-Path $stagingDir "gm-app") -Recurse -Force

$appDest = Join-Path $stagingDir "app"
New-Item -ItemType Directory -Path $appDest | Out-Null
New-Item -ItemType Directory -Path (Join-Path $appDest "roller") | Out-Null
Copy-Item -Path (Join-Path $repoRoot "app\ui.js") -Destination (Join-Path $appDest "ui.js") -Force
Copy-Item -Path (Join-Path $repoRoot "app\state.js") -Destination (Join-Path $appDest "state.js") -Force
Copy-Item -Path (Join-Path $repoRoot "app\roller\core.js") -Destination (Join-Path $appDest "roller\core.js") -Force

Write-Host "Staged frontend assets (gm-app/, app/{ui,state,roller/core}.js) to $stagingDir"
