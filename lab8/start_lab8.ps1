$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$backendRoot = Join-Path $root 'VacationDestinationsAspNet'
$dotnet = 'C:\Program Files\dotnet\dotnet.exe'

powershell.exe -ExecutionPolicy Bypass -File (Join-Path $root 'build_frontend.ps1')
sqllocaldb start MSSQLLocalDB *> $null

$existing = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq 'dotnet.exe' -and
    $_.CommandLine -like '*VacationDestinationsAspNet*' -and
    ($_.CommandLine -like '*http://127.0.0.1:5108*' -or $_.CommandLine -like '*http://localhost:5108*')
}

if (-not $existing) {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $dotnet
    $psi.Arguments = 'run --urls http://127.0.0.1:5108'
    $psi.WorkingDirectory = $backendRoot
    $psi.UseShellExecute = $true
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    [System.Diagnostics.Process]::Start($psi) | Out-Null
    Start-Sleep -Seconds 5
}

Write-Host 'Lab 8 is running at http://127.0.0.1:5108/login'
Write-Host 'Demo account: traveladmin / Travel123!'
