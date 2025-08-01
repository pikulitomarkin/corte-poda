# Sistema de Sincronização em Tempo Real 🔄

## Funcionalidade Implementada

O app agora possui **sincronização em tempo real** via WebSocket para que todos os dispositivos conectados vejam as mudanças instantaneamente.

### Características

- **⚡ Tempo Real**: Mudanças aparecem instantaneamente em todos os dispositivos
- **🔗 WebSocket**: Conexão persistente para comunicação bidirecional  
- **👥 Multi-Usuário**: Vários usuários podem trabalhar simultaneamente
- **🔄 Auto-Sync**: Sincronização automática quando volta online
- **📡 Status Visual**: Indicadores de conexão e usuários online

## Servidor WebSocket

### Funcionalidades do Servidor
- **Gerenciamento de sessões** de usuários conectados
- **Broadcast de mudanças** para todos os clients
- **Store em memória** dos dados (preparado para banco de dados)
- **Logs detalhados** de todas as ações
- **Graceful shutdown** e reconexão automática

### Arquivo: `websocket-server.js`
```bash
# Para iniciar o servidor
node websocket-server.js

# Servidor roda na porta 8080
# URL: ws://localhost:8080
```

### Dados Sincronizados
- ✅ **Status de vãos** (pendente → iniciado → concluído)
- ✅ **Fotos adicionadas** (URLs e metadados)
- ✅ **Localizações marcadas** (GPS e endereços)
- ✅ **Novos vãos** criados
- ✅ **Importação de planilhas** (dados completos)
- ✅ **Limpeza de dados** (reset completo)

## Interface do Cliente

### Indicadores Visuais
```
┌─────────────────────────────────────┐
│ Corte de Matos    [🌐][👥3][🔄][×] │
│ usuario - Operador                  │
└─────────────────────────────────────┘
```

- **🌐**: Status de conexão (verde=online, vermelho=offline)
- **👥3**: Usuários conectados (mostra quantidade)
- **🔄**: Status de sincronização WebSocket
- **×**: Logout

### Estados de Conexão WebSocket

#### ✅ **Conectado**
- **Indicador**: 🔗 Verde
- **Comportamento**: Mudanças em tempo real
- **Lista de usuários**: Atualizada em tempo real

#### ❌ **Desconectado**  
- **Indicador**: 🔗 Vermelho
- **Comportamento**: Modo offline + queue
- **Reconexão**: Automática a cada 5 segundos

#### 🔄 **Reconectando**
- **Indicador**: 🔄 Amarelo
- **Comportamento**: Tentando restabelecer conexão
- **Timeout**: 10 segundos por tentativa

## Fluxo de Sincronização

### 1. **Ação Local** → **Broadcast Global**
```
Usuário A marca localização → Servidor WebSocket → Todos os dispositivos
→ Atualização instantânea nas telas de todos os usuários
```

### 2. **Multi-Usuário Simultâneo**
```
Admin importa planilha → Broadcast → Usuários veem novos vãos instantaneamente
Usuário 1 inicia vão → Broadcast → Admin vê status atualizado em tempo real
Usuário 2 finaliza vão → Broadcast → Vão desaparece da lista do Usuário 1
```

### 3. **Reconexão Automática**
```
Perde conexão → Mode offline + queue → Reconecta → Sync queue → Recebe updates
```

## Mensagens WebSocket

### Cliente → Servidor

#### Login do Usuário
```javascript
{
  type: 'USER_LOGIN',
  data: { username: 'usuario', userType: 'operador' }
}
```

#### Atualização de Status
```javascript
{
  type: 'UPDATE_STATUS',
  data: { vaoId: 123, status: 'iniciado', timestamp: '...', user: 'usuario' }
}
```

#### Adição de Foto
```javascript
{
  type: 'ADD_PHOTO',
  data: { vaoId: 123, photoUri: 'file://...', timestamp: '...', user: 'usuario' }
}
```

### Servidor → Cliente

#### Usuário Online
```javascript
{
  type: 'USER_ONLINE',
  data: { username: 'usuario', userType: 'operador' },
  timestamp: '2025-08-01T15:30:00.000Z'
}
```

#### Status Atualizado
```javascript
{
  type: 'STATUS_UPDATED',
  data: { vao: {...}, updatedBy: 'usuario' },
  timestamp: '2025-08-01T15:30:00.000Z'
}
```

#### Dados Importados
```javascript
{
  type: 'DATA_IMPORTED',
  data: { matos: [...], action: 'replace', count: 50, importedBy: 'admin' }
}
```

## Benefícios

### Para Operadores:
- ✅ **Visibilidade em tempo real** do que outros estão fazendo
- ✅ **Evita conflitos** - vê quando alguém já está trabalhando em um vão
- ✅ **Colaboração** - mudanças aparecem instantaneamente
- ✅ **Atualização automática** - não precisa recarregar nada

### Para Administradores:
- ✅ **Monitoramento em tempo real** de toda a equipe
- ✅ **Visibilidade instantânea** de progresso e mudanças
- ✅ **Coordenação** - pode ver quem está onde fazendo o quê
- ✅ **Dados sempre atualizados** sem delay

### Para o Projeto:
- ✅ **Colaboração eficiente** entre equipes
- ✅ **Dados consistentes** em todos os dispositivos
- ✅ **Produtividade** - sem espera por sincronização
- ✅ **Transparência total** do andamento

## Casos de Uso

### 1. **Coordenação de Equipe**
```
Admin vê que Usuário A está em um vão → Direciona Usuário B para outro vão
→ Evita trabalho duplicado → Otimiza distribuição de tarefas
```

### 2. **Acompanhamento em Tempo Real**
```
Usuário inicia vão → Admin vê instantaneamente → Monitora progresso
→ Usuário adiciona fotos → Admin vê evidências em tempo real
```

### 3. **Importação Colaborativa**
```
Admin importa 100 vãos → Todos os usuários veem instantaneamente
→ Começam a trabalhar imediatamente → Progresso sincronizado
```

### 4. **Trabalho Simultâneo**
```
3 usuários trabalhando → Cada um em vãos diferentes
→ Mudanças aparecem em tempo real para todos
→ Admin acompanha progresso geral instantaneamente
```

## Implementação Técnica

### Servidor (Node.js + WebSocket)
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Store em memória
let appData = {
  matos: [],
  users: new Map(),
  sessions: new Map()
};

// Broadcast para todos os clients
function broadcast(data, excludeSessionId) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
```

### Cliente (React Native)
```javascript
// Estado WebSocket
const [wsConnected, setWsConnected] = useState(false);
const [connectedUsers, setConnectedUsers] = useState([]);
const [wsInstance, setWsInstance] = useState(null);

// Conexão WebSocket
const connectWebSocket = () => {
  const ws = new WebSocket('ws://localhost:8080');
  
  ws.onopen = () => {
    setWsConnected(true);
    // Enviar login
    ws.send(JSON.stringify({
      type: 'USER_LOGIN',
      data: { username, userType: username === 'admin' ? 'admin' : 'operador' }
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWebSocketMessage(data);
  };
};
```

## Configuração e Deploy

### Desenvolvimento Local
```bash
# 1. Instalar dependências
npm install ws

# 2. Iniciar servidor WebSocket
node websocket-server.js

# 3. Iniciar app React Native
npm start

# 4. O app conecta automaticamente em ws://localhost:8080
```

### Produção
```bash
# Deploy do servidor WebSocket (exemplo Heroku)
# 1. Criar Procfile: web: node websocket-server.js
# 2. Deploy: git push heroku main  
# 3. Configurar URL no app: wss://myapp.herokuapp.com

# Deploy do app React Native
# 1. Build: expo build:android / expo build:ios
# 2. Configurar URL de produção do WebSocket
```

### Variáveis de Ambiente
```javascript
// websocket-server.js
const PORT = process.env.PORT || 8080;

// App.js  
const WS_URL = __DEV__ ? 'ws://localhost:8080' : 'wss://myapp.herokuapp.com';
```

## Expansões Futuras

### 1. **Autenticação JWT**
- Token-based authentication
- Sessões seguras
- Autorização por roles

### 2. **Persistência em Banco**
- MongoDB/PostgreSQL
- Backup automático
- Histórico de mudanças

### 3. **Notificações Push Avançadas**
- Notificações personalizadas por usuário
- Alertas de ações específicas
- Sistema de mentions (@usuario)

### 4. **Chat Integrado**
- Comunicação entre usuários
- Comentários em vãos
- Histórico de conversas

### 5. **Analytics em Tempo Real**
- Dashboard de métricas ao vivo
- Performance por usuário
- Estatísticas de colaboração

Esta funcionalidade transforma o app em uma **plataforma colaborativa em tempo real**! 🔄⚡👥
