$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$php = Join-Path $root '.runtime\php\php.exe'
$dbBase = Join-Path $root '.runtime\mariadb-10.11.11-winx64'
$dbExe = Join-Path $dbBase 'bin\mariadbd.exe'
$dbClient = Join-Path $dbBase 'bin\mariadb.exe'
$dbIni = Join-Path $dbBase 'data\my.ini'

$dbProcess = Get-Process -Name mariadbd -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $dbExe }
if (-not $dbProcess) {
    Start-Process -FilePath $dbExe -ArgumentList @("--defaults-file=$dbIni", "--port=3306", "--bind-address=127.0.0.1") -WindowStyle Hidden
}

$ready = $false
for ($i = 0; $i -lt 20; $i++) {
    & $dbClient --host=127.0.0.1 --port=3306 --user=root --password=root -e "SELECT 1" *> $null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 1
}
if (-not $ready) { throw 'MariaDB did not become ready on 127.0.0.1:3306.' }

$phpServer = Get-CimInstance Win32_Process | Where-Object {
    $_.ExecutablePath -eq $php -and ($_.CommandLine -like '*localhost:8000*' -or $_.CommandLine -like '*127.0.0.1:8000*')
}
if (-not $phpServer) {
    Start-Process -FilePath $php -ArgumentList @('-S', '127.0.0.1:8000', '-t', $root) -WorkingDirectory $root -WindowStyle Hidden
}

Write-Host 'Lab 5 is running at http://127.0.0.1:8000/index.php'
