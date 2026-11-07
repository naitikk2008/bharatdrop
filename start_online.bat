@echo off
title BharatDrop E-Commerce Platform Launcher
echo =====================================================================
echo           BHARATDROP - INDIAN DROPSHIPPING E-COMMERCE
echo =====================================================================
echo.
echo 1. Starting Next.js Server on 0.0.0.0:3000...
start "BharatDrop Server" cmd /k "npm run start"
echo    Waiting 5 seconds for web server to initialize...
timeout /t 5 >nul
echo.
echo 2. Launching Cloudflare Tunnel for Cross-Device Access...
start "BharatDrop Public Tunnel" cmd /k ".\cloudflared.exe tunnel --protocol http2 --url http://localhost:3000"
echo.
echo =====================================================================
echo  STATUS: Server and Tunnel launched successfully!
echo.
echo  - Local PC URL:      http://localhost:3000
echo  - Local Wi-Fi URL:   http://10.74.189.183:3000
echo  - Public Device URL: Check the "BharatDrop Public Tunnel" window
echo                       for the https://*.trycloudflare.com link.
echo.
echo  - Admin Portal:      http://localhost:3000/admin
echo  - Admin Email:       admin@bharatdrop.in
echo  - Admin Password:    Admin@BharatDrop2026!
echo =====================================================================
pause

