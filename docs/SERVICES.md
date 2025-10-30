# Configuração de APIs e Serviços Externos - Opus Atlas

Este guia cobre a configuração completa de todas as APIs e serviços externos necessários para o funcionamento do Opus Atlas.

## Visão Geral dos Serviços

### Serviços Obrigatórios

- ✅ **Google OAuth** - Login social
- ✅ **YouTube API** - Busca de performances
- ✅ **Spotify API** - Preview de músicas
- ✅ **Cloudinary** - Upload e otimização de imagens
- ✅ **Gmail SMTP** - Email transacional

# Opus Atlas - Plataforma Educacional de Música Clássica

> Uma plataforma educacional completa que combina catálogo de partituras, ferramentas de aprendizado, sistema professor-aluno e comunidade musical integrada.

## Visão Geral

**Opus Atlas** é uma plataforma moderna e integrada para música clássica, desenvolvida como alternativa avançada ao IMSLP. O projeto oferece um ecossistema completo com:

- 📚 **Catálogo Completo**: 19.177 compositores e 207.883 obras musicais
- 🎓 **Sistema Educacional**: Plataforma professor-aluno com aulas e tarefas
- 🏆 **Gamificação**: 75 tipos de conquistas e sistema de XP
- 🎵 **Ferramentas de Estudo**: "Quero Aprender" e "Já Aprendi" com milestone tracking
- 📝 **Sistema de Anotações**: Anotações públicas da comunidade
- 🎬 **Upload de Performances**: Vídeos de performance pessoais
- 📊 **Analytics Avançados**: Insights com IA e dashboards completos

### Métricas do Sistema

- **247 páginas** implementadas
- **124 rotas de API** funcionais
- **41 tabelas** no banco de dados
- **28 sistemas principais** integrados
- **47 mini-sistemas** de suporte

---

## Stack Tecnológico

### Frontend/Backend

- **Next.js**: 15.3.2 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.8.3
- **Tailwind CSS**: 4.x
- **Next-Auth**: 4.24.11 (Autenticação)

### Banco de Dados

- **MongoDB**: 7.0 (Replica Set rs0)
- **Prisma ORM**: 6.13.0
- **Redis**: 7.2 (Cache/Sessions)

### Infraestrutura

- **Docker**: 28.4.0 + Docker Compose v2.39.2
- **Nginx**: 1.25-alpine (Reverse Proxy)
- **Ubuntu**: 24.04.3 LTS
- **Let's Encrypt**: SSL/TLS automático

### Monitoramento

- **Grafana**: 10.2.2 (Dashboards)
- **Prometheus**: v2.48.0 (Métricas)
- **Uptime Kuma**: 1.23.15 (Disponibilidade)
- **Umami Analytics**: v2.10.0 (Usuários)

### CDN/Segurança

- **Cloudflare**: CDN Global + DDoS Protection
- **UFW Firewall** + **Fail2ban**
- **GitHub Actions**: CI/CD

---

## Pré-requisitos

### Desenvolvimento Local

- Node.js 20.x
- Docker & Docker Compose
- Git

### Produção (VPS)

- **Servidor**: Mínimo 4GB RAM, 2 vCPUs, 50GB storage
- **OS**: Ubuntu 24.04.3 LTS
- **Domínio**: Configurado no Cloudflare
- **Email**: Para SSL e notificações

---

## Instalação e Configuração

### 1. Clone do Repositório

```bash
git clone https://github.com/IagoMartins12/Classical-Music.git
cd Classical-Music
```

### 2. Instalação de Dependências

```bash
npm install
```

### 3. Configuração do Banco de Dados

**Desenvolvimento (Docker):**

```bash
# Subir MongoDB e Redis
docker-compose up -d mongodb-dev redis
```

**Produção (ver seção Deploy em Produção)**

### 4. Configuração das Variáveis de Ambiente

Crie os arquivos de environment baseados nos templates:

#### `.env.local` (Desenvolvimento)

```env
# Database
DATABASE_URL="mongodb://localhost:27017/opus_atlas_dev"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production"

# Redis
REDIS_URL="redis://localhost:6379"

# APIs Externas
OPENAI_API_KEY="sk-proj-..."
GROQ_API_KEY="gsk_..."
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
YOUTUBE_API_KEY="AIzaSy..."

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."

# Email SMTP (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Cloudinary (Upload de imagens)
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
CLOUDINARY_UPLOAD_PRESET="musical-encyclopedia"

# Configurações opcionais
NODE_ENV="development"
NEXT_TELEMETRY_DISABLED="1"
```

#### `.env.production` (Produção)

```env
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED="1"

# Database (Replica Set)
DATABASE_URL="mongodb://opusatlas:SenhaSuperSegura!@opus-atlas-mongodb-prod:27017/opus_atlas_prod?authSource=admin&replicaSet=rs0"

# NextAuth.js
NEXTAUTH_URL="https://opusatlas.com.br"
NEXTAUTH_SECRET="super-secret-production-key-change-this-in-prod-2024"

# Redis
REDIS_URL="redis://:SenhaSuperSeguraRedis!@opus-atlas-redis:6379"

# APIs (mesmas do desenvolvimento)
OPENAI_API_KEY="sk-proj-..."
GROQ_API_KEY="gsk_..."
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
YOUTUBE_API_KEY="AIzaSy..."
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."

# Email SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="opusatlas@gmail.com"
SMTP_PASS="your-app-password"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
CLOUDINARY_UPLOAD_PRESET="musical-encyclopedia"

# Backup
BACKUP_RETENTION_DAYS="30"
BACKUP_SCHEDULE_ENABLED="true"
BACKUP_SCHEDULE_CRON="0 2 * * *"
```

### 5. Setup do Prisma

```bash
# Gerar Prisma Client
npx prisma generate

# Aplicar migrações (desenvolvimento)
npx prisma db push
```

### 6. Executar a Aplicação

**Desenvolvimento:**

```bash
npm run dev
```

**Build para Produção:**

```bash
npm run build
npm start
```

A aplicação estará disponível em `http://localhost:3000`

---

## Deploy em Produção (VPS)

### 1. Preparação do Servidor

```bash
# Conectar ao servidor
ssh opusatlas@SEU_IP

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar dependências
sudo apt install -y nginx certbot ufw fail2ban htop curl wget git vim nano
```

### 2. Configuração de Segurança

```bash
# Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw limit 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Estrutura de Diretórios

```bash
# Criar estrutura
sudo mkdir -p /opt/opus-atlas
cd /opt/opus-atlas

# Clonar repositório
git clone https://github.com/IagoMartins12/Classical-Music.git app-source/Classical-Music
```

### 4. Configuração Docker

Criar `/opt/opus-atlas/docker-compose.yml`:

```yaml
services:
  # PRODUÇÃO
  mongodb-prod:
    image: mongo:7.0
    container_name: opus-atlas-mongodb-prod
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: opusatlas
      MONGO_INITDB_ROOT_PASSWORD: SenhaSuperSegura!
      MONGO_INITDB_DATABASE: opus_atlas_prod
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db
      - ./mongodb/mongod.conf:/etc/mongod.conf:ro
      - ./logs/mongodb:/var/log/mongodb
    command: ['mongod', '--config', '/etc/mongod.conf', '--replSet', 'rs0']
    networks:
      - opus-atlas-network

  redis:
    image: redis:7.2-alpine
    container_name: opus-atlas-redis
    restart: unless-stopped
    command: redis-server --requirepass SenhaSuperSeguraRedis! --appendonly yes
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - opus-atlas-network

  app-prod:
    build:
      context: ./app-source/Classical-Music
      dockerfile: Dockerfile
      target: runner
    container_name: opus-atlas-app-prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
      - HOSTNAME=0.0.0.0
      - PORT=3000
    env_file:
      - .env.production
    ports:
      - '3000:3000'
    depends_on:
      - mongodb-prod
      - redis
    networks:
      - opus-atlas-network
    volumes:
      - ./logs/app-prod:/app/logs
    deploy:
      resources:
        limits:
          memory: 1.5G
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # NGINX
  nginx:
    image: nginx:1.25-alpine
    container_name: opus-atlas-nginx
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./logs/nginx:/var/log/nginx
      - ./certbot-webroot:/var/www/certbot:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    networks:
      - opus-atlas-network

  # MONITORAMENTO
  prometheus:
    image: prom/prometheus:v2.48.0
    container_name: opus-atlas-prometheus
    restart: unless-stopped
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - '9090:9090'
    networks:
      - opus-atlas-network

  grafana:
    image: grafana/grafana:10.2.2
    container_name: opus-atlas-grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=SenhaMonitorMonitor
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana:ro
    ports:
      - '3003:3000'
    networks:
      - opus-atlas-network

  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    restart: unless-stopped
    ports:
      - '3002:3001'
    volumes:
      - uptime-kuma-data:/app/data
    networks:
      - opus-atlas-network

networks:
  opus-atlas-network:
    driver: bridge

volumes:
  mongodb_data:
  redis_data:
  prometheus_data:
  grafana_data:
  uptime-kuma-data:
```

### 5. Configuração MongoDB

Criar `/opt/opus-atlas/mongodb/mongod.conf`:

```yaml
storage:
  dbPath: /data/db
  journal:
    enabled: true

net:
  port: 27017
  bindIp: 0.0.0.0

security:
  authorization: enabled

replication:
  replSetName: rs0

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
```

### 6. Configuração Nginx

Criar `/opt/opus-atlas/nginx/nginx.conf` e `/opt/opus-atlas/nginx/conf.d/prod.conf` (ver arquivos completos na documentação VPS).

### 7. SSL com Let's Encrypt

```bash
# Obter certificados SSL
sudo docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --agree-tos \
  --email SEU_EMAIL@gmail.com \
  --domains SEU_DOMINIO.com,www.SEU_DOMINIO.com
```

### 8. Deploy da Aplicação

```bash
# Subir infraestrutura
cd /opt/opus-atlas
docker-compose up -d mongodb-prod redis

# Inicializar replica set MongoDB
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'opus-atlas-mongodb-prod:27017'}]})"

# Subir aplicação
docker-compose up -d app-prod nginx

# Subir monitoramento
docker-compose up -d prometheus grafana uptime-kuma
```

---

## Estrutura do Projeto

```
Classical-Music/
├── app/                    # Next.js App Router (247 páginas)
│   ├── (admin)/           # Admin dashboard
│   ├── (protected)/       # Páginas protegidas
│   ├── (public)/          # Páginas públicas
│   ├── api/               # API Routes (124 rotas)
│   ├── student/           # Sistema do aluno
│   ├── teacher/           # Sistema do professor
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base
│   ├── forms/            # Formulários
│   ├── modals/           # Modais
│   └── layout/           # Layout components
├── lib/                   # Utilitários e configurações
│   ├── auth.ts           # NextAuth config
│   ├── db.ts             # Prisma client
│   ├── redis.ts          # Redis client
│   └── utils.ts          # Funções utilitárias
├── prisma/               # Schema do banco (41 tabelas)
│   ├── schema.prisma     # Schema principal
│   └── migrations/       # Migrações
├── types/                # TypeScript definitions
├── public/               # Assets estáticos
├── scripts/              # Scripts de automação
├── Dockerfile           # Container da aplicação
└── docker-compose.yml   # Orquestração local
```

---

## Funcionalidades Principais

### Sistema Público

- **Homepage**: Compositor do dia, curiosidades, últimas adições
- **Catálogo**: 19.177 compositores e 207.883 obras
- **Partituras**: Scraping automático IMSLP + upload próprio
- **História**: Períodos musicais e linha do tempo
- **Instrumentos**: 79 instrumentos com história detalhada

### Sistema de Usuários

- **Onboarding**: 6 etapas de configuração
- **Favoritos**: Compositores, obras e partituras específicas
- **Quero Aprender**: Sistema com milestone tracking
- **Já Aprendi**: Upload de vídeo de performance
- **Anotações**: Sistema público de anotações

### Sistema Professor-Aluno

- **Dashboard Professor**: Gestão completa de alunos
- **Dashboard Aluno**: Progresso e aulas
- **Aulas**: Agendamento com recorrência
- **Tarefas**: Sistema completo de assignments
- **Calendário**: Visualização integrada
- **Relatórios**: Analytics de progresso

### Sistema de Gamificação

- **75 Tipos de Badges**: Categorizados por atividade
- **Sistema de XP**: Pontuação automática
- **Conquistas**: Desbloqueio automático
- **Streaks**: Sequências de atividade

### Sistema Admin

- **Dashboard**: Métricas em tempo real
- **Moderação**: Sistema de reports
- **Newsletter**: Campanhas automáticas
- **Analytics**: Insights com IA
- **Backup**: Sistema automático

---

## APIs e Integrações

### APIs Internas (124 rotas)

- **Autenticação**: 7 rotas
- **Usuários**: 15 rotas
- **Conteúdo Musical**: 35 rotas
- **Sistema Educacional**: 20 rotas
- **Admin**: 35 rotas
- **Outras**: 12 rotas

### Integrações Externas

- **IMSLP**: Scraping de partituras e dados
- **YouTube API**: Busca de performances
- **Spotify API**: Preview de músicas
- **Google OAuth**: Autenticação social
- **SendGrid**: Email transacional
- **Cloudinary**: Upload de imagens
- **OpenAI/Groq**: IA para biografias

---

## Configuração de Serviços Externos

### 1. Google OAuth

```bash
# Google Cloud Console
1. Criar projeto
2. Ativar Google+ API
3. Criar credenciais OAuth 2.0
4. Adicionar domínios autorizados
5. Configurar .env com CLIENT_ID e CLIENT_SECRET
```

### 2. Spotify API

```bash
# Spotify Developer Dashboard
1. Criar aplicação
2. Obter Client ID e Client Secret
3. Configurar redirect URIs
```

### 3. YouTube API

```bash
# Google Cloud Console
1. Ativar YouTube Data API v3
2. Criar API Key
3. Restringir por domínio/IP
```

### 4. Cloudinary

```bash
# Cloudinary Dashboard
1. Criar conta
2. Obter Cloud Name, API Key, API Secret
3. Criar upload preset
```

### 5. SendGrid

```bash
# SendGrid Dashboard
1. Criar conta
2. Obter API Key
3. Configurar sender identity
4. Criar templates (opcional)
```

---

## Monitoramento e Analytics

### URLs de Acesso

- **Aplicação**: https://opusatlas.com.br
- **Monitoramento**: https://monitor.opusatlas.com.br
- **Grafana**: :3003 (admin/SenhaMonitorMonitor)
- **Prometheus**: :9090
- **Uptime Kuma**: :3002

### Dashboards Disponíveis

- **Sistema Completo**: 14 painéis integrados
- **Node Exporter**: Métricas detalhadas do servidor
- **Container Overview**: Monitoramento Docker
- **MongoDB Metrics**: Métricas do banco

### Alertas Configurados

- **Uptime**: Disponibilidade da aplicação
- **Resources**: CPU, memória, disco
- **SSL**: Expiração de certificados
- **Containers**: Status dos serviços

---

## Scripts de Manutenção

### Backup Automático

```bash
# /opt/opus-atlas/scripts/mongodb-backup.sh
# Executa diariamente às 2:00 AM
0 2 * * * /opt/opus-atlas/scripts/mongodb-backup.sh
```

### Limpeza Docker

```bash
# /opt/opus-atlas/scripts/docker-cleanup.sh
# Executa semanalmente aos domingos
0 3 * * 0 /opt/opus-atlas/scripts/docker-cleanup.sh
```

### Renovação SSL

```bash
# /opt/opus-atlas/scripts/ssl-renew.sh
# Verifica mensalmente
0 1 1 * * /opt/opus-atlas/scripts/ssl-renew.sh
```

---

## Comandos Úteis

### Desenvolvimento

```bash
# Iniciar desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npm run type-check

# Prisma
npx prisma studio
npx prisma db push
npx prisma generate
```

### Produção

```bash
# Deploy manual
cd /opt/opus-atlas/app-source/Classical-Music
git pull origin main
docker-compose build --no-cache app-prod
docker-compose up -d app-prod

# Status
docker-compose ps
docker-compose logs -f app-prod

# Restart services
docker-compose restart app-prod
docker-compose restart nginx

# Backup manual
docker exec opus-atlas-mongodb-prod mongodump \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --db opus_atlas_prod \
  --out /data/backup-$(date +%Y%m%d)
```

### MongoDB

```bash
# Conectar
docker exec -it opus-atlas-mongodb-prod mongosh \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin

# Replica set status
rs.status()

# Collections count
use opus_atlas_prod
db.Composer.countDocuments()
db.Work.countDocuments()
db.User.countDocuments()
```

### Redis

```bash
# Conectar
docker exec -it opus-atlas-redis redis-cli -a SenhaSuperSeguraRedis!

# Info
INFO memory
INFO stats
KEYS *
```

---

## CI/CD com GitHub Actions

### Configuração

```yaml
# .github/workflows/deploy.yml
name: Deploy Opus Atlas
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Production
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/opus-atlas/app-source/Classical-Music
            git pull origin main
            docker-compose build --no-cache app-prod
            docker-compose up -d app-prod
```

### GitHub Secrets

- `VPS_HOST`: IP do servidor
- `VPS_USER`: opusatlas
- `VPS_SSH_KEY`: Chave SSH privada

---

## Troubleshooting

### Problemas Comuns

#### App não inicia

```bash
# Verificar logs
docker logs opus-atlas-app-prod --tail 50

# Verificar variáveis de ambiente
docker exec opus-atlas-app-prod env | grep DATABASE_URL

# Restart
docker-compose restart app-prod
```

#### MongoDB connection issues

```bash
# Verificar replica set
docker exec opus-atlas-mongodb-prod mongosh \
  --eval "rs.status()"

# Reinicializar (se necessário)
docker exec opus-atlas-mongodb-prod mongosh \
  --eval "rs.reconfig(rs.conf(), {force: true})"
```

#### SSL issues

```bash
# Verificar certificado
openssl x509 -in /etc/letsencrypt/live/SEU_DOMINIO/fullchain.pem -noout -dates

# Renovar
docker-compose stop nginx
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot renew
docker-compose start nginx
```

### Health Checks

```bash
# Aplicação
curl http://localhost:3000/api/health
curl https://SEU_DOMINIO.com/api/health

# Monitoramento
curl http://localhost:9090/prometheus/api/v1/targets
curl http://localhost:3003/api/health

# Containers
docker-compose ps
docker stats --no-stream
```

---

## Segurança

### Hardening Aplicado

- ✅ SSH keys only (sem senhas)
- ✅ Firewall UFW configurado
- ✅ Fail2ban ativo
- ✅ SSL/TLS obrigatório
- ✅ Headers de segurança
- ✅ Rate limiting
- ✅ Basic Auth no monitoramento
- ✅ Senhas complexas
- ✅ Containers não-privilegiados

### Credenciais de Produção

```bash
# SSH
Host: SEU_IP
User: opusatlas
Auth: SSH keys (ED25519)

# MongoDB
User: opusatlas
Pass: SenhaSuperSegura!

# Redis
Pass: SenhaSuperSeguraRedis!

# Monitoring
User: admin
Pass: SenhaMonitorMonitor
```

---

## Performance

### Otimizações Implementadas

- ✅ CDN Cloudflare global
- ✅ Cache Redis multi-layer
- ✅ Nginx gzip + brotli
- ✅ Images WebP + responsive
- ✅ Bundle splitting automático
- ✅ Lazy loading componentes
- ✅ Database indexing otimizado
- ✅ Container resource limits

### Métricas de Performance

- **Response Time**: < 200ms (cached)
- **TTFB**: < 100ms via CDN
- **Memory Usage**: ~512MB app
- **CPU Usage**: < 50% normal load
- **Uptime**: 99.9% target

---

## Contribuição

### Estrutura de Branches

- `main`: Produção (deploy automático)
- `develop`: Desenvolvimento
- `feature/*`: Novas funcionalidades
- `hotfix/*`: Correções urgentes

### Workflow

1. Fork do repositório
2. Criar feature branch
3. Implementar mudanças
4. Adicionar testes
5. Submit pull request
6. Code review
7. Merge após aprovação

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## Suporte

### Documentação

- **README.md**: Este documento
- **API.md**: Documentação das APIs
- **DEPLOY.md**: Guia de deploy
- **TROUBLESHOOTING.md**: Resolução de problemas

### Contato

- **Email**: opusatlas@gmail.com
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

### Recursos

- **Demo**: https://opusatlas.com.br
- **Monitoring**: https://monitor.opusatlas.com.br
- **Status Page**: Uptime Kuma

---

## Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

---

## Changelog

### v1.0.0 (Current)

- ✅ Sistema completo implementado
- ✅ 247 páginas funcionais
- ✅ 124 APIs documentadas
- ✅ Infraestrutura enterprise
- ✅ Monitoramento completo
- ✅ CI/CD automático
- ✅ SSL/TLS configurado
- ✅ Backup automático

---

**Desenvolvido por**: Iago Martins  
**Arquitetura**: Claude (Anthropic)  
**Status**: ✅ Produção Completa  
**Última atualização**: Dezembro 2024

### Serviços Opcionais

- 🔶 **OpenAI API** - IA para biografias de compositores
- 🔶 **Groq API** - IA alternativa (mais rápida)
- 🔶 **SendGrid** - Email marketing avançado

---

## 1. Google Cloud Platform

### 1.1 Criar Projeto

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Clique em "Novo Projeto"
3. Nome: `opus-atlas-prod` (ou sua preferência)
4. Confirmar criação

### 1.2 Configurar OAuth 2.0

#### Tela de Consentimento OAuth

1. **APIs & Services** → **OAuth consent screen**
2. **User Type**: External
3. **Informações do app**:
   ```
   Nome do app: Opus Atlas
   Email de suporte: seu-email@gmail.com
   Logo do app: (opcional)
   Domínio da página inicial: https://opusatlas.com.br
   ```
4. **Domínios autorizados**:
   ```
   opusatlas.com.br
   localhost (para desenvolvimento)
   ```
5. **Contatos do desenvolvedor**: seu-email@gmail.com
6. **Escopos**:
   - userinfo.email
   - userinfo.profile
   - openid

#### Credenciais OAuth

1. **APIs & Services** → **Credenciais**
2. **Criar credenciais** → **ID do cliente OAuth 2.0**
3. **Tipo de aplicação**: Aplicação Web
4. **Nome**: `Opus Atlas Web Client`
5. **URIs de redirect autorizados**:

   ```
   # Desenvolvimento
   http://localhost:3000/api/auth/callback/google

   # Produção
   https://opusatlas.com.br/api/auth/callback/google
   https://www.opusatlas.com.br/api/auth/callback/google
   ```

6. **Origens JavaScript autorizadas**:

   ```
   # Desenvolvimento
   http://localhost:3000

   # Produção
   https://opusatlas.com.br
   https://www.opusatlas.com.br
   ```

### 1.3 YouTube Data API v3

#### Ativar API

1. **APIs & Services** → **Biblioteca**
2. Pesquisar "YouTube Data API v3"
3. Clicar em "Ativar"

#### Criar API Key

1. **APIs & Services** → **Credenciais**
2. **Criar credenciais** → **Chave de API**
3. **Restringir chave**:
   - **Restrições da aplicação**: Referenciadores HTTP
   - **Referenciadores de sites**:
     ```
     localhost:3000/*
     opusatlas.com.br/*
     *.opusatlas.com.br/*
     ```
   - **Restrições de API**: YouTube Data API v3
4. **Nome**: `Opus Atlas YouTube API`

### 1.4 Variáveis de Ambiente Google

```env
# Google OAuth
GOOGLE_CLIENT_ID="123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz"

# YouTube API
YOUTUBE_API_KEY="AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567"
```

---

## 2. Spotify for Developers

### 2.1 Criar Aplicação

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. **Create App**
3. **Configurações**:
   ```
   App name: Opus Atlas
   App description: Plataforma educacional de música clássica
   Website: https://opusatlas.com.br
   Redirect URIs:
     http://localhost:3000/api/auth/callback/spotify
     https://opusatlas.com.br/api/auth/callback/spotify
   ```
4. **Which API/SDKs are you planning to use?**
   - Web API ✅
   - Web Playback SDK ✅

### 2.2 Configurar Permissões

**Scopes necessários**:

- `user-read-email` - Email do usuário
- `user-read-private` - Perfil básico
- `streaming` - Reproduzir música (futuro)

### 2.3 Obter Credenciais

1. **Settings** da aplicação criada
2. Copiar **Client ID** e **Client Secret**
3. **Show client secret** para ver a secret

### 2.4 Variáveis de Ambiente Spotify

```env
SPOTIFY_CLIENT_ID="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
SPOTIFY_CLIENT_SECRET="z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0"
```

### 2.5 Teste da Integração

```javascript
// Teste no console do navegador ou Node.js
const testSpotifyAuth = async () => {
  const clientId = 'seu-client-id';
  const clientSecret = 'seu-client-secret';

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  );

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  console.log('Spotify Auth:', data.access_token ? '✅ Sucesso' : '❌ Erro');
};
```

---

## 3. Cloudinary

### 3.1 Criar Conta

1. Acesse [Cloudinary](https://cloudinary.com/users/register_free)
2. Registre-se com seu email
3. Verificar email e completar cadastro
4. Escolher plano **Free** (25 GB/mês)

### 3.2 Obter Credenciais

1. **Dashboard** → **Account Details**
2. Copiar:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3.3 Configurar Upload Preset

1. **Settings** → **Upload**
2. **Add upload preset**
3. **Configurações**:

   ```
   Preset name: musical-encyclopedia
   Signing mode: Unsigned
   Folder: opus-atlas

   # Transformações automáticas
   Format: Auto
   Quality: Auto

   # Eager transformations:
   c_fill,w_800,h_600,q_auto,f_auto (para cards)
   c_fill,w_400,h_300,q_auto,f_auto (para thumbnails)
   c_fill,w_150,h_150,q_auto,f_auto (para avatars)
   ```

### 3.4 Configurações Avançadas

```json
{
  "folder": "opus-atlas",
  "resource_type": "auto",
  "allowed_formats": ["jpg", "jpeg", "png", "gif", "webp", "svg"],
  "max_file_size": 10485760,
  "max_image_width": 2000,
  "max_image_height": 2000,
  "quality": "auto:best",
  "format": "auto",
  "crop": "limit",
  "fetch_format": "auto"
}
```

### 3.5 Variáveis de Ambiente Cloudinary

```env
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="AbCdEfGhIjKlMnOpQrStUvWxYz"
CLOUDINARY_UPLOAD_PRESET="musical-encyclopedia"
```

### 3.6 Teste da Integração

```javascript
// Upload de teste
const testCloudinaryUpload = async () => {
  const formData = new FormData();
  formData.append('upload_preset', 'musical-encyclopedia');
  formData.append(
    'file',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/seu-cloud-name/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  console.log('Cloudinary:', data.secure_url ? '✅ Sucesso' : '❌ Erro');
};
```

---

## 4. Gmail SMTP

### 4.1 Configurar Autenticação 2 Fatores

1. [Google Account Security](https://myaccount.google.com/security)
2. **2-Step Verification** → **Get started**
3. Seguir instruções para ativar

### 4.2 Gerar Senha de App

1. **2-Step Verification** → **App passwords**
2. **Select app**: Mail
3. **Select device**: Other (custom name)
4. **Name**: `Opus Atlas SMTP`
5. **Generate** → Copiar senha gerada (16 caracteres)

### 4.3 Configuração SMTP

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"  # StartTLS
SMTP_USER="opusatlas@gmail.com"
SMTP_PASS="abcd efgh ijkl mnop"  # App password
```

### 4.4 Teste SMTP

```javascript
// Teste de envio (Node.js + nodemailer)
const nodemailer = require('nodemailer');

const testSMTP = async () => {
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'opusatlas@gmail.com',
      pass: 'sua-app-password',
    },
  });

  try {
    await transporter.sendMail({
      from: 'opusatlas@gmail.com',
      to: 'seu-email-teste@gmail.com',
      subject: 'Teste SMTP Opus Atlas',
      text: 'Email de teste enviado com sucesso!',
    });
    console.log('SMTP: ✅ Sucesso');
  } catch (error) {
    console.log('SMTP: ❌ Erro', error.message);
  }
};
```

---

## 5. OpenAI API (Opcional)

### 5.1 Criar Conta

1. Acesse [OpenAI Platform](https://platform.openai.com)
2. Registrar/Login
3. **Billing** → Adicionar método de pagamento
4. **Usage limits** → Configurar limites

### 5.2 Gerar API Key

1. **API Keys** → **Create new secret key**
2. **Name**: `Opus Atlas Production`
3. **Permissions**: Restricted
4. **Allowed actions**:
   - Model capabilities: ✅
   - Model inference: ✅
5. Copiar chave (começa com `sk-proj-...`)

### 5.3 Configurações de Uso

```env
OPENAI_API_KEY="sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890..."

# Configurações opcionais
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_MAX_TOKENS="1000"
OPENAI_TEMPERATURE="0.7"
```

### 5.4 Teste OpenAI

```javascript
const testOpenAI = async () => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em música clássica.',
        },
        { role: 'user', content: 'Fale brevemente sobre Bach.' },
      ],
      max_tokens: 100,
    }),
  });

  const data = await response.json();
  console.log('OpenAI:', data.choices?.[0]?.message ? '✅ Sucesso' : '❌ Erro');
};
```

---

## 6. Groq API (Alternativa IA)

### 6.1 Criar Conta

1. Acesse [Groq Console](https://console.groq.com)
2. Registrar com GitHub/Google
3. **API Keys** → **Create API Key**
4. **Name**: `Opus Atlas`
5. Copiar chave (começa com `gsk_...`)

### 6.2 Vantagens do Groq

- **Velocidade**: ~10x mais rápido que OpenAI
- **Gratuito**: Tier generoso gratuito
- **Models**: Llama 2, Mixtral, Gemma

### 6.3 Configuração Groq

```env
GROQ_API_KEY="gsk_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"

# Configurações
GROQ_MODEL="llama2-70b-4096"
GROQ_MAX_TOKENS="1000"
GROQ_TEMPERATURE="0.7"
```

### 6.4 Teste Groq

```javascript
const testGroq = async () => {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2-70b-4096',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em música clássica.',
          },
          { role: 'user', content: 'Fale brevemente sobre Mozart.' },
        ],
        max_tokens: 100,
      }),
    }
  );

  const data = await response.json();
  console.log('Groq:', data.choices?.[0]?.message ? '✅ Sucesso' : '❌ Erro');
};
```

---

## 7. SendGrid (Email Marketing)

### 7.1 Criar Conta

1. Acesse [SendGrid](https://sendgrid.com)
2. **Start for Free**
3. Verificar email e completar onboarding

### 7.2 Configurar Sender Identity

1. **Settings** → **Sender Authentication**
2. **Single Sender Verification**
3. **Create New Sender**:
   ```
   From Name: Opus Atlas
   From Email: opusatlas@gmail.com
   Reply To: opusatlas@gmail.com
   Company: Opus Atlas
   Address: Sua cidade, Estado
   ```
4. Verificar email enviado

### 7.3 Gerar API Key

1. **Settings** → **API Keys**
2. **Create API Key**
3. **API Key Name**: `Opus Atlas Production`
4. **API Key Permissions**: Restricted Access
5. **Selected permissions**:
   - Mail Send: Full Access
   - Marketing Campaigns: Full Access
   - Template Engine: Full Access
6. Copiar chave (começa com `SG.`)

### 7.4 Configuração SendGrid

```env
SENDGRID_API_KEY="SG.AbCdEfGhIjKlMnOpQrStUvWxYz.1234567890"
SENDGRID_FROM_EMAIL="opusatlas@gmail.com"
SENDGRID_FROM_NAME="Opus Atlas"
```

### 7.5 Configurar Webhook (Opcional)

1. **Settings** → **Mail Settings** → **Event Webhook**
2. **HTTP POST URL**: `https://opusatlas.com.br/api/webhooks/sendgrid`
3. **Select Actions**:
   - Delivered ✅
   - Opens ✅
   - Clicks ✅
   - Bounces ✅
   - Spam Reports ✅

---

## 8. Configuração no Código

### 8.1 Arquivo .env Completo

```env
# =============================================================================
# OPUS ATLAS - CONFIGURAÇÃO COMPLETA DE SERVIÇOS
# =============================================================================

NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# =============================================================================
# DATABASE
# =============================================================================
DATABASE_URL="mongodb://opusatlas:SenhaSuperSegura!@opus-atlas-mongodb-prod:27017/opus_atlas_prod?authSource=admin&replicaSet=rs0"
REDIS_URL="redis://:SenhaSuperSeguraRedis!@opus-atlas-redis:6379"

# =============================================================================
# NEXTAUTH.JS
# =============================================================================
NEXTAUTH_URL="https://opusatlas.com.br"
NEXTAUTH_SECRET="super-secret-production-key-change-this-in-prod-2024"

# =============================================================================
# GOOGLE SERVICES
# =============================================================================
GOOGLE_CLIENT_ID="123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz"
YOUTUBE_API_KEY="AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567"

# =============================================================================
# SPOTIFY API
# =============================================================================
SPOTIFY_CLIENT_ID="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
SPOTIFY_CLIENT_SECRET="z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0"

# =============================================================================
# CLOUDINARY
# =============================================================================
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="AbCdEfGhIjKlMnOpQrStUvWxYz"
CLOUDINARY_UPLOAD_PRESET="musical-encyclopedia"

# =============================================================================
# EMAIL SMTP
# =============================================================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="opusatlas@gmail.com"
SMTP_PASS="abcd efgh ijkl mnop"

# =============================================================================
# AI SERVICES (OPCIONAL)
# =============================================================================
# OpenAI
OPENAI_API_KEY="sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_MAX_TOKENS="1000"
OPENAI_TEMPERATURE="0.7"

# Groq (Alternativa mais rápida)
GROQ_API_KEY="gsk_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
GROQ_MODEL="llama2-70b-4096"
GROQ_MAX_TOKENS="1000"
GROQ_TEMPERATURE="0.7"

# =============================================================================
# EMAIL MARKETING (OPCIONAL)
# =============================================================================
SENDGRID_API_KEY="SG.AbCdEfGhIjKlMnOpQrStUvWxYz.1234567890"
SENDGRID_FROM_EMAIL="opusatlas@gmail.com"
SENDGRID_FROM_NAME="Opus Atlas"

# =============================================================================
# CONFIGURAÇÕES ADICIONAIS
# =============================================================================
# Rate Limiting
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW_MS="900000"

# Upload Settings
MAX_FILE_SIZE="10485760"
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp,image/gif"

# Cache TTL
CACHE_TTL_SECONDS="3600"
REDIS_TTL_SECONDS="1800"

# Feature Flags
ENABLE_AI_BIOGRAPHIES="true"
ENABLE_SPOTIFY_INTEGRATION="true"
ENABLE_EMAIL_MARKETING="true"
ENABLE_ANALYTICS="true"

# Debug
DEBUG="opus:*"
LOG_LEVEL="info"
```

### 8.2 Configuração NextAuth

```javascript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
}
```

### 8.3 Configuração Cloudinary

```javascript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

---

## 9. Scripts de Teste

### 9.1 Script de Teste Geral

Criar `scripts/test-all-services.js`:

```javascript
#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const tests = [
  {
    name: 'YouTube API',
    test: async () => {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=Bach&type=video&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`
      );
      return response.ok;
    },
  },
  {
    name: 'Spotify API',
    test: async () => {
      const credentials = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64');
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      return response.ok;
    },
  },
  {
    name: 'Cloudinary',
    test: async () => {
      const formData = new FormData();
      formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
      formData.append(
        'file',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      return response.ok;
    },
  },
];

const runTests = async () => {
  console.log('🧪 Testando serviços externos...\n');

  for (const { name, test } of tests) {
    try {
      const result = await test();
      console.log(`${result ? '✅' : '❌'} ${name}`);
    } catch (error) {
      console.log(`❌ ${name} - Erro: ${error.message}`);
    }
  }

  console.log('\n✨ Testes concluídos!');
};

runTests();
```

### 9.2 Executar Testes

```bash
# Tornar executável
chmod +x scripts/test-all-services.js

# Executar
node scripts/test-all-services.js

# Ou adicionar ao package.json
{
  "scripts": {
    "test:services": "node scripts/test-all-services.js"
  }
}
```

---

## 10. Troubleshooting

### 10.1 Problemas Comuns

#### Google OAuth "redirect_uri_mismatch"

```bash
# Erro: The redirect URI in the request does not match
# Solução: Verificar URLs exatas no Google Console
# Deve ser exatamente: http://localhost:3000/api/auth/callback/google
```

#### YouTube API "quotaExceeded"

```bash
# Erro: Daily quota exceeded
# Solução: Aguardar reset (00:00 PST) ou aumentar quota
# Verificar: Google Cloud Console → APIs & Services → Quotas
```

#### Spotify "invalid_client"

```bash
# Erro: Invalid client credentials
# Solução: Verificar Client ID e Secret
# Re-gerar credenciais se necessário
```

#### Cloudinary "upload_preset not found"

```bash
# Erro: Invalid upload preset
# Solução: Criar preset "musical-encyclopedia" como unsigned
```

### 10.2 Verificação de Conectividade

```bash
# Testar conectividade básica
curl -I https://www.googleapis.com/youtube/v3/
curl -I https://accounts.spotify.com/api/token
curl -I https://api.cloudinary.com/
curl -I https://api.openai.com/
```

### 10.3 Logs de Debug

```javascript
// Adicionar ao .env para debug
DEBUG = 'oauth,youtube,spotify,cloudinary';
LOG_LEVEL = 'debug';

// No código
console.log('API Response:', {
  service: 'youtube',
  status: response.status,
  headers: response.headers,
  body: await response.text(),
});
```

---

## 11. Checklist Final

### ✅ Antes do Deploy

- [ ] Todas as APIs configuradas
- [ ] Credenciais adicionadas ao .env
- [ ] Scripts de teste passando
- [ ] URLs de callback configuradas
- [ ] Quotas/limits verificados

### ✅ Em Produção

- [ ] Variáveis de ambiente corretas
- [ ] URLs HTTPS configuradas
- [ ] Monitoramento de APIs ativo
- [ ] Logs de erro configurados
- [ ] Backup de credenciais seguro

---

**Configuração concluída! 🎉**

Todos os serviços externos estão prontos para uso. Execute `npm run test:services` para verificar se tudo está funcionando.
