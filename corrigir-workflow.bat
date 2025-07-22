@echo off
cd /d "C:\Users\0338138\Desktop\corte e poda"

echo ========================================
echo     VERIFICACAO E CORRECAO DO WORKFLOW
echo ========================================

echo.
echo 1. Verificando status do Git...
git status

echo.
echo 2. Adicionando arquivos corrigidos...
git add .github/workflows/build.yml

echo.
echo 3. Fazendo commit da correcao...
git commit -m "fix: correcao do evento 'on' no workflow GitHub Actions"

echo.
echo 4. Enviando para o GitHub...
git push origin main

echo.
echo 5. Status final...
git status

echo.
echo ========================================
echo     WORKFLOW CORRIGIDO E ENVIADO!
echo ========================================
echo.
echo Proximos passos:
echo 1. Va para https://github.com/seu-usuario/seu-repositorio
echo 2. Va em Settings ^> Secrets and variables ^> Actions
echo 3. Clique em "New repository secret"
echo 4. Nome: EXPO_TOKEN
echo 5. Value: seu-token-do-expo
echo 6. Va em Actions para testar o workflow

pause
