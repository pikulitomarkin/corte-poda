@echo off
echo ========================================
echo   CRIAR NOVA CHAVE ANDROID (se esqueceu a senha)
echo ========================================
echo.
echo ⚠️  ATENÇÃO: Só use este script se esqueceu completamente a senha!
echo.
echo Se você já publicou um app na Play Store com a chave anterior,
echo não poderá mais atualizar o app com uma nova chave!
echo.
set /p CONFIRMA="Tem certeza que quer criar uma NOVA chave? (s/N): "

if /i not "%CONFIRMA%"=="s" (
    echo.
    echo ❌ Operação cancelada. Use 'testar-senha-keystore.bat' primeiro.
    echo.
    pause
    exit /b
)

echo.
echo ========================================
echo.

echo Removendo chave antiga...
if exist my-release-key.jks (
    ren my-release-key.jks my-release-key.jks.backup
    echo ✅ Chave antiga renomeada para .backup
)

if exist keystore-base64.txt (
    ren keystore-base64.txt keystore-base64.txt.backup
    echo ✅ Base64 antigo renomeado para .backup
)

echo.
echo Criando nova chave de assinatura...
echo.

keytool -genkey -v -keystore my-release-key.jks -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Nova chave criada com sucesso!
    echo.
    echo Convertendo para base64...
    certutil -encode my-release-key.jks keystore-base64.txt > nul
    
    echo.
    echo ✅ NOVA CHAVE CONFIGURADA!
    echo.
    echo PRÓXIMOS PASSOS:
    echo 1. Execute: testar-senha-keystore.bat
    echo 2. Configure os secrets no GitHub com as novas senhas
    echo 3. Faça backup da nova chave!
    echo.
) else (
    echo.
    echo ❌ Erro ao criar nova chave.
    echo.
    if exist my-release-key.jks.backup (
        ren my-release-key.jks.backup my-release-key.jks
        echo ✅ Chave original restaurada
    )
)

echo.
pause
