# 🚀 Corte de Matos App - Expo Snack

## 📱 **TESTE IMEDIATO NO EXPO SNACK:**

### **✅ LINK DIRETO:**
https://snack.expo.dev/

### **📋 INSTRUÇÕES:**

1. **Acesse**: https://snack.expo.dev/
2. **Delete o código padrão** do App.js
3. **Cole o código completo** abaixo
4. **Clique em "Save"** (ou Ctrl+S)
5. **Teste no simulador** ou **escaneie QR code** no celular

---

## 📱 **CÓDIGO COMPLETO PARA SNACK:**

```javascript
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
  Platform
} from 'react-native';

// Dados de exemplo para demonstração
const DADOS_EXEMPLO = [
  {
    id: 1,
    descricao: 'Corte do mato da Subestação Central',
    localizacao: 'SE Central - Área externa',
    area: '500m²',
    dataNecessidade: '25/07/2025', // URGENTE (próximo)
    status: 'pendente',
    dataInicio: null,
    dataConclusao: null,
  },
  {
    id: 2,
    descricao: 'Limpeza da vegetação na Linha 138kV',
    localizacao: 'Trecho KM 15-20',
    area: '300m²',
    dataNecessidade: '15/08/2025', // Normal
    status: 'iniciado',
    dataInicio: '2025-07-20T08:00:00.000Z',
    dataConclusao: null,
  },
  {
    id: 3,
    descricao: 'Poda de árvores próximas à rede',
    localizacao: 'Bairro Industrial',
    area: '150m²',
    dataNecessidade: '15/07/2025', // ATRASADO
    status: 'pendente',
    dataInicio: null,
    dataConclusao: null,
  },
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
      dataNecessidade: '01/08/2025',
      status: 'pendente',
      dataInicio: null,
      dataConclusao: null,
    };

    setMatos(prevMatos => [...prevMatos, novoItem]);
    Alert.alert('Sucesso', 'Novo item adicionado!');
  };

  const gerarRelatorio = () => {
    const pendentes = matos.filter(item => item.status === 'pendente').length;
    const iniciados = matos.filter(item => item.status === 'iniciado').length;
    const concluidos = matos.filter(item => item.status === 'concluido').length;
    
    const urgentes = matos.filter(item => 
      item.status !== 'concluido' && isDataProxima(item.dataNecessidade)
    ).length;
    
    const atrasados = matos.filter(item => 
      item.status !== 'concluido' && isDataAtrasada(item.dataNecessidade)
    ).length;

    const relatorio = `📊 RELATÓRIO DE CORTE DE MATOS
📅 Data: ${new Date().toLocaleDateString('pt-BR')}
👤 Usuário: ${user?.username} (${user?.role === 'admin' ? 'Administrador' : 'Usuário'})

📈 RESUMO GERAL:
• Total de Vãos: ${matos.length}
• Pendentes: ${pendentes}
• Iniciados: ${iniciados}  
• Concluídos: ${concluidos}
• Progresso: ${totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%

⚠️ ALERTAS:
• Itens Atrasados: ${atrasados}
• Itens Urgentes: ${urgentes}

🔧 Sistema de Controle de Corte de Matos`;

    Alert.alert('📄 Relatório Gerado', relatorio);
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

  const formatarData = (dataString) => {
    if (!dataString) return null;
    
    try {
      if (typeof dataString === 'string' && dataString.includes('/')) {
        const [dia, mes, ano] = dataString.split('/');
        return new Date(ano, mes - 1, dia);
      }
      return new Date(dataString);
    } catch (error) {
      return null;
    }
  };

  const isDataProxima = (dataNecessidade) => {
    if (!dataNecessidade) return false;
    const data = formatarData(dataNecessidade);
    if (!data) return false;
    
    const hoje = new Date();
    const diffDias = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
    
    return diffDias <= 7 && diffDias >= 0;
  };

  const isDataAtrasada = (dataNecessidade) => {
    if (!dataNecessidade) return false;
    const data = formatarData(dataNecessidade);
    if (!data) return false;
    
    const hoje = new Date();
    return data < hoje;
  };

  if (showLogin) {
    return (
      <View style={styles.container}>
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>🌿 Controle de Corte de Matos</Text>
          <Text style={styles.loginSubtitle}>Faça login para continuar</Text>
          
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
            <Text style={styles.credentialsTitle}>Credenciais de Teste:</Text>
            <Text style={styles.credentialsText}>👤 Usuario / esul1234 (Usuário)</Text>
            <Text style={styles.credentialsText}>🔑 Admin / eletro2025 (Admin)</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 Controle de Corte de Matos</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
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
          <TouchableOpacity style={[styles.button, { backgroundColor: '#1976d2' }]} onPress={adicionarNovoItem}>
            <Text style={styles.buttonText}>📁 Adicionar Item</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#d32f2f' }]} 
          onPress={gerarRelatorio}
          disabled={matos.length === 0}
        >
          <Text style={styles.buttonText}>📄 Gerar Relatório</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView style={styles.listContainer}>
        {matos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyText}>Nenhum vão cadastrado</Text>
            <Text style={styles.emptySubtext}>
              {user.role === 'admin' ? 'Adicione um novo item para começar' : 'Aguarde o administrador adicionar dados'}
            </Text>
          </View>
        ) : (
          matos.map((item) => {
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
                
                {item.dataNecessidade && (
                  <Text style={[
                    styles.itemSubtitle,
                    dataAtrasada && item.status !== 'concluido' && { color: '#f44336', fontWeight: 'bold' },
                    dataProxima && item.status !== 'concluido' && { color: '#ff9800', fontWeight: 'bold' }
                  ]}>
                    📅 Necessário até: {item.dataNecessidade}
                    {dataAtrasada && item.status !== 'concluido' && ' ⚠️ ATRASADO'}
                    {dataProxima && item.status !== 'concluido' && ' 🕐 URGENTE'}
                  </Text>
                )}
                
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
          })
        )}
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
  // Login Styles
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2e7d32',
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#e8f5e8',
    marginBottom: 40,
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
    marginBottom: 30,
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  credentialsText: {
    color: '#e8f5e8',
    fontSize: 12,
    textAlign: 'center',
  },
  // App Styles
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
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
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
```

---

## 📱 **FUNCIONALIDADES INCLUÍDAS:**

### **✅ Sistema de Login:**
- **👤 Usuario** / `esul1234` (Usuário comum)
- **🔑 Admin** / `eletro2025` (Administrador)

### **✅ Controle de Status:**
- 🔘 **Cinza**: Pendente
- 🟡 **Amarelo**: Iniciado
- 🟢 **Verde**: Concluído

### **✅ Alertas de Data:**
- 🕐 **URGENTE**: Próximo de 7 dias
- ⚠️ **ATRASADO**: Prazo vencido

### **✅ Controle de Permissões:**
- **Usuário**: Apenas visualizar e alterar status
- **Admin**: Pode adicionar novos itens

### **✅ Funcionalidades:**
- Iniciar/Finalizar vãos
- Progresso visual
- Relatórios detalhados
- Interface responsiva

---

## 🎯 **INSTRUÇÕES DE TESTE:**

### **Passo 1: Login**
1. Use as credenciais de teste
2. Teste ambos os tipos de usuário

### **Passo 2: Testar Funcionalidades**
1. **Como usuário**: Iniciar/finalizar itens
2. **Como admin**: Adicionar novos itens
3. **Gerar relatórios** com estatísticas

### **Passo 3: Testar Alertas**
1. Observe os ícones 🕐 e ⚠️
2. Cores diferentes para urgência
3. Borda colorida nos itens

---

## 🚀 **PRÓXIMOS PASSOS:**

### **Após Testar no Snack:**
1. ✅ **Validar todas funcionalidades**
2. 🏗️ **Build nativo Android/iOS**
3. 📱 **Distribuição para dispositivos**
4. 🔄 **Sincronização de dados real**

### **Para Build Nativo:**
```bash
# Local (após testar no Snack)
expo build:android
expo build:ios
```

**🎯 Teste agora no Expo Snack e depois podemos evoluir para build nativo!**
