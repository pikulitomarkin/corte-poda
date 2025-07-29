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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Button, ListItem, Header } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import LoginScreen from './components/LoginScreen';
import SyncStatus from './components/SyncStatus';

// Chaves para AsyncStorage
const STORAGE_KEYS = {
  MATOS_DATA: '@matos_data',
  USER_DATA: '@user_data',
};

export default function App() {
  // Estados principais
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [matosData, setMatosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMato, setNewMato] = useState({
    descricao: '',
    localizacao: '',
    area: '',
    dataNecessidade: '',
  });

  // Estados para edição
  const [editingMato, setEditingMato] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Carregar dados ao iniciar o app
  useEffect(() => {
    loadUserData();
    loadMatosData();
  }, []);

  // Verificar login
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados dos matos
  const loadMatosData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MATOS_DATA);
      if (data) {
        setMatosData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos matos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados dos matos');
    } finally {
      setLoading(false);
    }
  };

  // Salvar dados dos matos
  const saveMatosData = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MATOS_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados dos matos:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados');
    }
  };

  // Função para lidar com o login
  const handleLogin = async (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
    }
  };

  // Função para fazer logout
  const handleLogout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Erro ao remover dados do usuário:', error);
    }
  };

  // Função para importar planilha Excel
  const importExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      if (result.canceled) {
        return;
      }

      setLoading(true);

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook = XLSX.read(fileContent, { type: 'base64' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        Alert.alert('Erro', 'A planilha não contém dados válidos');
        setLoading(false);
        return;
      }

      // Verificar se a planilha tem as colunas necessárias
      const requiredColumns = ['Descricao', 'Localizacao', 'Area', 'DataNecessidade'];
      const firstRow = jsonData[0];
      const missingColumns = requiredColumns.filter(
        col => !Object.keys(firstRow).some(key => key.toLowerCase() === col.toLowerCase())
      );

      if (missingColumns.length > 0) {
        Alert.alert(
          'Erro',
          `A planilha não contém as colunas necessárias: ${missingColumns.join(', ')}`
        );
        setLoading(false);
        return;
      }

      // Converter dados da planilha para o formato do app
      const newData = jsonData.map((row, index) => {
        // Encontrar as chaves que correspondem às colunas necessárias (case insensitive)
        const descKey = Object.keys(row).find(key => key.toLowerCase() === 'descricao');
        const locKey = Object.keys(row).find(key => key.toLowerCase() === 'localizacao');
        const areaKey = Object.keys(row).find(key => key.toLowerCase() === 'area');
        const dateKey = Object.keys(row).find(key => key.toLowerCase() === 'datanecessidade');

        return {
          id: Date.now() + index, // ID único
          descricao: row[descKey] || '',
          localizacao: row[locKey] || '',
          area: row[areaKey] || '',
          dataNecessidade: row[dateKey] || '',
          status: 'pendente',
          dataInicio: null,
          dataConclusao: null,
        };
      });

      const updatedData = [...matosData, ...newData];
      setMatosData(updatedData);
      await saveMatosData(updatedData);
      Alert.alert('Sucesso', `${newData.length} vãos de mato importados com sucesso!`);
    } catch (error) {
      console.error('Erro ao importar planilha:', error);
      Alert.alert('Erro', 'Não foi possível importar a planilha');
    } finally {
      setLoading(false);
    }
  };

  // Funções para manipular os estados dos matos
  const iniciarMato = async (id) => {
    const updatedData = matosData.map(mato => {
      if (mato.id === id) {
        return {
          ...mato,
          status: 'iniciado',
          dataInicio: new Date().toISOString(),
        };
      }
      return mato;
    });
    setMatosData(updatedData);
    await saveMatosData(updatedData);
  };

  const concluirMato = async (id) => {
    const updatedData = matosData.map(mato => {
      if (mato.id === id) {
        return {
          ...mato,
          status: 'concluido',
          dataConclusao: new Date().toISOString(),
        };
      }
      return mato;
    });
    setMatosData(updatedData);
    await saveMatosData(updatedData);
  };

  const deletarMato = async (id) => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja excluir este vão de mato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const updatedData = matosData.filter(mato => mato.id !== id);
            setMatosData(updatedData);
            await saveMatosData(updatedData);
          },
        },
      ]
    );
  };

  // Função para adicionar novo mato manualmente
  const addMato = async () => {
    if (!newMato.descricao || !newMato.dataNecessidade) {
      Alert.alert('Erro', 'Descrição e Data de Necessidade são obrigatórios');
      return;
    }

    // Validar formato da data (DD/MM/YYYY)
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(newMato.dataNecessidade)) {
      Alert.alert('Erro', 'A data deve estar no formato DD/MM/YYYY');
      return;
    }

    const novoMato = {
      id: Date.now(),
      ...newMato,
      status: 'pendente',
      dataInicio: null,
      dataConclusao: null,
    };

    const updatedData = [...matosData, novoMato];
    setMatosData(updatedData);
    await saveMatosData(updatedData);
    setShowAddModal(false);
    setNewMato({
      descricao: '',
      localizacao: '',
      area: '',
      dataNecessidade: '',
    });
  };

  // Funções para edição de mato
  const handleEdit = (mato) => {
    setEditingMato(mato);
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingMato.descricao || !editingMato.dataNecessidade) {
      Alert.alert('Erro', 'Descrição e Data de Necessidade são obrigatórios');
      return;
    }

    const updatedData = matosData.map(mato => {
      if (mato.id === editingMato.id) {
        return editingMato;
      }
      return mato;
    });

    setMatosData(updatedData);
    await saveMatosData(updatedData);
    setShowEditModal(false);
    setEditingMato(null);
  };

  // Função para gerar relatório PDF
  const generateReport = async () => {
    try {
      setLoading(true);

      // Estatísticas
      const total = matosData.length;
      const pendentes = matosData.filter(m => m.status === 'pendente').length;
      const iniciados = matosData.filter(m => m.status === 'iniciado').length;
      const concluidos = matosData.filter(m => m.status === 'concluido').length;

      // Calcular progresso
      const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0;

      // Criar tabela HTML para o PDF
      let tableRows = '';
      matosData.forEach((mato, index) => {
        // Determinar a cor da linha com base no status
        let rowColor = '#ffffff';
        let statusText = 'Pendente';
        
        if (mato.status === 'iniciado') {
          rowColor = '#fff9c4'; // Amarelo claro
          statusText = 'Iniciado';
        } else if (mato.status === 'concluido') {
          rowColor = '#c8e6c9'; // Verde claro
          statusText = 'Concluído';
        }

        // Verificar se está próximo do prazo ou atrasado
        let alertIcon = '';
        if (mato.status !== 'concluido') {
          const today = new Date();
          const [day, month, year] = mato.dataNecessidade.split('/');
          const necessidadeDate = new Date(`${year}-${month}-${day}`);
          
          const diffDays = Math.ceil((necessidadeDate - today) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            alertIcon = '⚠️'; // Atrasado
          } else if (diffDays <= 7) {
            alertIcon = '🕐'; // Próximo do prazo
          }
        }

        tableRows += `
          <tr style="background-color: ${rowColor};">
            <td>${index + 1}</td>
            <td>${mato.descricao} ${alertIcon}</td>
            <td>${mato.localizacao || '-'}</td>
            <td>${mato.area || '-'}</td>
            <td>${mato.dataNecessidade}</td>
            <td>${statusText}</td>
            <td>${mato.dataInicio ? new Date(mato.dataInicio).toLocaleDateString('pt-BR') : '-'}</td>
            <td>${mato.dataConclusao ? new Date(mato.dataConclusao).toLocaleDateString('pt-BR') : '-'}</td>
          </tr>
        `;
      });

      // Gerar HTML para o PDF
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
              h1 { color: #2196F3; text-align: center; }
              .stats { display: flex; justify-content: space-around; margin: 20px 0; text-align: center; }
              .stat-box { border: 1px solid #ddd; border-radius: 8px; padding: 10px; width: 22%; }
              .progress-container { width: 100%; background-color: #f1f1f1; border-radius: 5px; margin: 20px 0; }
              .progress-bar { height: 30px; background-color: #4CAF50; border-radius: 5px; text-align: center; color: white; line-height: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #2196F3; color: white; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
              .legend { margin: 20px 0; }
              .legend-item { display: inline-block; margin-right: 20px; }
              .legend-color { display: inline-block; width: 15px; height: 15px; margin-right: 5px; vertical-align: middle; }
            </style>
          </head>
          <body>
            <h1>Relatório de Corte de Matos</h1>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            
            <div class="stats">
              <div class="stat-box">
                <h3>Total</h3>
                <p>${total}</p>
              </div>
              <div class="stat-box">
                <h3>Pendentes</h3>
                <p>${pendentes}</p>
              </div>
              <div class="stat-box">
                <h3>Iniciados</h3>
                <p>${iniciados}</p>
              </div>
              <div class="stat-box">
                <h3>Concluídos</h3>
                <p>${concluidos}</p>
              </div>
            </div>
            
            <h3>Progresso Geral</h3>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${progresso}%;">${progresso}%</div>
            </div>
            
            <div class="legend">
              <div class="legend-item"><div class="legend-color" style="background-color: #ffffff;"></div> Pendente</div>
              <div class="legend-item"><div class="legend-color" style="background-color: #fff9c4;"></div> Iniciado</div>
              <div class="legend-item"><div class="legend-color" style="background-color: #c8e6c9;"></div> Concluído</div>
              <div class="legend-item">⚠️ Atrasado</div>
              <div class="legend-item">🕐 Próximo do prazo</div>
            </div>
            
            <h3>Detalhes dos Vãos</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Descrição</th>
                  <th>Localização</th>
                  <th>Área (m²)</th>
                  <th>Data Necessidade</th>
                  <th>Status</th>
                  <th>Data Início</th>
                  <th>Data Conclusão</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Aplicativo de Controle de Corte de Matos - v1.0</p>
            </div>
          </body>
        </html>
      `;

      // Gerar o PDF
      const { uri } = await Print.printToFileAsync({ html });
      
      // Compartilhar o PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar dados de acordo com o status selecionado
  const filteredData = filterStatus === 'todos'
    ? matosData
    : matosData.filter(mato => mato.status === filterStatus);

  // Ordenar por data de necessidade
  const sortedData = [...filteredData].sort((a, b) => {
    const [dayA, monthA, yearA] = a.dataNecessidade.split('/');
    const [dayB, monthB, yearB] = b.dataNecessidade.split('/');
    
    const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
    const dateB = new Date(`${yearB}-${monthB}-${yearB}`);
    
    return dateA - dateB;
  });

  // Renderização da tela de login
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Renderização da tela principal
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <Header
        backgroundColor="#2196F3"
        centerComponent={{ text: 'CONTROLE DE CORTE DE MATOS', style: styles.headerTitle }}
        rightComponent={
          <TouchableOpacity onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="white" />
          </TouchableOpacity>
        }
      />
      
      {user?.role === 'admin' && (
        <SyncStatus user={user} onSyncComplete={loadMatosData} />
      )}
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por status:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'todos' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('todos')}
          >
            <Text style={filterStatus === 'todos' ? styles.filterTextActive : styles.filterText}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'pendente' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('pendente')}
          >
            <Text style={filterStatus === 'pendente' ? styles.filterTextActive : styles.filterText}>Pendentes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'iniciado' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('iniciado')}
          >
            <Text style={filterStatus === 'iniciado' ? styles.filterTextActive : styles.filterText}>Iniciados</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'concluido' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('concluido')}
          >
            <Text style={filterStatus === 'concluido' ? styles.filterTextActive : styles.filterText}>Concluídos</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{matosData.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {matosData.filter(m => m.status === 'pendente').length}
          </Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {matosData.filter(m => m.status === 'iniciado').length}
          </Text>
          <Text style={styles.statLabel}>Iniciados</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {matosData.filter(m => m.status === 'concluido').length}
          </Text>
          <Text style={styles.statLabel}>Concluídos</Text>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text>Carregando...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {sortedData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="landscape" size={80} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum vão de mato cadastrado</Text>
              <Text style={styles.emptySubtext}>
                Importe uma planilha ou adicione manualmente
              </Text>
            </View>
          ) : (
            sortedData.map((mato) => {
              // Verificar status para cor de fundo
              let backgroundColor = '#f9f9f9'; // Cinza claro para pendente
              if (mato.status === 'iniciado') {
                backgroundColor = '#fff9c4'; // Amarelo claro
              } else if (mato.status === 'concluido') {
                backgroundColor = '#c8e6c9'; // Verde claro
              }
              
              // Verificar prazo
              const today = new Date();
              const [day, month, year] = mato.dataNecessidade.split('/');
              const necessidadeDate = new Date(`${year}-${month}-${day}`);
              const diffDays = Math.ceil((necessidadeDate - today) / (1000 * 60 * 60 * 24));
              
              let alertIcon = null;
              if (mato.status !== 'concluido') {
                if (diffDays < 0) {
                  alertIcon = (
                    <MaterialIcons name="warning" size={20} color="red" style={styles.alertIcon} />
                  );
                } else if (diffDays <= 7) {
                  alertIcon = (
                    <MaterialIcons name="access-time" size={20} color="orange" style={styles.alertIcon} />
                  );
                }
              }

              return (
                <ListItem
                  key={mato.id}
                  containerStyle={[styles.listItem, { backgroundColor }]}
                  bottomDivider
                >
                  <ListItem.Content>
                    <View style={styles.listItemHeader}>
                      <ListItem.Title style={styles.listItemTitle}>
                        {mato.descricao}
                      </ListItem.Title>
                      {alertIcon}
                    </View>
                    <ListItem.Subtitle style={styles.listItemSubtitle}>
                      {mato.localizacao ? `Local: ${mato.localizacao}` : 'Local: Não informado'}
                    </ListItem.Subtitle>
                    <ListItem.Subtitle style={styles.listItemSubtitle}>
                      {mato.area ? `Área: ${mato.area} m²` : 'Área: Não informada'}
                    </ListItem.Subtitle>
                    <ListItem.Subtitle style={styles.listItemSubtitle}>
                      Data necessidade: {mato.dataNecessidade}
                    </ListItem.Subtitle>
                    {mato.dataInicio && (
                      <ListItem.Subtitle style={styles.listItemSubtitle}>
                        Iniciado em: {new Date(mato.dataInicio).toLocaleDateString('pt-BR')}
                      </ListItem.Subtitle>
                    )}
                    {mato.dataConclusao && (
                      <ListItem.Subtitle style={styles.listItemSubtitle}>
                        Concluído em: {new Date(mato.dataConclusao).toLocaleDateString('pt-BR')}
                      </ListItem.Subtitle>
                    )}
                  </ListItem.Content>
                  
                  <View style={styles.buttonsContainer}>
                    {mato.status === 'pendente' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.startButton]}
                        onPress={() => iniciarMato(mato.id)}
                      >
                        <MaterialIcons name="play-arrow" size={20} color="white" />
                      </TouchableOpacity>
                    )}
                    
                    {mato.status === 'iniciado' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={() => concluirMato(mato.id)}
                      >
                        <MaterialIcons name="check" size={20} color="white" />
                      </TouchableOpacity>
                    )}
                    
                    {user?.role === 'admin' && (
                      <>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton]}
                          onPress={() => handleEdit(mato)}
                        >
                          <MaterialIcons name="edit" size={20} color="white" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => deletarMato(mato.id)}
                        >
                          <MaterialIcons name="delete" size={20} color="white" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </ListItem>
              );
            })
          )}
        </ScrollView>
      )}
      
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.addButton]}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.footerButtonText}>Adicionar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.footerButton, styles.importButton]}
          onPress={importExcel}
        >
          <MaterialIcons name="file-upload" size={24} color="white" />
          <Text style={styles.footerButtonText}>Importar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.footerButton, styles.reportButton]}
          onPress={generateReport}
          disabled={matosData.length === 0}
        >
          <MaterialIcons name="description" size={24} color="white" />
          <Text style={styles.footerButtonText}>Relatório</Text>
        </TouchableOpacity>
      </View>
      
      {/* Modal para adicionar novo mato */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Novo Vão</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Descrição *"
              value={newMato.descricao}
              onChangeText={(text) => setNewMato({ ...newMato, descricao: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Localização"
              value={newMato.localizacao}
              onChangeText={(text) => setNewMato({ ...newMato, localizacao: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Área (m²)"
              value={newMato.area}
              onChangeText={(text) => setNewMato({ ...newMato, area: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Data Necessidade (DD/MM/YYYY) *"
              value={newMato.dataNecessidade}
              onChangeText={(text) => setNewMato({ ...newMato, dataNecessidade: text })}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addMato}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal para editar mato */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Vão</Text>
            
            {editingMato && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Descrição *"
                  value={editingMato.descricao}
                  onChangeText={(text) =>
                    setEditingMato({ ...editingMato, descricao: text })
                  }
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Localização"
                  value={editingMato.localizacao}
                  onChangeText={(text) =>
                    setEditingMato({ ...editingMato, localizacao: text })
                  }
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Área (m²)"
                  value={editingMato.area}
                  onChangeText={(text) =>
                    setEditingMato({ ...editingMato, area: text })
                  }
                  keyboardType="numeric"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Data Necessidade (DD/MM/YYYY) *"
                  value={editingMato.dataNecessidade}
                  onChangeText={(text) =>
                    setEditingMato({ ...editingMato, dataNecessidade: text })
                  }
                />
                
                <View style={styles.statusSelector}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      editingMato.status === 'pendente' && styles.statusOptionSelected,
                    ]}
                    onPress={() =>
                      setEditingMato({
                        ...editingMato,
                        status: 'pendente',
                        dataInicio: null,
                        dataConclusao: null,
                      })
                    }
                  >
                    <Text style={styles.statusText}>Pendente</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      editingMato.status === 'iniciado' && styles.statusOptionSelected,
                    ]}
                    onPress={() =>
                      setEditingMato({
                        ...editingMato,
                        status: 'iniciado',
                        dataInicio: new Date().toISOString(),
                        dataConclusao: null,
                      })
                    }
                  >
                    <Text style={styles.statusText}>Iniciado</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      editingMato.status === 'concluido' && styles.statusOptionSelected,
                    ]}
                    onPress={() =>
                      setEditingMato({
                        ...editingMato,
                        status: 'concluido',
                        dataInicio: editingMato.dataInicio || new Date().toISOString(),
                        dataConclusao: new Date().toISOString(),
                      })
                    }
                  >
                    <Text style={styles.statusText}>Concluído</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEdit}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  filterContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    color: '#555',
    fontSize: 12,
  },
  filterTextActive: {
    color: 'white',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  listItem: {
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  alertIcon: {
    marginLeft: 5,
  },
  listItemSubtitle: {
    color: '#666',
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  startButton: {
    backgroundColor: '#FFC107',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  footerContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  importButton: {
    backgroundColor: '#FF9800',
  },
  reportButton: {
    backgroundColor: '#2196F3',
  },
  footerButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusLabel: {
    marginRight: 10,
  },
  statusOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 5,
  },
  statusOptionSelected: {
    backgroundColor: '#2196F3',
  },
  statusText: {
    fontSize: 12,
  },
});
