@echo off
echo ========================================
echo    CONFIGURAR CHAVE ANDROID - EAS BUILD
echo ========================================
echo.

echo 1. Gerando base64 da chave para GitHub Secrets...
certutil -encode my-release-key.jks keystore-base64.txt
echo    ✅ Arquivo keystore-base64.txt criado

echo.
echo 2. Informações para configurar no GitHub:
echo.
echo    📍 Vá para: https://github.com/pikulitomarkin/corte-poda/settings/secrets/actions
echo.
echo    🔑 Crie estes secrets:
echo       • ANDROID_KEYSTORE = [conteúdo do arquivo keystore-base64.txt]
echo       • ANDROID_KEYSTORE_PASSWORD = [sua senha do keystore]  
echo       • ANDROID_KEY_ALIAS = my-key-alias
echo       • ANDROID_KEY_PASSWORD = [sua senha da chave]
echo.
echo 3. Dados do seu certificado:
echo    Nome: Marcos Padilha
echo    Organização: Eletrobras
echo    Localização: Londrina, Paraná, BR
echo.
echo ✅ Configuração completa!
echo    Execute 'eas build --platform android --profile production' para testar
echo.
pause
