# 根目录 .env → backend/.env + .env.production（不打印密码）
$Root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { Get-Location }
$src = Join-Path $Root ".env"
if (-not (Test-Path $src)) { $src = Join-Path $Root "backend\.env" }

$map = @{}
Get-Content $src | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $k, $v = $_ -split '=', 2
  $map[$k.Trim()] = $v.Trim()
}

$defaults = @{
  PORT = "5000"
  CLIENT_ORIGIN = "http://localhost:8080,http://localhost"
  VERIFICATION_CREDIT_COST = "18.5"
  TOPUP_PLATFORM_FEE_RATE = "0.02"
  INVOICE_TAX_RATE = "0.15"
  DNS_SERVERS = "8.8.8.8,1.1.1.1"
}
foreach ($k in $defaults.Keys) {
  if (-not $map[$k]) { $map[$k] = $defaults[$k] }
}

$backendBody = @"
# Auto-synced — edit root .env or backend/.env
NODE_ENV=development
PORT=$($map['PORT'])
MONGODB_URI=$($map['MONGODB_URI'])
$(if ($map['MONGODB_URI_STANDARD']) { "MONGODB_URI_STANDARD=$($map['MONGODB_URI_STANDARD'])" })
DNS_SERVERS=$($map['DNS_SERVERS'])
CLIENT_ORIGIN=$($map['CLIENT_ORIGIN'])
VERIFICATION_CREDIT_COST=$($map['VERIFICATION_CREDIT_COST'])
TOPUP_PLATFORM_FEE_RATE=$($map['TOPUP_PLATFORM_FEE_RATE'])
INVOICE_TAX_RATE=$($map['INVOICE_TAX_RATE'])
OFFICIAL_USDC_ADDRESS=$($map['OFFICIAL_USDC_ADDRESS'])
API_KEY_SALT=$($map['API_KEY_SALT'])
"@

Set-Content (Join-Path $Root "backend\.env") $backendBody.Trim() -Encoding UTF8

$prod = @"
NODE_ENV=production
PORT=5000
MONGODB_URI=$($map['MONGODB_URI'])
DNS_SERVERS=$($map['DNS_SERVERS'])
CLIENT_ORIGIN=$($map['CLIENT_ORIGIN'])
VERIFICATION_CREDIT_COST=$($map['VERIFICATION_CREDIT_COST'])
TOPUP_PLATFORM_FEE_RATE=$($map['TOPUP_PLATFORM_FEE_RATE'])
INVOICE_TAX_RATE=$($map['INVOICE_TAX_RATE'])
VITE_API_BASE_URL=http://localhost:5000/api/v1
API_PORT=5000
WEB_PORT=80
"@
Set-Content (Join-Path $Root ".env.production") $prod.Trim() -Encoding UTF8
Write-Host "Synced root .env -> backend/.env and .env.production" -ForegroundColor Green
