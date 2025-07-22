@echo off
cd /d "C:\Users\0338138\Desktop\corte e poda"

echo ========================================
echo     DIAGNOSTICO DO WORKFLOW
echo ========================================

echo.
echo 1. Verificando estrutura de pastas...
if exist ".github\workflows" (
    echo [OK] Pasta .github\workflows existe
) else (
    echo [ERRO] Pasta .github\workflows NAO existe
)

echo.
echo 2. Verificando arquivo build.yml...
if exist ".github\workflows\build.yml" (
    echo [OK] Arquivo build.yml existe
    echo.
    echo Conteudo do arquivo:
    type ".github\workflows\build.yml"
) else (
    echo [ERRO] Arquivo build.yml NAO existe
)

echo.
echo 3. Verificando encoding e caracteres especiais...
powershell -Command "Get-Content '.github\workflows\build.yml' -Raw | Format-Hex | Select-Object -First 10"

echo.
echo 4. Verificando espacos no inicio das linhas...
powershell -Command "Get-Content '.github\workflows\build.yml' | ForEach-Object -Begin {$i=1} -Process { if($_ -match '^[ \t]+') { Write-Host 'Linha ' $i ': espacos/tabs detectados' }; $i++ }"

echo.
echo 5. Status do Git...
git status

echo.
echo ========================================
echo     DIAGNOSTICO CONCLUIDO
echo ========================================

pause
