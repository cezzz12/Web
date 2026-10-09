$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$angularRoot = Join-Path $root 'angular-ui'
$source = Join-Path $angularRoot 'dist\angular-ui\browser'
$target = Join-Path $root 'ng'

Push-Location $angularRoot
npm run build -- --base-href /ng/
Pop-Location

if (Test-Path -LiteralPath $target) {
    $resolvedRoot = (Resolve-Path -LiteralPath $root).Path
    $resolvedTarget = (Resolve-Path -LiteralPath $target).Path

    if (-not $resolvedTarget.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove outside project: $resolvedTarget"
    }

    Remove-Item -LiteralPath $target -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $target | Out-Null
Get-ChildItem -LiteralPath $source -Force | Copy-Item -Destination $target -Recurse -Force

Write-Host 'Angular build copied to http://127.0.0.1:8000/ng/index.html'
