@echo off
echo 🎯 CONFIGURAÇÃO SIMPLES DO EXPO - APENAS LOGIN E TOKEN
echo.

echo 📋 PASSO 1: Login no Expo
echo.
npx expo login
if %errorlevel% neq 0 (
    echo ❌ ERRO: Falha no login do Expo!
    pause
    exit /b 1
)

echo ✅ Login realizado com sucesso!
echo.

echo 📋 PASSO 2: Verificando usuário logado
npx expo whoami
if %errorlevel% neq 0 (
    echo ❌ ERRO: Não foi possível verificar usuário!
    pause
    exit /b 1
)

echo.
echo 📋 PASSO 3: Obtendo token de autenticação
echo.
echo 🔑 IMPORTANTE: COPIE O TOKEN ABAIXO!
echo ================================================
echo Use este token como EXPO_TOKEN no GitHub:
echo.
npx expo whoami --auth
echo.
echo ================================================
echo.

echo 🎉 TOKEN OBTIDO COM SUCESSO!
echo.
echo 📋 PRÓXIMOS PASSOS:
echo 1. ✅ Login no Expo - CONCLUÍDO
echo 2. ✅ Token obtido - CONCLUÍDO (copie o token acima)
echo 3. ❌ Configure o token como EXPO_TOKEN no GitHub
echo 4. ❌ Gere keystore Android (gerar-keystore.bat)
echo 5. ❌ Configure todas as 5 secrets no GitHub
echo 6. ❌ Execute build no GitHub Actions
echo.

echo 🔗 GitHub Secrets: https://github.com/pikulitomarkin/corte-poda/settings/secrets/actions
echo.

echo 📝 NOTA: O projeto será criado automaticamente durante o primeiro build
echo     Não é necessário criar projeto manualmente no Expo
echo.

pause
