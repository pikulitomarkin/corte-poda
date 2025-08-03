import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DataSyncService {
  constructor() {
    this.userId = null;
    this.listeners = [];
  }

  // Gerar ID único para dispositivo
  async getDeviceId() {
    let deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  // Sincronizar vãos de matos para a nuvem
  async syncVaosToCloud(vaos) {
    try {
      const deviceId = await this.getDeviceId();
      const vaosCollection = collection(db, 'vaos');

      for (const vao of vaos) {
        const vaoData = {
          ...vao,
          deviceId,
          updatedAt: serverTimestamp(),
          syncedAt: serverTimestamp()
        };

        if (vao.id && vao.cloudId) {
          // Atualizar existente
          const docRef = doc(db, 'vaos', vao.cloudId);
          await updateDoc(docRef, vaoData);
        } else {
          // Criar novo
          const docRef = await addDoc(vaosCollection, vaoData);
          // Salvar cloudId localmente
          vao.cloudId = docRef.id;
        }
      }

      // Salvar vãos atualizados localmente
      await AsyncStorage.setItem('vaos', JSON.stringify(vaos));
      
      console.log('✅ Vãos sincronizados para a nuvem!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao sincronizar para nuvem:', error);
      return false;
    }
  }

  // Baixar vãos de todos os dispositivos
  async syncVaosFromCloud() {
    try {
      const vaosCollection = collection(db, 'vaos');
      const querySnapshot = await getDocs(query(
        vaosCollection, 
        orderBy('updatedAt', 'desc')
      ));

      const cloudVaos = [];
      querySnapshot.forEach((doc) => {
        cloudVaos.push({
          id: doc.data().id || doc.id,
          cloudId: doc.id,
          ...doc.data()
        });
      });

      // Mesclar com dados locais
      const localVaosJson = await AsyncStorage.getItem('vaos');
      const localVaos = localVaosJson ? JSON.parse(localVaosJson) : [];

      const mergedVaos = this.mergeVaos(localVaos, cloudVaos);
      
      // Salvar dados mesclados
      await AsyncStorage.setItem('vaos', JSON.stringify(mergedVaos));
      
      console.log(`✅ ${cloudVaos.length} vãos baixados da nuvem!`);
      return mergedVaos;
    } catch (error) {
      console.error('❌ Erro ao baixar da nuvem:', error);
      return null;
    }
  }

  // Mesclar dados locais e da nuvem (resolve conflitos)
  mergeVaos(localVaos, cloudVaos) {
    const merged = {};

    // Adicionar vãos locais
    localVaos.forEach(vao => {
      merged[vao.id] = vao;
    });

    // Mesclar/sobrescrever com vãos da nuvem (mais recentes)
    cloudVaos.forEach(cloudVao => {
      const localVao = merged[cloudVao.id];
      
      if (!localVao || 
          (cloudVao.updatedAt && cloudVao.updatedAt.toDate() > new Date(localVao.updatedAt || 0))) {
        merged[cloudVao.id] = cloudVao;
      }
    });

    return Object.values(merged);
  }

  // Escutar mudanças em tempo real
  subscribeToChanges(callback) {
    const vaosCollection = collection(db, 'vaos');
    const unsubscribe = onSnapshot(
      query(vaosCollection, orderBy('updatedAt', 'desc')), 
      (snapshot) => {
        const changes = [];
        snapshot.docChanges().forEach((change) => {
          changes.push({
            type: change.type, // 'added', 'modified', 'removed'
            data: { 
              id: change.doc.data().id || change.doc.id,
              cloudId: change.doc.id,
              ...change.doc.data() 
            }
          });
        });
        
        if (changes.length > 0) {
          console.log(`🔄 ${changes.length} mudanças detectadas na nuvem`);
          callback(changes);
        }
      }
    );

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  // Parar escuta de mudanças
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }

  // Sincronização automática bidirecional
  async fullSync() {
    try {
      console.log('🔄 Iniciando sincronização completa...');
      
      // 1. Baixar dados da nuvem
      const cloudVaos = await this.syncVaosFromCloud();
      
      if (cloudVaos) {
        // 2. Enviar dados locais para nuvem
        await this.syncVaosToCloud(cloudVaos);
        
        console.log('✅ Sincronização completa finalizada!');
        return cloudVaos;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro na sincronização completa:', error);
      return null;
    }
  }
}

export default new DataSyncService();
