# 🔧 Configuração de Secrets do GitHub para Build Android

## ❌ PROBLEMA ATUAL
O erro indica que faltam as seguintes secrets no GitHub Actions:

```
credentials.json must exist in the project root directory and contain a valid JSON
```

## ✅ SOLUÇÃO - Configurar Secrets no GitHub

Acesse: `https://github.com/pikulitomarkin/corte-poda/settings/secrets/actions`

### 1️⃣ Secrets Obrigatórias:

**EXPO_TOKEN**
- Valor: Token do Expo CLI
- Como obter: Execute `npx expo login` e depois `npx expo whoami --auth`

**ANDROID_KEYSTORE** 
- Valor: Arquivo keystore em base64
- Como obter: `base64 -i my-release-key.jks` (Linux/Mac) ou `certutil -encode my-release-key.jks temp.txt` (Windows)

**ANDROID_KEYSTORE_PASSWORD**
- Valor: Senha do keystore
- Exemplo: `suaSenhaSegura123`

**ANDROID_KEY_ALIAS**
- Valor: Alias da chave
- Exemplo: `my-key-alias`

**ANDROID_KEY_PASSWORD**
- Valor: Senha da chave
- Exemplo: `suaSenhaSegura123`

### 2️⃣ Como gerar o keystore:

```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

### 3️⃣ Verificar se todas as secrets estão configuradas:

1. Acesse: GitHub > Seu Repositório > Settings > Secrets and variables > Actions
2. Verifique se existem essas 5 secrets:
   - ✅ EXPO_TOKEN
   - ✅ ANDROID_KEYSTORE  
   - ✅ ANDROID_KEYSTORE_PASSWORD
   - ✅ ANDROID_KEY_ALIAS
   - ✅ ANDROID_KEY_PASSWORD

### 4️⃣ Executar o build:

1. Vá em Actions no GitHub
2. Clique em "Build APK - Corte de Matos App"
3. Clique em "Run workflow"
4. Escolha o tipo de build: preview/development/production
5. Clique "Run workflow"

## 🔍 Status Atual:
- ✅ credentials.json criado
- ✅ app.json configurado com owner
- ✅ eas.json configurado
- ✅ workflow.yml configurado
- ❌ Secrets do GitHub precisam ser configuradas

## 📞 Próximos Passos:
1. Configure as 5 secrets no GitHub
2. Execute o workflow
3. Baixe o APK do Expo Dashboard
