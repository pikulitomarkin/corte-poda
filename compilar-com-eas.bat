@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0\.."
title Compilacao com EAS Build
color 0A
echo.
echo =========================================================
echo  COMPILACAO COM EAS BUILD (RECOMENDADO)
echo =========================================================
echo.
echo O EAS Build compila seu aplicativo nos servidores da Expo,
echo evitando problemas locais de SSL ou configuracao.
echo.

echo [1] Verificando configuracao do EAS...
echo.
npx eas --version

echo.
echo [2] Configurando o projeto para build...
echo.
call npx eas build:configure

echo.
echo [3] Iniciando build do APK (versao preview)...
echo.
echo Esta operacao ira criar um APK que pode ser instalado em
echo qualquer dispositivo Android para testes.
echo.
echo Executando: npx eas build -p android --profile preview
echo.
call npx eas build -p android --profile preview

echo.
echo =========================================================
echo  INFORMACOES ADICIONAIS
echo =========================================================
echo.
echo - O build sera executado nos servidores da Expo
echo - Voce podera acompanhar o progresso no navegador
echo - Ao finalizar, um link para download sera fornecido
echo.
echo Se preferir compilar localmente (avancado):
echo - Use o script 'compilar-offline.bat' no diretorio android/
echo - Baixe o Gradle manualmente conforme as instrucoes
echo.
pause
