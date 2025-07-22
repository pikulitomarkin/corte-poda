import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function App() {
  const [matos, setMatos] = useState([]);

  const adicionarItemTeste = () => {
    const novoItem = {
      id: matos.length + 1,
      descricao: `Vão ${matos.length + 1} - Teste`,
      localizacao: 'Local de Teste',
      area: '100m²',
      status: 'pendente',
      dataNecessidade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      dataInicio: null,
      dataConclusao: null
    };
    setMatos([...matos, novoItem]);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return '#757575';
      case 'iniciado': return '#ffeb3b';
      case 'concluido': return '#4caf50';
      default: return '#757575';
    }
  };

  const completedItems = matos.filter(item => item.status === 'concluido').length;
  const totalItems = matos.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Controle de Corte de Matos</Text>
      </View>
      
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Progresso: {completedItems}/{totalItems} ({totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%)
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#1976d2' }]} onPress={adicionarItemTeste}>
          <Text style={styles.buttonText}>➕ Adicionar Teste</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#d32f2f', opacity: matos.length === 0 ? 0.5 : 1 }]} 
          onPress={() => Alert.alert('Relatório', 'Funcionalidade será implementada')}
          disabled={matos.length === 0}
        >
          <Text style={styles.buttonText}>📄 Relatório</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer}>
        {matos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🌱</Text>
            <Text style={styles.emptyTitle}>Nenhum vão cadastrado</Text>
            <Text style={styles.emptySubtext}>Toque em "Adicionar Teste" para começar</Text>
          </View>
        ) : (
          matos.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.descricao}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={[styles.statusText, item.status === 'iniciado' ? { color: '#000' } : { color: '#fff' }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.itemSubtitle}>📍 {item.localizacao}</Text>
              <Text style={styles.itemSubtitle}>📐 Área: {item.area}</Text>
              <Text style={styles.itemSubtitle}>📅 Necessário até: {item.dataNecessidade}</Text>
              
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
                  <Text style={styles.completedIcon}>✅ Concluído</Text>
                )}
              </View>
            </View>
          ))
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
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
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
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
    padding: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedIcon: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
