# 📱 Guia Completo: App Nativo com Expo Go

## 🎯 **Objetivo: Testar Local → Build Nativo**

### **FASE 1: Expo Go (Teste Local)** ← ESTAMOS AQUI
### **FASE 2: Build APK (App Nativo)**

---

## 🔧 **FASE 1: Preparação para Expo Go**

### **Passo 1: Limpar e Preparar Ambiente**

```powershell
# 1. Navegar para pasta
cd "c:\Users\0338138\Desktop\corte e poda"

# 2. Limpar cache npm
npm cache clean --force

# 3. Remover node_modules (se existir)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 4. Reinstalar dependências limpas
npm install
```

### **Passo 2: Configuração SSL (Problema Atual)**

```powershell
# Configurar npm para ambiente corporativo
npm config set strict-ssl false
npm config set registry http://registry.npmjs.org/
```

### **Passo 3: Iniciar Expo Offline**

```powershell
# Comando offline (evita problemas SSL)
npx expo start --offline

# OU comando com variável ambiente
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npx expo start --offline
```

### **Passo 4: Resultado Esperado**

```
✅ Metro Bundler iniciado
✅ QR Code gerado
✅ URL local: exp://192.168.XXX.XXX:19000
✅ Interface web: http://localhost:19006
```

---

## 📱 **FASE 1: Teste com Expo Go**

### **No Celular:**

1. **Instalar Expo Go**
   - Android: Google Play Store
   - iOS: App Store

2. **Conectar na mesma rede WiFi**
   - Celular e computador na mesma rede

3. **Escanear QR Code**
   - Abrir Expo Go
   - Escanear QR code do terminal
   - OU digitar URL: `exp://192.168.XXX.XXX:19000`

4. **Testar Funcionalidades**
   - ✅ Login (Usuario/esul1234, Admin/eletro2025)
   - ✅ Sistema de cores (Cinza→Amarelo→Verde)
   - ✅ Alertas de data (🕐 ⚠️)
   - ✅ Adicionar itens (Admin)
   - ✅ Gerenciar status
   - ✅ Relatórios

---

## 🔨 **FASE 2: Build APK Nativo**

### **Opção A: Expo Build Service (EAS)**

```powershell
# 1. Instalar EAS CLI
npm install -g @expo/eas-cli

# 2. Login no Expo
eas login

# 3. Configurar build
eas build:configure

# 4. Build APK
eas build --platform android --profile preview
```

### **Opção B: Expo CLI Local**

```powershell
# 1. Build local
expo build:android

# 2. Download APK quando pronto
# Link será fornecido no terminal
```

### **Opção C: Eject para React Native**

```powershell
# 1. Eject do Expo
expo eject

# 2. Build com React Native CLI
npx react-native run-android
```

---

## 📊 **Troubleshooting Comum**

### **❌ Problema: Metro Bundler não inicia**
```powershell
# Solução:
npm cache clean --force
Remove-Item node_modules -Recurse -Force
npm install
npx expo start --offline --clear
```

### **❌ Problema: Expo Go não conecta**
```
# Verificar:
✅ Mesma rede WiFi
✅ Firewall Windows não bloqueando
✅ URL correta no celular
✅ Expo Go atualizado
```

### **❌ Problema: SSL/TLS errors**
```powershell
# Solução:
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
npm config set strict-ssl false
npx expo start --offline
```

### **❌ Problema: Assets não encontrados**
```json
// app.json - remover referências a assets
{
  "expo": {
    "splash": {
      "backgroundColor": "#2e7d32"
    }
    // Remover: "icon", "splash.image", etc.
  }
}
```

---

## 🎯 **Cronograma Sugerido**

### **Hoje (Teste Local):**
- ✅ Resolver problemas SSL/Metro
- ✅ Expo Go funcionando no celular
- ✅ Validar todas funcionalidades

### **Próximo (Build Nativo):**
- 🔨 EAS Build APK
- 📱 Instalar APK no celular
- ✅ Teste offline completo
- 🚀 Distribuição final

---

## 💡 **Vantagens App Nativo vs Web**

| Funcionalidade | Web (Railway) | Nativo (APK) |
|---|---|---|
| **Offline** | ❌ Não | ✅ Sim |
| **Performance** | 🟡 Média | ✅ Rápida |
| **Instalação** | 🌐 URL | 📱 APK |
| **Notificações** | ❌ Limitadas | ✅ Push |
| **Recursos Device** | ❌ Limitados | ✅ Completos |
| **App Store** | ❌ Não | ✅ Sim |

---

## 🚀 **Próximo Passo Imediato**

Vamos primeiro resolver o Metro Bundler e conseguir o QR code funcionando:

```powershell
# Execute este comando:
cd "c:\Users\0338138\Desktop\corte e poda"
npx expo start --offline --clear
```

**🎯 Meta: QR code funcionando e app carregando no Expo Go!**
