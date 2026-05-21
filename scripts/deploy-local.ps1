# 无 Docker 时：本机 Node 直接跑 API（需 backend/.env 含 Atlas MONGODB_URI）
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"
Set-Location $Backend

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "请编辑 backend\.env，将 MONGODB_URI 改为你的 Atlas 连接串，然后重新运行此脚本。" -ForegroundColor Yellow
  notepad .env
  exit 1
}

$envContent = Get-Content ".env" -Raw
if ($envContent -match "127\.0\.0\.1:27017" -and $envContent -notmatch "mongodb\+srv") {
  Write-Host "警告: .env 仍是本地 Mongo 地址。若使用 Atlas，请改为 mongodb+srv://..." -ForegroundColor Yellow
}

Write-Host "==> npm install" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> seed database" -ForegroundColor Cyan
npm run seed
if ($LASTEXITCODE -ne 0) {
  Write-Host "seed 失败 — 检查 MONGODB_URI 与 Atlas IP 白名单" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "==> starting API on port 5000" -ForegroundColor Cyan
$job = Start-Job -ScriptBlock {
  Set-Location $using:Backend
  npm run start
}

Start-Sleep -Seconds 4
Set-Location $Root
npm run check:api
if ($LASTEXITCODE -ne 0) {
  Stop-Job $job -ErrorAction SilentlyContinue
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "API 已启动 (Job Id: $($job.Id))" -ForegroundColor Green
Write-Host "  http://localhost:5000/health" -ForegroundColor Green
Write-Host "  另开终端: cd 仓库根目录 && npm run dev  -> http://localhost:8080" -ForegroundColor Green
Write-Host "  停止 API: Stop-Job $($job.Id); Remove-Job $($job.Id)" -ForegroundColor Gray
