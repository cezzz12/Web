$ErrorActionPreference = 'Stop'

$processes = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq 'dotnet.exe' -and
    $_.CommandLine -like '*VacationDestinationsAspNet*' -and
    ($_.CommandLine -like '*http://127.0.0.1:5108*' -or $_.CommandLine -like '*http://localhost:5108*')
}

if ($processes) {
    $processes | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
    Write-Host 'Lab 8 server stopped.'
} else {
    Write-Host 'No lab 8 server process was found.'
}
