# Aplicativo de Controle de Corte de Matos - Resumo

## Visão Geral

Este aplicativo foi desenvolvido para facilitar o controle e gerenciamento de atividades de corte de matos, permitindo importar planilhas de vãos, acompanhar o status de cada serviço e gerar relatórios em PDF.

## Arquivos Principais

- **App.js**: Componente principal da aplicação com toda a lógica de controle
- **app.json**: Configurações do Expo para o aplicativo
- **package.json**: Dependências e scripts do projeto
- **components/**: Componentes React Native reutilizáveis
- **services/**: Serviços para manipulação de dados e sincronização

## Funcionalidades Implementadas

1. **Importação de Planilhas**
   - Importa dados de planilhas Excel (.xlsx)
   - Normaliza dados de colunas mesmo com nomes diferentes
   - Valida a presença de colunas necessárias

2. **Gestão de Vãos**
   - Lista de vãos com status (pendente, iniciado, concluído)
   - Filtro de busca por descrição ou localização
   - Indicadores visuais de prazo (normal, urgente, atrasado)

3. **Controle de Progresso**
   - Estatísticas de vãos (total, pendentes, iniciados, concluídos)
   - Acompanhamento de datas (necessidade, início, conclusão)
   - Indicadores de prazos críticos

4. **Geração de Relatórios**
   - Relatórios em PDF com estatísticas
   - Detalhamento de todos os vãos cadastrados
   - Compartilhamento de relatórios

5. **Interface Intuitiva**
   - Design responsivo e intuitivo
   - Codificação por cores para status
   - Botões de ação contextuais

## Como Executar

1. Instale as dependências:
   ```
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```
   npx expo start
   ```

3. Use o Expo Go para visualizar no dispositivo móvel

## Próximos Passos

1. Implementar sincronização com serviço na nuvem
2. Adicionar suporte a fotos dos vãos
3. Melhorar o controle de usuários e permissões
4. Implementar relatórios personalizados
5. Adicionar backup automático dos dados

## Informações Técnicas

- **Framework**: React Native / Expo
- **Armazenamento**: AsyncStorage
- **Processamento de Dados**: XLSX para Excel
- **Documentação**: PDF via expo-print
- **UI Components**: React Native Elements
