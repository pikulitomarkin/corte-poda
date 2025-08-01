# Guia de Formatos de Data Suportados - App Corte de Matos

## Formatos de Data Aceitos na Importação

O app suporta automaticamente vários formatos de data na coluna `DataNecessidade`:

### 1. Formato Brasileiro Completo (DD/MM/AAAA)
```
15/02/2025
05/12/2024
31/01/2025
```
- Dia e mês podem ter 1 ou 2 dígitos
- Ano deve ter 4 dígitos
- Separador: barra (/)

### 2. Formato Brasileiro Abreviado (DD/MM/AA)
```
15/02/25
05/12/24
31/01/95
```
- Anos 00-30 → interpretados como 2000-2030
- Anos 31-99 → interpretados como 1931-1999
- Exemplo: 25 = 2025, 95 = 1995

### 3. Formato ISO (AAAA-MM-DD)
```
2025-02-15
2024-12-05
2025-01-31
```
- Formato internacional padrão
- Mantido sem conversão

### 4. Formato com Traços (DD-MM-AAAA)
```
15-02-2025
05-12-2024
31-01-2025
```
- Similar ao formato brasileiro, mas com traços

## Conversão Automática

O app converte automaticamente todos os formatos para o padrão interno (AAAA-MM-DD).

### Exemplos de Conversão:
- `15/02/2025` → `2025-02-15`
- `5/2/25` → `2025-02-05`
- `31/12/95` → `1995-12-31`
- `15-02-2025` → `2025-02-15`
- `2025-02-15` → `2025-02-15` (mantido)

## Comportamento em Caso de Erro

Se a data não for reconhecida em nenhum formato:
- O app usará a data atual
- Um aviso será exibido no console
- A importação continuará normalmente

## Arquivos de Exemplo

O projeto inclui arquivos de teste com diferentes formatos:

1. **exemplo-planilha-brasil.csv** - Datas DD/MM/AAAA com ponto e vírgula
2. **exemplo-planilha-brasil-virgula.csv** - Datas DD/MM/AAAA com vírgula
3. **exemplo-planilha-ano-abrev.csv** - Datas DD/MM/AA (anos abreviados)

## Separadores CSV Suportados

O app detecta automaticamente:
- **Vírgula (,)** - padrão internacional
- **Ponto e vírgula (;)** - comum no Excel brasileiro

## Dicas para Importação

1. **Prefira o formato DD/MM/AAAA** para máxima compatibilidade
2. **Use separadores consistentes** em todo o arquivo
3. **Verifique os logs** no console para acompanhar a conversão
4. **Teste com arquivos pequenos** antes de importar grandes volumes

## Troubleshooting

### Problema: Data aparece incorreta após importação
**Solução:** Verifique se o formato está correto. Use DD/MM/AAAA.

### Problema: Data vira data atual
**Solução:** O formato não foi reconhecido. Ajuste para um dos formatos suportados.

### Problema: Anos ficam incorretos (19xx em vez de 20xx)
**Solução:** Para anos abreviados, use valores 00-30 para 2000-2030.

---

*Última atualização: Janeiro 2025*
