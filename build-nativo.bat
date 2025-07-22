@echo off
echo ========================================
echo    CORTE DE MATOS - BUILD NATIVO
echo ========================================
echo.

echo [1/5] Verificando dependencias...
call npm install

echo.
echo [2/5] Instalando EAS CLI (se necessario)...
call npm install -g @expo/eas-cli 2>nul

echo.
echo [3/5] Fazendo login no Expo (se necessario)...
echo Execute: eas login
echo.

echo [4/5] Opcoes de build disponiveis:
echo   1. Preview APK (para testes)
echo   2. Development APK (com debug)
echo   3. Production AAB (para Google Play)
echo.

set /p opcao="Escolha uma opcao (1-3): "

if "%opcao%"=="1" (
    echo [5/5] Gerando Preview APK...
    call eas build --platform android --profile preview
) else if "%opcao%"=="2" (
    echo [5/5] Gerando Development APK...
    call eas build --platform android --profile development
) else if "%opcao%"=="3" (
    echo [5/5] Gerando Production AAB...
    call eas build --platform android --profile production
) else (
    echo Opcao invalida!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build concluido!
echo Verifique o link fornecido para download
echo ========================================
pause
