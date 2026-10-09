$ErrorActionPreference = 'SilentlyContinue'

$root = $PSScriptRoot

Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -like '*angular-ui*' -and (
        $_.CommandLine -like '*ng serve*' -or
        $_.CommandLine -like '*ng.js*' -or
        $_.CommandLine -like '*npm*start*'
    )
} | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
}

powershell.exe -ExecutionPolicy Bypass -File (Join-Path $root 'stop_lab5.ps1')

Write-Host 'PHP backend stopped. The compiled Angular files remain in the ng folder.'
