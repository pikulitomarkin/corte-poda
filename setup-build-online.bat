@echo off
echo ========================================
echo    SETUP BUILD ONLINE - GITHUB ACTIONS
echo ========================================
echo.

echo [1/4] Adicionando workflow ao Git...
git add .github\workflows\build.yml
git add BUILD_ONLINE_GITHUB.md

echo.
echo [2/4] Fazendo commit...
git commit -m "feat: GitHub Actions para build automático APK"

echo.
echo [3/4] Enviando para GitHub...
git push

echo.
echo [4/4] PRÓXIMOS PASSOS MANUAIS:
echo.
echo 1. Criar conta Expo (se não tiver):
echo    https://expo.dev/signup
echo.
echo 2. Gerar token de acesso:
echo    https://expo.dev/accounts/settings/access-tokens
echo    Nome sugerido: GITHUB_ACTIONS_TOKEN
echo.
echo 3. Configurar secret no GitHub:
echo    - Vá no seu repositório
echo    - Settings ^> Secrets and variables ^> Actions
echo    - New repository secret
echo    - Name: EXPO_TOKEN
echo    - Value: ^(cole o token do Expo^)
echo.
echo 4. Testar build:
echo    - GitHub ^> Actions ^> "Build APK - Corte de Matos App"
echo    - Run workflow ^> Preview ^> Run workflow
echo.
echo ========================================
echo CONFIGURAÇÃO ENVIADA PARA GITHUB!
echo ========================================
echo.
echo Agora configure o token EXPO_TOKEN conforme instruções acima.
echo Após isso, qualquer push fará build automático!
echo.
pause
