$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$node = 'node.exe'

function Get-Lab9Listener {
    $listener = Get-NetTCPConnection -LocalPort 5110 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($listener) {
        return $listener
    }

    $netstatLine = cmd /c netstat -ano | Select-String -Pattern '127\.0\.0\.1:5110\s+.*LISTENING\s+(\d+)$' | Select-Object -First 1
    if (-not $netstatLine) {
        return $null
    }

    $columns = ($netstatLine.ToString() -split '\s+') | Where-Object { $_ }
    if ($columns.Length -lt 5) {
        return $null
    }

    [pscustomobject]@{
        OwningProcess = [int]$columns[-1]
    }
}

powershell.exe -ExecutionPolicy Bypass -File (Join-Path $root 'build_frontend.ps1')

$listener = Get-Lab9Listener
if (-not $listener) {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $node
    $psi.Arguments = 'server.js'
    $psi.WorkingDirectory = $root
    $psi.UseShellExecute = $true
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    [System.Diagnostics.Process]::Start($psi) | Out-Null
    Start-Sleep -Seconds 4
}

Write-Host 'Lab 9 is running at http://127.0.0.1:5110/login'
Write-Host 'Demo account: traveladmin / Travel123!'
