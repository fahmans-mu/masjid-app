@echo off
rem ============================================================
rem  Skrip membuka demo MasjidAmanah (aplikasi + Cloudflare Tunnel)
rem  Cara pakai: klik dua kali file ini.
rem  Tautan publik muncul di jendela "MasjidAmanah - Tunnel",
rem  pada baris yang memuat  trycloudflare.com
rem ============================================================
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

rem --- 1. Nyalakan server aplikasi kalau belum jalan ---
netstat -ano | findstr ":3010" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
  echo [OK] Server aplikasi sudah jalan di port 3010.
) else (
  echo Menyalakan server aplikasi...
  start "MasjidAmanah - Server" cmd /k "npx next start -p 3010"
  echo Menunggu server siap...
  timeout /t 6 /nobreak >nul
)

rem --- 2. Nyalakan tunnel Cloudflare kalau belum jalan ---
tasklist /FI "IMAGENAME eq cloudflared.exe" | findstr /I "cloudflared" >nul 2>&1
if %errorlevel%==0 (
  echo [OK] Tunnel sudah jalan. Lihat jendela "MasjidAmanah - Tunnel" untuk tautannya.
  echo     Kalau tautan lama mati, tutup jendela tunnel itu dulu, lalu jalankan skrip ini lagi.
) else (
  echo Menyalakan tunnel Cloudflare...
  start "MasjidAmanah - Tunnel" cmd /k "tools\cloudflared.exe tunnel --url http://localhost:3010 --no-autoupdate --protocol http2 --edge-ip-version 4"
)

echo.
echo Selesai. Tautan publik ada di jendela "MasjidAmanah - Tunnel".
pause
