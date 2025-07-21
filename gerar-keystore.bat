@echo off
echo 🔑 Gerando keystore para o app Corte de Matos...
echo.

REM Verificar se Java está instalado
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: Java não encontrado! 
    echo Instale o Java JDK primeiro: https://www.oracle.com/java/technologies/downloads/
    pause
    exit /b 1
)

echo ✅ Java encontrado!
echo.

REM Gerar keystore
echo 📝 Digite as informações solicitadas:
echo.
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias

if %errorlevel% eq 0 (
    echo.
    echo ✅ Keystore gerado com sucesso: my-release-key.jks
    echo.
    echo 📋 PRÓXIMOS PASSOS:
    echo 1. Anote a senha que você digitou
    echo 2. Configure as secrets no GitHub:
    echo    - https://github.com/pikulitomarkin/corte-poda/settings/secrets/actions
    echo 3. Execute o workflow no GitHub Actions
    echo.
    echo 🔐 Para gerar o base64 do keystore, execute:
    echo    certutil -encode my-release-key.jks keystore-base64.txt
    echo.
) else (
    echo ❌ Erro ao gerar keystore!
)

pause
