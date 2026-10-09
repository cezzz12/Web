$ErrorActionPreference = 'Stop'

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

$listener = Get-Lab9Listener

if ($listener) {
    Stop-Process -Id $listener.OwningProcess -Force
    Write-Host 'Lab 9 server stopped.'
} else {
    Write-Host 'No lab 9 server process was found.'
}
