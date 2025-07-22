# Script PowerShell para corrigir e enviar workflow
Set-Location "c:\Users\0338138\Desktop\corte e poda"

Write-Host "========================================" -ForegroundColor Green
Write-Host "     CORRECAO DO WORKFLOW GITHUB ACTIONS" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "1. Verificando status do Git..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2. Adicionando arquivos corrigidos..." -ForegroundColor Yellow
git add .github/workflows/build.yml

Write-Host ""
Write-Host "3. Fazendo commit da correcao..." -ForegroundColor Yellow
git commit -m "fix: correcao de erros Yarn/NPM e cache no workflow GitHub Actions

- Forcado uso exclusivo do NPM (removido yarn.lock)
- Limpeza completa de caches antes da instalacao
- Adicionado flags --force para resolver conflitos
- Corrigido erro de cache service 400
- Workflow otimizado para build Android APK"

Write-Host ""
Write-Host "4. Enviando para o GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "5. Status final..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "     WORKFLOW CORRIGIDO E ENVIADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Va para https://github.com/pikulitomarkin/corte-poda" -ForegroundColor White
Write-Host "2. Va em Settings > Secrets and variables > Actions" -ForegroundColor White
Write-Host "3. Verifique se EXPO_TOKEN esta configurado" -ForegroundColor White
Write-Host "4. Va em Actions para testar o workflow" -ForegroundColor White
Write-Host "5. Execute 'Build APK - Corte de Matos App'" -ForegroundColor White

Write-Host ""
Write-Host "CORRECOES APLICADAS:" -ForegroundColor Cyan
Write-Host "✅ Forcado uso exclusivo do NPM" -ForegroundColor Green
Write-Host "✅ Removido conflitos com Yarn" -ForegroundColor Green  
Write-Host "✅ Limpeza completa de caches" -ForegroundColor Green
Write-Host "✅ Instalacao com --force para resolver dependencias" -ForegroundColor Green
Write-Host "✅ Workflow otimizado para Android APK" -ForegroundColor Green

Write-Host ""
Read-Host "Pressione ENTER para continuar..."
