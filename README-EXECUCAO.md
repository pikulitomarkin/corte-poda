# Aplicativo de Controle de Corte de Matos

Este aplicativo foi desenvolvido para controlar e gerenciar as atividades de corte de matos, permitindo o registro, acompanhamento e geração de relatórios das operações realizadas.

## Funcionalidades

- **Importação de Dados**: Importação de planilhas Excel com informações dos vãos a serem cortados
- **Gestão de Status**: Controle do status de cada vão (pendente, iniciado, concluído)
- **Acompanhamento de Prazos**: Identificação visual de vãos com prazos urgentes ou atrasados
- **Geração de Relatórios**: Criação de relatórios em PDF com estatísticas e detalhes das atividades
- **Funcionamento Offline**: Armazenamento local de dados para uso sem conexão com internet

## Tecnologias Utilizadas

- React Native
- Expo
- JavaScript
- AsyncStorage para armazenamento local
- Bibliotecas como XLSX, expo-document-picker, expo-print e expo-sharing

## Como Executar o Projeto

### Pré-requisitos

- Node.js instalado
- Expo CLI instalado (`npm install -g expo-cli`)
- Expo Go app instalado no dispositivo móvel (para testes)

### Passos para Execução

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/corte-matos-app.git
   ```

2. Instale as dependências:
   ```
   cd corte-matos-app
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```
   npx expo start
   ```

4. Escaneie o QR code com o aplicativo Expo Go no seu dispositivo móvel

Alternativamente, você pode executar o script `iniciar-app.bat` no Windows para iniciar o aplicativo automaticamente.

## Estrutura do Projeto

- `/assets` - Imagens e recursos estáticos
- `/components` - Componentes React reutilizáveis
- `/services` - Serviços para manipulação de dados e sincronização
- `App.js` - Componente principal do aplicativo
- `app.json` - Configurações do Expo

## Compilação para Android

Para compilar o APK para Android:

1. Configure o arquivo `eas.json` conforme necessário
2. Execute o comando:
   ```
   npx eas build -p android --profile preview
   ```

## Usuários Padrão

- **Usuário**: usuario / esul1234
- **Administrador**: admin / eletro1234

## Suporte

Para problemas ou sugestões, abra uma issue no repositório do GitHub ou entre em contato com a equipe de desenvolvimento.

---

Desenvolvido para facilitar o controle e gestão de operações de corte de matos. © 2024
