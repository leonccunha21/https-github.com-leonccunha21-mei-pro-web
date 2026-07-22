# Stripe Production Setup
# Run AFTER: stripe login
# This creates products, prices, and coupons on your LIVE Stripe account.
#
# Usage: .stripe\setup-prod.ps1

Write-Host "=== MEI PRO - Stripe Production Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
$whoami = stripe login 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Please run 'stripe login' first." -ForegroundColor Red
  exit 1
}

Write-Host "Creating product: MEI PRO - Mensal..." -ForegroundColor Yellow
$monthly = stripe products create --name="MEI PRO - Mensal" --description="Assinatura mensal - acesso completo" 2>&1
$monthlyProdId = ($monthly | ConvertFrom-Json).id
Write-Host "  Product: $monthlyProdId" -ForegroundColor Green

Write-Host "Creating price for monthly (R$ 29)..." -ForegroundColor Yellow
$monthlyPrice = stripe prices create "--product=$monthlyProdId" "--unit-amount=2900" "--currency=brl" "--recurring.interval=month" 2>&1
$monthlyPriceId = ($monthlyPrice | ConvertFrom-Json).id
Write-Host "  Price: $monthlyPriceId" -ForegroundColor Green

Write-Host "Creating price for annual (R$ 290)..." -ForegroundColor Yellow
$annualPrice = stripe prices create "--product=$monthlyProdId" "--unit-amount=29000" "--currency=brl" "--recurring.interval=year" 2>&1
$annualPriceId = ($annualPrice | ConvertFrom-Json).id
Write-Host "  Price: $annualPriceId" -ForegroundColor Green

Write-Host ""
Write-Host "Creating coupons..." -ForegroundColor Yellow

$c1 = stripe coupons create "--percent-off=20" "--duration=forever" "--name=INDICOU20" "--id=INDICOU20" 2>&1
Write-Host "  Coupon INDICOU20: 20%% off forever" -ForegroundColor Green

$c2 = stripe coupons create "--percent-off=50" "--duration=repeating" "--duration-in-months=3" "--name=BEMVINDO50" "--id=BEMVINDO50" 2>&1
Write-Host "  Coupon BEMVINDO50: 50%% off por 3 meses" -ForegroundColor Green

Write-Host ""
Write-Host "=== SETUP COMPLETE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add these to your .env / Vercel:" -ForegroundColor White
Write-Host "  VITE_STRIPE_PRICE_MONTHLY=$monthlyPriceId"
Write-Host "  VITE_STRIPE_PRICE_ANNUAL=$annualPriceId"
Write-Host "  STRIPE_SECRET_KEY=<your live secret key>"
Write-Host "  STRIPE_WEBHOOK_SECRET=<from: stripe listen --print-secret>"
Write-Host ""
Write-Host "Coupons created: INDICOU20 (20%%), BEMVINDO50 (50%% por 3 meses)" -ForegroundColor Gray
Write-Host "Create more coupons in the Stripe Dashboard." -ForegroundColor Gray
