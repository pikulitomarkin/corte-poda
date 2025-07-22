@echo off
echo 🚀 Iniciando Expo em Modo Offline...
echo.

echo 📡 Configurando ambiente...
set NODE_TLS_REJECT_UNAUTHORIZED=0

echo 🌐 Iniciando servidor local...
echo.
echo ⚡ Pressione 'w' quando aparecer o menu para abrir no navegador
echo 📱 URL: http://localhost:19006
echo.

npx expo start --offline

pause
