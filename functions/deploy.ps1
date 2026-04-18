# ═══════════════════════════════════════════════════════════════════
# 🚀 DEPLOY EMAIL NOTIFICATIONS TO FIREBASE
# ═══════════════════════════════════════════════════════════════════

Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   📧 Deploying Email Notifications" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to Firebase
Write-Host "🔐 Checking Firebase authentication..." -ForegroundColor Yellow
$loginCheck = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Firebase!" -ForegroundColor Red
    Write-Host "Please run: firebase login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Firebase authentication OK" -ForegroundColor Green
Write-Host ""

# Check if functions/index.js has been configured
Write-Host "⚙️  Checking email configuration..." -ForegroundColor Yellow
$indexContent = Get-Content "index.js" -Raw
if ($indexContent -match "your-email@gmail.com" -or $indexContent -match "your-app-password") {
    Write-Host "⚠️  WARNING: Email credentials not configured!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please edit: functions/index.js" -ForegroundColor Yellow
    Write-Host "  1. Replace 'your-email@gmail.com' with actual email" -ForegroundColor Yellow
    Write-Host "  2. Replace 'your-app-password' with Gmail app password" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Get app password: https://myaccount.google.com/apppasswords" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Configuration looks good" -ForegroundColor Green
Write-Host ""

# Deploy functions
Write-Host "🚀 Deploying Firebase Functions..." -ForegroundColor Yellow
Write-Host "   This may take 2-3 minutes..." -ForegroundColor Gray
Write-Host ""

# Change to root directory for deployment
Set-Location ".."
firebase deploy --only functions
$deployResult = $LASTEXITCODE
Set-Location "functions"

if ($deployResult -eq 0) {
    Write-Host ""
    Write-Host "════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "   ✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "📧 Email notifications are now LIVE!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Emails will be sent to:" -ForegroundColor White
    Write-Host "  • elia.hage1@gmail.com" -ForegroundColor Yellow
    Write-Host "  • gayelabouimad@gmail.com" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🧪 Test it:" -ForegroundColor White
    Write-Host "  1. Submit an RSVP on your site" -ForegroundColor Gray
    Write-Host "  2. Check both email inboxes" -ForegroundColor Gray
    Write-Host "  3. You should receive an email within 1-2 seconds!" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📊 Monitor logs:" -ForegroundColor White
    Write-Host "  firebase functions:log" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "   ❌ DEPLOYMENT FAILED" -ForegroundColor Red
    Write-Host "════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor White
    Write-Host "  • Run: firebase login" -ForegroundColor Gray
    Write-Host "  • Verify: functions/package.json exists" -ForegroundColor Gray
    Write-Host "  • Check: npm install ran successfully" -ForegroundColor Gray
    Write-Host ""
}

