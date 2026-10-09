$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$projectsRoot = Split-Path $root -Parent
$frontendRoot = Join-Path (Join-Path $projectsRoot 'lab5') 'angular-ui'
$backendRoot = Join-Path $root 'VacationDestinationsAspNet'
$source = Join-Path $frontendRoot 'dist\angular-ui\browser'
$target = Join-Path $backendRoot 'wwwroot'

if (-not (Test-Path -LiteralPath $frontendRoot)) {
    throw "Could not find the shared Angular frontend at $frontendRoot"
}

if (-not (Test-Path -LiteralPath $backendRoot)) {
    throw "Could not find the ASP.NET backend at $backendRoot"
}

Push-Location $frontendRoot
npm run build -- --base-href ./
Pop-Location

if (Test-Path -LiteralPath $target) {
    $resolvedBackendRoot = (Resolve-Path -LiteralPath $backendRoot).Path
    $resolvedTarget = (Resolve-Path -LiteralPath $target).Path

    if (-not $resolvedTarget.StartsWith($resolvedBackendRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove outside project: $resolvedTarget"
    }

    Get-ChildItem -LiteralPath $target -Force | Remove-Item -Recurse -Force
} else {
    New-Item -ItemType Directory -Force -Path $target | Out-Null
}

Get-ChildItem -LiteralPath $source -Force | Copy-Item -Destination $target -Recurse -Force

Write-Host 'Shared Angular frontend copied to http://127.0.0.1:5108/'
