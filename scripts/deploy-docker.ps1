# zkPass Portal — Docker 一键部署
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> zkPass Portal Docker Deploy" -ForegroundColor Cyan

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker 未安装或未加入 PATH"
}

docker info | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Error "Docker Desktop 未运行，请先启动 Docker"
}

if (-not (Test-Path ".env.production")) {
  Copy-Item ".env.production.example" ".env.production"
  Write-Host "已创建 .env.production — 请填入 MONGODB_URI 后重新运行" -ForegroundColor Yellow
  exit 1
}

Write-Host "==> Building & starting containers..." -ForegroundColor Cyan
docker compose -f docker-compose.production.yaml --env-file .env.production up -d --build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> Waiting for API health..." -ForegroundColor Cyan
$ok = $false
for ($i = 1; $i -le 30; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { $ok = $true; break }
  } catch { Start-Sleep -Seconds 2 }
}
if (-not $ok) {
  Write-Host "API 未就绪，查看日志: docker compose -f docker-compose.production.yaml logs api" -ForegroundColor Red
  exit 1
}

Write-Host "==> Seeding database..." -ForegroundColor Cyan
docker compose -f docker-compose.production.yaml --env-file .env.production --profile seed run --rm seed
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "部署完成!" -ForegroundColor Green
Write-Host "  Web:  http://localhost" -ForegroundColor Green
Write-Host "  API:  http://localhost:5000/health" -ForegroundColor Green
Write-Host "  本地开发前端: npm run dev -> http://localhost:8080" -ForegroundColor Green
