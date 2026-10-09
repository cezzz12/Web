# Lab 8 Demo Commands

## PHP mode

```powershell
cd C:\Users\Cezar\Web_Programming_Projects\lab5
powershell.exe -ExecutionPolicy Bypass -File .\start_angular_ui.ps1
powershell.exe -ExecutionPolicy Bypass -File .\use_php_backend.ps1
```

## ASP.NET mode

```powershell
cd C:\Users\Cezar\Web_Programming_Projects\lab8
powershell.exe -ExecutionPolicy Bypass -File .\start_lab8.ps1
```

Then in another terminal:

```powershell
cd C:\Users\Cezar\Web_Programming_Projects\lab5
powershell.exe -ExecutionPolicy Bypass -File .\use_aspnet_backend.ps1
```

## Open frontend

```powershell
Start-Process "http://127.0.0.1:8000/ng/index.html"
```

## Open ASP.NET login directly

```powershell
Start-Process "http://127.0.0.1:5108/login"
```
