# Sincronização em Tempo Real - WebSocket

## Visão Geral

O app agora possui sincronização em tempo real entre dispositivos usando WebSocket. Quando múltiplos usuários estão conectados na mesma rede, todas as ações são propagadas instantaneamente entre os dispositivos.

## Como Funciona

### Servidor WebSocket
- **Porta**: 8080
- **URL**: `ws://192.168.0.100:8080` (IP da rede local)
- **Arquivo**: `websocket-server.js`

### Tipos de Sincronização

#### 1. **Atualização de Status**
- Quando um usuário inicia ou finaliza um vão
- Todos os dispositivos conectados veem a mudança instantaneamente
- Inclui timestamps e identificação do usuário

#### 2. **Importação de Dados**
- Quando admin importa uma planilha CSV
- Todos os usuários recebem os novos vãos automaticamente
- Notificação visual sobre a importação

#### 3. **Limpeza de Dados**
- Quando admin limpa todos os dados
- Todos os dispositivos são sincronizados para lista vazia
- Notificação sobre a limpeza

#### 4. **Fotos**
- Quando usuário adiciona foto a um vão
- Fotos são compartilhadas entre dispositivos
- Thumbnails atualizados em tempo real

#### 5. **Lista de Usuários Online**
- Mostra quantos usuários estão conectados
- Atualizada em tempo real

## Interface do Usuário

### Status de Conexão
- **✅ Sincronizado**: WebSocket conectado e funcionando
- **🔄 Tentando conectar**: Tentando estabelecer conexão
- **❌ Desconectado**: Sem conexão WebSocket (modo local)
- **📴 Offline**: Sem internet

### Botão Reconectar
- Aparece quando WebSocket está desconectado mas há internet
- Permite tentativa manual de reconexão
- Útil para desenvolvimento e troubleshooting

### Indicadores
- **👥 X usuários online**: Quantidade de usuários conectados
- **🕐 HH:MM:SS**: Horário da última sincronização
- **💻 Modo Local**: Funcionando sem sincronização

## Configuração para Desenvolvimento

### 1. Iniciar o Servidor WebSocket
```bash
node websocket-server.js
```

### 2. Configurar IP da Rede
- O código está configurado para `192.168.0.100:8080`
- Se necessário, altere o IP no arquivo `App.js` na função `connectWebSocket`

### 3. Testar Multi-Device
1. Conecte dois dispositivos na mesma rede WiFi
2. Abra o app em ambos
3. Faça login com usuários diferentes (admin/usuario)
4. Teste as ações e veja a sincronização

## Funcionalidades por Tipo de Usuário

### Admin
- **Importar CSV**: Sincroniza para todos
- **Limpar dados**: Sincroniza para todos
- **Ver todos os vãos**: Independente do status
- **Ver detalhes**: Data/hora/usuário de início e finalização

### Usuário Normal
- **Iniciar vão**: Sincroniza para todos
- **Finalizar vão**: Sincroniza para todos
- **Tirar foto**: Sincroniza para todos
- **Marcar localização**: Sincroniza para todos
- **Ver apenas**: Vãos não finalizados

## Modo Offline/Fallback

### Quando WebSocket não conecta:
- App funciona normalmente em modo local
- Dados são salvos no AsyncStorage
- Interface mostra "Modo Local" ou botão "Reconectar"
- Funcionalidades básicas não são afetadas

### Reconexão Automática
- Tenta reconectar a cada 10 segundos
- Apenas se estiver online e logado
- Timeout de 5 segundos por tentativa

## Logs de Debug

### Console do App
```
✅ WebSocket conectado com sucesso!
📨 WebSocket recebeu: status_update de: admin
📤 Enviado via WebSocket: status_update para 2 usuários
🔄 Tentando reconectar WebSocket...
❌ Erro WebSocket: Connection refused
💾 WebSocket não conectado. Dados salvos localmente apenas: status_update
```

### Console do Servidor
```
🚀 Servidor WebSocket rodando na porta 8080
👋 Novo usuário conectado: admin
📊 Broadcast para 2 clientes: status_update
👥 2 usuários online: admin, usuario
```

## Troubleshooting

### 1. "Connection refused"
- Verificar se o servidor WebSocket está rodando
- Confirmar porta 8080 disponível
- Verificar IP da rede local

### 2. "Tentando conectar..." infinito
- Verificar conectividade de rede
- Confirmar que dispositivos estão na mesma rede
- Testar com IP diferente (localhost, 127.0.0.1)

### 3. Não sincroniza entre dispositivos
- Confirmar que ambos mostram "Sincronizado"
- Verificar logs do servidor para conexões
- Testar com usuários diferentes

### 4. Funciona local mas não via rede
- Verificar firewall do Windows
- Confirmar IP atual com `ipconfig`
- Testar com outros IPs da lista

## Próximos Passos

1. **Deploy em servidor real**: Para uso em produção
2. **HTTPS/WSS**: Para conexões seguras
3. **Autenticação**: Token-based auth
4. **Persistência**: Banco de dados no servidor
5. **Conflito resolution**: Para edições simultâneas
6. **Push notifications**: Para usuários offline

## URLs de Teste Configuradas

1. `ws://192.168.0.100:8080` - IP da rede local (principal)
2. `ws://localhost:8080` - Local development
3. `ws://127.0.0.1:8080` - Loopback
4. `ws://10.0.2.2:8080` - Android emulator

O sistema tenta a primeira URL por padrão. Em versões futuras, pode tentar as outras automaticamente em caso de falha.
