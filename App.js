import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Image,
  NetInfo,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Button, ListItem, Header, Badge } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

import LoginScreen from './components/LoginScreen';
import SyncStatus from './components/SyncStatus';
import { StorageService, SyncService } from './services/StorageService';

// Usuários pré-definidos
const USUARIOS = {
  'usuario': { senha: 'esul1234', tipo: 'usuario' },
  'admin': { senha: 'eletro1234', tipo: 'admin' }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [matos, setMatos] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [completedItems, setCompletedItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para autenticação
  const [logado, setLogado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  
  // Estado para sincronização
  const [sincronizando, setSincronizando] = useState(false);
  const [conectado, setConectado] = useState(true);
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState(null);

  useEffect(() => {
    verificarLogin();
  }, []);

  useEffect(() => {
    const completed = matos.filter(item => item.status === 'concluido').length;
    setCompletedItems(completed);
    setTotalItems(matos.length);
  }, [matos]);

  // Verificar login existente
  const verificarLogin = async () => {
    try {
      const usuarioSalvo = await AsyncStorage.getItem('usuario');
      if (usuarioSalvo) {
        const dadosUsuario = JSON.parse(usuarioSalvo);
        setUsuario(dadosUsuario);
        setLogado(true);
        carregarDados();
      }
    } catch (erro) {
      console.log('Erro ao verificar login:', erro);
    } finally {
      setCarregando(false);
    }
  };

  // Carregar dados locais
  const carregarDados = async () => {
    try {
      const dadosSalvos = await AsyncStorage.getItem('vaos');
      if (dadosSalvos) {
        setMatos(JSON.parse(dadosSalvos));
      } else {
        // Adicionar um vão de exemplo se não houver dados
        adicionarVaoExemplo();
      }
    } catch (erro) {
      console.log('Erro ao carregar dados:', erro);
      adicionarVaoExemplo();
    }
  };

  // Salvar dados localmente
  const salvarDados = async (dadosVaos) => {
    try {
      await AsyncStorage.setItem('vaos', JSON.stringify(dadosVaos));
    } catch (erro) {
      console.log('Erro ao salvar dados:', erro);
    }
  };

  // Login de usuário
  const fazerLogin = () => {
    setErroLogin('');
    
    if (!username.trim() || !senha.trim()) {
      setErroLogin('Preencha todos os campos');
      return;
    }
    
    const usuarioEncontrado = USUARIOS[username];
    
    if (!usuarioEncontrado || usuarioEncontrado.senha !== senha) {
      setErroLogin('Usuário ou senha incorretos');
      return;
    }
    
    const dadosUsuario = {
      username: username,
      tipo: usuarioEncontrado.tipo
    };
    
    setUsuario(dadosUsuario);
    AsyncStorage.setItem('usuario', JSON.stringify(dadosUsuario));
    setLogado(true);
    carregarDados();
  };

  // Logout
  const fazerLogout = async () => {
    await AsyncStorage.removeItem('usuario');
    setUsuario(null);
    setLogado(false);
    setSenha('');
    setUsername('');
  };

  // Função para sincronizar dados
  const sincronizarDados = async () => {
    if (!conectado) {
      Alert.alert('Sem conexão', 'Você precisa estar conectado à internet para sincronizar.');
      return;
    }
    
    setSincronizando(true);
    
    try {
      // Simulando uma chamada de API para sincronização
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Em uma aplicação real, aqui você faria uma chamada para sua API
      // para enviar os dados atualizados e receber os dados do servidor
      
      const agora = new Date().toLocaleString();
      setUltimaSincronizacao(agora);
      await AsyncStorage.setItem('ultimaSincronizacao', agora);
      
      Alert.alert('Sucesso', 'Dados sincronizados com sucesso!');
    } catch (erro) {
      Alert.alert('Erro', 'Erro ao sincronizar dados. Tente novamente.');
      console.log('Erro na sincronização:', erro);
    } finally {
      setSincronizando(false);
    }
  };

  // Verificar conectividade
  useEffect(() => {
    // Carregar última data de sincronização
    AsyncStorage.getItem('ultimaSincronizacao').then(data => {
      if (data) setUltimaSincronizacao(data);
    });
    
    // Em um app real, usaria NetInfo para monitorar conectividade
    // Simulando com uma função simples aqui
    const verificarConexao = () => {
      // Simular uma conexão aleatória para demonstração
      const temConexao = Math.random() > 0.2; // 80% de chance de estar conectado
      setConectado(temConexao);
    };
    
    verificarConexao();
    const intervalo = setInterval(verificarConexao, 30000);
    
    return () => clearInterval(intervalo);
  }, []);

  const adicionarVaoExemplo = () => {
    const exemplo = {
      id: Date.now(),
      descricao: 'Corte Vão Principal - Linha A',
      localizacao: 'Setor Norte - KM 15',
      area: '150m²',
      dataNecessidade: '2025-02-15',
      status: 'pendente',
      dataInicio: null,
      dataConclusao: null,
      atualizadoPor: null
    };
    const novosVaos = [exemplo];
    setMatos(novosVaos);
    salvarDados(novosVaos);
  };
  
  const adicionarVao = () => {
    if (!novoVao.descricao.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return;
    }
    
    const vao = {
      id: Date.now(),
      ...novoVao,
      status: 'pendente',
      dataInicio: null,
      dataConclusao: null,
      atualizadoPor: null
    };
    
    const novosVaos = [...matos, vao];
    setMatos(novosVaos);
    salvarDados(novosVaos);
    setNovoVao({ descricao: '', localizacao: '', area: '', dataNecessidade: '' });
    setModalVisible(false);
    Alert.alert('Sucesso', 'Vão adicionado com sucesso!');
  };
  
  const alterarStatus = (id, novoStatus) => {
    const novosVaos = matos.map(vao => {
      if (vao.id === id) {
        const agora = new Date().toISOString().split('T')[0];
        return {
          ...vao,
          status: novoStatus,
          dataInicio: novoStatus === 'iniciado' ? agora : vao.dataInicio,
          dataConclusao: novoStatus === 'concluido' ? agora : null,
          atualizadoPor: usuario.username
        };
      }
      return vao;
    });
    
    setMatos(novosVaos);
    salvarDados(novosVaos);
  };
  
  const getCorStatus = (status) => {
    switch(status) {
      case 'pendente': return '#9E9E9E';
      case 'iniciado': return '#FF9800';
      case 'concluido': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };
  
  const getStatusIcon = (vao) => {
    const hoje = new Date();
    const dataNecessidade = new Date(vao.dataNecessidade);
    const diasRestantes = Math.ceil((dataNecessidade - hoje) / (1000 * 60 * 60 * 24));
    
    if (vao.status === 'concluido') return '✅';
    if (diasRestantes < 0) return '⚠️'; // Atrasado
    if (diasRestantes <= 7) return '🕐'; // Urgente
    return '📅'; // Normal
  };
  
  const contarStatus = () => {
    const pendentes = matos.filter(v => v.status === 'pendente').length;
    const iniciados = matos.filter(v => v.status === 'iniciado').length;
    const concluidos = matos.filter(v => v.status === 'concluido').length;
    return { pendentes, iniciados, concluidos };
  };
  
  // Verificar se é admin
  const isAdmin = () => {
    return usuario && usuario.tipo === 'admin';
  };
  
  // Se estiver carregando, mostrar spinner
  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#2E7D32" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Se não estiver logado, mostrar tela de login
  if (!logado) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#2E7D32" />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.loginContainer}
        >
          <View style={styles.loginHeader}>
            <Text style={styles.loginTitle}>🌿 Corte de Matos</Text>
            <Text style={styles.loginSubtitle}>Sistema de Gestão</Text>
          </View>
          
          <View style={styles.loginForm}>
            {erroLogin ? (
              <Text style={styles.erroLogin}>{erroLogin}</Text>
            ) : null}
            
            <TextInput
              style={styles.loginInput}
              placeholder="Nome de usuário"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.loginInput}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={true}
            />
            
            <TouchableOpacity style={styles.loginButton} onPress={fazerLogin}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
            
            <View style={styles.loginInfo}>
              <Text style={styles.loginInfoText}>
                Use as credenciais fornecidas pelo administrador
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
  
  // Usuário logado - mostrar interface principal
  const stats = contarStatus();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🌿 Corte de Matos</Text>
          <Text style={styles.subtitle}>
            Olá, {usuario.username} ({usuario.tipo === 'admin' ? 'Administrador' : 'Operador'})
          </Text>
        </View>
        
        {/* Botão de logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={fazerLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
      
      {/* Barra de sincronização */}
      <View style={styles.syncBar}>
        <View style={styles.syncStatus}>
          <Text style={styles.syncStatusText}>
            {conectado ? '🟢 Online' : '🔴 Offline'}
          </Text>
          {ultimaSincronizacao && (
            <Text style={styles.syncTimeText}>
              Última sincronização: {ultimaSincronizacao}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.syncButton} 
          onPress={sincronizarDados}
          disabled={sincronizando}
        >
          {sincronizando ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.syncButtonText}>🔄 Sincronizar</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.pendentes}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, {color: '#FF9800'}]}>{stats.iniciados}</Text>
          <Text style={styles.statLabel}>Iniciados</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, {color: '#4CAF50'}]}>{stats.concluidos}</Text>
          <Text style={styles.statLabel}>Concluídos</Text>
        </View>
      </View>
      
      {/* Botão Adicionar - só para admin */}
      {isAdmin() && (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>➕ Adicionar Novo Vão</Text>
        </TouchableOpacity>
      )}
      
      {/* Lista de Vãos */}
      <ScrollView style={styles.lista}>
        {matos.map((vao) => (
          <View key={vao.id} style={[styles.vaoCard, { borderLeftColor: getCorStatus(vao.status) }]}>
            <View style={styles.vaoHeader}>
              <Text style={styles.vaoIcon}>{getStatusIcon(vao)}</Text>
              <Text style={styles.vaoDescricao}>{vao.descricao}</Text>
            </View>
            
            <Text style={styles.vaoInfo}>📍 {vao.localizacao}</Text>
            <Text style={styles.vaoInfo}>📏 Área: {vao.area}</Text>
            <Text style={styles.vaoInfo}>📅 Prazo: {vao.dataNecessidade}</Text>
            
            <View style={styles.statusContainer}>
              <Text style={[styles.status, { color: getCorStatus(vao.status) }]}>
                ● {vao.status.toUpperCase()}
              </Text>
              
              {vao.atualizadoPor && vao.status !== 'pendente' && (
                <Text style={styles.updatedByText}>
                  Atualizado por: {vao.atualizadoPor}
                </Text>
              )}
            </View>
            
            {/* Botões de Ação */}
            <View style={styles.actionButtons}>
              {vao.status === 'pendente' && (
                <TouchableOpacity 
                  style={[styles.actionBtn, {backgroundColor: '#FF9800'}]}
                  onPress={() => alterarStatus(vao.id, 'iniciado')}
                >
                  <Text style={styles.actionBtnText}>▶️ Iniciar</Text>
                </TouchableOpacity>
              )}
              
              {vao.status === 'iniciado' && (
                <TouchableOpacity 
                  style={[styles.actionBtn, {backgroundColor: '#4CAF50'}]}
                  onPress={() => alterarStatus(vao.id, 'concluido')}
                >
                  <Text style={styles.actionBtnText}>✅ Concluir</Text>
                </TouchableOpacity>
              )}
              
              {vao.status === 'concluido' && (
                <View style={[styles.actionBtn, {backgroundColor: '#4CAF50'}]}>
                  <Text style={styles.actionBtnText}>✅ Finalizado</Text>
                </View>
              )}
            </View>
          </View>
        ))}
        
        {matos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              🌿 Nenhum vão cadastrado{'\n'}
              {isAdmin() ? 'Toque no botão acima para adicionar' : 'Aguarde o administrador adicionar vãos'}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Modal Adicionar Vão - só para admin */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Vão de Corte</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Descrição do vão"
              value={novoVao.descricao}
              onChangeText={(text) => setNovoVao({...novoVao, descricao: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Localização"
              value={novoVao.localizacao}
              onChangeText={(text) => setNovoVao({...novoVao, localizacao: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Área (ex: 100m²)"
              value={novoVao.area}
              onChangeText={(text) => setNovoVao({...novoVao, area: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Data necessidade (AAAA-MM-DD)"
              value={novoVao.dataNecessidade}
              onChangeText={(text) => setNovoVao({...novoVao, dataNecessidade: text})}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, {backgroundColor: '#f44336'}]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, {backgroundColor: '#4CAF50'}]}
                onPress={adicionarVao}
              >
                <Text style={styles.modalBtnText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Corte de Matos v1.1 - Total: {matos.length} vãos
          {isAdmin() ? ' | Modo Admin' : ''}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Loading
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
  // Login
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  loginSubtitle: {
    fontSize: 18,
    color: '#555',
  },
  loginForm: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loginInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginInfoText: {
    color: '#666',
    textAlign: 'center',
  },
  erroLogin: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  // Header
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 20,
      },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#C8E6C9',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Sincronização
  syncBar: {
    backgroundColor: '#E8F5E9',
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  syncStatus: {
    flex: 1,
  },
  syncStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  syncTimeText: {
    fontSize: 12,
    color: '#666',
  },
  syncButton: {
    backgroundColor: '#388E3C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  // Botão Adicionar
  addButton: {
    backgroundColor: '#4CAF50',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Lista
  lista: {
    flex: 1,
    paddingHorizontal: 15,
  },
  vaoCard: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  vaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  vaoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  vaoDescricao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  vaoInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statusContainer: {
    marginVertical: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  updatedByText: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
    fontStyle: 'italic',
  },
  actionButtons: {
    marginTop: 10,
  },
  actionBtn: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Footer
  footer: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
});
