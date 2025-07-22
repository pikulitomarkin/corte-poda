# Instruções de Desenvolvimento - Corte de Matos App

## 🛠️ Configuração do Ambiente de Desenvolvimento

### 1. Primeiro Setup (Execute uma vez)

1. **Instalar Node.js**
   ```powershell
   # Opção 1: Download direto
   # Vá para https://nodejs.org/ e baixe a versão LTS
   
   # Opção 2: Via Chocolatey (se tiver instalado)
   choco install nodejs
   
   # Opção 3: Via Winget
   winget install OpenJS.NodeJS
   ```

2. **Reiniciar o Terminal**
   - Feche e abra novamente o PowerShell/Terminal
   - Ou execute: `refreshenv` (se usando Chocolatey)

3. **Verificar Instalação**
   ```powershell
   node --version
   npm --version
   ```

4. **Instalar Dependências do Projeto**
   ```powershell
   cd "C:\Users\0338138\Desktop\corte e poda"
   npm install
   ```

5. **Instalar Expo CLI**
   ```powershell
   npm install -g @expo/cli
   ```

### 2. Desenvolvimento Diário

1. **Iniciar o Servidor de Desenvolvimento**
   ```powershell
   npm start
   # ou
   expo start
   ```

2. **Executar no Android (com emulador ou dispositivo)**
   ```powershell
   npm run android
   # ou
   expo start --android
   ```

3. **Executar no navegador (para testes básicos)**
   ```powershell
   npm run web
   # ou
   expo start --web
   ```

## 📱 Testando o App

### Opção 1: Expo Go (Recomendado para desenvolvimento)
1. Instale o app "Expo Go" no seu celular Android
2. Execute `npm start` no computador
3. Escaneie o QR code que aparece no terminal
4. O app será carregado no seu celular

### Opção 2: Emulador Android
1. Instale o Android Studio
2. Configure um emulador Android
3. Execute `npm run android`

### Opção 3: Build APK (Para produção)
```powershell
expo build:android
```

## 🔧 Estrutura do Código

### Principais Arquivos:
- `App.js` - Componente principal com toda a lógica
- `app.json` - Configurações do Expo
- `package.json` - Dependências e scripts

### Funcionalidades Implementadas:
- ✅ Importação de planilhas Excel (.xlsx)
- ✅ Lista de vãos com status colorido
- ✅ **Sistema de alertas por data de necessidade**
- ✅ **Destaque visual para itens urgentes (🕐) e atrasados (⚠️)**
- ✅ Botões de iniciar/finalizar
- ✅ Geração de relatório PDF com informações de prazos
- ✅ Compartilhamento via WhatsApp/outros apps
- ✅ Cálculo de progresso automático

## 📊 Formato da Planilha

Crie uma planilha Excel (.xlsx) com as colunas:

| Coluna | Obrigatório | Exemplo |
|--------|-------------|---------|
| Descricao | Sim | "Vão 1 - Entrada" |
| Localizacao | Não | "Portão Principal" |
| Area | Não | "100m²" |
| DataNecessidade | Não | "15/08/2025" |

## 🎨 Personalizações Possíveis

### Cores do App:
- Verde principal: `#2e7d32`
- Pendente: `#ff9800` (laranja)
- Iniciado: `#2196f3` (azul)
- Concluído: `#4caf50` (verde)

### Para alterar cores, edite o arquivo `App.js`:
```javascript
const getStatusColor = (status) => {
  switch (status) {
    case 'pendente': return '#ff9800';  // Altere aqui
    case 'iniciado': return '#2196f3';  // Altere aqui
    case 'concluido': return '#4caf50'; // Altere aqui
  }
};
```

## 🐛 Solução de Problemas Comuns

### Erro: "node não é reconhecido"
- Instale o Node.js e reinicie o terminal

### Erro: "expo não é reconhecido"
- Execute: `npm install -g @expo/cli`

### Erro na importação de planilha:
- Verifique se o arquivo é .xlsx (não .xls)
- Certifique-se que tem a coluna "Descricao"

### App não abre no celular:
- Verifique se o celular está na mesma rede Wi-Fi
- Instale o app "Expo Go"

### Erro ao gerar PDF:
- Permissões de armazenamento podem estar bloqueadas
- Teste em dispositivo físico (emulador pode ter limitações)

## 📈 Próximas Melhorias Sugeridas

1. **Persistência de dados** (salvar localmente)
2. **Backup automático** na nuvem
3. **Fotos dos vãos** antes/depois
4. **GPS/localização** automática
5. **Múltiplos usuários** com login
6. **Relatórios por período**
7. **Notificações** de lembretes

## 🆘 Suporte

Se tiver dúvidas:
1. Verifique este arquivo primeiro
2. Consulte a documentação do Expo: https://docs.expo.dev/
3. React Native docs: https://reactnative.dev/docs/getting-started
