# 🔐 CONFIGURAÇÃO CHAVE ANDROID - GUIA COMPLETO

## ✅ CHAVE CRIADA COM SUCESSO!

**Localização:** `c:\Users\0338138\Desktop\corte e poda\my-release-key.jks`

## 🔐 SUAS SENHAS DO KEYSTORE:

### **Você criou 2 senhas durante o processo:**

1. **KEYSTORE PASSWORD** - Digitada em `Enter keystore password:`
2. **KEY PASSWORD** - Digitada em `Re-enter new password:`

### 🧪 **TESTE SE LEMBRA DAS SENHAS:**

```bash
# Execute este script para testar:
.\testar-senha-keystore.bat
```

### 🆘 **SE ESQUECEU AS SENHAS:**

```bash
# CUIDADO: Só use se não conseguir lembrar!
.\criar-nova-chave.bat
```

⚠️ **IMPORTANTE:** Se você já publicou um app na Play Store, **NÃO PODE** trocar a chave de assinatura!

---
- **Nome:** Marcos Padilha
- **Organização:** Eletrobras
- **Unidade:** Eletrobras  
- **Cidade:** Londrina
- **Estado:** Paraná
- **País:** BR
- **Validade:** 10.000 dias (≈27 anos)

---

## 🚀 PRÓXIMOS PASSOS PARA BUILDS ASSINADOS:

### 1. **CONFIGURAR SECRETS NO GITHUB** ⏳

Vá para: [GitHub Secrets](https://github.com/pikulitomarkin/corte-poda/settings/secrets/actions)

**Crie estes 4 secrets:**

| Secret Name | Value |
|-------------|-------|
| `ANDROID_KEYSTORE` | Conteúdo do arquivo `keystore-base64.txt` |
| `ANDROID_KEYSTORE_PASSWORD` | Sua senha do keystore |
| `ANDROID_KEY_ALIAS` | `my-key-alias` |
| `ANDROID_KEY_PASSWORD` | Sua senha da chave |

### 2. **ATUALIZAR WORKFLOW DO GITHUB ACTIONS** ⏳

O workflow precisa ser atualizado para usar a chave de assinatura nos builds de produção.

### 3. **PERFIS DE BUILD DISPONÍVEIS** ✅

```json
{
  "preview": "APK para testes rápidos",
  "development": "APK para debug", 
  "production": "AAB assinado para Play Store",
  "production-apk": "APK assinado para distribuição"
}
```

---

## 🔧 ARQUIVOS CRIADOS:

- ✅ `my-release-key.jks` - Chave de assinatura
- ✅ `keystore-base64.txt` - Chave em base64 para GitHub
- ✅ `.env.keystore` - Configurações (não commitado)
- ✅ `configurar-chave-android.bat` - Script de configuração
- ✅ `.gitignore` atualizado para proteger arquivos sensíveis

---

## ⚠️ SEGURANÇA:

### ✅ **PROTEGIDO (não será commitado):**
- `my-release-key.jks`
- `keystore-base64.txt`
- `.env.keystore`

### 🔒 **BACKUP RECOMENDADO:**
Faça backup da chave `my-release-key.jks` em local seguro!
**SEM ESSA CHAVE = IMPOSSÍVEL ATUALIZAR O APP NA PLAY STORE**

---

## 🎯 COMO USAR:

### **Build APK Assinado:**
```bash
eas build --platform android --profile production-apk
```

### **Build AAB para Play Store:**
```bash
eas build --platform android --profile production  
```

### **Build Preview (desenvolvimento):**
```bash
eas build --platform android --profile preview
```

---

## 📱 DISTRIBUIÇÃO:

### **APK Assinado:**
- ✅ Pode ser instalado em qualquer Android
- ✅ Não precisa de Play Store
- ✅ Distribuição direta via WhatsApp/email

### **AAB para Play Store:**
- ✅ Formato oficial do Google Play
- ✅ Otimizado automaticamente
- ✅ Suporte a Dynamic Delivery

---

## 🏆 STATUS ATUAL:

- ✅ **Chave de assinatura criada**
- ✅ **EAS.json configurado**  
- ✅ **Arquivos protegidos no .gitignore**
- ⏳ **Pendente:** Configurar secrets no GitHub
- ⏳ **Pendente:** Testar build assinado

---

*Configuração criada em: 22 de julho de 2025*  
*Corte de Matos App - Sistema de Controle de Prazos* 🌱
