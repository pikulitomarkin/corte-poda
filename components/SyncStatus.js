import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SyncService, StorageService } from '../services/StorageService';

export default function SyncStatus({ user, onSyncComplete }) {
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    checkConnectionStatus();
    loadSyncInfo();
    
    // Verificar conectividade a cada 30 segundos
    const interval = setInterval(checkConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnectionStatus = async () => {
    const connected = await SyncService.isConnected();
    setIsOnline(connected);
  };

  const loadSyncInfo = async () => {
    const lastSyncTime = await StorageService.loadLastSync();
    const pending = await StorageService.loadPendingChanges();
    
    setLastSync(lastSyncTime);
    setPendingChanges(pending.length);
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Sem Conexão', 'Verifique sua conexão com a internet e tente novamente.');
      return;
    }

    setIsSyncing(true);

    try {
      const localData = await StorageService.loadMatosData();
      const pendingChangesData = await StorageService.loadPendingChanges();
      
      const result = await SyncService.syncWithServer(localData, pendingChangesData, user.role);
      
      if (result.success) {
        Alert.alert('Sucesso', result.message);
        await loadSyncInfo();
        onSyncComplete && onSyncComplete(result.data);
      } else {
        Alert.alert('Erro na Sincronização', result.message);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao sincronizar dados');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Nunca';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora há pouco';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4caf50' : '#f44336' }]} />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        
        <Text style={styles.lastSyncText}>
          Última sync: {formatLastSync(lastSync)}
        </Text>
        
        {pendingChanges > 0 && (
          <Text style={styles.pendingText}>
            {pendingChanges} mudança{pendingChanges > 1 ? 's' : ''} pendente{pendingChanges > 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <TouchableOpacity 
        style={[
          styles.syncButton,
          !isOnline && styles.syncButtonDisabled,
          isSyncing && styles.syncButtonSyncing
        ]} 
        onPress={handleSync}
        disabled={!isOnline || isSyncing}
      >
        <Text style={styles.syncButtonText}>
          {isSyncing ? '🔄 Sincronizando...' : '🔄 Sincronizar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusContainer: {
    flex: 1,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  lastSyncText: {
    fontSize: 10,
    color: '#666',
  },
  pendingText: {
    fontSize: 10,
    color: '#ff9800',
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  syncButtonDisabled: {
    backgroundColor: '#ccc',
  },
  syncButtonSyncing: {
    backgroundColor: '#ff9800',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
