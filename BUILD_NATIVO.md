# 📱 BUILD NATIVO - Corte de Matos App

Este guia mostra como gerar builds nativas (APK/AAB) do aplicativo para testes mais precisos e distribuição.

## 🛠️ Pré-requisitos

1. **Node.js** instalado (versão 16 ou superior)
2. **Expo CLI** atualizado
3. **Conta Expo** (gratuita)
4. **EAS CLI** para builds modernas

## 🚀 Processo de Build

### Método 1: Script Automático (Recomendado)

```bash
# Execute o script
build-nativo.bat
```

O script fará:
- ✅ Instalação das dependências
- ✅ Instalação do EAS CLI
- ✅ Opções de build interativas
- ✅ Download automático do APK/AAB

### Método 2: Manual

#### 1. Instalar dependências
```bash
npm install
npm install -g @expo/eas-cli
```

#### 2. Login no Expo
```bash
eas login
```

#### 3. Configurar projeto (primeira vez)
```bash
eas build:configure
```

#### 4. Gerar build
```bash
# APK para testes (recomendado)
eas build --platform android --profile preview

# APK com debugging
eas build --platform android --profile development

# AAB para Google Play Store
eas build --platform android --profile production

# Build para iOS (requer conta Apple Developer)
eas build --platform ios --profile preview
```

## 📋 Tipos de Build

### 🧪 Preview APK
- **Uso**: Testes rápidos em dispositivos
- **Tamanho**: ~15-25 MB
- **Debug**: Não
- **Tempo**: ~5-10 minutos

### 🔧 Development APK  
- **Uso**: Desenvolvimento e debug
- **Tamanho**: ~30-50 MB
- **Debug**: Sim
- **Tempo**: ~10-15 minutos

### 🚀 Production AAB
- **Uso**: Google Play Store
- **Tamanho**: Otimizado
- **Debug**: Não
- **Tempo**: ~15-20 minutos

## 📲 Instalação no Dispositivo

### Android APK
1. Baixe o APK do link fornecido
2. Habilite "Fontes desconhecidas" no Android
3. Instale o arquivo APK
4. Execute o app

### iOS IPA
1. Baixe o IPA do link fornecido
2. Use TestFlight ou instalação via Xcode
3. Confie no certificado de desenvolvedor
4. Execute o app

## 🆚 Diferenças vs Expo Go

| Recurso | Expo Go | Build Nativo |
|---------|---------|--------------|
| Performance | Boa | Excelente |
| APIs nativas | Limitadas | Completas |
| Tamanho | N/A | Otimizado |
| Distribuição | Não | Sim |
| Stores | Não | Sim |

## 🔧 Solução de Problemas

### ❌ Erro de autenticação
```bash
eas logout
eas login
```

### ❌ Build falhando
```bash
# Limpar cache
expo r -c
npm install
```

### ❌ Dependências não encontradas
```bash
# Reinstalar dependências
rm -rf node_modules
npm install
```

## 📱 Teste no Dispositivo

1. **Instale o APK** gerado
2. **Teste todas as funcionalidades**:
   - ✅ Login (Usuario/esul1234, Admin/eletro2025)
   - ✅ Lista de vãos de mato
   - ✅ Alteração de status (Cinza → Amarelo → Verde)
   - ✅ Alertas de prazo (🕐 urgente, ⚠️ atrasado)
   - ✅ Importação simulada de dados
   - ✅ Geração de relatório
   - ✅ Compartilhamento via WhatsApp

## 📊 Status do Build

### ✅ Configurado
- [x] package.json com dependências nativas
- [x] app.json para Android/iOS
- [x] eas.json com perfis de build
- [x] App-build-nativo.js como main
- [x] Scripts de automação

### 🔄 Próximos passos
- [ ] **Opção A**: Build Local (requer rede sem restrições)
  - [ ] Executar primeiro build local
- [ ] **Opção B**: Build Online (recomendado) 
  - [ ] Configurar GitHub Actions (arquivo já criado)
  - [ ] Configurar token EXPO_TOKEN no GitHub
  - [ ] Fazer push para build automático
- [ ] Testar APK em dispositivo
- [ ] Ajustar configurações se necessário
- [ ] Gerar build de produção

## 📞 Suporte

### 🌐 Build Online (Recomendado)
Veja o arquivo `BUILD_ONLINE_GITHUB.md` para configurar builds automáticos via GitHub Actions.

### 🔧 Build Local
Se encontrar problemas no build local:
1. Verifique a documentação do Expo EAS
2. Execute `eas build --help` para opções
3. Consulte logs detalhados no dashboard Expo

### ⚡ Comando Rápido para Build Online
```bash
setup-build-online.bat
```
