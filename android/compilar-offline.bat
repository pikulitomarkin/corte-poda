@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title Compilacao Manual do Android APK
color 0A
echo.
echo =========================================================
echo  COMPILACAO ANDROID SEM DOWNLOAD GRADLE (OFFLINE)
echo =========================================================
echo.
echo Este script tenta compilar seu projeto Android quando
echo ha problemas com o download do Gradle ou SSL.
echo.

REM Verificar se o diretório Gradle já existe
if not exist "gradle-8.3" (
    echo [1] Criando estrutura do Gradle (offline)...
    mkdir gradle-8.3\bin
    mkdir gradle-8.3\lib
    echo.
    echo [AVISO] Como nao podemos baixar o Gradle automaticamente devido
    echo         a restricoes de SSL, voce precisa baixar manualmente:
    echo.
    echo         1. Acesse: https://gradle.org/releases/
    echo         2. Baixe o Gradle 8.3 (gradle-8.3-bin.zip)
    echo         3. Extraia o arquivo e coloque no diretorio:
    echo            %CD%\gradle-8.3
    echo.
    echo Pressione qualquer tecla depois de baixar e extrair o Gradle...
    pause > nul
) else (
    echo [1] Diretorio Gradle encontrado.
)

echo.
echo [2] Configurando variaveis de ambiente para contornar SSL...
echo.
set "JAVA_OPTS=-Djavax.net.ssl.trustStore=NONE"
set "JAVA_TOOL_OPTIONS=-Djavax.net.ssl.trustStore=NONE"

echo [3] Compilando APK Debug (local)...
echo.
if exist "gradle-8.3\bin\gradle.bat" (
    call gradle-8.3\bin\gradle.bat assembleDebug --info
) else (
    echo [ERRO] Gradle nao encontrado em gradle-8.3\bin\gradle.bat
    echo        Por favor, extraia o arquivo gradle-8.3-bin.zip corretamente.
    echo.
    goto :end
)

echo.
echo [4] Compilando APK Release (local)...
echo.
if exist "gradle-8.3\bin\gradle.bat" (
    call gradle-8.3\bin\gradle.bat assembleRelease --info
) else (
    echo [ERRO] Gradle nao encontrado em gradle-8.3\bin\gradle.bat
    goto :end
)

echo.
echo =========================================================
echo  ALTERNATIVA: USAR APK COM EXPO EAS
echo =========================================================
echo.
echo Se a compilacao local falhou, considere usar o EAS Build:
echo.
echo 1. Volte para o diretorio principal do projeto
echo 2. Execute: npx eas build -p android --profile preview
echo.
echo Isso criara um APK em nuvem sem problemas de SSL local.
echo.

:end
echo.
echo =========================================================
echo  RESULTADOS DA COMPILACAO
echo =========================================================
echo.
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo [SUCESSO] APK Debug criado: app\build\outputs\apk\debug\app-debug.apk
) else (
    echo [FALHA] APK Debug nao foi criado.
)

if exist "app\build\outputs\apk\release\app-release.apk" (
    echo [SUCESSO] APK Release criado: app\build\outputs\apk\release\app-release.apk
) else (
    echo [FALHA] APK Release nao foi criado.
)

echo.
echo Para compilar usando EAS (recomendado):
echo - Retorne ao diretorio principal do projeto
echo - Execute: npx eas build -p android --profile preview
echo.

pause
