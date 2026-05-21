# 将 backend/.env 同步到根目录 .env.production（Docker 部署用）
$Root = Split-Path -Parent $PSScriptRoot
$backendEnv = Join-Path $Root "backend\.env"
$prodEnv = Join-Path $Root ".env.production"

if (-not (Test-Path $backendEnv)) {
  Write-Error "backend/.env 不存在"
}

$lines = Get-Content $backendEnv
$map = @{}
foreach ($line in $lines) {
  if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
  $k, $v = $line -split '=', 2
  $map[$k.Trim()] = $v.Trim()
}

$out = @"
NODE_ENV=production
PORT=5000
MONGODB_URI=$($map['MONGODB_URI'])
CLIENT_ORIGIN=$($map['CLIENT_ORIGIN'])
VERIFICATION_CREDIT_COST=$($map['VERIFICATION_CREDIT_COST'])
TOPUP_PLATFORM_FEE_RATE=$($map['TOPUP_PLATFORM_FEE_RATE'])
INVOICE_TAX_RATE=$($map['INVOICE_TAX_RATE'])
OFFICIAL_USDC_ADDRESS=$($map['OFFICIAL_USDC_ADDRESS'])
VITE_API_BASE_URL=http://localhost:5000/api/v1
WEB_PORT=80
API_PORT=5000
"@

Set-Content -Path $prodEnv -Value $out -Encoding UTF8
Write-Host "已同步 -> .env.production" -ForegroundColor Green
