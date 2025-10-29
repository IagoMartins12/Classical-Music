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
