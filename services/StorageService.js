import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

const STORAGE_KEYS = {
  MATOS_DATA: '@matos_data',
  USER_DATA: '@user_data',
  LAST_SYNC: '@last_sync',
  PENDING_CHANGES: '@pending_changes'
};

export const StorageService = {
  // Salvar dados dos matos
  async saveMatosData(data) {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEYS.MATOS_DATA, jsonValue);
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados dos matos:', error);
      return false;
    }
  },

  // Carregar dados dos matos
  async loadMatosData() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.MATOS_DATA);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Erro ao carregar dados dos matos:', error);
      return [];
    }
  },

  // Salvar dados do usuário
  async saveUserData(userData) {
    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      return false;
    }
  },

  // Carregar dados do usuário
  async loadUserData() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return null;
    }
  },

  // Salvar mudanças pendentes para sincronização
  async savePendingChanges(changes) {
    try {
      const existing = await this.loadPendingChanges();
      const updated = [...existing, ...changes];
      const jsonValue = JSON.stringify(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CHANGES, jsonValue);
      return true;
    } catch (error) {
      console.error('Erro ao salvar mudanças pendentes:', error);
      return false;
    }
  },

  // Carregar mudanças pendentes
  async loadPendingChanges() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CHANGES);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Erro ao carregar mudanças pendentes:', error);
      return [];
    }
  },

  // Limpar mudanças pendentes após sincronização
  async clearPendingChanges() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_CHANGES);
      return true;
    } catch (error) {
      console.error('Erro ao limpar mudanças pendentes:', error);
      return false;
    }
  },

  // Salvar timestamp da última sincronização
  async saveLastSync(timestamp) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
      return true;
    } catch (error) {
      console.error('Erro ao salvar timestamp de sincronização:', error);
      return false;
    }
  },

  // Carregar timestamp da última sincronização
  async loadLastSync() {
    try {
      const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return timestamp ? parseInt(timestamp) : null;
    } catch (error) {
      console.error('Erro ao carregar timestamp de sincronização:', error);
      return null;
    }
  },

  // Limpar todos os dados
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.MATOS_DATA,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.PENDING_CHANGES
      ]);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  }
};

export const SyncService = {
  // Verificar conectividade
  async isConnected() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isConnected;
    } catch (error) {
      console.error('Erro ao verificar conectividade:', error);
      return false;
    }
  },

  // Simular sincronização com servidor (futuramente substituir por API real)
  async syncWithServer(localData, pendingChanges, userRole) {
    const isOnline = await this.isConnected();
    
    if (!isOnline) {
      return {
        success: false,
        message: 'Sem conexão com a internet',
        needsSync: true
      };
    }

    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular dados do servidor
      const serverData = await this.simulateServerData(userRole);
      
      // Aplicar mudanças pendentes
      const updatedData = this.applyPendingChanges(serverData, pendingChanges);
      
      // Salvar dados sincronizados
      await StorageService.saveMatosData(updatedData);
      await StorageService.clearPendingChanges();
      await StorageService.saveLastSync(Date.now());

      return {
        success: true,
        message: 'Sincronização concluída',
        data: updatedData,
        needsSync: false
      };
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return {
        success: false,
        message: 'Erro ao sincronizar com o servidor',
        needsSync: true
      };
    }
  },

  // Simular dados do servidor
  async simulateServerData(userRole) {
    // Para admin, retornar dados base
    // Para user, retornar dados já importados pelo admin
    if (userRole === 'admin') {
      return [];
    } else {
      // Simular dados que o admin já importou
      return [
        {
          id: 1,
          descricao: 'Vão 1 - Entrada Principal',
          localizacao: 'Portão de Acesso',
          area: '120m²',
          dataNecessidade: '25/07/2025',
          status: 'pendente',
          dataInicio: null,
          dataConclusao: null,
          createdBy: 'Admin',
          createdAt: Date.now() - 24 * 60 * 60 * 1000 // 1 dia atrás
        },
        {
          id: 2,
          descricao: 'Vão 2 - Lateral Esquerda',
          localizacao: 'Lado da Rua Principal',
          area: '95m²',
          dataNecessidade: '28/07/2025',
          status: 'pendente',
          dataInicio: null,
          dataConclusao: null,
          createdBy: 'Admin',
          createdAt: Date.now() - 24 * 60 * 60 * 1000
        },
        {
          id: 3,
          descricao: 'Vão 3 - Área dos Fundos',
          localizacao: 'Fundo do Terreno',
          area: '200m²',
          dataNecessidade: '30/07/2025',
          status: 'pendente',
          dataInicio: null,
          dataConclusao: null,
          createdBy: 'Admin',
          createdAt: Date.now() - 24 * 60 * 60 * 1000
        }
      ];
    }
  },

  // Aplicar mudanças pendentes aos dados do servidor
  applyPendingChanges(serverData, pendingChanges) {
    let updatedData = [...serverData];

    pendingChanges.forEach(change => {
      switch (change.type) {
        case 'UPDATE_STATUS':
          const itemIndex = updatedData.findIndex(item => item.id === change.itemId);
          if (itemIndex !== -1) {
            updatedData[itemIndex] = {
              ...updatedData[itemIndex],
              status: change.status,
              dataInicio: change.dataInicio,
              dataConclusao: change.dataConclusao,
              updatedBy: change.user,
              updatedAt: change.timestamp
            };
          }
          break;
        case 'ADD_ITEM':
          updatedData.push(change.item);
          break;
        default:
          break;
      }
    });

    return updatedData;
  },

  // Registrar mudança para sincronização futura
  async recordChange(type, data, user) {
    const change = {
      id: Date.now() + Math.random(),
      type,
      timestamp: Date.now(),
      user,
      ...data
    };

    await StorageService.savePendingChanges([change]);
    return change;
  }
};
