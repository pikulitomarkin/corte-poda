@echo off
echo 🧪 Testando configuração EAS local...
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: Node.js não encontrado! 
    echo Instale o Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!

REM Verificar se npm está funcionando
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: NPM não encontrado!
    pause
    exit /b 1
)

echo ✅ NPM encontrado!

REM Instalar EAS CLI se não estiver instalado
echo 📦 Verificando EAS CLI...
npx eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📥 Instalando EAS CLI...
    npm install -g @expo/eas-cli
)

echo ✅ EAS CLI disponível!

REM Verificar se está logado no Expo
echo 🔐 Verificando login no Expo...
npx expo whoami
if %errorlevel% neq 0 (
    echo ⚠️ Não está logado no Expo
    echo Execute: npx expo login
    pause
    exit /b 1
)

echo ✅ Logado no Expo!

REM Verificar configuração do projeto
echo 📄 Verificando app.json...
if not exist "app.json" (
    echo ❌ ERRO: app.json não encontrado!
    pause
    exit /b 1
)

echo ✅ app.json encontrado!

echo 📄 Verificando eas.json...
if not exist "eas.json" (
    echo ❌ ERRO: eas.json não encontrado!
    pause
    exit /b 1
)

echo ✅ eas.json encontrado!

REM Tentar inicializar EAS
echo 🚀 Inicializando EAS...
npx eas init --force
if %errorlevel% neq 0 (
    echo ❌ ERRO: Falha ao inicializar EAS!
    echo Verifique se o projeto existe no Expo Dashboard
    pause
    exit /b 1
)

echo ✅ EAS inicializado com sucesso!

REM Verificar build
echo 🔨 Testando configuração de build...
npx eas build --platform android --profile preview --dry-run
if %errorlevel% neq 0 (
    echo ❌ ERRO: Configuração de build inválida!
    pause
    exit /b 1
)

echo ✅ Configuração de build válida!
echo.
echo 🎉 SUCESSO! Projeto EAS configurado corretamente!
echo.
echo 📋 Próximos passos:
echo 1. Configure as secrets no GitHub
echo 2. Execute o workflow no GitHub Actions
echo 3. Baixe o APK do Expo Dashboard
echo.

pause
