@echo off
chcp 65001 > nul
echo.
echo ============================================
echo   🔑 GERADOR DE SECRET PARA GITHUB ACTIONS
echo ============================================
echo.

if not exist "my-release-key.jks" (
    echo ❌ Arquivo my-release-key.jks não encontrado!
    echo.
    echo Para gerar o keystore primeiro, execute:
    echo configurar-chave-android.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Keystore encontrado: my-release-key.jks
echo.

echo 📝 Gerando conteúdo base64 para GitHub Secret...
echo.

:: Gera o base64 do keystore
certutil -encode "my-release-key.jks" "keystore-temp.b64" > nul 2>&1

if exist "keystore-temp.b64" (
    :: Remove cabeçalhos e quebras de linha do certutil
    (
        for /f "skip=1 delims=" %%i in (keystore-temp.b64) do (
            set "line=%%i"
            setlocal enabledelayedexpansion
            if not "!line!"=="-----END CERTIFICATE-----" (
                if not "!line:~0,5!"=="-----" (
                    echo(!line!
                )
            )
            endlocal
        )
    ) > keystore-base64.txt

    del "keystore-temp.b64" > nul 2>&1

    echo ✅ Arquivo gerado: keystore-base64.txt
    echo.
    echo 📋 INSTRUÇÕES PARA CONFIGURAR OS SECRETS:
    echo.
    echo 1. Vá para o seu repositório no GitHub
    echo 2. Acesse: Settings ^> Secrets and variables ^> Actions
    echo 3. Clique em "New repository secret"
    echo 4. Configure os seguintes secrets:
    echo.
    echo    🔑 ANDROID_KEYSTORE
    echo       Valor: Cole todo o conteúdo do arquivo keystore-base64.txt
    echo.
    echo    🔑 ANDROID_KEYSTORE_PASSWORD
    echo       Valor: 1212Ervadoce
    echo.
    echo    🔑 ANDROID_KEY_ALIAS  
    echo       Valor: my-key-alias
    echo.
    echo    🔑 ANDROID_KEY_PASSWORD
    echo       Valor: 1212Ervadoce
    echo.
    echo    🔑 EXPO_TOKEN
    echo       Valor: ^(seu token do expo.dev^)
    echo.
    echo 📄 Para ver o conteúdo do secret ANDROID_KEYSTORE:
    type keystore-base64.txt
    echo.
) else (
    echo ❌ Falha ao gerar arquivo base64
    echo.
)

echo.
echo Pressione qualquer tecla para continuar...
pause > nul
