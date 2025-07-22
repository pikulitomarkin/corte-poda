# 🚀 BUILD ONLINE - GitHub Actions + Expo EAS

## ✅ **SIM! É POSSÍVEL fazer build online!**

Configurei um sistema completo de **GitHub Actions** que fará o build automaticamente na nuvem do GitHub.

## 🔧 **Como Funciona**

### 1️⃣ **GitHub Actions**
- Executa na nuvem do GitHub (gratuito)
- Instala dependências automaticamente
- Usa Expo EAS para build
- Gera APK/AAB sem precisar de ambiente local

### 2️⃣ **Expo EAS Cloud**
- Serviço de build na nuvem da Expo
- Gratuito para builds básicas
- Gera APK profissional
- Download direto via link

## ⚙️ **Configuração (Uma vez só)**

### Passo 1: Criar conta Expo (se não tiver)
```bash
# No seu computador ou qualquer lugar
npx expo register
```

### Passo 2: Gerar token Expo
1. Acesse: https://expo.dev/accounts/settings/access-tokens
2. Clique em "Create Token"
3. Nome: `GITHUB_ACTIONS_TOKEN`
4. Copie o token gerado

### Passo 3: Configurar GitHub Secret
1. Vá no seu repositório GitHub
2. Settings → Secrets and variables → Actions
3. Clique "New repository secret"
4. Name: `EXPO_TOKEN`
5. Value: cole o token do Expo
6. Clique "Add secret"

## 🚀 **Como Usar**

### Método 1: Push Automático
```bash
git add .
git commit -m "build: trigger automated APK build"
git push
```
✅ Build iniciará automaticamente após push!

### Método 2: Build Manual
1. Vá no GitHub → seu repositório
2. Actions → "Build APK - Corte de Matos App"
3. "Run workflow" → escolha tipo de build
4. Clique "Run workflow"

### Método 3: Pull Request
- Qualquer PR disparará build automaticamente
- Comentário automático com link do APK

## 📱 **Tipos de Build Disponíveis**

### 🧪 Preview (Padrão)
- APK otimizado para testes
- ~15-25 MB
- Tempo: ~5-10 minutos

### 🔧 Development  
- APK com debugging
- ~30-50 MB
- Logs detalhados

### 🚀 Production
- AAB para Google Play Store
- Otimizado e comprimido
- Pronto para produção

## 📊 **Monitoramento**

### GitHub Actions
- Status em tempo real no GitHub
- Logs detalhados de cada step
- Notificações por email

### Expo Dashboard
- https://expo.dev
- Histórico de builds
- Downloads de APK/AAB
- Análise de tamanho

## 💰 **Custos**

### GitHub Actions
- ✅ **Gratuito** para repositórios públicos
- ✅ 2000 minutos/mês para repositórios privados

### Expo EAS
- ✅ **Gratuito** para builds básicas
- 📊 Limitações: builds simultâneas e prioridade
- 💎 Planos pagos para uso intensivo

## 🎯 **Vantagens do Build Online**

### ✅ Sem dependências locais
- Não precisa instalar Android Studio
- Não precisa configurar ambiente
- Funciona mesmo com firewall/proxy

### ✅ Ambiente limpo
- Sempre atualizado
- Sem conflitos de versão
- Builds reproduzíveis

### ✅ Automação completa
- Build a cada push
- Testes automáticos
- Distribuição facilitada

### ✅ Colaboração
- Toda equipe pode fazer builds
- Histórico centralizado
- Sem "funciona na minha máquina"

## 📋 **Status da Configuração**

### ✅ Configurado
- [x] Workflow GitHub Actions criado
- [x] Jobs para Android configurados
- [x] Perfis de build (preview/dev/prod)
- [x] Comentários automáticos em PRs
- [x] Suporte a builds manuais

### ⏳ Próximos passos
1. [ ] Configurar token Expo no GitHub
2. [ ] Fazer primeiro push para testar
3. [ ] Baixar APK gerado
4. [ ] Testar em dispositivo

## 🔧 **Comandos para Ativar**

```bash
# 1. Adicionar workflow ao repositório
git add .github/workflows/build.yml

# 2. Commit
git commit -m "feat: GitHub Actions para build automático APK"

# 3. Push
git push

# 4. Ir no GitHub → Actions e configurar EXPO_TOKEN
```

## 🏆 **Resultado Final**

Após configurar, você terá:

### 🤖 **Build Automático**
- Push no GitHub → APK gerado automaticamente
- Email com status da build
- Download via Expo Dashboard

### 📱 **APK Profissional**
- Mesma qualidade de build local
- Assinado e otimizado
- Pronto para distribuição

### 🌐 **Acesso Universal**
- Funciona de qualquer lugar
- Qualquer pessoa autorizada pode buildar
- Sem dependência de máquina específica

**🎉 Agora você pode fazer builds profissionais sem sair do navegador!**
