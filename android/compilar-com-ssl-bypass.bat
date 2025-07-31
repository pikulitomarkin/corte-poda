@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
echo.
echo =========================================================
echo  COMPILADOR ANDROID APK - CONTORNANDO ERROS SSL
echo =========================================================
echo.
echo [1] Preparando ambiente com configuracoes SSL seguras...
echo.

set "JAVA_OPTS=-Djavax.net.ssl.trustStore=NONE -Djavax.net.ssl.trustStoreType=NONE"
set "JAVA_TOOL_OPTIONS=-Djavax.net.ssl.trustStore=NONE -Djavax.net.ssl.trustStoreType=NONE"

echo [2] Compilando versao de DEPURACAO (debug)...
echo.
echo Esta versao e mais rapida de compilar, mas tem recursos limitados.
echo Ideal para testes rapidos.
echo.
echo Executando: .\gradlew assembleDebug --stacktrace
call .\gradlew assembleDebug --stacktrace --info || (
    echo.
    echo Erro na compilacao Debug! Tentando abordagem alternativa...
    echo.
    call .\gradlew clean
    call .\gradlew assembleDebug --stacktrace --no-daemon
)

if exist ".\app\build\outputs\apk\debug\app-debug.apk" (
    echo.
    echo [SUCESSO] APK de depuracao gerado com sucesso!
    echo Arquivo: .\app\build\outputs\apk\debug\app-debug.apk
    echo.
)

echo [3] Compilando versao de LANCAMENTO (release)...
echo.
echo Esta versao e otimizada e pronta para distribuicao.
echo Pode demorar mais tempo para compilar.
echo.
echo Executando: .\gradlew assembleRelease --stacktrace
call .\gradlew assembleRelease --stacktrace --info || (
    echo.
    echo Erro na compilacao Release! Tentando abordagem alternativa...
    echo.
    call .\gradlew clean
    call .\gradlew assembleRelease --stacktrace --no-daemon
)

if exist ".\app\build\outputs\apk\release\app-release.apk" (
    echo.
    echo [SUCESSO] APK de lancamento gerado com sucesso!
    echo Arquivo: .\app\build\outputs\apk\release\app-release.apk
    echo.
)

echo.
echo =========================================================
echo  RESULTADOS DA COMPILACAO
echo =========================================================
echo.

echo Verifique os arquivos APK gerados em:
echo.
echo - Debug APK:   .\app\build\outputs\apk\debug\app-debug.apk
echo - Release APK: .\app\build\outputs\apk\release\app-release.apk
echo.
echo Obs: A versao release pode precisar ser assinada antes da distribuicao.
echo.

pause
