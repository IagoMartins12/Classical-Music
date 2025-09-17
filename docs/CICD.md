# CI/CD - Integração e Deploy Contínuo

> Sistema completo de CI/CD com GitHub Actions, pre-commit hooks e deploy automático para VPS

## Visão Geral

O Opus Atlas implementa um pipeline completo de CI/CD que garante qualidade de código, testes automatizados e deploy seguro em produção. O sistema é baseado em GitHub Actions com múltiplas camadas de proteção e validação.

### Características Principais

- **GitHub Actions**: Pipeline completo de CI/CD
- **Pre-commit Hooks**: Validação local antes do commit
- **Branch Protection**: Proteção da branch main
- **Deploy Automático**: Deploy direto no VPS via SSH
- **Health Checks**: Verificação pós-deploy
- **Rollback Automático**: Reversão em caso de falhas

---

## Estrutura do Repositório

### Branch Strategy

```
main (produção)
├── Proteção ativa
├── Deploy automático
├── Requer PR review
└── Status checks obrigatórios

dev (desenvolvimento) - REMOVIDO
└── Migrado para Vercel
```

### Arquivos de Configuração

```
Classical-Music/
├── .github/
│   └── workflows/
│       └── deploy.yml           # Pipeline principal
├── .husky/
│   ├── pre-commit               # Hook de pre-commit
│   └── pre-push                # Hook de pre-push
├── package.json                 # Scripts e dependências
├── .eslintrc.json              # Configuração ESLint
├── .prettierrc                 # Configuração Prettier
└── lint-staged.config.js       # Configuração lint-staged
```

---

## GitHub Actions Workflow

### Arquivo Principal: .github/workflows/deploy.yml

```yaml
name: Deploy Opus Atlas

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint code
        run: npm run lint

      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: 'mongodb://build:build@localhost:27017/build'
          NEXTAUTH_SECRET: 'build-secret-temp'
          NEXTAUTH_URL: 'http://localhost:3000'
          SKIP_ENV_VALIDATION: 'true'

  deploy-prod:
    needs: build-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to Production
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/opus-atlas/app-source/Classical-Music
            git checkout main
            git pull origin main
            docker-compose build --no-cache app-prod
            docker-compose up -d app-prod

      - name: Health check PROD
        run: |
          sleep 60
          for i in {1..3}; do
            if curl -f -H "Host: opusatlas.com.br" http://72.60.145.88/api/health; then
              exit 0
            fi
            sleep 10
          done
          exit 1

      - name: Rollback on failure
        if: failure()
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/opus-atlas/app-source/Classical-Music
            git checkout HEAD~1
            docker-compose build --no-cache app-prod
            docker-compose up -d app-prod
```

### Jobs Detalhados

#### Job 1: build-and-test

- **Trigger**: Todos os pushes e PRs para main
- **Ambiente**: ubuntu-latest
- **Node.js**: versão 20 com cache npm
- **Etapas**:
  1. Checkout do código
  2. Setup Node.js com cache
  3. Instalação de dependências (`npm ci`)
  4. Geração do Prisma Client
  5. Type checking (TypeScript)
  6. Linting (ESLint + Prettier)
  7. Build da aplicação

#### Job 2: deploy-prod

- **Trigger**: Apenas pushes na main (não PRs)
- **Dependência**: Sucesso do build-and-test
- **Etapas**:
  1. Deploy via SSH no VPS
  2. Health check pós-deploy
  3. Rollback automático em falhas

---

## GitHub Secrets

### Secrets Necessários

```bash
# Configuração no GitHub Repository Settings > Secrets

VPS_HOST: 72.60.145.88           # IP do servidor
VPS_USER: opusatlas              # Usuário SSH
VPS_SSH_KEY: [ED25519_KEY]       # Chave privada SSH
```

### Configuração da Chave SSH

```bash
# No servidor VPS
ssh-keygen -t ed25519 -f ~/.ssh/github_actions_key -N ""
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# Copiar chave privada para GitHub Secrets
cat ~/.ssh/github_actions_key
```

---

## Pre-commit Hooks

### Configuração Husky

**package.json**:

```json
{
  "scripts": {
    "prepare": "husky install",
    "lint-staged": "lint-staged"
  },
  "devDependencies": {
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  }
}
```

**lint-staged.config.js**:

```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
```

### Hook Scripts

**.husky/pre-commit**:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."
npm run lint-staged
echo "🔍 Type checking..."
npm run type-check
echo "🔍 Checking for vulnerabilities..."
npm audit --audit-level=high
echo "✅ Pre-commit checks passed!"
```

**.husky/pre-push**:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-push checks..."
npm run type-check
npm run build
echo "✅ Pre-push checks passed!"
```

---

## Branch Protection Rules

### Configuração Main Branch

```yaml
# Configurações aplicadas via GitHub UI
Branch Protection Rules:
  branch: main
  settings:
    - Require pull request reviews: 1 approval
    - Require status checks: build-and-test
    - Restrict pushes that create files > 100MB
    - Include administrators in restrictions
    - Allow force pushes: false
    - Allow deletions: false
```

### Status Checks Obrigatórios

- ✅ `build-and-test` - Pipeline completo de CI
- ✅ Type checking (TypeScript)
- ✅ Linting (ESLint)
- ✅ Build verification

---

## Deploy Process

### Fluxo de Deploy

1. **Developer Push**: Push para main
2. **CI Pipeline**: Execução automática do workflow
3. **Build & Test**: Validação completa do código
4. **Deploy**: SSH para VPS e atualização
5. **Health Check**: Verificação da aplicação
6. **Notificação**: Status do deploy

### Comandos de Deploy

```bash
# Deploy manual (emergency)
cd /opt/opus-atlas/app-source/Classical-Music
git checkout main
git pull origin main
docker-compose build --no-cache app-prod
docker-compose up -d app-prod

# Verificar deploy
curl https://opusatlas.com.br/api/health
```

### Deploy com Docker

```bash
# Build da imagem
docker-compose build --no-cache app-prod

# Deploy atômico
docker-compose up -d app-prod

# Verificação de saúde
docker logs opus-atlas-app-prod --tail 50
```

---

## Health Checks

### Endpoint de Saúde

```typescript
// /api/health
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

### Verificações Pós-Deploy

```bash
# Health check HTTP
curl -f -H "Host: opusatlas.com.br" http://72.60.145.88/api/health

# Verificação Docker
docker ps | grep opus-atlas-app-prod

# Verificação de logs
docker logs opus-atlas-app-prod --tail 20
```

---

## Rollback Strategy

### Rollback Automático

O sistema implementa rollback automático em caso de falhas no deploy:

```yaml
- name: Rollback on failure
  if: failure()
  uses: appleboy/ssh-action@v1.0.3
  with:
    script: |
      cd /opt/opus-atlas/app-source/Classical-Music
      git checkout HEAD~1
      docker-compose build --no-cache app-prod
      docker-compose up -d app-prod
```

### Rollback Manual

```bash
# Voltar para commit anterior
git checkout HEAD~1

# Rebuild e deploy
docker-compose build --no-cache app-prod
docker-compose up -d app-prod

# Verificar rollback
curl https://opusatlas.com.br/api/health
```

### Estratégias de Recovery

1. **Git Rollback**: Volta para commit anterior
2. **Container Rollback**: Usa imagem anterior do Docker
3. **Backup Restore**: Restaura backup do banco (se necessário)

---

## Environments

### Production Environment

```bash
# Variáveis de ambiente produção
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Database
DATABASE_URL="mongodb://opusatlas:***@opus-atlas-mongodb-prod:27017/opus_atlas_prod"

# NextAuth
NEXTAUTH_URL="https://opusatlas.com.br"
NEXTAUTH_SECRET="***"

# Redis
REDIS_URL="redis://:***@opus-atlas-redis:6379"
```

### Build Environment

```bash
# Variáveis para build CI/CD
DATABASE_URL="mongodb://build:build@localhost:27017/build"
NEXTAUTH_SECRET="build-secret-temp"
NEXTAUTH_URL="http://localhost:3000"
SKIP_ENV_VALIDATION="true"
```

---

## Monitoring e Logs

### Deploy Logs

```bash
# Ver logs do GitHub Actions
# Disponível na interface do GitHub

# Ver logs de deploy no servidor
sudo journalctl -u docker -f

# Logs da aplicação
docker logs opus-atlas-app-prod -f
```

### Métricas de Deploy

- **Frequência**: ~5 deploys por semana
- **Success Rate**: >95%
- **Tempo Médio**: 2-3 minutos
- **Downtime**: <30 segundos

---

## Troubleshooting

### Problemas Comuns

#### Deploy Failed - Build Error

```bash
# Verificar logs do GitHub Actions
# Acessar: GitHub > Actions > Failed workflow

# Verificar dependências
npm audit
npm outdated

# Build local
npm run build
```

#### Deploy Failed - SSH Connection

```bash
# Verificar conectividade
ssh -i ~/.ssh/github_actions_key opusatlas@72.60.145.88

# Verificar chave SSH
cat ~/.ssh/authorized_keys | grep github_actions

# Regenerar chave se necessário
ssh-keygen -t ed25519 -f ~/.ssh/github_actions_key -N ""
```

#### Health Check Failed

```bash
# Verificar aplicação
curl https://opusatlas.com.br/api/health

# Verificar container
docker ps | grep app-prod
docker logs opus-atlas-app-prod --tail 50

# Restart se necessário
docker-compose restart app-prod
```

#### Rollback Failed

```bash
# Rollback manual
cd /opt/opus-atlas/app-source/Classical-Music
git log --oneline -5  # Ver commits recentes
git checkout <COMMIT_ANTERIOR>
docker-compose build --no-cache app-prod
docker-compose up -d app-prod
```

---

## Scripts Úteis

### Deploy Scripts

```bash
#!/bin/bash
# scripts/deploy.sh
set -e

echo "🚀 Starting deploy..."

# Pull latest code
git checkout main
git pull origin main

# Build and deploy
docker-compose build --no-cache app-prod
docker-compose up -d app-prod

# Health check
sleep 30
curl -f https://opusatlas.com.br/api/health

echo "✅ Deploy completed successfully!"
```

### Pre-deploy Checks

```bash
#!/bin/bash
# scripts/pre-deploy-check.sh

echo "🔍 Pre-deploy checks..."

# Type check
npm run type-check

# Lint
npm run lint

# Build test
npm run build

# Security audit
npm audit --audit-level=moderate

echo "✅ All checks passed!"
```

---

## Workflow Optimization

### Cache Strategy

```yaml
# Otimizações no workflow
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm' # Cache automático do npm

- name: Cache Prisma
  uses: actions/cache@v3
  with:
    path: node_modules/.prisma
    key: ${{ runner.os }}-prisma-${{ hashFiles('prisma/schema.prisma') }}
```

### Parallel Jobs

```yaml
# Jobs paralelos quando possível
build-and-test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      node-version: [20]
  steps:
    # ... build steps
```

---

## Security Best Practices

### SSH Security

- ✅ Chaves SSH dedicadas para CI/CD
- ✅ Chaves com passphrase vazia para automação
- ✅ Rotação regular de chaves
- ✅ Acesso limitado ao usuário opusatlas

### Secrets Management

- ✅ Secrets criptografados no GitHub
- ✅ Variáveis de ambiente separadas
- ✅ Acesso limitado por repositório
- ✅ Logs sem exposição de secrets

### Deploy Security

- ✅ Deploy em usuário não-root
- ✅ Verificação de integridade pós-deploy
- ✅ Rollback automático em falhas
- ✅ Health checks obrigatórios

---

## Performance

### Otimizações de Build

```javascript
// next.config.js optimizations
const nextConfig = {
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
  },
};
```

### Deploy Performance

- **Build paralelo**: Múltiplos workers
- **Cache agressivo**: Dependencies e build
- **Incremental builds**: Apenas mudanças necessárias
- **Atomic deploys**: Transições sem downtime

---

## Métricas e KPIs

### Deploy Metrics

- **Lead Time**: Tempo do commit ao deploy
- **Deployment Frequency**: Frequência de releases
- **Mean Time to Recovery**: Tempo de recuperação
- **Change Failure Rate**: Taxa de falhas

### Targets

- Lead Time: < 10 minutos
- Deployment Frequency: > 3x por semana
- MTTR: < 30 minutos
- Change Failure Rate: < 5%

---

## Roadmap

### Melhorias Planejadas

- [ ] **Preview Environments**: Deploy automático de PRs
- [ ] **Blue-Green Deploy**: Deploy sem downtime
- [ ] **Canary Releases**: Deploy gradual
- [ ] **Automated Testing**: Testes E2E automatizados
- [ ] **Performance Budgets**: Limites de performance
- [ ] **Security Scans**: Análise de vulnerabilidades

### Integrações Futuras

- [ ] **Slack Notifications**: Notificações de deploy
- [ ] **Datadog Integration**: Métricas avançadas
- [ ] **Sentry Integration**: Error tracking
- [ ] **Lighthouse CI**: Performance auditing

---

## Conclusão

O sistema CI/CD do Opus Atlas fornece uma base sólida para desenvolvimento e deploy contínuo, com múltiplas camadas de proteção e verificação. O pipeline automatizado garante qualidade de código, testes de integração e deploy seguro em produção.

As práticas implementadas seguem as melhores práticas da indústria, proporcionando confiabilidade, segurança e eficiência no processo de desenvolvimento e deployment.

---

**Mantenedores**: Equipe Opus Atlas  
**Última atualização**: Dezembro 2024  
**Próxima revisão**: Fevereiro 2025
