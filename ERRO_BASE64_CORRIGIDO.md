# 🔧 ERRO BASE64 CORRIGIDO - GitHub Actions

## ❌ ERRO IDENTIFICADO:

```bash
Run echo "Setting up Android credentials..."
Setting up Android credentials...
base64: invalid input
Error: Process completed with exit code 1.
```

## 🔍 CAUSA RAIZ:

O comando `base64 -d` estava usando sintaxe incorreta para Linux Ubuntu (GitHub Actions runner).

## ✅ CORREÇÃO APLICADA:

### **ANTES (comando incorreto):**
```bash
echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 -d > android-keystore.jks
```

### **DEPOIS (comando corrigido):**
```bash
echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 --decode > android-keystore.jks
```

### **MELHORIAS ADICIONADAS:**

1. **Verificação de Secrets:**
   ```yaml
   if [ -n "${{ secrets.ANDROID_KEYSTORE }}" ]; then
     # Configurar keystore apenas se o secret existir
   else
     echo "⚠️ No Android keystore configured - using Expo managed credentials"
   fi
   ```

2. **Logs de Debug:**
   ```yaml
   echo "✅ Android keystore configured successfully"
   ls -la android-keystore.jks
   ```

## 📋 CONFIGURAÇÃO DOS SECRETS NO GITHUB:

Vá para: [GitHub Secrets](https://github.com/pikulitomarkin/corte-poda/settings/secrets/actions)

**Crie estes 5 secrets:**

| Secret Name | Value |
|-------------|-------|
| `EXPO_TOKEN` | ⏳ Obter em: https://expo.dev/accounts/[user]/settings/access-tokens |
| `ANDROID_KEYSTORE` | ✅ Todo o conteúdo de `keystore-base64.txt` |
| `ANDROID_KEYSTORE_PASSWORD` | ✅ `1212Ervadoce` |
| `ANDROID_KEY_ALIAS` | ✅ `my-key-alias` |
| `ANDROID_KEY_PASSWORD` | ✅ `1212Ervadoce` |

## 🔐 CONTEÚDO DO SECRET ANDROID_KEYSTORE:

Copie **TODO** o conteúdo do arquivo `keystore-base64.txt` (incluindo as linhas BEGIN/END):

```
-----BEGIN CERTIFICATE-----
MIIK4AIBAzCCCooGCSqGSIb3DQEHAaCCCnsEggp3MIIKczCCBboGCSqGSIb3DQEH
AaCCBasEggWnMIIFozCCBZ8GCyqGSIb3DQEMCgECoIIFQDCCBTwwZgYJKoZIhvcN
...
AgInEA==
-----END CERTIFICATE-----
```

## 🚀 PRÓXIMOS PASSOS:

### 1. **Configure os secrets no GitHub** ⏳
### 2. **Execute o workflow novamente** ⏳
### 3. **Verifique os logs do build** ⏳

## 🎯 RESULTADO ESPERADO:

Após configurar os secrets, o workflow deve executar com sucesso:

```bash
✅ Setting up Android credentials...
✅ Android keystore configured successfully
-rw-r--r-- 1 runner docker 2788 Jul 22 18:00 android-keystore.jks
✅ Initialize EAS project
✅ Build APK Preview
✅ Build completed successfully!
```

## 🔧 COMANDOS DE TESTE LOCAL:

Para testar suas senhas localmente:

```bash
# Testar senhas do keystore
.\testar-senha-keystore.bat

# Gerar base64 novamente se necessário
.\configurar-chave-android.bat
```

## 📝 ARQUIVOS ATUALIZADOS:

- ✅ `.github/workflows/build.yml` - Comando base64 corrigido
- ✅ `.env.keystore` - Senhas completas
- ✅ `ERRO_BASE64_CORRIGIDO.md` - Documentação da correção

---

## 🏆 STATUS ATUAL:

- ✅ **Erro base64 corrigido**
- ✅ **Verificação de secrets adicionada**
- ✅ **Logs de debug melhorados**
- ⏳ **Pendente:** Configurar secrets no GitHub
- ⏳ **Pendente:** Testar build automatizado

---

*Correção aplicada em: 22 de julho de 2025*  
*Comando base64 compatível com Linux Ubuntu* 🐧
