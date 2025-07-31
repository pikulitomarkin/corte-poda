@echo off
mode con: cols=120 lines=60
color 0F
cls

echo ========================================================================
echo  ASSISTENTE PARA EXECUCAO DO APP CORTE DE MATOS
echo  Escolha o melhor metodo para suas necessidades
echo ========================================================================
echo.

:inicio
echo Selecione a opcao desejada:
echo.
echo [1] Executar em rede local (dispositivos na mesma rede WiFi)
echo [2] Executar na internet com Ngrok (tentativa de correcao)
echo [3] Executar na internet com LocalTunnel (alternativa ao Ngrok)
echo [4] Executar com fallback automático (tenta internet, volta para local)
echo [5] Corrigir dependencias do Metro Bundler (erro 'metro-core')
echo [6] Executar em modo minimo (web - mais estavel)
echo [7] SUPER CORRECAO - Resolver todos os problemas
echo [8] Executar com CLI local do Expo (RECOMENDADO)
echo [9] CORRECAO EMERGENCIAL - Resolver erros do Android/Metro
echo [C] CORRECAO RAPIDA - Corrigir apenas erro de sintaxe do Metro
echo [0] Sair
echo.

set /p opcao=Digite o numero da opcao desejada: 

if "%opcao%"=="1" goto rede_local
if "%opcao%"=="2" goto corrigir_ngrok
if "%opcao%"=="3" goto local_tunnel
if "%opcao%"=="4" goto fallback
if "%opcao%"=="5" goto corrigir_metro
if "%opcao%"=="6" goto modo_minimo
if "%opcao%"=="7" goto super_correcao
if "%opcao%"=="8" goto cli_local
if "%opcao%"=="9" goto correcao_emergencial
if /i "%opcao%"=="c" goto corrigir_metro_config
if "%opcao%"=="0" goto fim

echo.
echo Opcao invalida. Tente novamente.
pause
cls
goto inicio

:rede_local
cls
echo Executando app em rede local...
call executar-rede-local.bat
goto fim

:corrigir_ngrok
cls
echo Tentando corrigir Ngrok e executar na internet...
call corrigir-ngrok.bat
goto fim

:local_tunnel
cls
echo Executando com LocalTunnel para acesso pela internet...
call executar-com-localtunnel.bat
goto fim

:fallback
cls
echo Executando com fallback automatico...
call executar-internet-alternativo.bat
goto fim

:corrigir_metro
cls
echo Corrigindo dependencias do Metro Bundler...
call corrigir-dependencias-metro.bat
goto inicio

:modo_minimo
cls
echo Executando em modo minimo (web)...
call executar-modo-minimo.bat
goto fim

:super_correcao
cls
echo Executando SUPER CORRECAO...
call super-correcao.bat
goto inicio

:cli_local
cls
echo Executando com CLI local do Expo...
call executar-cli-local.bat
goto fim

:correcao_emergencial
cls
echo Executando CORRECAO EMERGENCIAL...
call correcao-emergencial.bat
goto inicio

:corrigir_metro_config
cls
echo Executando CORRECAO RAPIDA do Metro Config...
call corrigir-metro-config.bat
goto inicio

:fim
exit
