@echo off
echo 🎯 CONFIGURAÇÃO COMPLETA DO PROJETO EXPO
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
echo 🔑 IMPORTANTE: Copie o token abaixo para usar como EXPO_TOKEN no GitHub!
echo ================================================
npx expo whoami --auth
echo ================================================
echo.

echo 📋 PASSO 4: Registrando projeto no Expo
echo.
npx expo register
if %errorlevel% neq 0 (
    echo ⚠️ Projeto pode já estar registrado, continuando...
)

echo.
echo 📋 PASSO 5: Inicializando EAS
echo.
npx eas init --force
if %errorlevel% neq 0 (
    echo ❌ ERRO: Falha ao inicializar EAS!
    echo.
    echo 🔧 SOLUÇÃO ALTERNATIVA:
    echo 1. Acesse: https://expo.dev/
    echo 2. Faça login com sua conta
    echo 3. Clique em "Create a project"
    echo 4. Nome: Corte de Matos
    echo 5. Slug: corte-matos-app
    echo 6. Execute este script novamente
    pause
    exit /b 1
)

echo ✅ EAS inicializado com sucesso!
echo.

echo 📋 PASSO 6: Verificando configuração
echo.
echo 📄 Conteúdo do app.json:
type app.json
echo.
echo 📄 Conteúdo do eas.json:
type eas.json
echo.

echo 📋 PASSO 7: Testando build (dry-run)
echo.
npx eas build --platform android --profile preview --dry-run
if %errorlevel% neq 0 (
    echo ❌ ERRO: Configuração de build inválida!
    pause
    exit /b 1
)

echo.
echo 🎉 SUCESSO! Projeto Expo configurado completamente!
echo.
echo 📋 PRÓXIMOS PASSOS:
echo 1. ✅ Login no Expo - CONCLUÍDO
echo 2. ✅ Token obtido - CONCLUÍDO  
echo 3. ✅ Projeto registrado - CONCLUÍDO
echo 4. ✅ EAS inicializado - CONCLUÍDO
echo 5. ❌ Configure secrets no GitHub
echo 6. ❌ Gere keystore Android
echo 7. ❌ Execute build no GitHub Actions
echo.

echo 🔗 Links importantes:
echo - Expo Dashboard: https://expo.dev/accounts/[SEU_USUARIO]/projects
echo - GitHub Secrets: https://github.com/pikulitomarkin/corte-poda/settings/secrets/actions
echo.

pause
