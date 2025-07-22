<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Instructions for Corte de Matos App

Este é um projeto React Native/Expo para controle de corte de matos com as seguintes funcionalidades:

## Funcionalidades Principais
- **Importação de Planilhas**: Leitura de arquivos Excel (.xlsx) para cadastrar vãos de matos
- **Controle de Prazos**: Sistema de alertas para datas de necessidade próximas ou atrasadas
- **Controle de Status**: Sistema de cores para indicar status dos vãos:
  - Cinza: Pendente
  - Amarelo: Iniciado 
  - Verde: Concluído
- **Alertas Visuais**: Destaque automático para itens urgentes (🕐) e atrasados (⚠️)
- **Geração de Relatórios**: Criação de PDFs com progresso e detalhes
- **Compartilhamento**: Envio de relatórios via WhatsApp e outros apps

## Estrutura de Dados
Cada vão de mato contém:
- ID único
- Descrição
- Localização
- Área
- Data de necessidade (prazo para conclusão)
- Status (pendente/iniciado/concluido)
- Data de início
- Data de conclusão

## Tecnologias Utilizadas
- React Native com Expo
- react-native-elements para UI
- expo-document-picker para importar arquivos
- expo-print para gerar PDFs
- expo-sharing para compartilhamento
- xlsx para leitura de planilhas

## Padrões de Código
- Use componentes funcionais com hooks
- Mantenha estados locais no App.js principal
- Use estilos StyleSheet do React Native
- Implemente tratamento de erros com Alert
- Use ícones do MaterialIcons

## Fluxo de Trabalho
1. Usuário importa planilha Excel (com colunas: Descricao, Localizacao, Area, DataNecessidade)
2. Lista de vãos é exibida com status pendente
3. Sistema destaca automaticamente itens urgentes e atrasados
4. Usuário inicia vão (status muda para iniciado/amarelo)
5. Usuário finaliza vão (status muda para concluído/verde)
6. Relatório PDF pode ser gerado e compartilhado com informações de prazos
