# 🔄 COMANDOS GIT - Corte de Matos App

## 📋 Comandos Básicos Git

### 1️⃣ Verificar Status
```bash
git status
```
- Mostra arquivos modificados, adicionados ou removidos
- Indica se você está à frente/atrás do repositório remoto

### 2️⃣ Adicionar Arquivos
```bash
# Adicionar arquivo específico
git add arquivo.js

# Adicionar todos os arquivos modificados
git add .

# Adicionar todos os arquivos de uma extensão
git add *.js
```

### 3️⃣ Fazer Commit
```bash
# Commit com mensagem
git commit -m "Descrição das mudanças"

# Commit adicionando e commitando ao mesmo tempo
git commit -am "Mensagem do commit"
```

### 4️⃣ Push (Enviar para GitHub)
```bash
# Push padrão (branch atual)
git push

# Push forçado (quando há conflitos)
git push --force

# Push primeira vez (definir upstream)
git push -u origin main
```

### 5️⃣ Pull (Baixar do GitHub)
```bash
# Pull padrão
git pull

# Pull forçado (sobrescrever local)
git pull --force
```

## 🚀 Sequência Completa para Push

### Cenário: Você fez mudanças e quer enviar pro GitHub

```bash
# 1. Verificar o que mudou
git status

# 2. Adicionar mudanças
git add .

# 3. Fazer commit
git commit -m "Atualização: configuração build nativo completa"

# 4. Enviar para GitHub
git push
```

## 📊 Status Atual do Seu Projeto

### ✅ Situação Detectada:
```
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
(use "git push" to publish your local commits)
nothing to commit, working tree clean
```

### 🎯 Ação Recomendada:
```bash
git push
```

Você já tem 1 commit local que precisa ser enviado para o GitHub.

## 🔧 Comandos Úteis

### Verificar Histórico
```bash
# Ver últimos commits
git log --oneline

# Ver mudanças específicas
git show
```

### Branches
```bash
# Ver branches
git branch

# Criar nova branch
git checkout -b nova-feature

# Trocar de branch
git checkout main
```

### Desfazer Mudanças
```bash
# Desfazer mudanças não commitadas
git checkout -- arquivo.js

# Desfazer último commit (mantém mudanças)
git reset HEAD~1

# Desfazer último commit (remove mudanças)
git reset --hard HEAD~1
```

## 📱 Comandos Específicos para o Projeto

### Para Build Nativo
```bash
# Adicionar novos arquivos de configuração
git add package.json app.json eas.json App-build-nativo.js

# Commit das configurações
git commit -m "feat: configuração completa para build nativo Android/iOS"

# Push para repositório
git push
```

### Para Documentação
```bash
# Adicionar documentação
git add *.md

# Commit da documentação
git commit -m "docs: guias completos de build e configuração"

# Push
git push
```

## ⚡ Comandos Rápidos

### Push Rápido (1 linha)
```bash
git add . && git commit -m "update" && git push
```

### Backup Completo
```bash
git add .
git commit -m "backup: projeto completo $(date)"
git push
```

### Sincronizar com GitHub
```bash
git pull && git add . && git commit -m "sync" && git push
```

## 🔍 Verificar Configuração Git

```bash
# Ver configuração atual
git config --list

# Configurar usuário (se necessário)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"

# Ver repositório remoto
git remote -v
```

## 🎯 Para Seu Projeto Agora

### Comando Imediato:
```bash
git push
```

### Se quiser adicionar mais mudanças antes:
```bash
# 1. Adicionar novos arquivos/mudanças
git add .

# 2. Commit com mensagem descritiva
git commit -m "feat: projeto corte de matos completo com build nativo"

# 3. Push final
git push
```

## 📞 Solução de Problemas

### ❌ "Git push rejected"
```bash
git pull --rebase
git push
```

### ❌ "Authentication failed"
- Verificar token do GitHub
- Configurar credenciais novamente

### ❌ "Repository not found"
```bash
git remote -v
git remote set-url origin https://github.com/usuario/repo.git
```

**Execute `git push` agora para enviar suas mudanças!** 🚀
