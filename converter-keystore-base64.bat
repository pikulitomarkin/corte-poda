@echo off
echo 🔄 Convertendo keystore para base64...
echo.

REM Verificar se o keystore existe
if not exist "my-release-key.jks" (
    echo ❌ ERRO: Arquivo my-release-key.jks não encontrado!
    echo Execute primeiro: gerar-keystore.bat
    pause
    exit /b 1
)

echo ✅ Keystore encontrado: my-release-key.jks
echo.

REM Converter para base64
echo 🔄 Convertendo para base64...
certutil -encode my-release-key.jks keystore-base64.txt

if %errorlevel% eq 0 (
    echo.
    echo ✅ Conversão concluída!
    echo 📄 Arquivo gerado: keystore-base64.txt
    echo.
    echo 📋 PRÓXIMO PASSO:
    echo 1. Abra o arquivo keystore-base64.txt
    echo 2. Copie todo o conteúdo (exceto as linhas -----BEGIN----- e -----END-----)
    echo 3. Cole como valor da secret ANDROID_KEYSTORE no GitHub
    echo.
    echo 🌐 Link direto para secrets:
    echo https://github.com/pikulitomarkin/corte-poda/settings/secrets/actions
    echo.
    
    REM Abrir o arquivo automaticamente
    notepad keystore-base64.txt
) else (
    echo ❌ Erro ao converter keystore!
)

pause
