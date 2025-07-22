# Corte de Matos App

Um aplicativo móvel desenvolvido em React Native/Expo para controle e gerenciamento de corte de matos.

## 📱 Funcionalidades

- **📊 Importação de Planilhas**: Importe arquivos Excel (.xlsx) para cadastrar os vãos de matos
- **📅 Controle de Prazos**: Defina datas de necessidade e receba alertas visuais
- **🎨 Controle Visual de Status**: 
  - 🔘 Cinza: Pendente
  - 🟡 Amarelo: Iniciado
  - 🟢 Verde: Concluído
- **⚠️ Alertas de Urgência**: Destaque automático para itens próximos do prazo ou atrasados
- **📄 Geração de Relatórios**: Crie relatórios em PDF com progresso detalhado
- **📱 Compartilhamento**: Compartilhe relatórios via WhatsApp e outros aplicativos
- **⏱️ Controle de Tempo**: Registre datas de início e conclusão automaticamente

## 🚀 Como Usar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- Expo CLI
- Android Studio (para teste em Android)

### Instalação

1. **Instale o Node.js**
   - Baixe em: https://nodejs.org/
   - Ou use o chocolatey: `choco install nodejs`
   - Ou use o winget: `winget install OpenJS.NodeJS`
   - Reinicie o terminal após a instalação

2. **Verifique a instalação**
```bash
node --version
npm --version
```

3. **Navegue até a pasta do projeto**
```bash
cd "C:\Users\0338138\Desktop\corte e poda"
```

4. **Instale as dependências**
```bash
npm install
```

5. **Instale o Expo CLI globalmente**
```bash
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
