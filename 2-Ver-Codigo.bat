@echo off
cd /d "%~dp0"
title Ver codigo - Banda Estudiantil

where code >nul 2>nul
if %errorlevel%==0 (
  echo Abriendo el proyecto en Visual Studio Code...
  code .
) else (
  echo Visual Studio Code no esta instalado o no esta en el PATH.
  echo Abriendo la carpeta del proyecto en el Explorador de archivos.
  echo Puedes abrir cualquier archivo con doble clic ^(por ejemplo con el Bloc de notas^).
  echo.
  echo Carpetas importantes:
  echo   src\      -^> codigo del frontend (React)
  echo   server\   -^> codigo del backend (Express + base de datos)
  echo.
  pause
  explorer "%~dp0"
)
