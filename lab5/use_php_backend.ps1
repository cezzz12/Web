$ErrorActionPreference = 'Stop'

$scriptRoot = $PSScriptRoot
powershell.exe -ExecutionPolicy Bypass -File (Join-Path $scriptRoot 'set_frontend_backend.ps1') -ApiBaseUrl 'http://127.0.0.1:8000'
