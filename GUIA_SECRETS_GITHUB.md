# Guia Completo: Configurar GitHub Secrets

## 🔐 Secrets Necessários

Você precisa configurar 5 secrets no GitHub para que o build automatizado funcione:

### 1. EXPO_TOKEN
- **Valor**: Seu token de acesso da Expo
- **Como obter**: 
  1. Acesse: https://expo.dev/accounts/[username]/settings/access-tokens
  2. Clique em "Create Token"
  3. Copie o token gerado

### 2. ANDROID_KEYSTORE
- **Valor**: (já pronto - ver abaixo)
```
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
```

### 3. ANDROID_KEYSTORE_PASSWORD
- **Valor**: `1212Ervadoce`

### 4. ANDROID_KEY_ALIAS
- **Valor**: `my-key-alias`

### 5. ANDROID_KEY_PASSWORD
- **Valor**: `1212Ervadoce`

## 📝 Como Configurar no GitHub

1. **Acesse seu repositório no GitHub**
2. **Vá para Settings** (aba do repositório)
3. **Clique em "Secrets and variables"** no menu lateral
4. **Selecione "Actions"**
5. **Clique em "New repository secret"** para cada secret

### Passo a Passo:

**Secret 1: EXPO_TOKEN**
- Name: `EXPO_TOKEN`
- Value: [Seu token da Expo]

**Secret 2: ANDROID_KEYSTORE**
- Name: `ANDROID_KEYSTORE`
- Value: [Copie exatamente o código base64 acima]

**Secret 3: ANDROID_KEYSTORE_PASSWORD**
- Name: `ANDROID_KEYSTORE_PASSWORD`
- Value: `1212Ervadoce`

**Secret 4: ANDROID_KEY_ALIAS**
- Name: `ANDROID_KEY_ALIAS`
- Value: `my-key-alias`

**Secret 5: ANDROID_KEY_PASSWORD**
- Name: `ANDROID_KEY_PASSWORD`
- Value: `1212Ervadoce`

## ✅ Verificação Final

Após configurar todos os secrets, você deve ver 5 secrets listados:
- EXPO_TOKEN
- ANDROID_KEYSTORE
- ANDROID_KEYSTORE_PASSWORD
- ANDROID_KEY_ALIAS
- ANDROID_KEY_PASSWORD

## 🚀 Testar o Build

1. Faça um commit e push para triggerar o workflow
2. Ou vá para Actions > Build APK > Run workflow
3. Aguarde o build terminar
4. Baixe o APK gerado nos artifacts

## 🔧 Se o Build Falhar

- Verifique se todos os 5 secrets estão configurados corretamente
- Verifique se o EXPO_TOKEN está válido
- Verifique se as senhas estão exatas (1212Ervadoce)
- O alias deve ser exato: my-key-alias

## 📱 Próximos Passos

Após o build funcionar:
1. Baixar e testar o APK
2. Verificar se o app funciona no dispositivo
3. Configurar builds automáticos para releases

---

**Importante**: Mantenha essas senhas seguras e não as compartilhe publicamente!
