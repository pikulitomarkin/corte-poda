@echo off
echo ========================================
echo     TESTE DE SENHA DO KEYSTORE
echo ========================================
echo.
echo Este script vai testar se voce lembra da senha do keystore
echo.
echo Arquivo: my-release-key.jks
echo Alias: my-key-alias
echo.
echo ========================================
echo.

set /p KEYSTORE_PWD="Digite a senha do KEYSTORE (a primeira que voce digitou): "
echo.

echo Testando senha do keystore...
keytool -list -keystore my-release-key.jks -storepass "%KEYSTORE_PWD%" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCESSO! Senha do keystore esta CORRETA!
    echo.
    
    set /p KEY_PWD="Digite a senha da CHAVE (a segunda que voce digitou): "
    echo.
    
    echo Testando senha da chave...
    keytool -list -keystore my-release-key.jks -alias my-key-alias -storepass "%KEYSTORE_PWD%" -keypass "%KEY_PWD%" 2>nul
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ PERFEITO! Ambas as senhas estao CORRETAS!
        echo.
        echo Salvando as senhas no arquivo .env.keystore...
        
        (
        echo # Configurações do Keystore para build de produção
        echo # ATENÇÃO: Este arquivo contém informações sensíveis - NÃO commitar no Git!
        echo.
        echo # Informações do Keystore criado
        echo KEYSTORE_PATH=./my-release-key.jks
        echo KEY_ALIAS=my-key-alias
        echo KEYSTORE_PASSWORD=%KEYSTORE_PWD%
        echo KEY_PASSWORD=%KEY_PWD%
        echo.
        echo # Informações do certificado
        echo SIGNER_NAME=Marcos Padilha
        echo ORGANIZATION=Eletrobras
        echo ORGANIZATIONAL_UNIT=Eletrobras
        echo LOCALITY=Londrina
        echo STATE=Parana
        echo COUNTRY=BR
        ) > .env.keystore
        
        echo.
        echo ✅ Senhas salvas em .env.keystore
        echo.
        echo PRÓXIMO PASSO:
        echo 1. Configure os secrets no GitHub usando essas senhas
        echo 2. Execute: configurar-chave-android.bat
        echo.
    ) else (
        echo.
        echo ❌ Senha da CHAVE incorreta. Tente novamente.
        echo.
    )
    
) else (
    echo.
    echo ❌ Senha do KEYSTORE incorreta. Tente novamente.
    echo.
    echo DICAS:
    echo - A senha pode ter números, letras ou símbolos
    echo - Verifique se Caps Lock não está ativado
    echo - Se esqueceu, você pode criar um novo keystore
    echo.
)

echo.
pause
