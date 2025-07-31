# Guia de Solução de Problemas - Aplicativo Corte de Matos

## Problemas Comuns e Soluções

### 1. Problemas ao iniciar o Expo

**Problema**: Erro ao executar `npx expo start`

**Solução**:
- Verifique se o Node.js está atualizado (v14 ou superior)
- Reinstale o Expo CLI: `npm uninstall -g expo-cli && npm install -g expo-cli`
- Limpe o cache: `npx expo start -c`

### 2. Erros de dependência

**Problema**: Erro "Cannot find module X" ou similar

**Solução**:
- Reinstale as dependências: `npm install`
- Verifique se todas as dependências estão no package.json
- Limpe o cache do npm: `npm cache clean --force`

### 3. Problemas de build do APK

**Problema**: Falha na geração do APK com EAS Build

**Solução**:
- Verifique o arquivo eas.json
- Certifique-se de que o login foi feito: `npx eas-cli login`
- Verifique os logs detalhados do build no dashboard do Expo
- Tente com o perfil de desenvolvimento: `npx eas build -p android --profile development`

### 4. Problemas de compatibilidade com Expo SDK

**Problema**: Incompatibilidade entre versões de pacotes

**Solução**:
- Execute `npx expo-doctor` para identificar problemas
- Atualize os pacotes para versões compatíveis
- Reinstale o node_modules: `rm -rf node_modules && npm install`

### 5. Erros ao importar planilhas

**Problema**: Falha ao ler dados de planilhas Excel

**Solução**:
- Verifique o formato da planilha (deve ser .xlsx)
- Confirme se as colunas necessárias existem na planilha
- Tente exportar a planilha em formato Excel 2016 ou anterior

### 6. Problemas de armazenamento local

**Problema**: Dados não sendo salvos ou carregados corretamente

**Solução**:
- Verifique a implementação do AsyncStorage
- Limpe o armazenamento do app no dispositivo
- Verifique se há erros no console durante operações de armazenamento

### 7. Erros ao gerar relatórios PDF

**Problema**: Falha na geração ou compartilhamento de PDFs

**Solução**:
- Verifique as permissões de compartilhamento no dispositivo
- Certifique-se de que o HTML gerado é válido
- Tente com um template PDF mais simples para isolar o problema

## Verificação do Ambiente de Desenvolvimento

Execute os seguintes comandos para verificar seu ambiente:

```bash
node -v                    # Deve ser v14 ou superior
npm -v                     # Deve ser compatível com seu Node.js
npx expo-cli --version     # Verificar versão do Expo CLI
```

## Comandos Úteis para Depuração

```bash
# Limpar cache do Expo
npx expo start -c

# Verificar problemas com o projeto
npx expo-doctor

# Verificar status do build no EAS
npx eas build:list

# Modo debug com mais informações
npx expo start --dev-client
```

## Contato para Suporte

Se os problemas persistirem, entre em contato com a equipe de desenvolvimento pelo email suporte@cortematos.com.br ou abra uma issue no repositório do projeto.
