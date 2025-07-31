# Guia para Build do App "Corte de Matos"

Este guia explica o processo de build do aplicativo para Android, mostrando como resolver os principais erros que podem ocorrer durante o processo.

## Pré-requisitos

1. Node.js instalado (versão 16.x ou superior)
2. npm (vem com o Node.js)
3. Expo CLI instalado globalmente (`npm install -g expo-cli`)
4. EAS CLI instalado globalmente (`npm install -g eas-cli`)
5. Conta no Expo (expo.dev)

## Erros Comuns e Soluções

Antes de iniciar o processo de build, execute o script `atualizar-dependencias.bat` para garantir que todas as dependências estejam corretamente instaladas.

### Problema: Falta do módulo expo-build-properties

**Erro:**
```
Error: build:configure command failed.
PluginError: Failed to resolve plugin for module "expo-build-properties"
```

**Solução:**
1. Execute o script `atualizar-dependencias.bat` que instalará o pacote necessário
2. Verifique se o package.json contém a dependência `expo-build-properties`

### Problema: Erro de certificado SSL

**Erro:**
```
request to https://api.expo.dev/v2/auth/loginAsync failed, reason: unable to get local issuer certificate
```

**Solução:**
1. Execute o script `build-apk-corrigido.bat` que contém configurações para ignorar erros de SSL
2. Ou configure manualmente: `npm config set strict-ssl false`

### Problema: Erro na execução do npm

**Erro:**
```
npm error could not determine executable to run
```

**Solução:**
1. Reinstale o Node.js
2. Limpe o cache do npm: `npm cache clean --force`
3. Execute o script `build-apk-corrigido.bat`

## Processo de Build

Para simplificar o processo, foram criados os seguintes scripts:

1. **atualizar-dependencias.bat**: Atualiza o package.json e instala todas as dependências necessárias
2. **build-apk-corrigido.bat**: Executa o processo de build com correções para erros comuns

### Passos para o Build:

1. Execute `atualizar-dependencias.bat`
2. Execute `build-apk-corrigido.bat`
3. Siga as instruções na tela para login e configuração
4. Após o envio do build para o servidor Expo, aguarde a conclusão
5. O link para download do APK será fornecido no terminal ou você pode verificar em seu painel no Expo.dev

## Build Local (Sem Expo)

Para builds sem depender do servidor EAS, é possível configurar o ambiente local com Android Studio, mas esse processo é mais complexo e requer instalação adicional de ferramentas.

## Verificação do Build

Após o download do APK, instale-o em um dispositivo Android para verificar:
- Funcionalidade de importação de planilhas
- Sistema de cores para status
- Alertas visuais para prazos
- Geração e compartilhamento de relatórios

## Documentação Adicional

Consulte os seguintes arquivos para mais informações:
- `SOLUCAO_ERROS_EAS.md`: Guia detalhado para solução de problemas
- `exemplo-planilha.md`: Exemplo de formato de planilha para importação
