param(
    [Parameter(Mandatory = $true)]
    [string]$ApiBaseUrl
)

$ErrorActionPreference = 'Stop'

$normalizedUrl = $ApiBaseUrl.Trim().TrimEnd('/')

if ($normalizedUrl -notmatch '^https?://(127\.0\.0\.1|localhost)(:\d+)?$') {
    throw 'Use a localhost/127.0.0.1 backend URL such as http://127.0.0.1:8000, http://127.0.0.1:5108, or http://127.0.0.1:5110'
}

$root = Split-Path $PSScriptRoot -Parent
$lab5Root = Join-Path $root 'lab5'
$lab8Root = Join-Path $root 'lab8'
$lab9Root = Join-Path $root 'lab9'
$targets = @(
    (Join-Path $lab5Root 'angular-ui\public\app-config.js'),
    (Join-Path $lab5Root 'ng\app-config.js'),
    (Join-Path $lab8Root 'VacationDestinationsAspNet\wwwroot\app-config.js'),
    (Join-Path $lab9Root 'public\app-config.js')
)

$content = @"
window.APP_CONFIG = {
  apiBaseUrl: '$normalizedUrl',
};
"@

foreach ($target in $targets) {
    if (Test-Path -LiteralPath $target) {
        Set-Content -Path $target -Value $content -Encoding ASCII
        Write-Host "Updated $target"
    }
}

Write-Host "Frontend backend base URL is now $normalizedUrl"
