import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
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

export default function App() {
  const [user, setUser] = useState(null);
  const [matos, setMatos] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [completedItems, setCompletedItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    const completed = matos.filter(item => item.status === 'concluido').length;
    setCompletedItems(completed);
    setTotalItems(matos.length);
  }, [matos]);

  const initializeApp = async () => {
    try {
      const savedUser = await StorageService.loadUserData();
      if (savedUser) {
        setUser(savedUser);
        await loadMatosData();
      }
    } catch (error) {
      console.error('Erro ao inicializar app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMatosData = async () => {
    try {
      const data = await StorageService.loadMatosData();
      setMatos(data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    await StorageService.saveUserData(userData);
    await loadMatosData();
    
    if (userData.role === 'user') {
      setTimeout(() => {
        handleAutoSync(userData);
      }, 1000);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: async () => {
            await StorageService.saveUserData(null);
            setUser(null);
            setMatos([]);
          }
        }
      ]
    );
  };

  const handleAutoSync = async (userData) => {
    try {
      const isOnline = await SyncService.isConnected();
      if (isOnline) {
        const localData = await StorageService.loadMatosData();
        const pendingChanges = await StorageService.loadPendingChanges();
        
        const result = await SyncService.syncWithServer(localData, pendingChanges, userData.role);
        if (result.success && result.data) {
          setMatos(result.data);
        }
      }
    } catch (error) {
      console.error('Erro na sincronização automática:', error);
    }
  };

  const importarPlanilha = async () => {
    if (user?.role !== 'admin') {
      Alert.alert('Acesso Negado', 'Apenas administradores podem importar planilhas.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const workbook = XLSX.read(fileContent, { type: 'base64' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const matosData = data.map((row, index) => ({
          id: Date.now() + index,
          descricao: row.Descricao || row.descricao || '',
          localizacao: row.Localizacao || row.localizacao || '',
          area: row.Area || row.area || '',
          dataNecessidade: row.DataNecessidade || row.dataNecessidade || row['Data Necessidade'] || '',
          status: 'pendente',
          dataInicio: null,
          dataConclusao: null,
        }));

        const novaMatos = [...matos, ...matosData];
        setMatos(novaMatos);
        await StorageService.saveMatosData(novaMatos);

        Alert.alert('Sucesso', `${matosData.length} itens importados com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao importar planilha:', error);
      Alert.alert('Erro', 'Falha ao importar planilha. Verifique o formato do arquivo.');
    }
  };

  const iniciarItem = async (id) => {
    const updatedMatos = matos.map(item => 
      item.id === id 
        ? { ...item, status: 'iniciado', dataInicio: new Date().toISOString() }
        : item
    );
    setMatos(updatedMatos);
    await StorageService.saveMatosData(updatedMatos);
    await StorageService.savePendingChange({ type: 'update', id, status: 'iniciado', dataInicio: new Date().toISOString() });
  };

  const finalizarItem = async (id) => {
    const updatedMatos = matos.map(item => 
      item.id === id 
        ? { ...item, status: 'concluido', dataConclusao: new Date().toISOString() }
        : item
    );
    setMatos(updatedMatos);
    await StorageService.saveMatosData(updatedMatos);
    await StorageService.savePendingChange({ type: 'update', id, status: 'concluido', dataConclusao: new Date().toISOString() });
  };

  const gerarRelatorio = async () => {
    const agora = new Date();
    const pendentes = matos.filter(item => item.status === 'pendente').length;
    const iniciados = matos.filter(item => item.status === 'iniciado').length;
    const concluidos = matos.filter(item => item.status === 'concluido').length;
    
    const urgentes = matos.filter(item => 
      item.status !== 'concluido' && isDataProxima(item.dataNecessidade)
    ).length;
    
    const atrasados = matos.filter(item => 
      item.status !== 'concluido' && isDataAtrasada(item.dataNecessidade)
    ).length;

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; color: #2e7d32; margin-bottom: 30px; }
            .summary { background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .alerts { background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ff9800; }
            .item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; }
            .item.atrasado { border-left: 4px solid #f44336; background-color: #ffebee; }
            .item.urgente { border-left: 4px solid #ff9800; background-color: #fff8e1; }
            .item.pendente { border-left: 4px solid #757575; }
            .item.iniciado { border-left: 4px solid #ffeb3b; }
            .item.concluido { border-left: 4px solid #4caf50; }
            .status { font-weight: bold; padding: 4px 8px; border-radius: 4px; color: white; }
            .status.pendente { background-color: #757575; }
            .status.iniciado { background-color: #ffeb3b; color: black; }
            .status.concluido { background-color: #4caf50; }
            .meta-info { font-size: 12px; color: #666; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Corte de Matos</h1>
            <p>Gerado em: ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR')}</p>
            <p>Usuário: ${user?.username || 'N/A'} (${user?.role === 'admin' ? 'Administrador' : 'Usuário'})</p>
          </div>
          
          <div class="summary">
            <h2>Resumo Geral</h2>
            <p><strong>Total de Vãos:</strong> ${matos.length}</p>
            <p><strong>Pendentes:</strong> ${pendentes} | <strong>Iniciados:</strong> ${iniciados} | <strong>Concluídos:</strong> ${concluidos}</p>
            <p><strong>Progresso:</strong> ${totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%</p>
          </div>

          ${(urgentes > 0 || atrasados > 0) ? `
          <div class="alerts">
            <h2>⚠️ Alertas de Prazo</h2>
            ${atrasados > 0 ? `<p><strong>Atrasados:</strong> ${atrasados} itens</p>` : ''}
            ${urgentes > 0 ? `<p><strong>Urgentes (próximos 7 dias):</strong> ${urgentes} itens</p>` : ''}
          </div>
          ` : ''}
          
          <h2>Detalhamento dos Vãos</h2>
          ${matos.map(item => {
            const dataProxima = isDataProxima(item.dataNecessidade);
            const dataAtrasada = isDataAtrasada(item.dataNecessidade);
            let alertClass = item.status;
            
            if (dataAtrasada && item.status !== 'concluido') {
              alertClass = 'atrasado';
            } else if (dataProxima && item.status !== 'concluido') {
              alertClass = 'urgente';
            }
            
            return `
              <div class="item ${alertClass}">
                <h3>${item.descricao}${dataAtrasada && item.status !== 'concluido' ? ' ⚠️' : ''}${dataProxima && item.status !== 'concluido' ? ' 🕐' : ''}</h3>
                <p><strong>Localização:</strong> ${item.localizacao}</p>
                <p><strong>Área:</strong> ${item.area}</p>
                ${item.dataNecessidade ? `<p><strong>Data Necessária:</strong> ${formatarData(item.dataNecessidade)?.toLocaleDateString('pt-BR')}${dataAtrasada && item.status !== 'concluido' ? ' ⚠️ ATRASADO' : ''}${dataProxima && item.status !== 'concluido' ? ' 🕐 URGENTE' : ''}</p>` : ''}
                <p><strong>Status:</strong> <span class="status ${item.status}">${getStatusText(item.status)}</span></p>
                ${item.dataInicio ? `<p><strong>Iniciado em:</strong> ${new Date(item.dataInicio).toLocaleDateString('pt-BR')}</p>` : ''}
                ${item.dataConclusao ? `<p><strong>Concluído em:</strong> ${new Date(item.dataConclusao).toLocaleDateString('pt-BR')}</p>` : ''}
                <div class="meta-info">
                  ID: ${item.id}
                </div>
              </div>
            `;
          }).join('')}
          
          <div class="meta-info" style="text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
            <p>Relatório gerado pelo App de Controle de Corte de Matos</p>
            <p>Sistema desenvolvido para controle eficiente de manutenção de áreas verdes</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      Alert.alert(
        'Relatório Gerado',
        'Deseja compartilhar o relatório?',
        [
          { text: 'Não', style: 'cancel' },
          {
            text: 'Compartilhar',
            onPress: async () => {
              await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Compartilhar Relatório de Corte de Matos',
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      Alert.alert('Erro', 'Falha ao gerar relatório PDF');
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

  const formatarData = (dataString) => {
    if (!dataString) return null;
    
    try {
      if (dataString instanceof Date) {
        return dataString;
      }
      
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

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'Controle de Corte de Matos', style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } }}
        rightComponent={{
          icon: 'logout',
          color: '#fff',
          onPress: handleLogout
        }}
        backgroundColor="#2e7d32"
      />
      
      <SyncStatus user={user} />
      
      <View style={styles.userInfo}>
        <Text style={styles.userInfoText}>
          👤 {user.username} ({user.role === 'admin' ? 'Administrador' : 'Usuário'})
        </Text>
      </View>
      
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Progresso: {completedItems}/{totalItems} ({totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%)
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {user.role === 'admin' && (
          <Button
            title="Importar Planilha"
            icon={<Icon name="file-upload" size={20} color="white" style={{ marginRight: 5 }} />}
            onPress={importarPlanilha}
            buttonStyle={[styles.button, { backgroundColor: '#1976d2' }]}
          />
        )}
        <Button
          title="Gerar Relatório"
          icon={<Icon name="picture-as-pdf" size={20} color="white" style={{ marginRight: 5 }} />}
          onPress={gerarRelatorio}
          disabled={matos.length === 0}
          buttonStyle={[styles.button, { backgroundColor: '#d32f2f' }]}
        />
      </View>

      <ScrollView style={styles.listContainer}>
        {matos.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="grass" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum vão cadastrado</Text>
            <Text style={styles.emptySubtext}>
              {user.role === 'admin' ? 'Importe uma planilha para começar' : 'Aguarde o administrador importar dados'}
            </Text>
          </View>
        ) : (
          matos.map((item) => {
            const dataProxima = isDataProxima(item.dataNecessidade);
            const dataAtrasada = isDataAtrasada(item.dataNecessidade);
            
            return (
              <ListItem 
                key={item.id} 
                bottomDivider
                containerStyle={[
                  dataAtrasada && item.status !== 'concluido' && styles.itemAtrasado,
                  dataProxima && item.status !== 'concluido' && styles.itemUrgente
                ]}
              >
                <ListItem.Content>
                  <ListItem.Title style={styles.itemTitle}>
                    {item.descricao}
                    {dataAtrasada && item.status !== 'concluido' && ' ⚠️'}
                    {dataProxima && item.status !== 'concluido' && ' 🕐'}
                  </ListItem.Title>
                  <ListItem.Subtitle>
                    <Text style={styles.itemSubtitle}>📍 {item.localizacao}</Text>
                    <Text style={styles.itemSubtitle}>📐 Área: {item.area}</Text>
                    {item.dataNecessidade && (
                      <Text style={[
                        styles.itemSubtitle,
                        isDataAtrasada(item.dataNecessidade) && item.status !== 'concluido' && { color: '#f44336', fontWeight: 'bold' },
                        isDataProxima(item.dataNecessidade) && item.status !== 'concluido' && { color: '#ff9800', fontWeight: 'bold' }
                      ]}>
                        📅 Necessário até: {formatarData(item.dataNecessidade)?.toLocaleDateString('pt-BR')}
                        {isDataAtrasada(item.dataNecessidade) && item.status !== 'concluido' && ' ⚠️ ATRASADO'}
                        {isDataProxima(item.dataNecessidade) && item.status !== 'concluido' && ' 🕐 URGENTE'}
                      </Text>
                    )}
                  </ListItem.Subtitle>
                  <View style={styles.itemActions}>
                    <Badge
                      value={getStatusText(item.status)}
                      badgeStyle={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: getStatusColor(item.status),
                          ...(item.status === 'iniciado' && { color: '#000' })
                        }
                      ]}
                      textStyle={item.status === 'iniciado' ? { color: '#000' } : { color: '#fff' }}
                    />
                    <View style={styles.actionButtons}>
                      {item.status === 'pendente' && (
                        <Button
                          title="Iniciar"
                          onPress={() => iniciarItem(item.id)}
                          buttonStyle={[styles.actionButton, { backgroundColor: '#ffeb3b' }]}
                          titleStyle={[styles.actionButtonText, { color: '#000' }]}
                        />
                      )}
                      {item.status === 'iniciado' && (
                        <Button
                          title="Finalizar"
                          onPress={() => finalizarItem(item.id)}
                          buttonStyle={[styles.actionButton, { backgroundColor: '#4caf50' }]}
                          titleStyle={styles.actionButtonText}
                        />
                      )}
                      {item.status === 'concluido' && (
                        <Icon name="check-circle" size={24} color="#4caf50" />
                      )}
                    </View>
                  </View>
                </ListItem.Content>
              </ListItem>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
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
    paddingVertical: 10,
    borderRadius: 8,
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
