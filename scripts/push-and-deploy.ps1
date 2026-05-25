# Push fixes to GitHub (triggers Render + Vercel auto-deploy)
$ErrorActionPreference = "Stop"
$Root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { Get-Location }
Set-Location $Root

Write-Host "==> zkPass Portal — push to GitHub" -ForegroundColor Cyan

$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
  Write-Host "Git not in PATH. Install Git or add to PATH, then run:" -ForegroundColor Yellow
  Write-Host "  git add -A && git commit -m `"fix: Render listen before DB, Vercel CORS`" && git push"
  Write-Host "See scripts/DEPLOY-CHECKLIST.md for manual Render/Vercel env steps."
  exit 1
}

git status -sb
$msg = "fix: start API before MongoDB, allow all Vercel preview origins"
git add backend/src/server.js backend/src/cors.js backend/src/middleware/dbReady.js render.yaml scripts/DEPLOY-CHECKLIST.md
git commit -m $msg 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Nothing to commit or commit failed — check git status" -ForegroundColor Yellow
} else {
  git push
  Write-Host "Pushed. Wait for Render + Vercel deploy, then verify DEPLOY-CHECKLIST.md" -ForegroundColor Green
}
