const WebSocket = require('ws');
const http = require('http');

// Criar servidor HTTP simples
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store para dados em memória (em produção usar banco de dados)
let appData = {
  matos: [],
  users: new Map(), // userId -> {username, type, lastSeen}
  sessions: new Map() // sessionId -> {ws, userId, username}
};

// Função para broadcast para todos os clients conectados
function broadcast(data, excludeSessionId = null) {
  const message = JSON.stringify(data);
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      // Pegar session ID do client
      const sessionId = [...appData.sessions.entries()]
        .find(([id, session]) => session.ws === client)?.[0];
      
      // Enviar para todos exceto o remetente
      if (sessionId !== excludeSessionId) {
        client.send(message);
      }
    }
  });
}

// Função para enviar dados para um client específico
function sendToClient(ws, type, data, user = 'servidor') {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ 
      type, 
      data, 
      user, 
      timestamp: new Date().toISOString() 
    }));
  }
}

// Conectão WebSocket
wss.on('connection', (ws, req) => {
  const sessionId = Date.now() + Math.random();
  console.log(`🔗 Nova conexão: ${sessionId}`);
  
  // Enviar dados iniciais (usar a estrutura correta)
  sendToClient(ws, 'INITIAL_DATA', appData.matos, 'servidor');
  
  // Enviar lista de usuários conectados
  sendToClient(ws, 'users_update', Array.from(appData.users.values()), 'servidor');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`📨 Mensagem recebida:`, data.type, `de ${data.user || 'unknown'}`);
      
      switch (data.type) {
        case 'USER_LOGIN':
          handleUserLogin(sessionId, ws, data);
          break;
          
        case 'USER_LOGOUT':
          handleUserLogout(sessionId, data);
          break;
          
        case 'UPDATE_STATUS':
          handleUpdateStatus(sessionId, data);
          break;
          
        case 'ADD_PHOTO':
          handleAddPhoto(sessionId, data);
          break;
          
        case 'UPDATE_LOCATION':
          handleUpdateLocation(sessionId, data);
          break;
          
        case 'ADD_VAO':
          handleAddVao(sessionId, data);
          break;
          
        case 'IMPORT_DATA':
          handleImportData(sessionId, data);
          break;
          
        case 'CLEAR_DATA':
          handleClearData(sessionId, data);
          break;
          
        case 'SYNC_REQUEST':
          handleSyncRequest(sessionId, ws, data);
          break;
          
        default:
          console.log('❓ Tipo de mensagem não reconhecido:', data.type);
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  });

  ws.on('close', () => {
    console.log(`🔌 Conexão fechada: ${sessionId}`);
    handleDisconnection(sessionId);
  });

  ws.on('error', (error) => {
    console.error('❌ Erro WebSocket:', error);
  });
});

// Handlers para diferentes tipos de ação
function handleUserLogin(sessionId, ws, data) {
  const { username, userType } = data.data;
  
  // Registrar sessão
  appData.sessions.set(sessionId, {
    ws,
    userId: username,
    username,
    userType,
    loginTime: new Date().toISOString()
  });
  
  // Registrar usuário
  appData.users.set(username, {
    username,
    type: userType,
    lastSeen: new Date().toISOString(),
    sessionId
  });
  
  // Notificar outros usuários
  broadcast({
    type: 'USER_ONLINE',
    data: { username, userType },
    timestamp: new Date().toISOString()
  }, sessionId);
  
  console.log(`👤 Usuário ${username} (${userType}) conectado`);
}

function handleUserLogout(sessionId, data) {
  const session = appData.sessions.get(sessionId);
  if (session) {
    const { username } = session;
    
    // Remover da lista de usuários ativos
    appData.users.delete(username);
    appData.sessions.delete(sessionId);
    
    // Notificar outros usuários
    broadcast({
      type: 'USER_OFFLINE',
      data: { username },
      timestamp: new Date().toISOString()
    }, sessionId);
    
    console.log(`👤 Usuário ${username} desconectado`);
  }
}

function handleUpdateStatus(sessionId, data) {
  const { vaoId, status, timestamp, user } = data.data;
  
  // Encontrar e atualizar vão
  const vaoIndex = appData.matos.findIndex(v => v.id === vaoId);
  if (vaoIndex !== -1) {
    const vao = appData.matos[vaoIndex];
    
    // Atualizar status
    vao.status = status;
    
    // Atualizar campos baseado no status
    if (status === 'iniciado' && !vao.dataHoraInicio) {
      vao.dataHoraInicio = timestamp;
      vao.iniciadoPor = user;
      vao.dataInicio = new Date().toISOString().split('T')[0];
    } else if (status === 'concluido' && !vao.dataHoraConclusao) {
      vao.dataHoraConclusao = timestamp;
      vao.finalizadoPor = user;
      vao.dataConclusao = new Date().toISOString().split('T')[0];
    }
    
    // Broadcast para todos os outros clients
    broadcast({
      type: 'STATUS_UPDATED',
      data: { vao: appData.matos[vaoIndex], updatedBy: user },
      timestamp: new Date().toISOString()
    }, sessionId);
    
    console.log(`🔄 Status do vão ${vaoId} atualizado para ${status} por ${user}`);
  }
}

function handleAddPhoto(sessionId, data) {
  const { vaoId, photoUri, timestamp, user } = data.data;
  
  // Encontrar vão
  const vaoIndex = appData.matos.findIndex(v => v.id === vaoId);
  if (vaoIndex !== -1) {
    const vao = appData.matos[vaoIndex];
    
    // Adicionar foto
    if (!vao.fotos) vao.fotos = [];
    vao.fotos.push(photoUri);
    
    // Broadcast para outros clients
    broadcast({
      type: 'PHOTO_ADDED',
      data: { vaoId, photoUri, vao, addedBy: user },
      timestamp: new Date().toISOString()
    }, sessionId);
    
    console.log(`📸 Foto adicionada ao vão ${vaoId} por ${user}`);
  }
}

function handleUpdateLocation(sessionId, data) {
  const { vaoId, coordinates, address, timestamp, user } = data.data;
  
  // Encontrar vão
  const vaoIndex = appData.matos.findIndex(v => v.id === vaoId);
  if (vaoIndex !== -1) {
    const vao = appData.matos[vaoIndex];
    
    // Atualizar localização
    vao.coordenadas = coordinates;
    vao.localizacao = address;
    
    // Broadcast para outros clients
    broadcast({
      type: 'LOCATION_UPDATED',
      data: { vaoId, coordinates, address, vao, updatedBy: user },
      timestamp: new Date().toISOString()
    }, sessionId);
    
    console.log(`📍 Localização do vão ${vaoId} atualizada por ${user}`);
  }
}

function handleAddVao(sessionId, data) {
  const { vao, user } = data.data;
  
  // Adicionar vão
  appData.matos.push(vao);
  
  // Broadcast para outros clients
  broadcast({
    type: 'VAO_ADDED',
    data: { vao, addedBy: user },
    timestamp: new Date().toISOString()
  }, sessionId);
  
  console.log(`➕ Novo vão adicionado: ${vao.descricao} por ${user}`);
}

function handleImportData(sessionId, data) {
  const { vaos, user, action } = data.data; // action: 'add' ou 'replace'
  
  if (action === 'replace') {
    appData.matos = vaos;
  } else {
    appData.matos.push(...vaos);
  }
  
  // Broadcast para outros clients
  broadcast({
    type: 'DATA_IMPORTED',
    data: { 
      matos: appData.matos, 
      action, 
      count: vaos.length, 
      importedBy: user 
    },
    timestamp: new Date().toISOString()
  }, sessionId);
  
  console.log(`📊 Dados importados: ${vaos.length} vãos (${action}) por ${user}`);
}

function handleClearData(sessionId, data) {
  const { user } = data.data;
  
  // Limpar dados
  appData.matos = [];
  
  // Broadcast para outros clients
  broadcast({
    type: 'DATA_CLEARED',
    data: { clearedBy: user },
    timestamp: new Date().toISOString()
  }, sessionId);
  
  console.log(`🧹 Dados limpos por ${user}`);
}

function handleSyncRequest(sessionId, ws, data) {
  // Enviar dados atuais para o client
  sendToClient(ws, 'SYNC_RESPONSE', {
    matos: appData.matos,
    connectedUsers: Array.from(appData.users.values()),
    serverTime: new Date().toISOString()
  });
  
  console.log(`🔄 Sync solicitado pela sessão ${sessionId}`);
}

function handleDisconnection(sessionId) {
  const session = appData.sessions.get(sessionId);
  if (session) {
    handleUserLogout(sessionId, {});
  }
}

// Status do servidor
function printServerStatus() {
  console.log('\n=== STATUS DO SERVIDOR ===');
  console.log(`🔗 Conexões ativas: ${wss.clients.size}`);
  console.log(`👥 Usuários online: ${appData.users.size}`);
  console.log(`📊 Vãos no sistema: ${appData.matos.length}`);
  console.log('==========================\n');
}

// Imprimir status a cada 30 segundos
setInterval(printServerStatus, 30000);

// Iniciar servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Servidor WebSocket rodando na porta ${PORT}`);
  console.log(`🔗 URL de conexão: ws://localhost:${PORT}`);
  printServerStatus();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.close();
    }
  });
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});
