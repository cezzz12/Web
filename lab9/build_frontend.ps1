$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$parentRoot = Split-Path $root -Parent
$sourceCandidates = @(
    (Join-Path (Join-Path $parentRoot 'lab5') 'ng'),
    (Join-Path (Join-Path (Join-Path $env:USERPROFILE 'Web_Programming_Projects') 'lab5') 'ng')
)
$target = Join-Path $root 'public'
$source = $sourceCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if (-not $source) {
    throw "Could not find the shared frontend build. Checked: $($sourceCandidates -join ', ')"
}

if (Test-Path -LiteralPath $target) {
    $resolvedRoot = (Resolve-Path -LiteralPath $root).Path
    $resolvedTarget = (Resolve-Path -LiteralPath $target).Path

    if (-not $resolvedTarget.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove outside project: $resolvedTarget"
    }

    Get-ChildItem -LiteralPath $target -Force | Remove-Item -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $target | Out-Null
Get-ChildItem -LiteralPath $source -Force | Copy-Item -Destination $target -Recurse -Force

$indexPath = Join-Path $target 'index.html'
if (Test-Path -LiteralPath $indexPath) {
    $indexContent = Get-Content -Path $indexPath -Raw
    $indexContent = $indexContent -replace '<base href="/ng/">', '<base href="./">'
    Set-Content -Path $indexPath -Value $indexContent -Encoding UTF8
}

@"
window.APP_CONFIG = {
  apiBaseUrl: 'http://127.0.0.1:5110',
};
"@ | Set-Content -Path (Join-Path $target 'app-config.js') -Encoding ASCII

Write-Host 'Shared Angular frontend copied to http://127.0.0.1:5110/'
