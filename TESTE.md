# 🧪 Como Testar o App - Guia Rápido

## 📱 Teste Básico do Aplicativo

### 1. **Preparar Ambiente**
```powershell
# Instalar Node.js (se não tiver)
winget install OpenJS.NodeJS

# Executar setup automático
./setup.bat

# OU instalar manualmente:
npm install
npm install -g @expo/cli
```

### 2. **Iniciar o App**
```powershell
npm start
# ou usar a tarefa do VS Code: "Start Expo Development Server"
```

### 3. **Testar no Celular**
- Instale o app **"Expo Go"** no Android
- Escaneie o QR code que aparece no terminal
- O app será carregado no celular

### 4. **Testar Funcionalidades**

#### 📊 **Teste 1: Importação de Planilha**
1. Use o arquivo `exemplo-dados.csv` (converta para .xlsx no Excel)
2. Ou crie uma planilha com as colunas:
   ```
   Descricao | Localizacao | Area | DataNecessidade
   ```
3. Toque "Importar Planilha" no app
4. Selecione o arquivo
5. ✅ Deve aparecer a lista de vãos

#### 🎨 **Teste 2: Sistema de Cores**
1. Após importar: todos devem estar **cinza** (pendente)
2. Toque "Iniciar" em um vão: deve ficar **amarelo**
3. Toque "Finalizar": deve ficar **verde**
4. ✅ Cores funcionando corretamente

#### ⏰ **Teste 3: Alertas de Prazo**
1. Use datas próximas (ex: amanhã) na planilha
2. Deve aparecer **🕐 URGENTE** para vãos nos próximos 7 dias
3. Use datas passadas (ex: ontem)
4. Deve aparecer **⚠️ ATRASADO** para vãos vencidos
5. ✅ Sistema de alertas funcionando

#### 📄 **Teste 4: Relatório PDF**
1. Toque "Gerar Relatório"
2. Deve abrir opções de compartilhamento
3. Selecione WhatsApp ou outro app
4. ✅ PDF gerado e compartilhado

#### 📊 **Teste 5: Progresso**
- Barra de progresso deve atualizar conforme você finaliza vãos
- Ex: 2/8 concluídos = 25%

## 🐛 **Problemas Comuns e Soluções**

### ❌ App não carrega no celular
- **Solução**: Verifique se celular e PC estão na mesma Wi-Fi
- Desative VPN se estiver usando

### ❌ Erro ao importar planilha
- **Solução**: Certifique-se que o arquivo é .xlsx (não .xls)
- Verifique se tem a coluna "Descricao"

### ❌ PDF não gera
- **Solução**: Teste em dispositivo real (não emulador)
- Verifique permissões de armazenamento

### ❌ Node.js não encontrado
- **Solução**: Instale Node.js e reinicie o terminal

## 📝 **Dados de Teste Sugeridos**

### Para testar alertas, use estas datas:
```
Vão Urgente: ${new Date(Date.now() + 2*24*60*60*1000).toLocaleDateString('pt-BR')} (daqui 2 dias)
Vão Normal: ${new Date(Date.now() + 15*24*60*60*1000).toLocaleDateString('pt-BR')} (daqui 15 dias)
Vão Atrasado: ${new Date(Date.now() - 2*24*60*60*1000).toLocaleDateString('pt-BR')} (2 dias atrás)
```

## ✅ **Checklist de Teste Completo**

- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] App inicia sem erros (`npm start`)
- [ ] Conecta no celular via Expo Go
- [ ] Importa planilha .xlsx
- [ ] Mostra lista de vãos
- [ ] Muda status: pendente → iniciado → concluído
- [ ] Cores corretas: cinza → amarelo → verde
- [ ] Detecta vãos urgentes (🕐)
- [ ] Detecta vãos atrasados (⚠️)
- [ ] Gera relatório PDF
- [ ] Compartilha via WhatsApp
- [ ] Barra de progresso atualiza

## 🎯 **Teste de Produção**

Para testar como usuário final:
```powershell
# Gerar APK de produção
expo build:android
```

---

**✨ Se todos os testes passaram, seu app está pronto para uso!**
