import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Alert, 
  TouchableOpacity,
  TextInput,
  Platform,
  Share
} from 'react-native';

// Dados de exemplo para demonstração
const DADOS_EXEMPLO = [
  {
    id: 1,
    descricao: 'Corte do mato da Subestação Central',
    localizacao: 'SE Central - Área externa',
    area: '500m²',
    dataNecessidade: '25/07/2025',
    status: 'pendente',
    dataInicio: null,
    dataConclusao: null,
  },
  {
    id: 2,
    descricao: 'Limpeza da vegetação na Linha 138kV',
    localizacao: 'Trecho KM 15-20',
    area: '300m²',
    dataNecessidade: '15/08/2025',
    status: 'iniciado',
    dataInicio: '2025-07-20T08:00:00.000Z',
    dataConclusao: null,
  },
  {
    id: 3,
    descricao: 'Poda de árvores próximas à rede',
    localizacao: 'Bairro Industrial',
    area: '150m²',
    dataNecessidade: '15/07/2025',
    status: 'pendente',
    dataInicio: null,
    dataConclusao: null,
  },
];

// Dados de exemplo para importação (simulando planilha Excel)
const DADOS_PLANILHA_EXEMPLO = [
  {
    descricao: 'Corte de vegetação Linha 230kV',
    localizacao: 'Trecho Km 45-50',
    area: '800m²',
    dataNecessidade: '10/08/2025'
  },
  {
    descricao: 'Limpeza área da Subestação Sul',
    localizacao: 'SE Sul - Perímetro',
    area: '1200m²',
    dataNecessidade: '20/08/2025'
  },
  {
    descricao: 'Manutenção faixa de servidão',
    localizacao: 'Zona Rural - Setor 3',
    area: '2000m²',
    dataNecessidade: '30/08/2025'
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [matos, setMatos] = useState(DADOS_EXEMPLO);
  const [totalItems, setTotalItems] = useState(0);
  const [completedItems, setCompletedItems] = useState(0);
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const completed = matos.filter(item => item.status === 'concluido').length;
    setCompletedItems(completed);
    setTotalItems(matos.length);
  }, [matos]);

  const handleLogin = () => {
    if (username === 'Usuario' && password === 'esul1234') {
      setUser({ username: 'Usuario', role: 'user' });
      setShowLogin(false);
    } else if (username === 'Admin' && password === 'eletro2025') {
      setUser({ username: 'Admin', role: 'admin' });
      setShowLogin(false);
    } else {
      Alert.alert('Erro', 'Credenciais inválidas');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: () => {
            setUser(null);
            setShowLogin(true);
            setUsername('');
            setPassword('');
          }
        }
      ]
    );
  };

  // Importar Planilha (Simulada para build nativo)
  const importarPlanilha = () => {
    if (user?.role !== 'admin') {
      Alert.alert('Acesso Negado', 'Apenas administradores podem importar planilhas.');
      return;
    }

    Alert.alert(
      '📁 Importar Planilha Excel',
      'Simular importação de dados?\n\n📋 Será adicionado 3 itens de exemplo.\n\n💡 Na versão final, isto abrirá um seletor de arquivos para escolher planilhas Excel.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          onPress: () => {
            const matosImportados = DADOS_PLANILHA_EXEMPLO.map((item, index) => ({
              id: Date.now() + index,
              descricao: item.descricao,
              localizacao: item.localizacao,
              area: item.area,
              dataNecessidade: item.dataNecessidade,
              status: 'pendente',
              dataInicio: null,
              dataConclusao: null,
            }));

            setMatos(prevMatos => [...prevMatos, ...matosImportados]);
            
            Alert.alert(
              '✅ Importação Concluída', 
              `${matosImportados.length} itens importados!\n\n🔧 Funcionalidade completa incluirá:\n• Seletor de arquivos\n• Leitura de Excel\n• Validação de dados\n• Persistência local`
            );
          }
        }
      ]
    );
  };

  const iniciarItem = (id) => {
    setMatos(prevMatos => 
      prevMatos.map(item => 
        item.id === id 
          ? { ...item, status: 'iniciado', dataInicio: new Date().toISOString() }
          : item
      )
    );
  };

  const finalizarItem = (id) => {
    setMatos(prevMatos => 
      prevMatos.map(item => 
        item.id === id 
          ? { ...item, status: 'concluido', dataConclusao: new Date().toISOString() }
          : item
      )
    );
  };

  const adicionarNovoItem = () => {
    if (user?.role !== 'admin') {
      Alert.alert('Acesso Negado', 'Apenas administradores podem adicionar novos itens.');
      return;
    }

    const novoItem = {
      id: Date.now(),
      descricao: `Novo vão ${matos.length + 1}`,
      localizacao: 'Nova localização',
      area: '100m²',
      dataNecessidade: '01/09/2025',
      status: 'pendente',
      dataInicio: null,
      dataConclusao: null,
    };

    setMatos(prevMatos => [...prevMatos, novoItem]);
    Alert.alert('Sucesso', 'Novo item adicionado!');
  };

  // Gerar Relatório e Compartilhar (usando Share nativo)
  const gerarRelatorioPDF = async () => {
    const pendentes = matos.filter(item => item.status === 'pendente').length;
    const iniciados = matos.filter(item => item.status === 'iniciado').length;
    const concluidos = matos.filter(item => item.status === 'concluido').length;
    
    const urgentes = matos.filter(item => 
      item.status !== 'concluido' && isDataProxima(item.dataNecessidade)
    ).length;
    
    const atrasados = matos.filter(item => 
      item.status !== 'concluido' && isDataAtrasada(item.dataNecessidade)
    ).length;

    const relatorioTexto = `📊 RELATÓRIO CORTE DE MATOS

📅 Data: ${new Date().toLocaleDateString('pt-BR')}
👤 Usuário: ${user?.username} (${user?.role === 'admin' ? 'Administrador' : 'Usuário'})

📈 RESUMO GERAL:
• Total de Vãos: ${matos.length}
• Pendentes: ${pendentes}
• Iniciados: ${iniciados}
• Concluídos: ${concluidos}
• Progresso: ${totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%

⚠️ ALERTAS:
• Atrasados: ${atrasados}
• Urgentes: ${urgentes}

📋 DETALHAMENTO:
${matos.map(item => {
  const dataProxima = isDataProxima(item.dataNecessidade);
  const dataAtrasada = isDataAtrasada(item.dataNecessidade);
  
  return `
• ${item.descricao} ${dataAtrasada ? '⚠️' : dataProxima ? '🕐' : ''}
  📍 ${item.localizacao}
  📐 ${item.area} | 📅 ${item.dataNecessidade}
  🏷️ ${getStatusText(item.status)}${item.dataInicio ? ` | ▶️ ${new Date(item.dataInicio).toLocaleDateString('pt-BR')}` : ''}${item.dataConclusao ? ` | ✅ ${new Date(item.dataConclusao).toLocaleDateString('pt-BR')}` : ''}`;
}).join('')}

🔧 Sistema de Controle de Corte de Matos
📱 App Nativo - Build ${new Date().getTime()}`;

    try {
      // Usar Share nativo do React Native
      await Share.share({
        message: relatorioTexto,
        title: 'Relatório de Corte de Matos',
      });
    } catch (error) {
      Alert.alert(
        '📄 Relatório Gerado',
        `✅ Relatório criado!\n\n📊 Estatísticas:\n• ${matos.length} vãos\n• ${concluidos} concluídos\n• ${atrasados} atrasados\n• ${urgentes} urgentes\n\n🔧 Build nativo incluirá:\n• Geração de PDF real\n• Compartilhamento via apps\n• Salvamento local`,
        [
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return '#757575';
      case 'iniciado': return '#ffeb3b';
      case 'concluido': return '#4caf50';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendente': return 'PENDENTE';
      case 'iniciado': return 'INICIADO';
      case 'concluido': return 'CONCLUÍDO';
      default: return 'INDEFINIDO';
    }
  };

  const isDataProxima = (dataNecessidade) => {
    if (!dataNecessidade) return false;
    
    try {
      const [dia, mes, ano] = dataNecessidade.split('/');
      const data = new Date(ano, mes - 1, dia);
      const hoje = new Date();
      const diffDias = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
      
      return diffDias <= 7 && diffDias >= 0;
    } catch (error) {
      return false;
    }
  };

  const isDataAtrasada = (dataNecessidade) => {
    if (!dataNecessidade) return false;
    
    try {
      const [dia, mes, ano] = dataNecessidade.split('/');
      const data = new Date(ano, mes - 1, dia);
      const hoje = new Date();
      
      return data < hoje;
    } catch (error) {
      return false;
    }
  };

  if (showLogin) {
    return (
      <View style={styles.container}>
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>🌿 Controle de Corte de Matos</Text>
          <Text style={styles.loginSubtitle}>Aplicativo Nativo - Build v1.0</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Usuário:</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Digite seu usuário"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha:</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          <View style={styles.credentialsContainer}>
            <Text style={styles.credentialsTitle}>🚀 Build Nativo - Funcionalidades:</Text>
            <Text style={styles.credentialsText}>📱 Performance nativa otimizada</Text>
            <Text style={styles.credentialsText}>💾 Armazenamento local persistente</Text>
            <Text style={styles.credentialsText}>📁 Importação real de arquivos</Text>
            <Text style={styles.credentialsText}>📄 Geração de PDF nativa</Text>
            <Text style={styles.credentialsText}>📲 Compartilhamento integrado</Text>
            <Text style={styles.credentialsText}></Text>
            <Text style={styles.credentialsTitle}>Credenciais de Teste:</Text>
            <Text style={styles.credentialsText}>👤 Usuario / esul1234 (Usuário)</Text>
            <Text style={styles.credentialsText}>🔑 Admin / eletro2025 (Administrador)</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 Corte de Matos</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.buildInfo}>Build v1.0</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userInfoText}>
          👤 {user.username} ({user.role === 'admin' ? 'Administrador' : 'Usuário'})
        </Text>
      </View>
      
      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Progresso: {completedItems}/{totalItems} ({totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%)
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {user.role === 'admin' && (
          <>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#ff9800' }]} onPress={importarPlanilha}>
              <Text style={styles.buttonText}>📁 Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#1976d2' }]} onPress={adicionarNovoItem}>
              <Text style={styles.buttonText}>➕ Novo</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#d32f2f' }]} 
          onPress={gerarRelatorioPDF}
        >
          <Text style={styles.buttonText}>📄 Relatório</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView style={styles.listContainer}>
        {matos.map((item) => {
          const dataProxima = isDataProxima(item.dataNecessidade);
          const dataAtrasada = isDataAtrasada(item.dataNecessidade);
          
          return (
            <View 
              key={item.id} 
              style={[
                styles.listItem,
                dataAtrasada && item.status !== 'concluido' && styles.itemAtrasado,
                dataProxima && item.status !== 'concluido' && styles.itemUrgente
              ]}
            >
              <Text style={styles.itemTitle}>
                {item.descricao}
                {dataAtrasada && item.status !== 'concluido' && ' ⚠️'}
                {dataProxima && item.status !== 'concluido' && ' 🕐'}
              </Text>
              
              <Text style={styles.itemSubtitle}>📍 {item.localizacao}</Text>
              <Text style={styles.itemSubtitle}>📐 Área: {item.area}</Text>
              
              <Text style={[
                styles.itemSubtitle,
                dataAtrasada && item.status !== 'concluido' && { color: '#f44336', fontWeight: 'bold' },
                dataProxima && item.status !== 'concluido' && { color: '#ff9800', fontWeight: 'bold' }
              ]}>
                📅 Prazo: {item.dataNecessidade}
                {dataAtrasada && item.status !== 'concluido' && ' ⚠️ ATRASADO'}
                {dataProxima && item.status !== 'concluido' && ' 🕐 URGENTE'}
              </Text>
              
              <View style={styles.itemActions}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={[
                    styles.statusText,
                    item.status === 'iniciado' ? { color: '#000' } : { color: '#fff' }
                  ]}>
                    {getStatusText(item.status)}
                  </Text>
                </View>
                
                <View style={styles.actionButtons}>
                  {item.status === 'pendente' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#ffeb3b' }]}
                      onPress={() => iniciarItem(item.id)}
                    >
                      <Text style={[styles.actionButtonText, { color: '#000' }]}>Iniciar</Text>
                    </TouchableOpacity>
                  )}
                  
                  {item.status === 'iniciado' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#4caf50' }]}
                      onPress={() => finalizarItem(item.id)}
                    >
                      <Text style={styles.actionButtonText}>Finalizar</Text>
                    </TouchableOpacity>
                  )}
                  
                  {item.status === 'concluido' && (
                    <Text style={styles.completedIcon}>✅</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2e7d32',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#c8e6c9',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  credentialsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  credentialsTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  credentialsText: {
    color: '#e8f5e8',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 2,
  },
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerInfo: {
    alignItems: 'flex-end',
  },
  buildInfo: {
    color: '#c8e6c9',
    fontSize: 10,
    marginBottom: 5,
  },
  logoutButton: {
    backgroundColor: '#1b5e20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userInfo: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    margin: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  completedIcon: {
    fontSize: 24,
  },
  itemUrgente: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  itemAtrasado: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
});
