import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyChXpRcQawnO81gxNNUH5GMG27--PMlLK4",
  authDomain: "corte-matos-sync.firebaseapp.com",
  projectId: "corte-matos-sync",
  storageBucket: "corte-matos-sync.firebasestorage.app",
  messagingSenderId: "174399593138",
  appId: "1:174399593138:web:3b0efb92b487bef237c7ab",
  measurementId: "G-KSEDQ9C88V"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Auth
export const auth = getAuth(app);

// Funções para gerenciar conexão offline
export const enableFirestoreNetwork = () => enableNetwork(db);
export const disableFirestoreNetwork = () => disableNetwork(db);

export default app;
