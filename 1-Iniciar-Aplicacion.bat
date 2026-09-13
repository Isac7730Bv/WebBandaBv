@echo off
setlocal
cd /d "%~dp0"
title Sistema de Banda Estudiantil

echo ============================================
echo   Sistema de Banda Estudiantil
echo ============================================
echo.

if not exist "runtime\node.exe" (
  echo No se encontro runtime\node.exe
  echo Esta carpeta debe incluir su propio Node.js portatil
  echo para funcionar sin depender de esta computadora.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo No se encontro la carpeta node_modules.
  echo El proyecto debe copiarse completo, incluyendo esa carpeta.
  pause
  exit /b 1
)

if not exist "dist" (
  echo No se encontro la carpeta dist ^(la version compilada del sitio^).
  echo El proyecto debe copiarse completo, incluyendo esa carpeta.
  pause
  exit /b 1
)

echo Iniciando el servidor (backend + frontend + base de datos)...
echo NO CIERRES la ventana negra que se va a abrir mientras uses la app.
echo.

start "Servidor - Banda Estudiantil" cmd /k ""%~dp0runtime\node.exe" "%~dp0server\index.js""

echo Esperando a que el servidor arranque...
timeout /t 3 /nobreak >nul

start "" "http://localhost:3001"

echo.
echo Listo. Si el navegador no se abrio solo, entra a: http://localhost:3001
pause
