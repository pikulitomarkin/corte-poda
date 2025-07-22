@echo off
echo.
echo ================================================
echo    CORTE DE MATOS APP - SETUP AUTOMATICO
echo ================================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js primeiro:
    echo 1. Va para https://nodejs.org/
    echo 2. Baixe a versao LTS
    echo 3. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
node --version

echo.
echo Instalando dependencias do projeto...
npm install

if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias
    pause
    exit /b 1
)

echo.
echo [OK] Dependencias instaladas com sucesso!

echo.
echo Instalando Expo CLI globalmente...
npm install -g @expo/cli

if %errorlevel% neq 0 (
    echo [AVISO] Falha ao instalar Expo CLI globalmente
    echo Tente executar como administrador ou instale manualmente:
    echo npm install -g @expo/cli
)

echo.
echo ================================================
echo          SETUP CONCLUIDO COM SUCESSO!
echo ================================================
echo.
echo Para iniciar o app:
echo   npm start
echo.
echo Para testar no Android:
echo   npm run android
echo.
echo Para mais informacoes, consulte SETUP.md
echo.
pause
