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
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';

// Ignorar avisos específicos para SDK 29
// Configuração silenciosa - removido LogBox por compatibilidade com Hermes
// LogBox.ignoreLogs(['Require cycle:', 'AsyncStorage has been extracted']);

// Usuários pré-definidos
const USUARIOS = {
  'usuario': { senha: 'esul1234', tipo: 'usuario' },
  'admin': { senha: 'eletro1234', tipo: 'admin' }
};

export default function App() {
  // Estado para controle de inicialização
  const [isInitialized, setIsInitialized] = useState(false);
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
  
  // Estado para adicionar novo vão
  const [modalVisible, setModalVisible] = useState(false);
  const [novoVao, setNovoVao] = useState({
    descricao: '',
    localizacao: '',
    area: '',
    dataNecessidade: ''
  });
  
  // Estado para importação de Excel
  const [importando, setImportando] = useState(false);

  useEffect(() => {
    verificarLogin();
  }, []);

  useEffect(() => {
    const completed = matos.filter(item => item.status === 'concluido').length;
    setCompletedItems(completed);
    setTotalItems(matos.length);
  }, [matos]);

  // Verificar conectividade
  useEffect(() => {
    // Carregar última data de sincronização
    AsyncStorage.getItem('ultimaSincronizacao').then(data => {
      if (data) setUltimaSincronizacao(data);
    });
    
    // Em um app real, usaria NetInfo para monitorar conectividade
    setConectado(true);
  }, []);

  // Verificar se todos os componentes estão inicializados
  useEffect(() => {
    try {
      // Verificar se todos os módulos necessários estão disponíveis
      if (Platform && 
          AsyncStorage && 
          DocumentPicker && 
          FileSystem && 
          Print && 
          Sharing) {
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("Erro na inicialização:", error);
      Alert.alert(
        "Erro na Inicialização",
        "Houve um problema ao inicializar o aplicativo. Por favor, reinicie o aplicativo."
      );
    }
  }, []);

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

  // Função para importar planilha Excel
  const importExcel = async () => {
    if (!isAdmin()) {
      Alert.alert('Acesso Negado', 'Apenas administradores podem importar planilhas.');
      return;
    }
    
    setImportando(true);
    
    try {
      // Selecionar arquivo CSV
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv', 'text/plain'],
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        setImportando(false);
        return;
      }
      
      // Ler o arquivo como texto
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // Processar CSV
      const lines = fileContent.split(/\r?\n/).filter(line => line.trim());
      
      if (lines.length < 2) {
        Alert.alert('Arquivo Inválido', 'O arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados.');
        setImportando(false);
        return;
      }
      
      // Detectar separador (vírgula ou ponto e vírgula)
      const header = lines[0];
      const separator = header.includes(';') ? ';' : ',';
      
      // Processar dados
      const jsonData = [];
      for (let i = 1; i < lines.length; i++) {
        const valores = lines[i].split(separator).map(v => v.trim().replace(/['"]/g, ''));
        
        if (valores.length >= 3) {
          jsonData.push({
            Descricao: valores[0] || `Vão ${i}`,
            Localizacao: valores[1] || 'Não informado',
            Area: valores[2] || '0m²',
            DataNecessidade: valores[3] || new Date().toISOString().split('T')[0]
          });
        }
      }
      
      if (jsonData.length === 0) {
        Alert.alert('Nenhum Dado Válido', 'Não foi possível processar nenhum item do arquivo.');
        setImportando(false);
        return;
      }
      
      // Mapear dados da planilha para o formato do app
      const novosVaos = jsonData.map((linha, index) => ({
        id: Date.now() + index,
        descricao: linha.Descricao || 'Sem descrição',
        localizacao: linha.Localizacao || 'Local não especificado',
        area: linha.Area || '0m²',
        dataNecessidade: linha.DataNecessidade || new Date().toISOString().split('T')[0],
        status: 'pendente',
        dataInicio: null,
        dataConclusao: null,
        atualizadoPor: null
      }));
      
      // Atualizar a lista
      setMatos(novosVaos);
      salvarDados(novosVaos);
      
      Alert.alert(
        'Importação Concluída', 
        `${novosVaos.length} vãos foram importados com sucesso.`
      );
      
    } catch (erro) {
      console.log('Erro ao importar Excel:', erro);
      Alert.alert(
        'Erro na Importação', 
        'Não foi possível importar a planilha. Verifique o formato do arquivo.'
      );
    } finally {
      setImportando(false);
    }
  };
  
  // Função para gerar relatório PDF
  const gerarRelatorio = async () => {
    try {
      // Dados para o relatório
      const stats = contarStatus();
      const hoje = new Date().toLocaleDateString();
      
      // Gerar HTML para o PDF
      const html = `
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; color: #333; padding: 20px; }
            h1 { color: #2E7D32; text-align: center; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { text-align: center; padding: 10px; }
            .stat-number { font-size: 24px; font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .table th { background-color: #f5f5f5; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            .pendente { color: #9E9E9E; }
            .iniciado { color: #FF9800; }
            .concluido { color: #4CAF50; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌿 Relatório de Corte de Matos</h1>
            <p>Gerado em ${hoje} por ${usuario.username}</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-number">${stats.pendentes}</div>
              <div>Pendentes</div>
            </div>
            <div class="stat-box">
              <div class="stat-number" style="color: #FF9800">${stats.iniciados}</div>
              <div>Iniciados</div>
            </div>
            <div class="stat-box">
              <div class="stat-number" style="color: #4CAF50">${stats.concluidos}</div>
              <div>Concluídos</div>
            </div>
          </div>
          
          <h2>Detalhes dos Vãos</h2>
          <table class="table">
            <tr>
              <th>Descrição</th>
              <th>Localização</th>
              <th>Área</th>
              <th>Prazo</th>
              <th>Status</th>
            </tr>
            ${matos.map(vao => `
              <tr>
                <td>${vao.descricao}</td>
                <td>${vao.localizacao}</td>
                <td>${vao.area}</td>
                <td>${vao.dataNecessidade}</td>
                <td class="${vao.status}">${vao.status.toUpperCase()}</td>
              </tr>
            `).join('')}
          </table>
          
          <div class="footer">
            <p>Sistema de Gestão de Corte de Matos v1.1 - Total: ${matos.length} vãos</p>
          </div>
        </body>
        </html>
      `;
      
      // Gerar o PDF
      const { uri } = await Print.printToFileAsync({ html });
      
      // Compartilhar o arquivo
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar Relatório',
        UTI: 'com.adobe.pdf'
      });
      
    } catch (erro) {
      console.log('Erro ao gerar relatório:', erro);
      Alert.alert(
        'Erro', 
        'Não foi possível gerar o relatório. Tente novamente.'
      );
    }
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
      <SafeAreaView style={styles.loginSafeArea}>
        <StatusBar style="light" backgroundColor="#1B5E20" />
        
        {/* Fundo com gradiente */}
        <LinearGradient
          colors={['#1B5E20', '#2E7D32', '#388E3C']}
          style={styles.loginGradientBackground}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.loginKeyboardContainer}
          >
            <View style={styles.loginContentContainer}>
              
              {/* Header com logo e título */}
              <View style={styles.loginHeaderSection}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={styles.logoCircle}
                  >
                    <Text style={styles.logoIcon}>🌿</Text>
                  </LinearGradient>
                </View>
                
                <Text style={styles.appTitle}>Corte de Matos</Text>
                <Text style={styles.appSubtitle}>Sistema Inteligente de Gestão</Text>
                <View style={styles.titleUnderline} />
              </View>
              
              {/* Formulário de login */}
              <View style={styles.loginFormCard}>
                <View style={styles.loginFormHeader}>
                  <Text style={styles.loginFormTitle}>Acesso ao Sistema</Text>
                  <Text style={styles.loginFormSubtitle}>Entre com suas credenciais</Text>
                </View>
                
                {erroLogin ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{erroLogin}</Text>
                  </View>
                ) : null}
                
                {/* Campo Usuário */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Text style={styles.inputIcon}>👤</Text>
                  </View>
                  <TextInput
                    style={styles.modernInput}
                    placeholder="Nome de usuário"
                    placeholderTextColor="#9E9E9E"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
                
                {/* Campo Senha */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Text style={styles.inputIcon}>🔒</Text>
                  </View>
                  <TextInput
                    style={styles.modernInput}
                    placeholder="Senha"
                    placeholderTextColor="#9E9E9E"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry={true}
                  />
                </View>
                
                {/* Botão de Login */}
                <TouchableOpacity 
                  style={styles.modernLoginButton} 
                  onPress={fazerLogin}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={styles.loginButtonGradient}
                  >
                    <Text style={styles.modernLoginButtonText}>
                      {carregando ? '⏳ Entrando...' : '🚀 Entrar'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* Informações de acesso */}
                <View style={styles.loginInfoSection}>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Credenciais de Acesso</Text>
                    <View style={styles.dividerLine} />
                  </View>
                  
                  <View style={styles.credentialsContainer}>
                    <View style={styles.credentialItem}>
                      <Text style={styles.credentialLabel}>👨‍💼 Usuário:</Text>
                      <Text style={styles.credentialValue}>usuario / esul1234</Text>
                    </View>
                    
                    <View style={styles.credentialItem}>
                      <Text style={styles.credentialLabel}>🛠️ Admin:</Text>
                      <Text style={styles.credentialValue}>admin / eletro1234</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Footer */}
              <View style={styles.loginFooter}>
                <Text style={styles.footerText}>
                  © 2025 Sistema de Controle de Corte de Matos
                </Text>
                <Text style={styles.footerSubtext}>
                  Versão 2.0 • Desenvolvido com ❤️
                </Text>
              </View>
              
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  
  // Usuário logado - mostrar interface principal
  const stats = contarStatus();
  
  return (
    <>
      {isInitialized ? (
        <SafeAreaView style={styles.mainContainer}>
          <StatusBar style="light" backgroundColor="#1B5E20" />
          
          {/* Header Moderno */}
          <LinearGradient
            colors={['#1B5E20', '#2E7D32']}
            style={styles.modernHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.profileContainer}>
                  <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={styles.profileAvatar}
                  >
                    <Text style={styles.profileIcon}>
                      {usuario.tipo === 'admin' ? '👨‍💼' : '👤'}
                    </Text>
                  </LinearGradient>
                  <View style={styles.profileInfo}>
                    <Text style={styles.welcomeText}>Olá!</Text>
                    <Text style={styles.usernameText}>{usuario.username}</Text>
                    <View style={styles.roleContainer}>
                      <Text style={styles.roleText}>
                        {usuario.tipo === 'admin' ? '🛠️ Administrador' : '⚡ Operador'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity style={styles.modernLogoutButton} onPress={fazerLogout}>
                <LinearGradient
                  colors={['#F44336', '#E57373']}
                  style={styles.logoutGradient}
                >
                  <Text style={styles.logoutIcon}>🚪</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            {/* Status Bar */}
            <View style={styles.statusBar}>
              <View style={styles.connectionStatus}>
                <View style={[styles.statusDot, { backgroundColor: conectado ? '#4CAF50' : '#F44336' }]} />
                <Text style={styles.statusText}>
                  {conectado ? 'Online' : 'Offline'}
                </Text>
                {ultimaSincronizacao && (
                  <Text style={styles.lastSyncText}>
                    • Sync: {ultimaSincronizacao.split(' ')[1]}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.modernSyncButton} 
                onPress={sincronizarDados}
                disabled={sincronizando}
              >
                {sincronizando ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={styles.syncIcon}>🔄</Text>
                    <Text style={styles.syncText}>Sync</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
          
          {/* Dashboard de Estatísticas */}
          <View style={styles.dashboardContainer}>
            <Text style={styles.dashboardTitle}>📊 Painel de Controle</Text>
            
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={['#9E9E9E', '#BDBDBD']}
                style={[styles.statCard, styles.pendentesCard]}
              >
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>⏳</Text>
                </View>
                <Text style={styles.statNumber}>{stats.pendentes}</Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </LinearGradient>
              
              <LinearGradient
                colors={['#FF9800', '#FFB74D']}
                style={[styles.statCard, styles.iniciadosCard]}
              >
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>⚡</Text>
                </View>
                <Text style={styles.statNumber}>{stats.iniciados}</Text>
                <Text style={styles.statLabel}>Em Andamento</Text>
              </LinearGradient>
              
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={[styles.statCard, styles.concluidosCard]}
              >
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>✅</Text>
                </View>
                <Text style={styles.statNumber}>{stats.concluidos}</Text>
                <Text style={styles.statLabel}>Concluídos</Text>
              </LinearGradient>
            </View>
            
            {/* Barra de Progresso */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Progresso Geral</Text>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${((stats.concluidos / (stats.pendentes + stats.iniciados + stats.concluidos)) * 100) || 0}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(((stats.concluidos / (stats.pendentes + stats.iniciados + stats.concluidos)) * 100) || 0)}% Concluído
              </Text>
            </View>
          </View>
          
          {/* Menu de Administrador Sofisticado */}
          {isAdmin() && (
            <View style={styles.adminMenuContainer}>
              <View style={styles.adminMenuHeader}>
                <LinearGradient
                  colors={['#FF6F00', '#FF8F00']}
                  style={styles.adminBadge}
                >
                  <Text style={styles.adminBadgeText}>🛠️ ADMIN</Text>
                </LinearGradient>
                <Text style={styles.adminMenuTitle}>Painel Administrativo</Text>
                <Text style={styles.adminMenuSubtitle}>Controle total do sistema</Text>
              </View>
              
              <View style={styles.adminActionsGrid}>
                <TouchableOpacity 
                  style={styles.adminActionCard} 
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#2196F3', '#42A5F5']}
                    style={styles.adminActionGradient}
                  >
                    <View style={styles.adminActionIcon}>
                      <Text style={styles.adminActionIconText}>➕</Text>
                    </View>
                    <Text style={styles.adminActionTitle}>Adicionar</Text>
                    <Text style={styles.adminActionSubtitle}>Novo Vão</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.adminActionCard} 
                  onPress={importExcel}
                  disabled={importando}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={importando ? ['#9E9E9E', '#BDBDBD'] : ['#4CAF50', '#66BB6A']}
                    style={styles.adminActionGradient}
                  >
                    <View style={styles.adminActionIcon}>
                      {importando ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.adminActionIconText}>📁</Text>
                      )}
                    </View>
                    <Text style={styles.adminActionTitle}>
                      {importando ? 'Importando...' : 'Importar'}
                    </Text>
                    <Text style={styles.adminActionSubtitle}>CSV/Excel</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.adminActionCard} 
                  onPress={gerarRelatorio}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#9C27B0', '#BA68C8']}
                    style={styles.adminActionGradient}
                  >
                    <View style={styles.adminActionIcon}>
                      <Text style={styles.adminActionIconText}>📊</Text>
                    </View>
                    <Text style={styles.adminActionTitle}>Relatório</Text>
                    <Text style={styles.adminActionSubtitle}>Gerar PDF</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.adminActionCard} 
                  onPress={() => Alert.alert('Em Breve', 'Funcionalidade em desenvolvimento')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF5722', '#FF7043']}
                    style={styles.adminActionGradient}
                  >
                    <View style={styles.adminActionIcon}>
                      <Text style={styles.adminActionIconText}>⚙️</Text>
                    </View>
                    <Text style={styles.adminActionTitle}>Configurações</Text>
                    <Text style={styles.adminActionSubtitle}>Sistema</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              {/* Estatísticas Avançadas para Admin */}
              <View style={styles.adminStatsContainer}>
                <Text style={styles.adminStatsTitle}>📈 Métricas Avançadas</Text>
                <View style={styles.adminStatsRow}>
                  <View style={styles.adminStatItem}>
                    <Text style={styles.adminStatNumber}>{matos.length}</Text>
                    <Text style={styles.adminStatLabel}>Total de Vãos</Text>
                  </View>
                  <View style={styles.adminStatItem}>
                    <Text style={[styles.adminStatNumber, { color: '#F44336' }]}>
                      {matos.filter(v => {
                        const dias = Math.ceil((new Date(v.dataNecessidade) - new Date()) / (1000 * 60 * 60 * 24));
                        return dias < 0 && v.status !== 'concluido';
                      }).length}
                    </Text>
                    <Text style={styles.adminStatLabel}>Atrasados</Text>
                  </View>
                  <View style={styles.adminStatItem}>
                    <Text style={[styles.adminStatNumber, { color: '#FF9800' }]}>
                      {matos.filter(v => {
                        const dias = Math.ceil((new Date(v.dataNecessidade) - new Date()) / (1000 * 60 * 60 * 24));
                        return dias <= 3 && dias >= 0 && v.status !== 'concluido';
                      }).length}
                    </Text>
                    <Text style={styles.adminStatLabel}>Urgentes</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          
          {/* Lista de Vãos */}
          <ScrollView style={styles.lista}>
            {matos.map((vao) => {
              // Calcular status do prazo
              const hoje = new Date();
              const dataNecessidade = new Date(vao.dataNecessidade);
              const diasRestantes = Math.ceil((dataNecessidade - hoje) / (1000 * 60 * 60 * 24));
              
              // Determinar classe de prazo e indicador
              let classPrazo = 'normal';
              let indicadorPrazo = '';
              let corPrazo = '#4CAF50';
              
              if (vao.status !== 'concluido') {
                if (diasRestantes < 0) {
                  classPrazo = 'atrasado';
                  indicadorPrazo = '⚠️';
                  corPrazo = '#F44336';
                } else if (diasRestantes <= 3) {
                  classPrazo = 'urgente';
                  indicadorPrazo = '🕐';
                  corPrazo = '#FF9800';
                } else if (diasRestantes <= 7) {
                  classPrazo = 'proximoVencimento';
                  indicadorPrazo = '⏰';
                  corPrazo = '#FFC107';
                }
              }

              // Determinar estilo do card baseado no status e prazo
              const getCardStyle = () => {
                const baseStyle = [styles.vaoCard];
                
                // Estilo baseado no status
                if (vao.status === 'pendente') {
                  baseStyle.push(styles.vaoItemPendente);
                } else if (vao.status === 'iniciado') {
                  baseStyle.push(styles.vaoItemIniciado);
                } else if (vao.status === 'concluido') {
                  baseStyle.push(styles.vaoItemConcluido);
                }
                
                // Estilo baseado no prazo (apenas se não estiver concluído)
                if (vao.status !== 'concluido') {
                  if (classPrazo === 'atrasado') {
                    baseStyle.push(styles.vaoItemAtrasado);
                  } else if (classPrazo === 'urgente') {
                    baseStyle.push(styles.vaoItemUrgente);
                  } else if (classPrazo === 'proximoVencimento') {
                    baseStyle.push(styles.vaoItemProximoVencimento);
                  }
                }
                
                return baseStyle;
              };

              return (
                <View key={vao.id} style={getCardStyle()}>
                  <View style={styles.vaoHeader}>
                    <View style={styles.vaoTitleContainer}>
                      <Text style={styles.vaoIcon}>{getStatusIcon(vao)}</Text>
                      <Text style={styles.vaoDescricao}>
                        {indicadorPrazo} {vao.descricao}
                      </Text>
                      {vao.status !== 'concluido' && classPrazo !== 'normal' && (
                        <View style={[styles.prazoIndicator, { backgroundColor: corPrazo }]}>
                          <Text style={styles.prazoIndicatorText}>
                            {diasRestantes < 0 ? `${Math.abs(diasRestantes)}d atraso` : 
                             diasRestantes === 0 ? 'Hoje!' : 
                             `${diasRestantes}d restantes`}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.vaoInfoContainer}>
                    <Text style={styles.vaoInfo}>📍 {vao.localizacao}</Text>
                    <Text style={styles.vaoInfo}>📏 Área: {vao.area}</Text>
                    <Text style={[styles.vaoInfo, styles.vaoDataNecessidade]}>
                      📅 Prazo: {new Date(vao.dataNecessidade).toLocaleDateString('pt-BR')}
                      {vao.status !== 'concluido' && classPrazo !== 'normal' && (
                        <Text style={[styles.prazoTexto, 
                          classPrazo === 'atrasado' && styles.prazoAtrasado,
                          classPrazo === 'urgente' && styles.prazoUrgente,
                          classPrazo === 'proximoVencimento' && styles.prazoProximo
                        ]}>
                          {classPrazo === 'atrasado' ? ' (ATRASADO)' :
                           classPrazo === 'urgente' ? ' (URGENTE)' :
                           classPrazo === 'proximoVencimento' ? ' (PRÓXIMO)' : ''}
                        </Text>
                      )}
                    </Text>
                  </View>
                  
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
              );
            })}
            
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
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Inicializando aplicativo...</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555'
  },
  // ===== ESTILOS DE LOGIN SOFISTICADOS =====
  loginSafeArea: {
    flex: 1,
    backgroundColor: '#1B5E20',
  },
  loginGradientBackground: {
    flex: 1,
  },
  loginKeyboardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loginContentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loginHeaderSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  logoIcon: {
    fontSize: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 15,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  loginFormCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  loginFormHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loginFormTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 5,
  },
  loginFormSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputIconContainer: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputIcon: {
    fontSize: 18,
    color: '#6C757D',
  },
  modernInput: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
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
    elevation: 8,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modernLoginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loginInfoSection: {
    marginTop: 30,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  credentialsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
  },
  credentialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  credentialLabel: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  credentialValue: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  loginFooter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#C8E6C9',
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
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Sync Bar
  syncBar: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    flexDirection: 'row',
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
    color: '#555',
  },
  syncTimeText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  syncButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9E9E9E',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  // Action Container (Botões de ação)
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  // Lista de Vãos
  lista: {
    flex: 1,
    padding: 10,
  },
  vaoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  vaoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  vaoDescricao: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  vaoInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  updatedByText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  actionBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Footer
  footer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  // ===== ESTILOS PRINCIPAIS MODERNOS =====
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // ===== ESTILOS DOS MENUS SOFISTICADOS =====
  
  // Menu Principal
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header Moderno do Usuário
  modernUserHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modernHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernUserInfo: {
    flex: 1,
  },
  modernWelcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  modernUserName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  modernLastSync: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  modernUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: 15,
  },
  modernAvatarText: {
    fontSize: 20,
    color: '#ffffff',
  },
  modernSyncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  syncIcon: {
    fontSize: 16,
    marginRight: 5,
    color: '#ffffff',
  },
  syncText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Dashboard de Estatísticas
  dashboardContainer: {
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Barra de Progresso
  progressContainer: {
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  
  // Menu de Administrador
  adminMenuContainer: {
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  adminMenuHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  adminBadge: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  adminBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  adminMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  adminMenuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  
  // Grid de Ações do Admin
  adminActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  adminActionCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  adminActionGradient: {
    padding: 15,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  adminActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  adminActionIconText: {
    fontSize: 20,
  },
  adminActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 2,
  },
  adminActionSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  
  // Estatísticas Avançadas do Admin
  adminStatsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  adminStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  adminStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  adminStatItem: {
    alignItems: 'center',
  },
  adminStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  adminStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // ===== ESTILOS PARA INDICADORES DE PRAZO =====
  
  // Estilos dos itens de vão baseados no prazo
  vaoItemAtrasado: {
    borderLeftColor: '#F44336',
    borderLeftWidth: 5,
    backgroundColor: '#FFEBEE',
  },
  vaoItemUrgente: {
    borderLeftColor: '#FF9800',
    borderLeftWidth: 5,
    backgroundColor: '#FFF3E0',
  },
  vaoItemProximoVencimento: {
    borderLeftColor: '#FFC107',
    borderLeftWidth: 5,
    backgroundColor: '#FFFDE7',
  },
  vaoItemPendente: {
    borderLeftColor: '#9E9E9E',
    borderLeftWidth: 4,
  },
  vaoItemIniciado: {
    borderLeftColor: '#FF9800',
    borderLeftWidth: 4,
  },
  vaoItemConcluido: {
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 4,
  },

  // Container do título do vão
  vaoTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Indicador de prazo (badge)
  prazoIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  prazoIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Container das informações do vão
  vaoInfoContainer: {
    marginBottom: 10,
  },

  // Estilo especial para data de necessidade
  vaoDataNecessidade: {
    fontWeight: '500',
  },

  // Textos de prazo com cores específicas
  prazoTexto: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  prazoAtrasado: {
    color: '#F44336',
  },
  prazoUrgente: {
    color: '#FF9800',
  },
  prazoProximo: {
    color: '#FFC107',
  },

  // Estilos para cards de diagnóstico
  diagnosticCard: {
    borderLeftColor: '#9C27B0',
  },
  dateTestCard: {
    borderLeftColor: '#00BCD4',
  },
});
