# Enviando o Projeto para o GitHub

Este documento explica como enviar o projeto Corte de Matos para o GitHub de forma organizada.

## Arquivos Incluídos

O arquivo `.gitignore` foi configurado para incluir apenas os arquivos essenciais para o funcionamento do aplicativo:

- 📁 **Código-fonte principal**: App.js, App.web.js, components/, services/
- 📁 **Configuração**: app.config.js, metro.config.js, babel.config.js, eas.json
- 📁 **Recursos**: assets/ (imagens e recursos visuais)
- 📁 **Documentação**: README.md, GUIA-DE-USO.md, RESUMO-PROJETO.md
- 📁 **Exemplos**: exemplo-planilha.csv
- 📁 **Scripts essenciais**: executar-app.bat, compilar-com-eas.bat
- 📁 **Configuração GitHub**: .github/ (inclui instruções para Copilot)

## Arquivos Excluídos

Os seguintes arquivos **NÃO** serão enviados para o GitHub:

- 📁 **Módulos e dependências**: node_modules/, node_modules_old/, deps/
- 📁 **Builds e temporários**: build/, dist/, .expo/, TempProject/
- 📁 **Configurações sensíveis**: *.keystore, credentials.json, *.env
- 📁 **Backups e arquivos de teste**: *-backup.*, *-temp.*, App-*.js (exceto os principais)
- 📁 **Scripts de depuração**: diversos scripts .bat de suporte
- 📁 **Documentação de suporte**: arquivos MD de troubleshooting e soluções

## Como Enviar para o GitHub

1. Certifique-se de que você tem o Git instalado:
   ```
   git --version
   ```

2. Navegue até a pasta do projeto:
   ```
   cd "d:\Users\0338138\Desktop\corte e pode\corte-poda"
   ```

3. Inicialize o repositório (se ainda não inicializado):
   ```
   git init
   ```

4. Adicione os arquivos ao staging:
   ```
   git add .
   ```

5. Verifique quais arquivos serão incluídos:
   ```
   git status
   ```

6. Faça o commit inicial:
   ```
   git commit -m "Versão inicial do Corte de Matos App"
   ```

7. Adicione o repositório remoto:
   ```
   git remote add origin https://github.com/SEU-USUARIO/corte-poda.git
   ```

8. Envie o código:
   ```
   git push -u origin main
   ```

## Verificação Pós-Envio

Após enviar para o GitHub, verifique se:

1. Todos os arquivos essenciais estão presentes
2. Nenhum arquivo sensível foi enviado (credenciais, keystores)
3. O README.md está bem formatado e contém instruções claras
4. Os links e imagens estão funcionando corretamente

## Dicas para Manutenção do Repositório

- Mantenha o código limpo e organizado
- Atualize o README.md com novas funcionalidades
- Documente bem as alterações em cada commit
- Utilize branches para novas funcionalidades
- Faça commits pequenos e frequentes com mensagens claras
