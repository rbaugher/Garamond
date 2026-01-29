# PowerShell script to rename connect7 to connect10
# Run this script from the garamond directory after closing VS Code and stopping dev servers

Write-Host "Renaming connect7 to connect10..." -ForegroundColor Green

# Rename CSS file
if (Test-Path "src/games/connect7/connect7.css") {
    Rename-Item -Path "src/games/connect7/connect7.css" -NewName "connect10.css"
    Write-Host "✓ Renamed connect7.css to connect10.css" -ForegroundColor Cyan
}

# Rename main folder
if (Test-Path "src/games/connect7") {
    Rename-Item -Path "src/games/connect7" -NewName "connect10"
    Write-Host "✓ Renamed src/games/connect7 to connect10" -ForegroundColor Cyan
}

# Rename page file
if (Test-Path "src/components/pages/Connect7Page.jsx") {
    Rename-Item -Path "src/components/pages/Connect7Page.jsx" -NewName "Connect10Page.jsx"
    Write-Host "✓ Renamed Connect7Page.jsx to Connect10Page.jsx" -ForegroundColor Cyan
}

# Rename files inside connect10 folder
if (Test-Path "src/games/connect10/Connect7App.jsx") {
    Rename-Item -Path "src/games/connect10/Connect7App.jsx" -NewName "Connect10App.jsx"
    Write-Host "✓ Renamed Connect7App.jsx to Connect10App.jsx" -ForegroundColor Cyan
}

if (Test-Path "src/games/connect10/context/Connect7Context.jsx") {
    Rename-Item -Path "src/games/connect10/context/Connect7Context.jsx" -NewName "Connect10Context.jsx"
    Write-Host "✓ Renamed Connect7Context.jsx to Connect10Context.jsx" -ForegroundColor Cyan
}

if (Test-Path "src/games/connect10/hooks/useConnect7.js") {
    Rename-Item -Path "src/games/connect10/hooks/useConnect7.js" -NewName "useConnect10.js"
    Write-Host "✓ Renamed useConnect7.js to useConnect10.js" -ForegroundColor Cyan
}

Write-Host "`nAll files renamed successfully!" -ForegroundColor Green
Write-Host "Don't forget to update the import statements in your code." -ForegroundColor Yellow
