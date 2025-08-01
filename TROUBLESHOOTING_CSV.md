# 🔧 Troubleshooting - Importação de CSV

## ❌ Erro Corrigido: "File is not readable"

### **Problema Original:**
```
File '/var/mobile/Containers/.../file.csv' is not readable
```

### **Soluções Implementadas:**

#### 1. **Verificação de Arquivo Mais Robusta**
- ✅ Verifica se arquivo existe antes de ler
- ✅ Log detalhado do processo
- ✅ Suporte a múltiplos tipos de arquivo

#### 2. **Estratégia de Leitura Dupla**
- 🥇 **Primeira tentativa**: UTF-8 (padrão)
- 🥈 **Segunda tentativa**: Base64 + conversão
- 📋 Logs detalhados para debugging

#### 3. **Parser CSV Melhorado**
- ✅ Suporte a quebras de linha Windows/Mac (`\r?\n`)
- ✅ Remoção de aspas simples e duplas
- ✅ Mapeamento dinâmico de colunas (case insensitive)
- ✅ Pula linhas vazias automaticamente

#### 4. **Validações Aprimoradas**
- ✅ Verifica extensão do arquivo (`.csv`)
- ✅ Verifica colunas obrigatórias
- ✅ Mostra colunas encontradas em caso de erro
- ✅ Logs detalhados do processo

## 📋 Como Usar Agora

### **1. Formato do Arquivo CSV**
```csv
Descricao,Localizacao,Area,DataNecessidade
Corte Vão Principal,Setor Norte,150m²,2025-02-15
Corte Vão Secundário,Setor Sul,80m²,2025-02-20
```

### **2. Passos para Importar**
1. **Login como admin** (`admin` / `eletro1234`)
2. **Toque em "📄 Importar CSV"**
3. **Selecione o arquivo** do seu dispositivo
4. **Aguarde o processamento** (com logs no console)
5. **Escolha** "Adicionar" ou "Substituir"

### **3. Tipos de Arquivo Suportados**
- ✅ `.csv` (recomendado)
- ✅ Arquivos de texto com vírgulas
- ✅ Codificação UTF-8 ou Base64

## 🐛 Debug e Logs

### **Console Logs Adicionados:**
```javascript
LOG DocumentPicker result: {...}
LOG Selected file: {...}
LOG File info: {...}
LOG File content length: 245
LOG First 100 chars: Descricao,Localizacao...
LOG Number of lines: 7
LOG Header line: Descricao,Localizacao,Area,DataNecessidade
LOG Headers: ["Descricao", "Localizacao", "Area", "DataNecessidade"]
LOG Processado vão 1: {...}
LOG Total vãos processados: 6
```

### **Como Verificar Erros:**
1. **Abra o console** do Expo
2. **Importe um arquivo** 
3. **Veja os logs detalhados**
4. **Identifique onde parou**

## 🆘 Se Ainda Der Erro

### **Opção 1: Arquivo Simples**
Crie um CSV com o mínimo de dados:
```csv
Descricao,Localizacao,Area,DataNecessidade
Teste,Local Teste,100m²,2025-02-15
```

### **Opção 2: Verificar Formato**
- ✅ Use apenas vírgulas como separador
- ✅ Não use aspas desnecessárias
- ✅ Evite caracteres especiais
- ✅ Use datas no formato AAAA-MM-DD

### **Opção 3: Criar pelo App**
- Use "➕ Adicionar Vão" manualmente
- Mais seguro para poucos registros

## 📱 Testado e Funcionando

- ✅ **iOS**: Expo Go SDK 53
- ✅ **Android**: Expo Go SDK 53  
- ✅ **Hermes Engine**: Compatível
- ✅ **Arquivos locais**: iCloud, Google Drive, etc.
- ✅ **Múltiplos formatos**: UTF-8, Base64

A importação agora é **muito mais robusta** e deve funcionar com a maioria dos arquivos CSV! 🚀
