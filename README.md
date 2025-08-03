# 🌿 Sistema de Controle de Corte de Matos

## 📱 Aplicativo Android - Versão 2.0

Um sistema inteligente e moderno para controle e gestão de corte de matos, desenvolvido em React Native com sincronização em tempo real via Firebase.

---

## 🎯 **Visão Geral**

O **Sistema de Controle de Corte de Matos** é uma solução completa para empresas que precisam gerenciar trabalhos de corte de vegetação em linhas de transmissão, rodovias, ou outras áreas. O aplicativo oferece controle total sobre prazos, status dos trabalhos e sincronização entre múltiplos dispositivos.

### ✨ **Principais Características**

- **� Sistema de Login Seguro** - Dois níveis de acesso (Admin/Operador)
- **☁️ Sincronização em Tempo Real** - Firebase REST API
- **📊 Dashboard Inteligente** - Estatísticas e progresso visual
- **📅 Controle de Prazos** - Alertas automáticos para vencimentos
- **� Importação de Planilhas** - Suporte a Excel/CSV
- **📱 Interface Moderna** - Design responsivo e intuitivo
- **🌐 Multi-dispositivo** - Trabalhe em qualquer lugar

---

## 🚀 **Recursos Principais**

### 🔐 **Sistema de Autenticação**
- **Administrador**: `admin` / `eletro1234`
  - Acesso completo ao sistema
  - Importação de dados
  - Geração de relatórios
  - Controle total dos usuários
  
- **Operador**: `usuario` / `esul1234`
  - Visualização de tarefas pendentes/iniciadas
  - Atualização de status
  - Sincronização automática

### 📊 **Dashboard Avançado**
- **Estatísticas em Tempo Real**:
  - ⏳ Vãos Pendentes
  - ⚡ Em Andamento
  - ✅ Concluídos
  - 📈 Progresso Geral

- **Alertas Visuais**:
  - � **Atrasados** - Vãos com prazo vencido
  - 🟡 **Urgentes** - Vencimento em até 3 dias
  - 🟢 **No Prazo** - Situação normal

### 🔄 **Sincronização Firebase**
- **Automática**: A cada 30 segundos
- **Manual**: Botão de sincronização
- **Bidirecional**: Upload e download de dados
- **Multi-dispositivo**: Trabalhe em equipe
- **Offline**: Funciona sem internet

### 📁 **Importação de Dados**
Suporte a planilhas Excel/CSV com as colunas:
- `Descricao` - Descrição do vão
- `Localizacao` - Local do trabalho
- `Area` - Área em m²
- `DataNecessidade` - Prazo (DD/MM/AAAA)

---

## 🛠 **Tecnologias Utilizadas**

### 📱 **Frontend**
- **React Native** - Framework principal
- **Expo SDK 53** - Plataforma de desenvolvimento
- **React Hooks** - Gerenciamento de estado
- **StyleSheet** - Estilização nativa

### ☁️ **Backend & Sincronização**
- **Firebase Firestore** - Banco de dados em tempo real
- **Firebase Auth** - Autenticação anônima
- **REST API** - Comunicação HTTP
- **AsyncStorage** - Armazenamento local

### 📚 **Bibliotecas Principais**
- `expo-document-picker` - Seleção de arquivos
- `expo-print` - Geração de PDFs
- `expo-sharing` - Compartilhamento
- `xlsx` - Processamento de planilhas
- `react-native-elements` - Componentes UI
- `@expo/vector-icons` - Ícones

---

## � **Instalação do APK**

### 📋 **Pré-requisitos**
- Android 5.0+ (API Level 21)
- 100MB de espaço livre
- Conexão com internet (para sincronização)

### 📥 **Download e Instalação**

1. **Baixe o APK**:
   ```
   Tamanho: ~75MB
   Versão: 2.0
   Build: app-release.apk
   ```

2. **Habilite "Fontes Desconhecidas"**:
   - Vá em `Configurações > Segurança`
   - Ative `Instalar apps de fontes desconhecidas`

3. **Instale o APK**:
   - Toque no arquivo baixado
   - Confirme a instalação
   - Aguarde o processo concluir

### 🚀 **Primeiro Uso**

1. **Abra o aplicativo**
2. **Faça login**:
   - Admin: `admin` / `eletro1234`
   - Usuário: `usuario` / `esul1234`
3. **Configure a sincronização**
4. **Importe seus dados** (Admin)
5. **Comece a trabalhar!**

---

## 📋 **Manual de Uso**

### 👨‍💼 **Modo Administrador**

#### 📁 **Importação de Dados**
1. Prepare sua planilha Excel com as colunas obrigatórias
2. Toque em **"Importar CSV/Excel"**
3. Selecione o arquivo
4. Aguarde o processamento
5. Dados serão sincronizados automaticamente

#### 📊 **Geração de Relatórios**
1. Toque em **"Relatório"**
2. PDF será gerado automaticamente
3. Compartilhe via WhatsApp, Email, etc.

#### 🗑️ **Limpeza de Dados**
1. Toque em **"Limpar Dados"**
2. Confirme a ação
3. Todos os dados importados serão removidos

### 👤 **Modo Operador**

#### ▶️ **Iniciar Trabalho**
1. Visualize a lista de vãos pendentes
2. Toque em **"▶️ Iniciar"**
3. Status mudará para "EM ANDAMENTO"
4. Dados sincronizam automaticamente

#### ✅ **Concluir Trabalho**
1. Em vãos "EM ANDAMENTO"
2. Toque em **"✅ Concluir"**
3. Status mudará para "CONCLUÍDO"
4. Vão sairá da lista do operador

### 🔄 **Sincronização**

#### **Automática**
- Ativa por padrão
- Intervalo: 30 segundos
- Indicador visual no header
- Notificações de mudanças

#### **Manual**
- Botão "🔄 Sync" no header
- Toque para forçar sincronização
- Indicador de progresso
- Mensagem de confirmação

---

## 🎨 **Interface do Usuário**

### 🎭 **Temas e Cores**
- **Verde Principal**: `#1B5E20` - Header e elementos principais
- **Verde Claro**: `#4CAF50` - Botões de ação e progresso
- **Laranja**: `#FF9800` - Status "Em Andamento" e urgentes
- **Vermelho**: `#F44336` - Alertas e itens atrasados
- **Cinza**: `#9E9E9E` - Itens pendentes

### 📱 **Componentes Visuais**
- **Cards Modernos** - Layout limpo e organizado
- **Gradientes** - Visual atrativo
- **Ícones Intuitivos** - Fácil compreensão
- **Animações Suaves** - Experiência fluida
- **Indicadores Visuais** - Status claros

### 🚨 **Sistema de Alertas**
- **⚠️ Atrasado** - Fundo vermelho, borda vermelha
- **🕐 Urgente** - Fundo laranja, prazo ≤ 3 dias
- **📅 Normal** - Sem destaque especial
- **✅ Concluído** - Fundo verde, confirmação visual

---

## 🔧 **Configuração de Desenvolvimento**

### 📋 **Pré-requisitos de Dev**
- Node.js 18+
- Expo CLI
- Android Studio (para emulador)
- Git

### 🛠 **Setup Local**
```bash
# Clone o repositório
git clone https://github.com/pikulitomarkin/corte-poda.git

# Entre no diretório
cd corte-poda

# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npx expo start

# Para compilar APK local
cd android
./gradlew assembleRelease
```

### 📁 **Estrutura do Projeto**
```
corte-poda/
├── App.js                  # Componente principal
├── services/
│   └── FirebaseRestAPI.js  # API Firebase
├── android/                # Configurações Android
├── assets/                 # Imagens e ícones
├── app.json               # Configuração Expo
├── package.json           # Dependências
└── README.md              # Este arquivo
```

---

## 🔄 **Sistema de Sincronização**

### 🌐 **Firebase Integration**
- **Projeto**: `corte-matos-sync`
- **Database**: Firestore
- **Auth**: Anônima (automática)
- **REST API**: Compatible com APK

### 🔀 **Fluxo de Dados**
1. **Local → Firebase**: Upload de mudanças
2. **Firebase → Local**: Download de atualizações
3. **Merge Inteligente**: Resolve conflitos
4. **Validação**: IDs únicos garantidos
5. **Notificação**: Usuário informado

### 🛡️ **Proteção de Dados**
- **IDs Únicos**: Sistema robusto anti-duplicação
- **Validação**: Entrada e saída de dados
- **Backup Local**: AsyncStorage como fallback
- **Retry Logic**: Tentativas automáticas
- **Error Handling**: Tratamento de erros

---

## 📱 **Compatibilidade**

### 🤖 **Android**
- **Mínimo**: Android 5.0 (API 21)
- **Recomendado**: Android 8.0+ (API 26)
- **Arquitetura**: ARM64, ARM32
- **RAM**: Mínimo 2GB

### 📶 **Conectividade**
- **Online**: Sincronização completa
- **Offline**: Funcionalidade básica mantida
- **3G/4G/5G/WiFi**: Compatível
- **Dados Móveis**: Otimizado, baixo consumo

### 🔋 **Performance**
- **Tamanho APK**: ~75MB
- **RAM Usage**: ~150MB
- **CPU**: Otimizado para dispositivos básicos
- **Bateria**: Eficiência energética

---

## 🐛 **Solução de Problemas**

### ❌ **Problemas Comuns**

#### **"Erro de IDs Duplicados"**
- **Causa**: Importação rápida de dados
- **Solução**: Sistema auto-corrige automaticamente
- **Prevenção**: Aguarde sync antes de nova importação

#### **"Falha na Sincronização"**
- **Causa**: Conexão instável
- **Solução**: Verifique internet, tente novamente
- **Fallback**: Dados salvos localmente

#### **"Login não funciona"**
- **Causa**: Credenciais incorretas
- **Solução**: Use as credenciais corretas listadas
- **Reset**: Reinstale o app se necessário

### 🔧 **Logs e Debug**
```javascript
// Ver logs no console do dispositivo
console.log("🔄 Debug info");

// Limpar cache local
AsyncStorage.clear();

// Resetar sincronização
// Toque 5x no logo para debug mode
```

---

## 📈 **Roadmap e Atualizações**

### 🎯 **Versão Atual (2.0)**
- ✅ Sistema de login
- ✅ Sincronização Firebase
- ✅ Importação Excel/CSV
- ✅ Dashboard completo
- ✅ Controle de prazos
- ✅ Multi-dispositivo

### 🚀 **Próximas Versões**
- **v2.1**: Notificações push
- **v2.2**: Backup automático
- **v2.3**: Relatórios avançados
- **v2.4**: Geolocalização
- **v3.0**: Modo offline completo

### 🐛 **Correções Recentes**
- ✅ IDs duplicados corrigidos
- ✅ Merge inteligente implementado
- ✅ Performance otimizada
- ✅ UI/UX melhorada

---

## 👥 **Suporte e Contribuição**

### 📞 **Contato**
- **Desenvolvedor**: Sistema de Corte de Matos
- **Email**: suporte@cortematos.com
- **GitHub**: https://github.com/pikulitomarkin/corte-poda

### 🤝 **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### 🐞 **Reportar Bugs**
- Use o GitHub Issues
- Descreva o problema detalhadamente
- Inclua screenshots se possível
- Mencione versão do Android

---

## 📄 **Licença**

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🏆 **Créditos**

Desenvolvido com ❤️ por **Marcos Padilha Piloto e Claude Sonnet 4 Copiloto**

### 🛠 **Tecnologias e Agradecimentos**
- React Native Team
- Expo Team  
- Firebase Team
- Community Contributors

---

**📱 Versão do APK: 2.0 | 🗓 Última Atualização: Agosto 2025**
npm install -g @expo/cli
```

6. **Inicie o projeto**
```bash
npm start
```

### Executar no Android
```bash
npm run android
```

## 📋 Estrutura da Planilha

Para importar dados, sua planilha Excel deve conter as seguintes colunas:

| Coluna | Descrição | Obrigatório |
|--------|-----------|-------------|
| Descricao | Descrição do vão de mato | Sim |
| Localizacao | Localização do vão | Não |
| Area | Área do terreno | Não |
| DataNecessidade | Data limite para conclusão (DD/MM/AAAA) | Não |

### Exemplo de Planilha:
```
Descricao          | Localizacao        | Area    | DataNecessidade
Vão 1 - Entrada    | Portão Principal   | 100m²   | 15/08/2025
Vão 2 - Lateral    | Lado Esquerdo      | 150m²   | 20/08/2025
Vão 3 - Fundos     | Área dos Fundos    | 200m²   | 25/08/2025
```

### Alertas Visuais:
- **🕐 URGENTE**: Vãos que precisam ser concluídos nos próximos 7 dias (fundo amarelo claro)
- **⚠️ ATRASADO**: Vãos que já passaram da data de necessidade (fundo vermelho claro)

## 🛠️ Tecnologias Utilizadas

- **React Native**: Framework principal
- **Expo**: Plataforma de desenvolvimento
- **React Native Elements**: Componentes de UI
- **XLSX**: Leitura de planilhas Excel
- **Expo Print**: Geração de PDFs
- **Expo Sharing**: Compartilhamento de arquivos
- **Expo Document Picker**: Seleção de arquivos

## 📱 Fluxo de Uso

1. **Importar Planilha**: Toque em "Importar Planilha" e selecione seu arquivo Excel
2. **Visualizar Lista**: Veja todos os vãos importados com status pendente
3. **Verificar Prazos**: Observe os alertas visuais (🕐 urgente, ⚠️ atrasado)
4. **Iniciar Trabalho**: Toque em "Iniciar" para começar o corte (status fica amarelo)
5. **Finalizar Trabalho**: Toque em "Finalizar" quando concluir (status fica verde)
6. **Gerar Relatório**: Toque em "Gerar Relatório" para criar PDF
7. **Compartilhar**: Use o botão de compartilhamento para enviar via WhatsApp

## 📊 Relatório

O relatório PDF inclui:
- Resumo geral (total, concluídos, pendentes, progresso %)
- Lista detalhada de todos os vãos
- Status de cada item
- Datas de início e conclusão
- Data de geração do relatório

## 🎨 Interface

- **Header verde**: Identidade visual do app
- **Barra de progresso**: Mostra andamento geral
- **Lista organizada**: Cards com informações claras
- **Botões de ação**: Cores intuitivas (amarelo para iniciar, verde para finalizar)
- **Ícones**: Interface amigável com ícones Material Design

## 📦 Build para Android

Para gerar um APK:

```bash
expo build:android
```

## 🔧 Desenvolvimento

### Estrutura do Projeto
```
corte-matos-app/
├── App.js                 # Componente principal
├── app.json              # Configurações do Expo
├── package.json          # Dependências
├── babel.config.js       # Configuração Babel
├── assets/               # Imagens e ícones
└── .github/              # Documentação
```

### Principais Componentes
- **App.js**: Lógica principal e interface
- **Importação**: Leitura e processamento de planilhas
- **Lista de Vãos**: Exibição e controle de status
- **Geração de PDF**: Criação de relatórios
- **Compartilhamento**: Integração com apps nativos

## 📄 Licença

MIT License - Veja o arquivo LICENSE para detalhes.

## 🤝 Suporte

Para suporte ou dúvidas sobre o aplicativo, entre em contato com a equipe de desenvolvimento.
