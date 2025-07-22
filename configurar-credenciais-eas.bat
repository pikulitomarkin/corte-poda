@echo off
echo ========================================
echo    CONFIGURACAO CREDENCIAIS EAS LOCAL
echo ========================================
echo.

echo 1. VERIFICANDO ARQUIVOS...
if not exist "my-release-key.jks" (
    echo ❌ ERRO: Arquivo my-release-key.jks nao encontrado!
    echo    Execute primeiro: .\criar-nova-chave.bat
    pause
    exit /b 1
)

if not exist "keystore-base64.txt" (
    echo ❌ ERRO: Arquivo keystore-base64.txt nao encontrado!
    echo    Execute primeiro: .\configurar-chave-android.bat
    pause
    exit /b 1
)

echo ✅ Arquivos encontrados!
echo.

echo 2. CONFIGURANDO CREDENCIAIS NO EAS.JSON...

REM Criar eas.json com credenciais locais
(
echo {
echo   "cli": {
echo     "version": ">= 7.8.6",
echo     "appVersionSource": "local"
echo   },
echo   "build": {
echo     "preview": {
echo       "android": {
echo         "buildType": "apk"
echo       }
echo     },
echo     "development": {
echo       "developmentClient": true,
echo       "distribution": "internal",
echo       "android": {
echo         "buildType": "apk"
echo       }
echo     },
echo     "production": {
echo       "android": {
echo         "buildType": "app-bundle",
echo         "gradleCommand": ":app:bundleRelease"
echo       }
echo     },
echo     "production-apk": {
echo       "android": {
echo         "buildType": "apk",
echo         "gradleCommand": ":app:assembleRelease"
echo       }
echo     }
echo   },
echo   "submit": {
echo     "production": {}
echo   }
echo }
) > eas.json

echo ✅ eas.json atualizado!
echo.

echo 3. PROXIMOS PASSOS PARA BUILD:
echo.
echo    A. CONFIGURE SECRETS NO GITHUB:
echo       📍 https://github.com/pikulitomarkin/corte-poda/settings/secrets/actions
echo.
echo       Crie estes 5 secrets:
echo       - EXPO_TOKEN: [seu token do expo.dev]
echo       - ANDROID_KEYSTORE: [conteudo do keystore-base64.txt]
echo       - ANDROID_KEYSTORE_PASSWORD: [sua senha do keystore]
echo       - ANDROID_KEY_ALIAS: my-key-alias
echo       - ANDROID_KEY_PASSWORD: [sua senha da chave]
echo.
echo    B. EXECUTE BUILD AUTOMATICO:
echo       📍 https://github.com/pikulitomarkin/corte-poda/actions
echo       - Clique em "Build APK - Corte de Matos App"
echo       - "Run workflow" → "preview"
echo.
echo ✅ CONFIGURACAO CONCLUIDA!
echo.
pause
