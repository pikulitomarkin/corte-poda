# Resolução de Problemas com Certificados SSL no Build Local

Este guia aborda especificamente os problemas de certificado SSL que estão impedindo a criação do projeto Android e o download de dependências.

## Problema Identificado

Você está enfrentando o seguinte erro:
```
request to https://registry.npmjs.org/expo-template-bare-minimum/-/expo-template-bare-minimum-50.0.43.tgz failed, reason: unable to get local issuer certificate
```

Este é um problema comum em redes corporativas ou em computadores com configurações de segurança específicas.

## Solução 1: Desabilitar a Verificação SSL no npm

Execute os seguintes comandos em um terminal PowerShell:

```powershell
# Configurar npm para ignorar erros de SSL
npm config set strict-ssl false

# Definir variável de ambiente para ignorar verificação SSL temporariamente
$env:NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Solução 2: Usar o Script de Build com Bypass de SSL

Foi criado um script especial que contorna os problemas de certificado SSL:

```
build-local-com-bypass-ssl.bat
```

Este script:
1. Configura o npm para ignorar erros de SSL
2. Define variáveis de ambiente para contornar a verificação de certificados
3. Configura o Gradle para aceitar conexões inseguras
4. Usa métodos alternativos para criar a estrutura Android

## Solução 3: Configurar Certificados Manualmente

Se as soluções anteriores não funcionarem:

1. Baixe o certificado do site registry.npmjs.org:
   ```powershell
   openssl s_client -showcerts -servername registry.npmjs.org -connect registry.npmjs.org:443 > npmjs.pem
   ```

2. Importe o certificado para o Java:
   ```powershell
   keytool -import -alias npmjs -file npmjs.pem -keystore "%JAVA_HOME%\lib\security\cacerts"
   ```
   (A senha padrão é "changeit")

3. Importe o certificado para o Node.js:
   ```powershell
   npm config set cafile npmjs.pem
   ```

## Solução 4: Usar um Proxy ou VPN

Se você estiver em uma rede corporativa:

1. Configure um proxy no npm:
   ```powershell
   npm config set proxy http://proxy.exemplo.com:8080
   npm config set https-proxy http://proxy.exemplo.com:8080
   ```

2. Ou use uma VPN que não bloqueie conexões com servidores npm.

## Solução 5: Criar Projeto Android Manualmente

Se todas as soluções acima falharem:

1. Crie um novo projeto React Native em um computador com acesso à internet sem restrições
2. Copie a pasta `android` gerada para o seu projeto atual
3. Adapte os arquivos de configuração conforme necessário

Este procedimento está detalhado no arquivo `SOLUCAO_MANUAL_ANDROID.md` que foi criado pelo script `build-local-com-bypass-ssl.bat` caso ele falhe.

## Próximos Passos

1. Execute o script `build-local-com-bypass-ssl.bat`
2. Se não funcionar, siga as instruções em `SOLUCAO_MANUAL_ANDROID.md`
3. Após resolver os problemas de SSL, você poderá prosseguir com o build normal
