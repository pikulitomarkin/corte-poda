// Firebase REST API Service - Compatível com APK e Expo Go
// Usa REST API em vez de SDK nativo para evitar conflitos

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyChXpRcQawnO81gxNNUH5GMG27--PMlLK4",
  authDomain: "corte-matos-sync.firebaseapp.com",
  projectId: "corte-matos-sync",
  storageBucket: "corte-matos-sync.firebasestorage.app",
  messagingSenderId: "174399593138",
  appId: "1:174399593138:web:3b0efb92b487bef237c7ab"
};

class FirebaseRestAPI {
  constructor() {
    this.projectId = FIREBASE_CONFIG.projectId;
    this.apiKey = FIREBASE_CONFIG.apiKey;
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
    this.authToken = null;
    this.deviceId = null;
  }

  // Gerar ID único do dispositivo
  async getDeviceId() {
    if (!this.deviceId) {
      try {
        const { getRandomBytes } = await import('expo-crypto');
        const randomBytes = await getRandomBytes(16);
        this.deviceId = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        // Fallback para dispositivos sem expo-crypto
        this.deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      }
    }
    return this.deviceId;
  }

  // Autenticação anônima via REST API
  async authenticateAnonymously() {
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();
      
      if (response.ok && data.idToken) {
        this.authToken = data.idToken;
        console.log('🔑 Autenticação anônima bem-sucedida');
        return true;
      } else {
        console.warn('⚠️ Erro na autenticação:', data.error?.message || 'Erro desconhecido');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro na autenticação anônima:', error);
      return false;
    }
  }

  // Converter dados para formato Firestore
  async convertToFirestoreFormat(data) {
    const converted = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (typeof value === 'string') {
        converted[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        converted[key] = { doubleValue: value };
      } else if (typeof value === 'boolean') {
        converted[key] = { booleanValue: value };
      } else if (value instanceof Date) {
        converted[key] = { timestampValue: value.toISOString() };
      } else if (Array.isArray(value)) {
        converted[key] = {
          arrayValue: {
            values: value.map(item => 
              typeof item === 'string' ? { stringValue: item } : { stringValue: String(item) }
            )
          }
        };
      } else {
        converted[key] = { stringValue: String(value) };
      }
    });
    
    // Adicionar metadados
    converted.lastUpdated = { timestampValue: new Date().toISOString() };
    converted.deviceId = { stringValue: await this.getDeviceId() };
    
    return converted;
  }

  // Converter dados do formato Firestore
  convertFromFirestoreFormat(firestoreData) {
    if (!firestoreData.fields) return null;
    
    const converted = {};
    
    Object.keys(firestoreData.fields).forEach(key => {
      const field = firestoreData.fields[key];
      
      if (field.stringValue !== undefined) {
        converted[key] = field.stringValue;
      } else if (field.doubleValue !== undefined) {
        converted[key] = field.doubleValue;
      } else if (field.booleanValue !== undefined) {
        converted[key] = field.booleanValue;
      } else if (field.timestampValue !== undefined) {
        converted[key] = field.timestampValue;
      } else if (field.arrayValue?.values) {
        converted[key] = field.arrayValue.values.map(item => 
          item.stringValue || item.doubleValue || item.booleanValue || ''
        );
      }
    });
    
    return converted;
  }

  // Salvar vãos na nuvem
  async saveVaosToCloud(vaos) {
    if (!this.authToken && !(await this.authenticateAnonymously())) {
      throw new Error('Falha na autenticação');
    }

    try {
      const deviceId = await this.getDeviceId();
      const batch = [];

      // Preparar dados para envio em lote
      for (const vao of vaos) {
        const firestoreData = await this.convertToFirestoreFormat({
          ...vao,
          syncedAt: new Date().toISOString(),
          deviceId: deviceId
        });

        batch.push({
          url: `${this.baseUrl}/vaos/${vao.id}`,
          method: 'PATCH',
          body: { fields: firestoreData }
        });
      }

      // Enviar em lotes de 10 (limite do Firestore)
      const batchSize = 10;
      const results = [];

      for (let i = 0; i < batch.length; i += batchSize) {
        const currentBatch = batch.slice(i, i + batchSize);
        
        const promises = currentBatch.map(async (request) => {
          const response = await fetch(request.url, {
            method: request.method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.authToken}`,
            },
            body: JSON.stringify(request.body),
          });
          
          return response.ok;
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
      }

      const successCount = results.filter(r => r).length;
      console.log(`🔄 Sincronizados ${successCount}/${vaos.length} vãos para a nuvem`);
      
      return successCount > 0;
    } catch (error) {
      console.error('❌ Erro ao salvar na nuvem:', error);
      throw error;
    }
  }

  // Carregar vãos da nuvem
  async loadVaosFromCloud() {
    if (!this.authToken && !(await this.authenticateAnonymously())) {
      throw new Error('Falha na autenticação');
    }

    try {
      const response = await fetch(`${this.baseUrl}/vaos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.documents) {
        console.log('📭 Nenhum vão encontrado na nuvem');
        return [];
      }

      const vaos = data.documents.map(doc => {
        const converted = this.convertFromFirestoreFormat(doc);
        // Extrair ID do documento do path
        const pathParts = doc.name.split('/');
        converted.id = pathParts[pathParts.length - 1];
        return converted;
      }).filter(vao => vao && vao.id);

      console.log(`📥 Carregados ${vaos.length} vãos da nuvem`);
      return vaos;
    } catch (error) {
      console.error('❌ Erro ao carregar da nuvem:', error);
      throw error;
    }
  }

  // Sincronização completa bidirecional
  async fullSync(localVaos = []) {
    try {
      console.log('🔄 Iniciando sincronização completa...');
      
      // 1. Carregar dados da nuvem
      const cloudVaos = await this.loadVaosFromCloud();
      
      // 2. Merge inteligente dos dados
      const mergedVaos = this.mergeVaos(localVaos, cloudVaos);
      
      // 3. Salvar dados mesclados na nuvem
      if (mergedVaos.length > 0) {
        await this.saveVaosToCloud(mergedVaos);
      }
      
      console.log(`✅ Sincronização completa: ${mergedVaos.length} vãos`);
      return mergedVaos;
    } catch (error) {
      console.error('❌ Erro na sincronização completa:', error);
      throw error;
    }
  }

  // Fazer merge inteligente entre dados locais e da nuvem
  mergeVaos(localVaos, cloudVaos) {
    console.log(`🔄 Merge: ${localVaos.length} locais, ${cloudVaos.length} da nuvem`);
    
    // REGRA PRINCIPAL: Se a nuvem está vazia (0 itens), significa que foram limpos intencionalmente
    // Neste caso, deve-se priorizar a nuvem vazia e limpar dados locais também
    if (cloudVaos.length === 0 && localVaos.length > 0) {
      console.log('🗑️ MERGE: Nuvem vazia detectada - dados foram limpos por admin. Priorizando limpeza.');
      return []; // Retorna array vazio para sincronizar a limpeza
    }
    
    const merged = new Map();
    
    // Se nuvem não está vazia, fazer merge normal
    
    // Adicionar dados locais com validação
    localVaos.forEach(vao => {
      if (!vao.id) {
        console.warn('⚠️ Vão local sem ID encontrado:', vao);
        return;
      }
      
      merged.set(vao.id, {
        ...vao,
        source: 'local',
        lastUpdated: vao.lastUpdated || new Date().toISOString()
      });
    });
    
    // Merge com dados da nuvem (prevalece o mais recente)
    cloudVaos.forEach(vao => {
      if (!vao.id) {
        console.warn('⚠️ Vão da nuvem sem ID encontrado:', vao);
        return;
      }
      
      const existing = merged.get(vao.id);
      
      if (!existing) {
        // Novo item da nuvem
        merged.set(vao.id, { ...vao, source: 'cloud' });
      } else {
        // Decidir qual versão manter baseado no timestamp
        const cloudTime = new Date(vao.lastUpdated || vao.syncedAt || 0);
        const localTime = new Date(existing.lastUpdated || 0);
        
        if (cloudTime > localTime) {
          console.log(`📥 Atualizando vão ${vao.id} com versão da nuvem`);
          merged.set(vao.id, { ...vao, source: 'cloud-updated' });
        } else {
          console.log(`📱 Mantendo vão ${vao.id} com versão local`);
        }
        // Senão, mantém a versão local
      }
    });
    
    const result = Array.from(merged.values()).map(vao => {
      // Limpar metadados de sync
      const { source, syncedAt, deviceId, ...cleanVao } = vao;
      return cleanVao;
    });
    
    console.log(`✅ Merge finalizado: ${result.length} vãos únicos`);
    
    // Verificar se há IDs duplicados (debugging)
    const ids = result.map(v => v.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.error('❌ ERRO: IDs duplicados detectados após merge!');
      console.error('IDs:', ids);
    }
    
    return result;
  }

  // Verificar conectividade
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Limpar todos os vãos da nuvem
  async limparTodosVaos() {
    try {
      if (!this.authToken && !(await this.authenticateAnonymously())) {
        throw new Error('Falha na autenticação');
      }
      
      console.log('🗑️ Iniciando limpeza de todos os vãos da nuvem...');
      
      // Primeiro, listar todos os vãos
      const vaos = await this.loadVaosFromCloud();
      console.log(`📋 Encontrados ${vaos.length} vãos para deletar`);
      
      if (vaos.length === 0) {
        console.log('✅ Nenhum vão encontrado na nuvem para deletar');
        return { success: true, deletedCount: 0 };
      }
      
      // Deletar cada vão individualmente
      let deletedCount = 0;
      const errors = [];
      
      for (const vao of vaos) {
        try {
          const response = await fetch(
            `${this.baseUrl}/vaos/${vao.id}?key=${this.apiKey}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json',
              }
            }
          );
          
          if (response.ok) {
            deletedCount++;
            console.log(`🗑️ Vão ${vao.id} deletado da nuvem (${deletedCount}/${vaos.length})`);
          } else {
            const errorText = await response.text();
            console.log(`⚠️ Erro ao deletar vão ${vao.id}:`, errorText);
            errors.push({ id: vao.id, error: errorText });
          }
        } catch (error) {
          console.log(`❌ Erro ao deletar vão ${vao.id}:`, error);
          errors.push({ id: vao.id, error: error.message });
        }
      }
      
      console.log(`✅ Limpeza concluída: ${deletedCount}/${vaos.length} vãos deletados`);
      
      if (errors.length > 0) {
        console.log(`⚠️ ${errors.length} erros durante a limpeza:`, errors);
      }
      
      return { 
        success: true, 
        deletedCount, 
        totalFound: vaos.length, 
        errors: errors.length > 0 ? errors : null 
      };
      
    } catch (error) {
      console.error('❌ Erro ao limpar todos os vãos da nuvem:', error);
      throw error;
    }
  }
}

export default new FirebaseRestAPI();
