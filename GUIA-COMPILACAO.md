# Guia de Compilação e Publicação - Aplicativo Corte de Matos

Este guia fornece instruções passo a passo para compilar e publicar o aplicativo Corte de Matos em diferentes plataformas.

## Preparação Inicial

1. **Verifique as dependências**
   ```bash
   npm install
   ```

2. **Atualize o arquivo app.json**
   - Verifique se as informações estão corretas
   - Atualize a versão do aplicativo
   - Configure ícones e splash screen

## Compilação para Android

### Método 1: Usando EAS Build (Recomendado)

1. **Configure o EAS**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure o arquivo eas.json**
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```

3. **Inicie o build**
   ```bash
   eas build -p android --profile preview
   ```

4. **Acompanhe o progresso**
   O comando abrirá automaticamente uma página no navegador onde você pode acompanhar o progresso do build.

### Método 2: Build Local (Para Desenvolvimento)

1. **Configure as variáveis de ambiente**
   - Instale o Android Studio
   - Configure ANDROID_HOME e JAVA_HOME

2. **Prepare o projeto**
   ```bash
   npx expo prebuild -p android
   ```

3. **Compile o APK**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

4. **Localize o APK**
   O APK estará em `android/app/build/outputs/apk/debug/app-debug.apk`

## Publicação na Google Play

1. **Prepare o build de produção**
   ```bash
   eas build -p android --profile production
   ```

2. **Crie uma conta de desenvolvedor**
   - Acesse [Google Play Console](https://play.google.com/console/)
   - Pague a taxa de registro ($25 USD)

3. **Crie um novo aplicativo**
   - Preencha todas as informações necessárias
   - Configure a ficha da loja com screenshots e descrições

4. **Envie o APK/AAB**
   - Faça upload do arquivo AAB gerado pelo EAS Build
   - Preencha o questionário de conteúdo

5. **Publique o aplicativo**
   - Escolha entre lançamento de teste ou produção
   - Aguarde a revisão da Google (pode levar de algumas horas a alguns dias)

## Atualização do Aplicativo

1. **Atualize a versão**
   - Em `app.json`, incremente `version` e `android.versionCode`

2. **Compile uma nova versão**
   ```bash
   eas build -p android --profile production
   ```

3. **Envie a atualização**
   - Faça upload do novo AAB no Google Play Console
   - Crie uma nova versão e publique

## Solução de Problemas Comuns

### Erros de Compilação
- **Problema**: Falha no build com erros de dependência
  **Solução**: Execute `npm install` e verifique se todas as dependências estão instaladas corretamente

- **Problema**: Erro de versão do SDK do Android
  **Solução**: Verifique se o SDK do Android está instalado e configurado corretamente

### Rejeição da Google Play
- **Problema**: Aplicativo rejeitado por questões de metadata
  **Solução**: Verifique se todas as descrições, screenshots e políticas de privacidade estão corretas

- **Problema**: Falha em testes de qualidade
  **Solução**: Teste o aplicativo em diferentes dispositivos para garantir que funcione corretamente

## Recursos Adicionais

- [Documentação do Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Guia de Publicação na Google Play](https://docs.expo.dev/submit/android/)
- [Melhores Práticas para Publicação de Apps](https://developer.android.com/distribute/best-practices/launch)

---

Boa sorte com o lançamento do seu aplicativo! Para mais informações, consulte a documentação oficial do Expo e da Google Play.
