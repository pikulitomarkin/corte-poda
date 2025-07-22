import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const users = {
    'Usuario': { password: 'esul1234', role: 'user' },
    'Admin': { password: 'eletro2025', role: 'admin' }
  };

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha usuário e senha');
      return;
    }

    setLoading(true);

    // Simular delay de autenticação
    setTimeout(() => {
      const user = users[username];
      
      if (user && user.password === password) {
        Alert.alert('Sucesso', `Bem-vindo, ${username}!`, [
          {
            text: 'OK',
            onPress: () => onLogin({ username, role: user.role })
          }
        ]);
      } else {
        Alert.alert('Erro', 'Usuário ou senha incorretos');
      }
      
      setLoading(false);
    }, 1000);
  };

  const handleDemoLogin = (userType) => {
    if (userType === 'user') {
      setUsername('Usuario');
      setPassword('esul1234');
    } else {
      setUsername('Admin');
      setPassword('eletro2025');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🌱</Text>
          <Text style={styles.logoText}>Corte de Matos</Text>
        </View>
        <Text style={styles.subtitle}>Sistema de Controle</Text>
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginTitle}>Fazer Login</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Usuário</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Digite seu usuário"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Acesso de Demonstração:</Text>
          
          <TouchableOpacity 
            style={[styles.demoButton, { backgroundColor: '#2196f3' }]} 
            onPress={() => handleDemoLogin('user')}
          >
            <Text style={styles.demoButtonText}>👤 Usuário Operacional</Text>
            <Text style={styles.demoButtonSubtext}>Visualizar e gerenciar vãos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.demoButton, { backgroundColor: '#ff9800' }]} 
            onPress={() => handleDemoLogin('admin')}
          >
            <Text style={styles.demoButtonText}>⚙️ Administrador</Text>
            <Text style={styles.demoButtonSubtext}>Importar planilhas e gerenciar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.credentialsInfo}>
          <Text style={styles.credentialsTitle}>Credenciais de Acesso:</Text>
          <Text style={styles.credentialsText}>
            <Text style={styles.credentialsBold}>Usuário:</Text> Usuario / esul1234
          </Text>
          <Text style={styles.credentialsText}>
            <Text style={styles.credentialsBold}>Admin:</Text> Admin / eletro2025
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e7d32',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#c8e6c9',
    textAlign: 'center',
  },
  loginContainer: {
    flex: 2,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 20,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loginButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoContainer: {
    marginBottom: 20,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  demoButton: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  demoButtonSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  credentialsInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  credentialsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  credentialsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 3,
  },
  credentialsBold: {
    fontWeight: 'bold',
    color: '#333',
  },
});
