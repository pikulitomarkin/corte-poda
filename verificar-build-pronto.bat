@echo off
echo ============================================
echo     VERIFICACAO FINAL - BUILD AUTOMATICO
echo ============================================
echo.

echo [1/5] Verificando se o keystore existe...
if exist "my-release-key.jks" (
    echo ✅ Keystore encontrado: my-release-key.jks
) else (
    echo ❌ ERRO: Keystore nao encontrado!
    pause
    exit
)

echo.
echo [2/5] Verificando se o arquivo base64 existe...
if exist "keystore-base64.txt" (
    echo ✅ Arquivo base64 encontrado: keystore-base64.txt
) else (
    echo ❌ ERRO: Arquivo base64 nao encontrado!
    pause
    exit
)

echo.
echo [3/5] Verificando configuracao EAS...
if exist "eas.json" (
    echo ✅ Arquivo EAS encontrado: eas.json
) else (
    echo ❌ ERRO: Arquivo eas.json nao encontrado!
    pause
    exit
)

echo.
echo [4/5] Verificando workflow do GitHub...
if exist ".github\workflows\build.yml" (
    echo ✅ Workflow encontrado: .github\workflows\build.yml
) else (
    echo ❌ ERRO: Workflow nao encontrado!
    pause
    exit
)

echo.
echo [5/5] Verificando App principal...
if exist "App-build-nativo.js" (
    echo ✅ App principal encontrado: App-build-nativo.js
) else (
    echo ❌ ERRO: App principal nao encontrado!
    pause
    exit
)

echo.
echo ============================================
echo               RESUMO FINAL
echo ============================================
echo.
echo ✅ Todos os arquivos necessarios estao presentes!
echo.
echo PROXIMOS PASSOS:
echo 1. Configure os 5 secrets no GitHub (veja GUIA_SECRETS_GITHUB.md)
echo 2. Faca commit e push para triggerar o build
echo 3. Aguarde o build terminar
echo 4. Baixe o APK gerado
echo.
echo SECRETS NECESSARIOS:
echo - EXPO_TOKEN (obter no site da Expo)
echo - ANDROID_KEYSTORE (ja pronto no arquivo keystore-base64.txt)
echo - ANDROID_KEYSTORE_PASSWORD: 1212Ervadoce
echo - ANDROID_KEY_ALIAS: my-key-alias
echo - ANDROID_KEY_PASSWORD: 1212Ervadoce
echo.
echo Pressione qualquer tecla para abrir o guia completo...
pause
start GUIA_SECRETS_GITHUB.md
