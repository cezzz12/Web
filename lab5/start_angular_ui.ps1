$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot

powershell.exe -ExecutionPolicy Bypass -File (Join-Path $root 'start_lab5.ps1')
powershell.exe -ExecutionPolicy Bypass -File (Join-Path $root 'build_angular_ui.ps1')

Write-Host 'Angular UI is running at http://127.0.0.1:8000/ng/index.html'
Write-Host 'PHP backend is running at http://127.0.0.1:8000'
