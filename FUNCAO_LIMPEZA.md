# Função de Limpeza de Dados

## Funcionalidade Implementada

O sistema agora possui uma **função de limpeza completa de dados** disponível apenas para administradores:

### Características

- **Acesso Restrito**: Apenas usuários "admin" podem usar esta função
- **Botão no Menu Principal**: "🧹 Limpar Dados" na área de ações do admin
- **Confirmação de Segurança**: Dialog de confirmação antes da exclusão
- **Limpeza Completa**: Remove TODOS os vãos importados/cadastrados

### Como Usar

1. **Faça login como admin** (admin/eletro1234)
2. **Procure o botão "🧹 Limpar Dados"** na área de ações (junto com "Adicionar Vão" e "Importar CSV")
3. **Toque no botão** para iniciar o processo
4. **Confirme a ação** no dialog que aparece
5. **Todos os dados serão removidos** instantaneamente

### Dialog de Confirmação

```
Limpar Todos os Dados

Tem certeza que deseja remover todos os vãos?

Esta ação não pode ser desfeita.

[Cancelar] [Limpar]
```

## Implementação Técnica

### Função Principal
```javascript
const limparDados = () => {
  if (username !== 'admin') {
    Alert.alert('Acesso Negado', 'Apenas administradores podem limpar os dados.');
    return;
  }

  Alert.alert(
    'Limpar Todos os Dados',
    'Tem certeza que deseja remover todos os vãos?\n\nEsta ação não pode ser desfeita.',
    [
      {
        text: 'Cancelar',
        style: 'cancel'
      },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: async () => {
          setMatos([]);
          await saveData([]);
          Alert.alert('Sucesso', 'Todos os dados foram removidos.');
        }
      }
    ]
  );
};
```

### Botão na Interface
```javascript
<TouchableOpacity 
  style={[styles.addButton, styles.clearButton]} 
  onPress={limparDados}
>
  <Text style={styles.addButtonText}>🧹 Limpar Dados</Text>
</TouchableOpacity>
```

## Casos de Uso

### 1. Nova Importação
- Limpar dados antigos antes de importar nova planilha
- Evitar mistura de dados de diferentes projetos
- Começar "do zero" com dados limpos

### 2. Teste do Sistema  
- Limpar dados de teste
- Resetar para demonstrações
- Volta ao estado inicial

### 3. Manutenção
- Remover dados incorretos ou corrompidos
- Resolver problemas de dados inconsistentes
- Limpeza geral do sistema

## Segurança

- ✅ **Acesso Restrito**: Apenas admin pode usar
- ✅ **Confirmação Obrigatória**: Dialog de confirmação
- ✅ **Feedback Visual**: Mensagem de sucesso
- ✅ **Ação Irreversível**: Aviso claro sobre não poder desfazer
- ✅ **Limpeza Completa**: Remove tanto da memória quanto do storage

## Fluxo Recomendado

1. **Backup Manual** (se necessário): Gerar relatório antes de limpar
2. **Usar Função de Limpeza**: Botão "🧹 Limpar Dados"
3. **Confirmar Ação**: Aceitar o dialog de confirmação
4. **Importar Novos Dados**: Usar "📄 Importar CSV" para carregar nova planilha
5. **Validar Importação**: Verificar se os dados foram carregados corretamente

Esta funcionalidade é essencial para manutenção e controle administrativo do sistema.
