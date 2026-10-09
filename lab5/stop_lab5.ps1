$ErrorActionPreference = 'SilentlyContinue'
$root = $PSScriptRoot
$php = Join-Path $root '.runtime\php\php.exe'
$dbExe = Join-Path $root '.runtime\mariadb-10.11.11-winx64\bin\mariadbd.exe'

Get-CimInstance Win32_Process | Where-Object {
    $_.ExecutablePath -eq $php -and ($_.CommandLine -like '*localhost:8000*' -or $_.CommandLine -like '*127.0.0.1:8000*')
} | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

Get-Process -Name mariadbd | Where-Object { $_.Path -eq $dbExe } | Stop-Process -Force
Write-Host 'Lab 5 PHP server and MariaDB stopped.'
