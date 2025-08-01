import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import NetInfo from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';

// Configuração de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Versão compatível com Hermes - com WebSocket para sincronização em tempo real
function App() {
  const [matos, setMatos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logado, setLogado] = useState(false);
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [importando, setImportando] = useState(false);
  // Novos estados para funcionalidades extras
  const [locationPermission, setLocationPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  // Estados para modo offline
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  // Estados para sincronização em tempo real
  const [wsConnected, setWsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [wsInstance, setWsInstance] = useState(null);

  // Usuários simples
  const USUARIOS = {
    'usuario': 'esul1234',
    'admin': 'eletro1234'
  };

  useEffect(() => {
    initApp();
    
    // Configurar monitoramento de conectividade
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection type:', state.type);
      console.log('Is connected:', state.isConnected);
      
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      
      // Se voltou online, processar queue de ações offline
      if (state.isConnected && offlineQueue.length > 0) {
        processOfflineQueue();
      }
      
      // Conectar ou desconectar WebSocket baseado na conectividade
      if (state.isConnected && logado) {
        connectWebSocket();
      } else {
        disconnectWebSocket();
      }
    });

    return () => {
      unsubscribe();
      disconnectWebSocket();
    };
  }, [offlineQueue, logado]);

  // Configurar WebSocket quando usuário logar
  useEffect(() => {
    if (logado && isConnected) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }
  }, [logado, isConnected]);

  const initApp = async () => {
    try {
      // Verificar conectividade inicial
      const netInfo = await NetInfo.fetch();
      setIsConnected(netInfo.isConnected);
      setConnectionType(netInfo.type);
      
      // Solicitar permissões
      await requestPermissions();
      
      // Carregar queue offline
      await loadOfflineQueue();
      
      // Verificar se existe login salvo
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        setUsername(savedUser);
        setLogado(true);
        await loadData();
      }
    } catch (error) {
      console.log('Init error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para solicitar permissões
  const requestPermissions = async () => {
    try {
      // Permissão para notificações
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(notificationStatus === 'granted');
      
      // Permissão para localização
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locationStatus === 'granted');
      
      console.log('Permissões:', {
        notifications: notificationStatus,
        location: locationStatus
      });
    } catch (error) {
      console.log('Erro ao solicitar permissões:', error);
    }
  };

  // Função para configurar notificações de prazos
  const configurarNotificacoesPrazos = async (dados) => {
    if (!notificationPermission) {
      console.log('Permissão de notificação não concedida, pulando configuração de prazos');
      return;
    }
    
    try {
      // Cancelar notificações anteriores
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      console.log('Configurando notificações para', dados.length, 'vãos');
      
      // Configurar notificações para vãos próximos do prazo
      dados.forEach(async (vao) => {
        if (vao.status !== 'concluido' && vao.dataNecessidade) {
          const dataNecessidade = new Date(vao.dataNecessidade);
          const hoje = new Date();
          const diasRestantes = Math.ceil((dataNecessidade - hoje) / (1000 * 60 * 60 * 24));
          
          // Notificar 3 dias antes se não foi iniciado
          if (diasRestantes === 3 && vao.status === 'pendente') {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: '⚠️ Prazo se aproximando!',
                body: `O vão "${vao.descricao}" deve ser iniciado em 3 dias.`,
                data: { vaoId: vao.id }
              },
              trigger: {
                seconds: 10 // Para teste, usar segundos. Em produção, usar data específica
              }
            });
            console.log(`Notificação agendada: 3 dias para ${vao.descricao}`);
          }
          
          // Notificar no dia se ainda não foi concluído
          if (diasRestantes === 0 && vao.status !== 'concluido') {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: '🚨 Prazo hoje!',
                body: `O vão "${vao.descricao}" deve ser concluído hoje.`,
                data: { vaoId: vao.id }
              },
              trigger: {
                seconds: 15 // Para teste
              }
            });
            console.log(`Notificação agendada: prazo hoje para ${vao.descricao}`);
          }
          
          // Notificar se está atrasado
          if (diasRestantes < 0 && vao.status !== 'concluido') {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: '❗ Prazo vencido!',
                body: `O vão "${vao.descricao}" está ${Math.abs(diasRestantes)} dias atrasado.`,
                data: { vaoId: vao.id }
              },
              trigger: {
                seconds: 20 // Para teste
              }
            });
            console.log(`Notificação agendada: ${Math.abs(diasRestantes)} dias atrasado para ${vao.descricao}`);
          }
        }
      });
      
      console.log('✅ Notificações de prazo configuradas com sucesso');
    } catch (error) {
      console.log('Erro ao configurar notificações de prazo:', error);
    }
  };

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('matos');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Migrar dados antigos para novo formato
        const migratedData = parsedData.map(item => ({
          ...item,
          // Garantir que campos novos existam
          dataHoraInicio: item.dataHoraInicio || null,
          dataHoraConclusao: item.dataHoraConclusao || null,
          iniciadoPor: item.iniciadoPor || null,
          finalizadoPor: item.finalizadoPor || null,
          // Novos campos para funcionalidades extras
          fotos: item.fotos || [],
          localizacao: item.localizacao || null,
          coordenadas: item.coordenadas || null
        }));
        setMatos(migratedData);
        // Salvar dados migrados
        if (JSON.stringify(parsedData) !== JSON.stringify(migratedData)) {
          await saveData(migratedData);
        }
        
        // Configurar notificações para vãos próximos do prazo
        await configurarNotificacoesPrazos(migratedData);
      }
    } catch (error) {
      console.log('Load data error:', error);
    }
  };

  const saveData = async (data) => {
    try {
      await AsyncStorage.setItem('matos', JSON.stringify(data));
    } catch (error) {
      console.log('Save data error:', error);
    }
  };

  // ===== WEBSOCKET - SINCRONIZAÇÃO EM TEMPO REAL =====
  
  const connectWebSocket = () => {
    if (wsInstance) {
      console.log('WebSocket já conectado');
      return;
    }

    // Não tentar conectar se offline
    if (!isConnected) {
      console.log('Dispositivo offline, não tentando conectar WebSocket');
      return;
    }

    try {
      // URLs possíveis para diferentes ambientes
      const possibleUrls = [
        'ws://192.168.0.100:8080', // IP da máquina na rede local
        'ws://localhost:8080',
        'ws://127.0.0.1:8080',
        'ws://10.0.2.2:8080', // Para emulador Android
      ];
      
      // Para desenvolvimento, começar com localhost
      const wsUrl = possibleUrls[0];
      console.log('Tentando conectar WebSocket em:', wsUrl);
      
      const ws = new WebSocket(wsUrl);

      // Timeout para conexão
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.log('Timeout na conexão WebSocket');
          ws.close();
        }
      }, 5000);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado com sucesso!');
        clearTimeout(connectionTimeout);
        setWsConnected(true);
        setWsInstance(ws);
        
        // Enviar identificação do usuário (garantir que username existe)
        const currentUser = username || 'anônimo';
        console.log('👤 Identificando usuário:', currentUser);
        
        ws.send(JSON.stringify({
          type: 'identify',
          user: currentUser,
          timestamp: new Date().toISOString(),
          hasData: matos.length > 0,
          dataCount: matos.length
        }));
        
        // Enviar dados locais para o servidor se tivermos
        if (matos.length > 0) {
          console.log(`📤 Enviando ${matos.length} vãos locais para o servidor`);
          ws.send(JSON.stringify({
            type: 'sync_local_data',
            user: currentUser,
            data: matos,
            timestamp: new Date().toISOString()
          }));
        }
        
        setLastSyncTime(new Date().toISOString());
      };

      ws.onmessage = (event) => {
        try {
          console.log('📨 WebSocket dados brutos recebidos:', event.data);
          const message = JSON.parse(event.data);
          console.log('📨 WebSocket mensagem processada:', {
            type: message.type,
            user: message.user,
            hasData: !!message.data,
            dataLength: message.data ? (Array.isArray(message.data) ? message.data.length : typeof message.data) : 'n/a'
          });
          
          handleWebSocketMessage(message);
        } catch (error) {
          console.log('❌ Erro ao processar mensagem WebSocket:', error, 'Dados:', event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('❌ WebSocket desconectado. Código:', event.code, 'Razão:', event.reason);
        clearTimeout(connectionTimeout);
        setWsConnected(false);
        setWsInstance(null);
        setConnectedUsers([]);
        
        // Tentar reconectar após 10 segundos se ainda estiver online e logado
        if (isConnected && logado) {
          console.log('🔄 Agendando reconexão em 10 segundos...');
          setTimeout(() => {
            if (isConnected && logado && !wsInstance) {
              console.log('🔄 Tentando reconectar WebSocket...');
              connectWebSocket();
            }
          }, 10000);
        }
      };

      ws.onerror = (error) => {
        console.log('❌ Erro WebSocket:', error.message || 'Erro desconhecido');
        clearTimeout(connectionTimeout);
        setWsConnected(false);
        
        // Em caso de erro, tentar próxima URL (se houver)
        // Para implementação futura: ciclar entre URLs diferentes
      };

    } catch (error) {
      console.log('❌ Erro ao criar WebSocket:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (wsInstance) {
      wsInstance.close();
      setWsInstance(null);
      setWsConnected(false);
      setConnectedUsers([]);
    }
  };

  const handleWebSocketMessage = async (message) => {
    console.log('🔍 Processando mensagem WebSocket:', {
      type: message.type,
      user: message.user,
      timestamp: message.timestamp,
      hasData: !!message.data,
      dataType: message.data ? typeof message.data : 'undefined',
      dataLength: message.data && Array.isArray(message.data) ? message.data.length : 'n/a'
    });

    switch (message.type) {
      case 'users_update':
        setConnectedUsers(message.users || []);
        break;

      case 'INITIAL_DATA':
        // Recebeu dados iniciais do servidor
        console.log('📊 Recebendo dados iniciais do servidor...');
        console.log('📊 Detalhes da mensagem INITIAL_DATA:', {
          hasData: !!message.data,
          dataType: typeof message.data,
          isArray: Array.isArray(message.data),
          dataLength: message.data ? message.data.length : 0,
          currentMatosLength: matos.length,
          user: message.user,
          timestamp: message.timestamp
        });
        
        if (message.data && Array.isArray(message.data) && message.data.length > 0) {
          console.log(`📥 ${message.data.length} vãos recebidos do servidor`);
          // Apenas atualizar se não temos dados locais ou se os dados do servidor são mais recentes
          if (matos.length === 0) {
            console.log('💾 Atualizando com dados do servidor (sem dados locais)');
            setMatos(message.data);
            await AsyncStorage.setItem('matos', JSON.stringify(message.data));
            setLastSyncTime(new Date().toISOString());
            console.log('✅ Dados iniciais sincronizados');
          } else {
            console.log('💾 Mantendo dados locais existentes (matos.length > 0)');
          }
        } else {
          console.log('📝 Servidor não possui dados iniciais ou dados inválidos');
        }
        break;
        
      case 'data_update':
        // Recebeu atualização de dados de outro dispositivo
        if (message.data && message.user !== username) {
          console.log('Sincronizando dados de:', message.user);
          setMatos(message.data);
          await AsyncStorage.setItem('matos', JSON.stringify(message.data));
          setLastSyncTime(new Date().toISOString());
        }
        break;
        
      case 'status_update':
        // Recebeu atualização de status de vão
        if (message.vaoId && message.user !== username) {
          console.log('Sincronizando status do vão:', message.vaoId, 'para:', message.status);
          
          setMatos(prevMatos => {
            const updated = prevMatos.map(item => {
              if (item.id === message.vaoId) {
                const updatedItem = { ...item, status: message.status };
                
                if (message.status === 'iniciado') {
                  updatedItem.dataHoraInicio = message.timestamp;
                  updatedItem.iniciadoPor = message.user;
                } else if (message.status === 'concluido') {
                  updatedItem.dataHoraConclusao = message.timestamp;
                  updatedItem.finalizadoPor = message.user;
                }
                
                return updatedItem;
              }
              return item;
            });
            
            // Salvar no AsyncStorage (sem broadcast para evitar loop)
            AsyncStorage.setItem('matos', JSON.stringify(updated));
            setLastSyncTime(new Date().toISOString());
            
            return updated;
          });
        }
        break;
        
      case 'import_update':
        // Recebeu atualização de importação de dados
        if (message.data && message.user !== username) {
          console.log('Sincronizando importação de:', message.user);
          setMatos(message.data);
          await AsyncStorage.setItem('matos', JSON.stringify(message.data));
          setLastSyncTime(new Date().toISOString());
          Alert.alert('Dados Atualizados', `Novos dados importados por ${message.user}`);
        }
        break;
        
      case 'clear_data':
        // Recebeu comando de limpeza de dados
        if (message.user !== username) {
          console.log('Sincronizando limpeza de dados de:', message.user);
          setMatos([]);
          await AsyncStorage.setItem('matos', JSON.stringify([]));
          setLastSyncTime(new Date().toISOString());
          Alert.alert('Dados Limpos', `Dados foram limpos por ${message.user}`);
        }
        break;
        
      case 'photo_update':
        // Recebeu atualização de foto
        if (message.vaoId && message.user !== username) {
          console.log('Sincronizando foto do vão:', message.vaoId);
          
          setMatos(prevMatos => {
            const updated = prevMatos.map(item => {
              if (item.id === message.vaoId) {
                return {
                  ...item,
                  fotos: message.fotos || []
                };
              }
              return item;
            });
            
            AsyncStorage.setItem('matos', JSON.stringify(updated));
            setLastSyncTime(new Date().toISOString());
            
            return updated;
          });
        }
        break;
        
      case 'sync_local_data':
        // Outro usuário está enviando dados locais
        if (message.data && message.user !== username) {
          console.log('🔄 Sincronizando dados de outro usuário:', message.user);
          if (message.data.length > matos.length) {
            console.log('📥 Dados remotos são mais completos, atualizando...');
            setMatos(message.data);
            await AsyncStorage.setItem('matos', JSON.stringify(message.data));
            setLastSyncTime(new Date().toISOString());
          }
        }
        break;
        
      case 'server_status':
        // Status do servidor
        console.log('🖥️ Status do servidor:', message);
        break;
        
      case 'connection_confirmed':
        // Confirmação de conexão
        console.log('✅ Conexão confirmada pelo servidor');
        break;
        
      default:
        console.log('❓ Tipo de mensagem WebSocket não reconhecido:', message.type, '- Dados:', message);
    }
  };

  const broadcastUpdate = (type, data) => {
    if (wsInstance && wsConnected) {
      try {
        const currentUser = username || 'anônimo';
        const message = {
          type,
          user: currentUser,
          timestamp: new Date().toISOString(),
          ...data
        };
        
        wsInstance.send(JSON.stringify(message));
        console.log('📤 Enviado via WebSocket:', message.type, 'por', currentUser, 'para', connectedUsers.length, 'usuários');
      } catch (error) {
        console.log('❌ Erro ao enviar via WebSocket:', error);
      }
    } else {
      console.log('💾 WebSocket não conectado. Dados salvos localmente apenas:', type);
    }
  };

  // ===== FIM WEBSOCKET =====

  const handleLogin = async () => {
    if (USUARIOS[username] === senha) {
      await AsyncStorage.setItem('user', username);
      setLogado(true);
      await loadData();
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } else {
      Alert.alert('Erro', 'Usuário ou senha incorretos');
    }
  };

  const handleLogout = async () => {
    disconnectWebSocket();
    await AsyncStorage.removeItem('user');
    setLogado(false);
    setUsername('');
    setSenha('');
    setMatos([]);
  };

  // Função para atualizar status com WebSocket
  const updateStatus = async (id, newStatus) => {
    console.log(`🔄 Atualizando status do vão ${id} para ${newStatus}...`);
    const dataHora = new Date().toISOString();
    
    const updatedMatos = matos.map(item => {
      if (item.id === id) {
        console.log(`✏️ Vão encontrado: ${item.descricao} - Status atual: ${item.status}`);
        const updatedItem = { ...item, status: newStatus };
        
        if (newStatus === 'iniciado' && !item.dataHoraInicio) {
          updatedItem.dataHoraInicio = dataHora;
          updatedItem.iniciadoPor = username;
          console.log(`⏰ Marcando início: ${dataHora} por ${username}`);
        } else if (newStatus === 'concluido' && !item.dataHoraConclusao) {
          updatedItem.dataHoraConclusao = dataHora;
          updatedItem.finalizadoPor = username;
          console.log(`✅ Marcando conclusão: ${dataHora} por ${username}`);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    // Atualizar estado e salvar
    console.log('💾 Salvando dados atualizados...');
    setMatos(updatedMatos);
    await saveData(updatedMatos);

    // Broadcast da mudança via WebSocket
    broadcastUpdate('status_update', {
      vaoId: id,
      status: newStatus,
      timestamp: dataHora
    });

    const acao = newStatus === 'iniciado' ? 'iniciado' : 'finalizado';
    console.log(`🎉 Vão ${acao} com sucesso!`);
    Alert.alert('Sucesso', `Vão ${acao} com sucesso!`);
  };

  // Renderizar status badge para admin
  const getStatusBadge = (status) => {
    const colors = {
      'pendente': '#9E9E9E',
      'iniciado': '#FF9800',
      'concluido': '#4CAF50'
    };
    
    const labels = {
      'pendente': 'Pendente',
      'iniciado': 'Iniciado',
      'concluido': 'Concluído'
    };

    return (
      <View style={[styles.statusBadge, { backgroundColor: colors[status] }]}>
        <Text style={styles.statusBadgeText}>{labels[status]}</Text>
      </View>
    );
  };

  // Função de sincronização em tempo real - com melhor feedback
  const renderSyncStatus = () => {
    let statusColor = '#FF5722'; // Vermelho por padrão (desconectado)
    let statusText = 'Desconectado';
    let statusIcon = '❌';

    if (wsConnected) {
      statusColor = '#4CAF50';
      statusText = 'Sincronizado';
      statusIcon = '✅';
    } else if (isConnected) {
      statusColor = '#FF9800';
      statusText = 'Tentando conectar...';
      statusIcon = '🔄';
    } else {
      statusColor = '#9E9E9E';
      statusText = 'Offline';
      statusIcon = '📴';
    }

    return (
      <View style={styles.syncStatusContainer}>
        <View style={styles.syncIndicator}>
          <View style={[styles.syncDot, { backgroundColor: statusColor }]} />
          <Text style={styles.syncText}>
            {statusIcon} {statusText}
          </Text>
        </View>
        
        {connectedUsers.length > 0 && (
          <Text style={styles.usersText}>
            👥 {connectedUsers.length} usuário{connectedUsers.length > 1 ? 's' : ''} online
          </Text>
        )}
        
        {lastSyncTime && wsConnected && (
          <Text style={styles.lastSyncText}>
            🕐 {new Date(lastSyncTime).toLocaleTimeString('pt-BR')}
          </Text>
        )}

        {/* Indicador de modo offline para desenvolvimento */}
        {!wsConnected && isConnected && (
          <TouchableOpacity 
            style={styles.reconnectButton}
            onPress={() => {
              console.log('🔄 Tentativa manual de reconexão...');
              connectWebSocket();
            }}
          >
            <Text style={styles.reconnectButtonText}>
              🔄 Reconectar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Função melhorada para renderizar lista com todas as funcionalidades
  const renderMatosList = () => {
    const vaosParaExibir = username === 'admin' ? matos : matos.filter(vao => vao.status !== 'concluido');
    
    if (matos.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum vão cadastrado</Text>
          {username === 'admin' && (
            <View style={styles.emptyActions}>
              <TouchableOpacity 
                style={styles.emptyImportButton} 
                onPress={importPlanilha}
                disabled={importando}
              >
                <Text style={styles.emptyImportButtonText}>
                  {importando ? '⏳ Importando...' : '📄 Importar CSV'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.emptyTestButton} 
                onPress={criarVaoTeste}
              >
                <Text style={styles.emptyTestButtonText}>
                  🧪 Criar Teste
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.listContainer}>
        {/* Painel de Admin - Menu Elegante */}
        {username === 'admin' && (
          <View style={styles.adminPanel}>
            <View style={styles.adminHeader}>
              <Text style={styles.adminHeaderTitle}>🛠️ Painel Administrativo</Text>
              <Text style={styles.adminHeaderSubtitle}>Controle total do sistema</Text>
            </View>
            
            <View style={styles.adminGrid}>
              <TouchableOpacity 
                style={[styles.adminCard, styles.importCard]} 
                onPress={importPlanilha}
                disabled={importando}
              >
                <View style={styles.adminCardIcon}>
                  <Text style={styles.adminCardIconText}>📄</Text>
                </View>
                <View style={styles.adminCardContent}>
                  <Text style={styles.adminCardTitle}>
                    {importando ? 'Importando...' : 'Importar CSV'}
                  </Text>
                  <Text style={styles.adminCardDescription}>
                    Adicionar vãos via planilha
                  </Text>
                </View>
                {importando && (
                  <ActivityIndicator size="small" color="#2196F3" style={styles.adminCardLoader} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.adminCard, styles.clearCard]} 
                onPress={limparDados}
              >
                <View style={styles.adminCardIcon}>
                  <Text style={styles.adminCardIconText}>🗑️</Text>
                </View>
                <View style={styles.adminCardContent}>
                  <Text style={styles.adminCardTitle}>Limpar Dados</Text>
                  <Text style={styles.adminCardDescription}>
                    Remover todos os vãos
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.adminCard, styles.testCard]} 
                onPress={criarVaoTeste}
              >
                <View style={styles.adminCardIcon}>
                  <Text style={styles.adminCardIconText}>🧪</Text>
                </View>
                <View style={styles.adminCardContent}>
                  <Text style={styles.adminCardTitle}>Vão Teste</Text>
                  <Text style={styles.adminCardDescription}>
                    Criar dados para teste
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.adminCard, styles.diagnosticCard]} 
                onPress={executarDiagnostico}
              >
                <View style={styles.adminCardIcon}>
                  <Text style={styles.adminCardIconText}>🔧</Text>
                </View>
                <View style={styles.adminCardContent}>
                  <Text style={styles.adminCardTitle}>Diagnóstico</Text>
                  <Text style={styles.adminCardDescription}>
                    Verificar sistema
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.adminCard, styles.dateTestCard]} 
                onPress={testarFormatacaoDatas}
              >
                <View style={styles.adminCardIcon}>
                  <Text style={styles.adminCardIconText}>📅</Text>
                </View>
                <View style={styles.adminCardContent}>
                  <Text style={styles.adminCardTitle}>Teste Datas</Text>
                  <Text style={styles.adminCardDescription}>
                    Validar formatação
                  </Text>
                </View>
              </TouchableOpacity>
              
              {/* Card de estatísticas */}
              <View style={[styles.adminCard, styles.statsCard]}>
                <View style={styles.adminCardIcon}>
                  <Text style={styles.adminCardIconText}>📊</Text>
                </View>
                <View style={styles.adminCardContent}>
                  <Text style={styles.adminCardTitle}>Estatísticas</Text>
                  <Text style={styles.adminCardDescription}>
                    Total: {matos.length} vãos
                  </Text>
                  <View style={styles.statsRow}>
                    <Text style={styles.statsPendente}>
                      Pendentes: {matos.filter(v => v.status === 'pendente').length}
                    </Text>
                    <Text style={styles.statsIniciado}>
                      Iniciados: {matos.filter(v => v.status === 'iniciado').length}
                    </Text>
                    <Text style={styles.statsConcluido}>
                      Concluídos: {matos.filter(v => v.status === 'concluido').length}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Lista de vãos */}
        {vaosParaExibir.map((vao) => {
          const hoje = new Date();
          const dataNecessidade = new Date(vao.dataNecessidade);
          const diasRestantes = Math.ceil((dataNecessidade - hoje) / (1000 * 60 * 60 * 24));
          
          let indicadorPrazo = '';
          if (vao.status !== 'concluido') {
            if (diasRestantes < 0) {
              indicadorPrazo = '⚠️'; // Atrasado
            } else if (diasRestantes <= 3) {
              indicadorPrazo = '🕐'; // Urgente
            }
          }

          return (
            <View key={vao.id} style={[
              styles.vaoItem,
              vao.status === 'pendente' && { borderLeftColor: '#9E9E9E', borderLeftWidth: 4 },
              vao.status === 'iniciado' && { borderLeftColor: '#FF9800', borderLeftWidth: 4 },
              vao.status === 'concluido' && { borderLeftColor: '#4CAF50', borderLeftWidth: 4 },
              // Classes de prazo
              diasRestantes < 0 && vao.status !== 'concluido' && styles.vaoAtrasado,
              diasRestantes >= 0 && diasRestantes <= 3 && vao.status !== 'concluido' && styles.vaoUrgente,
              diasRestantes > 3 && vao.status !== 'concluido' && styles.vaoNormal
            ]}>
              <View style={styles.vaoHeader}>
                <Text style={[
                  styles.vaoDescricao,
                  diasRestantes < 0 && vao.status !== 'concluido' && styles.textoAtrasado,
                  diasRestantes >= 0 && diasRestantes <= 3 && vao.status !== 'concluido' && styles.textoUrgente
                ]}>
                  {indicadorPrazo} {vao.descricao}
                </Text>
                {username === 'admin' && getStatusBadge(vao.status)}
              </View>
              
              <Text style={styles.vaoInfo}>📍 {vao.localizacao}</Text>
              <Text style={styles.vaoInfo}>📏 {vao.area}</Text>
              <Text style={styles.vaoInfo}>📅 {vao.dataNecessidade}</Text>
              
              {/* Informações detalhadas para admin */}
              {username === 'admin' && (
                <View style={styles.detalhesContainer}>
                  {vao.dataHoraInicio && (
                    <Text style={styles.detalheText}>
                      ▶️ Iniciado: {new Date(vao.dataHoraInicio).toLocaleString('pt-BR')} por {vao.iniciadoPor || 'N/A'}
                    </Text>
                  )}
                  {vao.dataHoraConclusao && (
                    <Text style={styles.detalheText}>
                      ✅ Finalizado: {new Date(vao.dataHoraConclusao).toLocaleString('pt-BR')} por {vao.finalizadoPor || 'N/A'}
                    </Text>
                  )}
                  {!vao.dataHoraInicio && !vao.dataHoraConclusao && (
                    <Text style={styles.detalheText}>
                      ⏳ Aguardando início
                    </Text>
                  )}
                </View>
              )}

              {/* Fotos */}
              {vao.fotos && vao.fotos.length > 0 && (
                <View style={styles.fotosContainer}>
                  <Text style={styles.fotosLabel}>📷 Fotos ({vao.fotos.length}):</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fotosScroll}>
                    {vao.fotos.map((foto, index) => (
                      <Image key={index} source={{ uri: foto }} style={styles.fotoThumbnail} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Localização GPS */}
              {vao.coordenadas && (
                <Text style={styles.coordenadasText}>
                  🌍 GPS: {vao.coordenadas.latitude.toFixed(6)}, {vao.coordenadas.longitude.toFixed(6)}
                </Text>
              )}
              
              {/* Botões de ação para usuários normais */}
              {username !== 'admin' && vao.status !== 'concluido' && (
                <View style={styles.actionContainer}>
                  {vao.status === 'pendente' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                      onPress={() => updateStatus(vao.id, 'iniciado')}
                    >
                      <Text style={styles.actionButtonText}>▶️ Iniciar</Text>
                    </TouchableOpacity>
                  )}
                  
                  {vao.status === 'iniciado' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                        onPress={() => tirarFoto(vao.id)}
                      >
                        <Text style={styles.actionButtonText}>📷 Foto</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
                        onPress={() => obterLocalizacao(vao.id)}
                      >
                        <Text style={styles.actionButtonText}>📍 Local</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                        onPress={() => updateStatus(vao.id, 'concluido')}
                      >
                        <Text style={styles.actionButtonText}>✅ Finalizar</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  // Interface de login
  if (!logado) {
    return (
      <SafeAreaView style={styles.loginContainerOuter}>
        <StatusBar style="light" />
        
        {/* Background gradiente */}
        <LinearGradient
          colors={['#4CAF50', '#2E7D32', '#1B5E20']}
          style={styles.loginBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.loginContainer}>
          {/* Logo/Ícone */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🌿</Text>
            <Text style={styles.logoText}>CORTE DE MATOS</Text>
            <Text style={styles.logoSubtext}>Sistema de Controle</Text>
          </View>
          
          {/* Card de login */}
          <View style={styles.loginCard}>
            {/* Inputs */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>👤 Usuário</Text>
              <TextInput
                style={styles.modernInput}
                placeholder="Digite seu usuário"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Senha</Text>
              <TextInput
                style={styles.modernInput}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />
            </View>
            
            {/* Botão de login */}
            <TouchableOpacity style={styles.modernLoginButton} onPress={handleLogin}>
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.loginButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.modernLoginButtonText}>ENTRAR</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Dicas de acesso */}
            <View style={styles.accessHints}>
              <Text style={styles.hintText}>💡 Dicas de acesso:</Text>
              <Text style={styles.hintDetail}>• Admin: acesso completo</Text>
              <Text style={styles.hintDetail}>• Operador: visualização limitada</Text>
            </View>
          </View>
          
          {/* Rodapé */}
          <View style={styles.loginFooter}>
            <Text style={styles.footerText}>v1.0 • Sistema de Gestão</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ===== FUNÇÕES DE MÍDIA E LOCALIZAÇÃO =====
  
  // Função para tirar foto com WebSocket
  const tirarFoto = async (vaoId) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        
        setMatos(prevMatos => {
          const updated = prevMatos.map(item => {
            if (item.id === vaoId) {
              const novasFotos = [...(item.fotos || []), photoUri];
              
              // Broadcast da foto via WebSocket
              broadcastUpdate('photo_update', {
                vaoId,
                fotos: novasFotos
              });
              
              return { ...item, fotos: novasFotos };
            }
            return item;
          });
          
          AsyncStorage.setItem('matos', JSON.stringify(updated));
          return updated;
        });

        Alert.alert('Sucesso', 'Foto adicionada com sucesso!');
      }
    } catch (error) {
      console.log('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto. Tente novamente.');
    }
  };

  // Função para obter localização com WebSocket
  const obterLocalizacao = async (vaoId) => {
    if (!locationPermission) {
      Alert.alert(
        'Permissão Necessária',
        'É necessário permitir o acesso à localização para marcar o local do trabalho.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configurar', onPress: () => requestPermissions() }
        ]
      );
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Obter endereço
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const endereco = addresses[0] ? 
        `${addresses[0].street || ''} ${addresses[0].streetNumber || ''}, ${addresses[0].city || ''}`.trim() :
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setMatos(prevMatos => {
        const updated = prevMatos.map(item => {
          if (item.id === vaoId) {
            return {
              ...item,
              coordenadas: { latitude, longitude },
              localizacao: endereco
            };
          }
          return item;
        });

        AsyncStorage.setItem('matos', JSON.stringify(updated));
        return updated;
      });

      Alert.alert('Sucesso', 'Localização salva com sucesso!');
    } catch (error) {
      console.log('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter a localização. Tente novamente.');
    }
  };

  // ===== FUNÇÕES ADMINISTRATIVAS =====
  
  // Função para importar planilha CSV com WebSocket
  const importPlanilha = async () => {
    console.log('🔄 ==> INICIANDO IMPORTAÇÃO DE PLANILHA <==');
    
    if (username !== 'admin') {
      Alert.alert('Acesso Negado', 'Apenas administradores podem importar planilhas.');
      return;
    }

    console.log('👤 Usuário autorizado:', username);
    setImportando(true);

    try {
      console.log('📁 Abrindo seletor de arquivos...');
      
      // Selecionar arquivo - configuração mais flexível para CSV
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log('📋 Resultado do picker:', result);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('❌ Importação cancelada pelo usuário ou arquivo não selecionado');
        setImportando(false);
        return;
      }

      const selectedFile = result.assets[0];
      console.log('📁 Arquivo selecionado:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.mimeType,
        uri: selectedFile.uri
      });

      // Validar se é um arquivo de texto (CSV)
      const fileName = selectedFile.name.toLowerCase();
      const isValidFile = fileName.endsWith('.csv') || 
                         fileName.endsWith('.txt') || 
                         selectedFile.mimeType?.includes('text') ||
                         selectedFile.mimeType?.includes('csv');

      if (!isValidFile) {
        console.log('⚠️ Arquivo com extensão/tipo não padrão, mas tentando processar...');
        Alert.alert(
          'Arquivo Pode Não Ser CSV', 
          `O arquivo selecionado pode não ser um CSV válido:\n\n• Nome: ${selectedFile.name}\n• Tipo: ${selectedFile.mimeType || 'desconhecido'}\n\nDeseja tentar importar mesmo assim?`,
          [
            { text: 'Cancelar', onPress: () => { setImportando(false); return; }, style: 'cancel' },
            { text: 'Tentar Importar', onPress: () => {}, style: 'default' }
          ]
        );
      } else {
        console.log('✅ Arquivo CSV válido detectado:', {
          name: fileName,
          type: selectedFile.mimeType
        });
      }

      // Ler conteúdo do arquivo com tratamento de encoding
      let content;
      try {
        content = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType.UTF8
        });
      } catch (error) {
        console.log('⚠️ Erro UTF8, tentando Base64...', error);
        try {
          const base64Content = await FileSystem.readAsStringAsync(selectedFile.uri, {
            encoding: FileSystem.EncodingType.Base64
          });
          content = atob(base64Content);
        } catch (error2) {
          console.log('❌ Erro ao ler arquivo:', error2);
          Alert.alert('Erro', 'Não foi possível ler o arquivo. Verifique se é um arquivo de texto válido.');
          setImportando(false);
          return;
        }
      }

      console.log('📖 Conteúdo lido:', {
        tamanho: content.length,
        primeiros100: content.substring(0, 100),
        temVirgula: content.includes(','),
        temPontoVirgula: content.includes(';')
      });

      if (!content || content.trim().length === 0) {
        Alert.alert('Erro', 'Arquivo está vazio ou não pôde ser lido.');
        setImportando(false);
        return;
      }

      // Processar CSV
      const lines = content.split(/\r?\n/).filter(line => line.trim());
      console.log('📊 Linhas encontradas:', lines.length);

      if (lines.length < 2) {
        Alert.alert(
          'Arquivo Incompleto', 
          `Arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados.\n\nLinhas encontradas: ${lines.length}\nPrimeira linha: ${lines[0] || 'vazia'}`
        );
        setImportando(false);
        return;
      }

      // Detectar separador de forma mais inteligente
      const header = lines[0];
      let separator = ',';
      
      const virgulas = (header.match(/,/g) || []).length;
      const pontosVirgula = (header.match(/;/g) || []).length;
      
      if (pontosVirgula > virgulas) {
        separator = ';';
      }
      
      console.log('🔍 Análise de separadores:', {
        header: header.substring(0, 100),
        virgulas: virgulas,
        pontosVirgula: pontosVirgula,
        separadorEscolhido: separator
      });

      // Processar cabeçalhos
      const headers = header.split(separator).map(h => h.trim().replace(/['"]/g, ''));
      console.log('📋 Cabeçalhos processados:', headers);
      
      if (headers.length < 3) {
        Alert.alert(
          'Formato Inválido',
          `Arquivo deve ter pelo menos 3 colunas (Descrição, Localização, Área).\n\nColunas encontradas: ${headers.length}\nCabeçalhos: ${headers.join(', ')}`
        );
        setImportando(false);
        return;
      }

      const dados = [];
      let linhasProcessadas = 0;
      let linhasComErro = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const linha = lines[i].trim();
        if (!linha) continue;
        
        const valores = linha.split(separator).map(v => v.trim().replace(/['"]/g, ''));
        
        console.log(`📝 Processando linha ${i}:`, {
          linha: linha.substring(0, 100),
          valores: valores.slice(0, 4),
          quantidadeValores: valores.length
        });
        
        // Validar se a linha tem dados suficientes
        if (valores.length < 3) {
          console.log(`⚠️ Linha ${i} ignorada - poucos dados:`, valores);
          linhasComErro++;
          continue;
        }

        // Criar item com validação robusta
        const item = {
          id: Date.now() + Math.random() + i,
          descricao: valores[0]?.trim() || `Vão ${linhasProcessadas + 1}`,
          localizacao: valores[1]?.trim() || 'Não informado',
          area: valores[2]?.trim() || '0',
          dataNecessidade: formatarData(valores[3]) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pendente',
          // Novos campos com valores padrão
          dataHoraInicio: null,
          dataHoraConclusao: null,
          iniciadoPor: null,
          finalizadoPor: null,
          fotos: [],
          coordenadas: null,
          observacoes: valores[4]?.trim() || ''
        };

        // Validação adicional dos dados
        const validacoes = [];
        
        if (!item.descricao || item.descricao === `Vão ${linhasProcessadas + 1}`) {
          validacoes.push('Descrição vazia ou padrão');
        }
        
        if (!item.localizacao || item.localizacao === 'Não informado') {
          validacoes.push('Localização não informada');
        }
        
        if (!item.area || item.area === '0') {
          validacoes.push('Área não informada');
        }

        if (validacoes.length > 0) {
          console.log(`⚠️ Linha ${i} com problemas:`, validacoes);
          item.observacoes = `${item.observacoes} [Importação: ${validacoes.join(', ')}]`.trim();
        }

        dados.push(item);
        linhasProcessadas++;
        
        console.log(`✅ Item ${linhasProcessadas} criado:`, {
          descricao: item.descricao,
          localizacao: item.localizacao,
          area: item.area,
          dataNecessidade: item.dataNecessidade
        });
      }

      console.log('📊 Resumo do processamento:', {
        totalLinhas: lines.length - 1,
        linhasProcessadas: linhasProcessadas,
        linhasComErro: linhasComErro,
        dadosValidos: dados.length
      });

      if (dados.length === 0) {
        Alert.alert(
          'Nenhum Dado Válido', 
          `Não foi possível processar nenhum item do arquivo.\n\nDetalhes:\n• Total de linhas: ${lines.length - 1}\n• Linhas com erro: ${linhasComErro}\n• Separador usado: "${separator}"\n• Cabeçalhos: ${headers.slice(0, 3).join(', ')}`
        );
        setImportando(false);
        return;
      }

      // Salvar dados
      const dadosAtualizados = [...matos, ...dados];
      setMatos(dadosAtualizados);
      await saveData(dadosAtualizados);

      // Configurar notificações
      await configurarNotificacoesPrazos(dadosAtualizados);

      // Broadcast via WebSocket
      broadcastUpdate('import_update', { data: dadosAtualizados });

      console.log('🎉 Importação concluída com sucesso!');
      
      const mensagemSucesso = linhasComErro > 0 
        ? `${dados.length} vãos importados com sucesso!\n\n⚠️ ${linhasComErro} linhas foram ignoradas por dados incompletos.`
        : `${dados.length} vãos importados com sucesso!`;
      
      Alert.alert('Importação Concluída', mensagemSucesso);

    } catch (error) {
      console.log('❌ Erro na importação:', error);
      Alert.alert('Erro', 'Erro ao importar planilha. Verifique o formato do arquivo.');
    } finally {
      setImportando(false);
    }
  };

  // Função para formatar data brasileira para ISO (versão robusta)
  const formatarData = (dataString) => {
    if (!dataString) {
      console.log('📅 formatarData: dados vazios, retornando null');
      return null;
    }
    
    const dataLimpa = dataString.toString().trim();
    console.log('📅 formatarData: processando', dataLimpa);
    
    // Se já está no formato YYYY-MM-DD, validar e retornar
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataLimpa)) {
      const [ano, mes, dia] = dataLimpa.split('-');
      if (parseInt(mes) >= 1 && parseInt(mes) <= 12 && parseInt(dia) >= 1 && parseInt(dia) <= 31) {
        console.log('📅 Data já em formato ISO válida:', dataLimpa);
        return dataLimpa;
      }
    }
    
    // Se está no formato DD/MM/YYYY (brasileiro padrão)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dataLimpa)) {
      const [dia, mes, ano] = dataLimpa.split('/');
      const diaNum = parseInt(dia);
      const mesNum = parseInt(mes);
      
      if (mesNum >= 1 && mesNum <= 12 && diaNum >= 1 && diaNum <= 31) {
        const diaFormatado = dia.padStart(2, '0');
        const mesFormatado = mes.padStart(2, '0');
        const resultado = `${ano}-${mesFormatado}-${diaFormatado}`;
        console.log('📅 Data DD/MM/YYYY convertida:', dataLimpa, '->', resultado);
        return resultado;
      }
    }

    // Se está no formato DD/MM/YY (ano abreviado)
    if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(dataLimpa)) {
      const [dia, mes, anoAbrev] = dataLimpa.split('/');
      const diaNum = parseInt(dia);
      const mesNum = parseInt(mes);
      
      if (mesNum >= 1 && mesNum <= 12 && diaNum >= 1 && diaNum <= 31) {
        const ano = parseInt(anoAbrev) < 50 ? `20${anoAbrev}` : `19${anoAbrev}`;
        const diaFormatado = dia.padStart(2, '0');
        const mesFormatado = mes.padStart(2, '0');
        const resultado = `${ano}-${mesFormatado}-${diaFormatado}`;
        console.log('📅 Data DD/MM/YY convertida:', dataLimpa, '->', resultado);
        return resultado;
      }
    }

    // Se está no formato DD-MM-YYYY, DD.MM.YYYY ou DD MM YYYY
    if (/^\d{1,2}[-\.\s]\d{1,2}[-\.\s]\d{4}$/.test(dataLimpa)) {
      const [dia, mes, ano] = dataLimpa.split(/[-\.\s]/);
      const diaNum = parseInt(dia);
      const mesNum = parseInt(mes);
      
      if (mesNum >= 1 && mesNum <= 12 && diaNum >= 1 && diaNum <= 31) {
        const diaFormatado = dia.padStart(2, '0');
        const mesFormatado = mes.padStart(2, '0');
        const resultado = `${ano}-${mesFormatado}-${diaFormatado}`;
        console.log('📅 Data DD-MM-YYYY/DD.MM.YYYY/DD MM YYYY convertida:', dataLimpa, '->', resultado);
        return resultado;
      }
    }

    // Formato americano MM/DD/YYYY (menos comum, mas possível)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dataLimpa)) {
      const [primeiro, segundo, ano] = dataLimpa.split('/');
      const primeiroNum = parseInt(primeiro);
      const segundoNum = parseInt(segundo);
      
      // Se o primeiro número é maior que 12, assume formato brasileiro (DD/MM/YYYY)
      if (primeiroNum > 12 && segundoNum >= 1 && segundoNum <= 12) {
        const diaFormatado = primeiro.padStart(2, '0');
        const mesFormatado = segundo.padStart(2, '0');
        const resultado = `${ano}-${mesFormatado}-${diaFormatado}`;
        console.log('📅 Data assumida como DD/MM/YYYY:', dataLimpa, '->', resultado);
        return resultado;
      }
      
      // Se o segundo número é maior que 12, assume formato americano (MM/DD/YYYY)
      if (segundoNum > 12 && primeiroNum >= 1 && primeiroNum <= 12) {
        const diaFormatado = segundo.padStart(2, '0');
        const mesFormatado = primeiro.padStart(2, '0');
        const resultado = `${ano}-${mesFormatado}-${diaFormatado}`;
        console.log('📅 Data assumida como MM/DD/YYYY:', dataLimpa, '->', resultado);
        return resultado;
      }
    }

    // Tentar interpretar como data em português
    try {
      const mesesPt = {
        'janeiro': '01', 'jan': '01', 'fevereiro': '02', 'fev': '02',
        'março': '03', 'mar': '03', 'abril': '04', 'abr': '04',
        'maio': '05', 'mai': '05', 'junho': '06', 'jun': '06',
        'julho': '07', 'jul': '07', 'agosto': '08', 'ago': '08',
        'setembro': '09', 'set': '09', 'outubro': '10', 'out': '10',
        'novembro': '11', 'nov': '11', 'dezembro': '12', 'dez': '12'
      };

      const textoData = dataLimpa.toLowerCase().replace(/[^\w\s]/g, ' ');
      console.log('📅 Tentando processar data em português:', textoData);
      
      for (const [mesNome, mesNum] of Object.entries(mesesPt)) {
        if (textoData.includes(mesNome)) {
          const partes = textoData.split(/\s+/).filter(p => p.length > 0);
          const dia = partes.find(p => /^\d{1,2}$/.test(p))?.padStart(2, '0') || '01';
          const ano = partes.find(p => /^\d{4}$/.test(p)) || new Date().getFullYear().toString();
          const resultado = `${ano}-${mesNum}-${dia}`;
          console.log('📅 Data em português convertida:', dataLimpa, '->', resultado);
          return resultado;
        }
      }
    } catch (error) {
      console.log('📅 Erro ao processar data em português:', error);
    }

    // Tentar interpretar números simples como formato brasileiro
    const numeros = dataLimpa.match(/\d+/g);
    if (numeros && numeros.length >= 3) {
      try {
        let dia = parseInt(numeros[0]);
        let mes = parseInt(numeros[1]);
        let ano = parseInt(numeros[2]);
        
        // Ajustar ano de 2 dígitos
        if (ano < 100) {
          ano = ano < 50 ? 2000 + ano : 1900 + ano;
        }
        
        // Validar se faz sentido como data
        if (mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31 && ano >= 1900 && ano <= 2100) {
          const diaFormatado = dia.toString().padStart(2, '0');
          const mesFormatado = mes.toString().padStart(2, '0');
          const resultado = `${ano}-${mesFormatado}-${diaFormatado}`;
          console.log('📅 Data extraída de números:', dataLimpa, '->', resultado);
          return resultado;
        }
      } catch (error) {
        console.log('📅 Erro ao processar números:', error);
      }
    }

    // Formato padrão se não conseguir processar - usar data atual + 30 dias
    const dataAtual = new Date();
    dataAtual.setDate(dataAtual.getDate() + 30);
    const resultado = dataAtual.toISOString().split('T')[0];
    console.log('📅 Data não reconhecida, usando data atual + 30 dias:', dataLimpa, '->', resultado);
    return resultado;
  };

  // Função para limpar dados com WebSocket
  const limparDados = () => {
    console.log('🗑️ Iniciando limpeza de dados...');
    
    if (username !== 'admin') {
      Alert.alert('Acesso Negado', 'Apenas administradores podem limpar os dados.');
      return;
    }

    Alert.alert(
      'Confirmar Limpeza',
      'Tem certeza que deseja remover todos os vãos? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🧹 Limpando todos os dados...');
              setMatos([]);
              await saveData([]);

              // Cancelar todas as notificações
              await Notifications.cancelAllScheduledNotificationsAsync();
              console.log('🔕 Notificações canceladas');

              // Broadcast da limpeza via WebSocket
              broadcastUpdate('clear_data', { cleared: true });

              setMatos([]);
              await saveData([]);
              console.log('✅ Dados limpos com sucesso!');
              Alert.alert('Sucesso', 'Todos os dados foram removidos.');
            } catch (error) {
              console.log('❌ Erro ao limpar dados:', error);
              Alert.alert('Erro', 'Erro ao limpar os dados.');
            }
          }
        ]
      );
  };

  // Função para criar vão de teste (desenvolvimento)
  const criarVaoTeste = async () => {
    console.log('🧪 Criando vão de teste...');
    
    Alert.alert(
      'Criar Vão de Teste',
      'Que tipo de teste deseja criar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Teste Simples', onPress: () => criarTesteSimples() },
        { text: 'Teste com Datas', onPress: () => criarTesteComDatas() },
        { text: 'Teste Completo', onPress: () => criarTesteCompleto() }
      ]
    );
  };

  const criarTesteSimples = async () => {
    const vaoTeste = {
      id: Date.now() + Math.random(),
      descricao: `Vão Teste Simples - ${new Date().toLocaleString('pt-BR')}`,
      localizacao: 'Local de Teste',
      area: '100m²',
      dataNecessidade: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pendente',
      dataHoraInicio: null,
      dataHoraConclusao: null,
      iniciadoPor: null,
      finalizadoPor: null,
      fotos: [],
      coordenadas: null,
      observacoes: 'Vão criado para teste simples'
    };

    const dadosAtualizados = [...matos, vaoTeste];
    setMatos(dadosAtualizados);
    await saveData(dadosAtualizados);
    await configurarNotificacoesPrazos(dadosAtualizados);
    broadcastUpdate('import_update', { data: dadosAtualizados });
    
    console.log('✅ Vão de teste simples criado!');
    Alert.alert('Sucesso', 'Vão de teste simples criado!');
  };

  const criarTesteComDatas = async () => {
    const hoje = new Date();
    const testeDatas = [
      {
        descricao: 'Teste - Vencendo Hoje',
        dataNecessidade: hoje.toISOString().split('T')[0],
        observacoes: 'Teste: vence hoje'
      },
      {
        descricao: 'Teste - Venceu Ontem',
        dataNecessidade: new Date(hoje.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Teste: venceu ontem (atrasado)'
      },
      {
        descricao: 'Teste - Vence em 3 dias',
        dataNecessidade: new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Teste: vence em 3 dias (urgente)'
      },
      {
        descricao: 'Teste - Vence em 10 dias',
        dataNecessidade: new Date(hoje.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Teste: vence em 10 dias (normal)'
      }
    ];

    const novosVaos = testeDatas.map((teste, index) => ({
      id: Date.now() + Math.random() + index,
      descricao: teste.descricao,
      localizacao: `Local Teste ${index + 1}`,
      area: `${100 + index * 50}m²`,
      dataNecessidade: teste.dataNecessidade,
      status: 'pendente',
      dataHoraInicio: null,
      dataHoraConclusao: null,
      iniciadoPor: null,
      finalizadoPor: null,
      fotos: [],
      coordenadas: null,
      observacoes: teste.observacoes
    }));

    const dadosAtualizados = [...matos, ...novosVaos];
    setMatos(dadosAtualizados);
    await saveData(dadosAtualizados);
    await configurarNotificacoesPrazos(dadosAtualizados);
    broadcastUpdate('import_update', { data: dadosAtualizados });
    
    console.log('✅ Vãos de teste com datas criados!');
    Alert.alert('Sucesso', `${novosVaos.length} vãos de teste com diferentes datas criados!`);
  };

  const criarTesteCompleto = async () => {
    const hoje = new Date();
    const testesCompletos = [
      {
        descricao: 'Jardim Central - Área Nobre',
        localizacao: 'Praça da Matriz, Centro',
        area: '250m²',
        dataNecessidade: new Date(hoje.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Área de alta visibilidade, cuidado com pedestres'
      },localizacao: 'Entrada Norte do Parque',
      { area: '150m²',
        descricao: 'Canteiro Rodoviário BR-101', + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        localizacao: 'Km 15, próximo ao viaduto',
        area: '500m²',
      {
        descricao: 'Vão Residencial - Conjunto Habitacional',
        localizacao: 'Rua das Flores, 123',
        area: '80m²',
        dataNecessidade: new Date(hoje.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'ATRASADO: Reclamação de moradores'
      }
    ];

    const novosVaos = testesCompletos.map((teste, index) => ({
      id: Date.now() + Math.random() + index,
      descricao: teste.descricao,
      localizacao: teste.localizacao,
      area: teste.area,
      dataNecessidade: teste.dataNecessidade,
      status: index === 2 ? 'iniciado' : 'pendente', // Um teste já iniciado
      dataHoraInicio: index === 2 ? new Date(hoje.getTime() - 12 * 60 * 60 * 1000).toISOString() : null,
      dataHoraConclusao: null,
      iniciadoPor: index === 2 ? username : null,
      finalizadoPor: null,
      fotos: [],
      coordenadas: null,
      observacoes: teste.observacoes
    }));

    const dadosAtualizados = [...matos, ...novosVaos];
    setMatos(dadosAtualizados);
    await saveData(dadosAtualizados);
    await configurarNotificacoesPrazos(dadosAtualizados);
    broadcastUpdate('import_update', { data: dadosAtualizados });
    
    console.log('✅ Vãos de teste completos criados!');
    Alert.alert('Sucesso', `${novosVaos.length} vãos de teste completos criados!\n\nIncluindo: urgente, atrasado, iniciado e normal.`);
  };

  // Função de diagnóstico do sistema
  const executarDiagnostico = () => {
    console.log('🔧 ==> EXECUTANDO DIAGNÓSTICO DO SISTEMA <==');
    
    const diagnostico = {
      versao: '1.0.0',
      timestamp: new Date().toISOString(),
      usuario: username,
      qtdVaos: matos.length,
      status: {
        logado: logado,
        importando: importando,
        conectado: isConnected,
        websocket: wsConnected,
        localizacao: locationPermission,
        notificacoes: notificationPermission
      },
      dados: {
        vaosTotal: matos.length,
        vaosPendentes: matos.filter(m => m.status === 'pendente').length,
        vaosIniciados: matos.filter(m => m.status === 'iniciado').length,
        vaosConcluidos: matos.filter(m => m.status === 'concluido').length,
        vaosUrgentes: matos.filter(m => {
          const dias = Math.ceil((new Date(m.dataNecessidade) - new Date()) / (1000 * 60 * 60 * 24));
          return dias <= 3 && dias >= 0;
        }).length,
        vaosAtrasados: matos.filter(m => {
          const dias = Math.ceil((new Date(m.dataNecessidade) - new Date()) / (1000 * 60 * 60 * 24));
          return dias < 0;
        }).length
      },
      dispositivo: {
        plataforma: Platform.OS,
        versao: Platform.Version
      }
    };

    console.log('📊 Diagnóstico completo:', diagnostico);

    // Verificar datas problemáticas
    const datasProblematicas = matos.filter(m => {
      const data = new Date(m.dataNecessidade);
      return isNaN(data.getTime()) || data.getFullYear() < 2020 || data.getFullYear() > 2030;
    });

    if (datasProblematicas.length > 0) {
      console.log('⚠️ Datas problemáticas encontradas:', datasProblematicas.map(m => ({
        id: m.id,
        descricao: m.descricao,
        dataNecessidade: m.dataNecessidade
      })));
    }

    // Verificar dados duplicados
    const duplicados = matos.filter((item, index, array) => 
      array.findIndex(i => i.descricao === item.descricao && i.localizacao === item.localizacao) !== index
    );

    if (duplicados.length > 0) {
      console.log('⚠️ Possíveis duplicados encontrados:', duplicados.length);
    }

    const resumo = `🔧 DIAGNÓSTICO DO SISTEMA

✅ ESTADO GERAL:
• Usuário: ${username} (${logado ? 'logado' : 'não logado'})
• Total de vãos: ${diagnostico.dados.vaosTotal}
• Conexão: ${isConnected ? 'online' : 'offline'}
• WebSocket: ${wsConnected ? 'conectado' : 'desconectado'}

📊 DISTRIBUIÇÃO POR STATUS:
• Pendentes: ${diagnostico.dados.vaosPendentes}
• Iniciados: ${diagnostico.dados.vaosIniciados}
• Concluídos: ${diagnostico.dados.vaosConcluidos}

⚠️ ALERTAS:
• Urgentes (≤3 dias): ${diagnostico.dados.vaosUrgentes}
• Atrasados: ${diagnostico.dados.vaosAtrasados}
• Datas problemáticas: ${datasProblematicas.length}
• Possíveis duplicados: ${duplicados.length}

🔧 PERMISSÕES:
• Localização: ${locationPermission ? 'OK' : 'Negada'}
• Notificações: ${notificationPermission ? 'OK' : 'Negada'}

📱 DISPOSITIVO:
• Plataforma: ${Platform.OS}
• Versão: ${Platform.Version}`;

    Alert.alert(
      'Diagnóstico do Sistema',
      resumo,
      [
        { text: 'Fechar', style: 'cancel' },
        { text: 'Ver Logs', onPress: () => console.log('Ver logs completos no console') }
      ],
      { cancelable: true }
    );
  };

  // Função para testar formatação de datas
  const testarFormatacaoDatas = () => {
    console.log('📅 ==> TESTANDO FORMATAÇÃO DE DATAS <==');
    
    const testeDatas = [
      '15/12/2024',
      '20/12/24',
      '25-12-2024',
      '30.12.2024',
      '2025-01-15',
      '5 de janeiro de 2025',
      '10 jan 2025',
      'data_inválida',
      '',
      null,
      '32/13/2024', // data inválida
      '05 fev 2024',
      '1/1/25'
    ];

    const resultados = testeDatas.map(data => ({
      original: data,
      formatada: formatarData(data),
      tipo: typeof data
    }));

    console.log('📅 Resultados dos testes de formatação:', resultados);

    const resumoTeste = resultados.map(r => 
      `${r.original || 'null'} → ${r.formatada}`
    ).join('\n');

    Alert.alert(
      'Teste de Formatação de Datas',
      `Resultados dos testes:\n\n${resumoTeste}`,
      [{ text: 'OK' }]
    );
  };

  // Interface principal
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vãos de Matos ({username})</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Status de sincronização */}
      {renderSyncStatus()}

      {/* Lista de vãos */}
      {renderMatosList()}
    </SafeAreaView>
  );
  
  // ===== FUNÇÕES AUXILIARES =====
}

// ===== ESTILOS =====

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingHorizontal: 30,
  },
  loginContainerOuter: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loginBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2E7D32',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textAlign: 'center',
  },
  logoSubtext: {
    fontSize: 16,
    color: '#B8E6B8',
    marginTop: 5,
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modernInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  modernLoginButton: {
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    padding: 18,
    alignItems: 'center',
    borderRadius: 12,
  },
  modernLoginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  accessHints: {
    marginTop: 25,
    padding: 15,
    backgroundColor: '#F0F8F0',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 5,
  },
  hintDetail: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 10,
    marginBottom: 2,
  },
  loginFooter: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#B8E6B8',
    opacity: 0.7,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 10,
    elevation: 2,
  },
  importButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  clearButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  testButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  vaosContainer: {
    flex: 1,
  },
  vaoItem: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    borderLeftWidth: 5,
  },
  vaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  vaoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  vaoStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  vaoDetails: {
    marginBottom: 10,
  },
  vaoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  iniciarButton: {
    backgroundColor: '#FF9800',
  },
  finalizarButton: {
    backgroundColor: '#4CAF50',
  },
  mediaButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImportButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginRight: 10,
  },
  emptyImportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyTestButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginLeft: 10,
  },
  emptyTestButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  syncStatusContainer: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncStatusText: {
    fontSize: 12,
    color: '#666',
  },
  connectedIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  disconnectedIndicator: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncingIndicator: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  offlineIndicator: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: '600',
  },

  // === ESTILOS DO PAINEL ADMINISTRATIVO ===
  adminPanel: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  adminHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  adminHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  adminHeaderSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  adminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  adminCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  importCard: {
    borderLeftColor: '#2196F3',
  },
  clearCard: {
    borderLeftColor: '#FF5722',
  },
  testCard: {
    borderLeftColor: '#4CAF50',
  },
  diagnosticCard: {
    borderLeftColor: '#9C27B0',
  },
  dateTestCard: {
    borderLeftColor: '#00BCD4',
  },
  statsCard: {
    width: '100%',
    borderLeftColor: '#FF9800',
    backgroundColor: '#FFF8E1',
  },
  adminCardIcon: {
    alignItems: 'center',
    marginBottom: 10,
  },
  adminCardIconText: {
    fontSize: 24,
  },
  adminCardContent: {
    alignItems: 'center',
  },
  adminCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
    textAlign: 'center',
  },
  adminCardDescription: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  adminCardLoader: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  statsRow: {
    marginTop: 10,
    width: '100%',
  },
  statsPendente: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  statsIniciado: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 2,
  },
  statsConcluido: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 2,
  },
  listContainer: {
    flex: 1,
    padding: 10,
  },
  // Estilos para classes de prazo
  vaoAtrasado: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderLeftWidth: 6,
    elevation: 4,
  },
  vaoUrgente: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    borderLeftWidth: 6,
    elevation: 3,
  },
  vaoNormal: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
    borderLeftWidth: 4,
  },
  textoAtrasado: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  textoUrgente: {
    color: '#F57C00',
    fontWeight: '600',
  },
  diagnosticCard: {
    borderLeftColor: '#9C27B0',
  },
  dateTestCard: {
    borderLeftColor: '#00BCD4',
  },
});

export default App;