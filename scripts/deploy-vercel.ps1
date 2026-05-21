# Vercel CLI 部署向导
$ErrorActionPreference = "Stop"
$Root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { Get-Location }
Set-Location $Root

Write-Host "==> zkPass Portal — Vercel Deploy" -ForegroundColor Cyan

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
  npm install -g vercel
}

$apiUrl = Read-Host "输入公网 API 地址 (例如 https://api.example.com/api/v1)"
if (-not $apiUrl) {
  Write-Error "VITE_API_BASE_URL 不能为空。本地 localhost 无法在 Vercel 上访问。"
}

Write-Host "设置 Vercel 环境变量 VITE_API_BASE_URL ..." -ForegroundColor Cyan
$apiUrl | vercel env add VITE_API_BASE_URL production 2>$null
$apiUrl | vercel env add VITE_API_BASE_URL preview 2>$null

Write-Host "==> Building (optional local check)..." -ForegroundColor Cyan
$env:NITRO_PRESET = "vercel"
$env:VITE_API_BASE_URL = $apiUrl
npm run build:vercel

Write-Host "==> Deploying to Vercel..." -ForegroundColor Cyan
vercel deploy --prod

Write-Host ""
Write-Host "部署完成后，请到 API 的 CLIENT_ORIGIN 加入 Vercel 域名。" -ForegroundColor Green
