# 🚀 GUIA COMPLETO: DEPLOY NEXT.JS 15+ EM VPS - ARQUITETURA PROFISSIONAL

## 📋 ÍNDICE

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Pré-requisitos](#pré-requisitos)
3. [Compra e Configuração do Domínio](#compra-e-configuração-do-domínio)
4. [Setup da VPS Linode](#setup-da-vps-linode)
5. [Configuração Inicial do Servidor](#configuração-inicial-do-servidor)
6. [Instalação e Configuração do Docker](#instalação-e-configuração-do-docker)
7. [Configuração do MongoDB](#configuração-do-mongodb)
8. [Configuração do Redis](#configuração-do-redis)
9. [Configuração do Nginx](#configuração-do-nginx)
10. [Configuração do SSL (Let's Encrypt)](#configuração-do-ssl-lets-encrypt)
11. [Preparação do Projeto Next.js](#preparação-do-projeto-nextjs)
12. [GitHub Actions CI/CD](#github-actions-cicd)
13. [Configuração do Cloudflare](#configuração-do-cloudflare)
14. [Monitoramento e Logs](#monitoramento-e-logs)
15. [Backup Automático](#backup-automático)
16. [Segurança Avançada](#segurança-avançada)
17. [Troubleshooting](#troubleshooting)
18. [Comandos Úteis](#comandos-úteis)

---

## 🏗️ VISÃO GERAL DA ARQUITETURA

```
Internet → Cloudflare → Nginx → Next.js App (Docker)
                                    ↓
                               Redis (Cache)
                                    ↓
                             MongoDB (Database)
```

**Componentes:**

- **Cloudflare**: CDN, DDoS protection, Cache global
- **Nginx**: Reverse proxy, SSL termination, Load balancing
- **Next.js 15+**: Aplicação principal (Docker + PM2)
- **Redis**: Cache de sessões e dados
- **MongoDB**: Banco de dados principal
- **GitHub Actions**: CI/CD automático
- **Monitoring**: Logs centralizados + alertas

---

## 📝 PRÉ-REQUISITOS

- [ ] Conta no GitHub com projeto Next.js
- [ ] Cartão de crédito para VPS e domínio
- [ ] Terminal/SSH client (Windows: PuTTY ou WSL)
- [ ] Editor de texto para arquivos de configuração

---

## 🌐 COMPRA E CONFIGURAÇÃO DO DOMÍNIO

### Passo 1: Comprar o Domínio (GoDaddy)

1. **Acesse**: https://godaddy.com
2. **Busque** seu domínio desejado
3. **Compre** o domínio (recomendo .com)
4. **Anote**: o domínio comprado (ex: `meusite.com`)

### Passo 2: Configurar DNS Temporário

Por enquanto, vamos deixar o DNS no GoDaddy. Depois migraremos para Cloudflare.

1. Vá em **My Products** → **DNS**
2. **Anote** os nameservers atuais:
   ```
   ns1.godaddy.com
   ns2.godaddy.com
   ```

⚠️ **Importante**: Não altere nada ainda. Faremos isso depois da VPS estar pronta.

---

## 🖥️ SETUP DA VPS LINODE

### Passo 1: Criar a VPS

1. **Acesse**: https://linode.com
2. **Crie** uma conta
3. **Create Linode**:
   - **Image**: Ubuntu 22.04 LTS
   - **Region**: Próximo do Brasil (São Paulo se disponível)
   - **Plan**: Linode 2GB ($12/mês)
   - **Root Password**: Crie uma senha FORTE (anote!)

### Passo 2: Configurar SSH Key (Recomendado)

**No seu computador local:**

```bash
# Gerar chave SSH (se não tiver)
ssh-keygen -t ed25519 -C "seu-email@gmail.com"

# Mostrar chave pública
cat ~/.ssh/id_ed25519.pub
```

**No painel Linode:**

1. Vá em **Account** → **SSH Keys**
2. **Add SSH Key**
3. Cole a chave pública
4. **Rebuild** a VPS com a chave SSH

### Passo 3: Conectar via SSH

```bash
ssh root@SEU_IP_DA_VPS
```

⚠️ **Anote o IP da VPS**: Você precisará em vários lugares.

---

## ⚙️ CONFIGURAÇÃO INICIAL DO SERVIDOR

### Passo 1: Atualizar o Sistema

```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar utilitários essenciais
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release htop nano tree fail2ban ufw logrotate
```

### Passo 2: Configurar Timezone

```bash
timedatectl set-timezone America/Sao_Paulo
timedatectl status
```

### Passo 3: Criar Usuário Deploy (Segurança)

```bash
# Criar usuário
adduser deploy
usermod -aG sudo deploy

# Configurar SSH para o usuário deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### Passo 4: Configurar SSH (Segurança)

```bash
nano /etc/ssh/sshd_config
```

**Alterar/adicionar:**

```
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Protocol 2
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

```bash
# Reiniciar SSH
systemctl restart sshd

# Testar conexão com novo usuário (NOVA ABA do terminal)
ssh -p 2222 deploy@SEU_IP_DA_VPS
```

⚠️ **Atenção**: Mantenha a conexão root aberta até confirmar que o usuário deploy funciona!

### Passo 5: Configurar Firewall

```bash
# Resetar UFW
ufw --force reset

# Configurar regras
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH, HTTP, HTTPS
ufw allow 2222/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Ativar firewall
ufw enable

# Verificar status
ufw status verbose
```

---

## 🐳 INSTALAÇÃO E CONFIGURAÇÃO DO DOCKER

### Passo 1: Instalar Docker

```bash
# Remover versões antigas
apt remove -y docker docker-engine docker.io containerd runc

# Adicionar repositório oficial
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário deploy ao grupo docker
usermod -aG docker deploy

# Iniciar e habilitar Docker
systemctl start docker
systemctl enable docker

# Testar instalação
docker --version
docker compose version
```

### Passo 2: Configurar Docker Daemon

```bash
nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-address-pools": [
    {
      "base": "172.80.0.0/12",
      "size": 24
    }
  ]
}
```

```bash
systemctl restart docker
```

---

## 🍃 CONFIGURAÇÃO DO MONGODB

### Passo 1: Criar Diretório de Dados

```bash
# Como usuário deploy
su - deploy

# Criar estrutura de diretórios
mkdir -p ~/app/{data/mongodb,logs,backups}
cd ~/app
```

### Passo 2: Configurar MongoDB via Docker

```bash
nano docker-compose.yml
```

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: enciclopedia_musical
    ports:
      - '127.0.0.1:27017:27017'
    volumes:
      - ./data/mongodb:/data/db
      - ./logs/mongodb:/var/log/mongodb
    networks:
      - app-network
    command: mongod --logpath /var/log/mongodb/mongodb.log --logappend

networks:
  app-network:
    driver: bridge
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
nano .env
```

```env
# MongoDB
MONGO_ROOT_PASSWORD=SUA_SENHA_SUPER_FORTE_AQUI
DATABASE_URL=mongodb://admin:SUA_SENHA_SUPER_FORTE_AQUI@localhost:27017/enciclopedia_musical?authSource=admin

# Next.js
NEXTAUTH_SECRET=SUA_NEXTAUTH_SECRET_SUPER_FORTE
NEXTAUTH_URL=https://seudominio.com

# APIs
OPENAI_API_KEY=sua_openai_key
GROQ_API_KEY=sua_groq_key
SPOTIFY_CLIENT_ID=seu_spotify_client_id
SPOTIFY_CLIENT_SECRET=seu_spotify_client_secret
YOUTUBE_API_KEY=sua_youtube_api_key

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app_gmail

# Backup
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE_ENABLED=true
BACKUP_SCHEDULE_CRON=0 2 * * *

# Redis
REDIS_URL=redis://localhost:6379
```

### Passo 4: Iniciar MongoDB

```bash
docker compose up -d mongodb

# Verificar logs
docker compose logs -f mongodb
```

### Passo 5: Criar Usuário da Aplicação

```bash
# Conectar ao MongoDB
docker exec -it mongodb mongosh -u admin -p

# No shell do MongoDB
use enciclopedia_musical
db.createUser({
  user: "app_user",
  pwd: "OUTRA_SENHA_FORTE",
  roles: [
    { role: "readWrite", db: "enciclopedia_musical" }
  ]
})
exit
```

**Atualizar .env:**

```env
DATABASE_URL=mongodb://app_user:OUTRA_SENHA_FORTE@localhost:27017/enciclopedia_musical
```

---

## 🔴 CONFIGURAÇÃO DO REDIS

### Passo 1: Adicionar Redis ao Docker Compose

```bash
nano docker-compose.yml
```

**Adicionar ao arquivo:**

```yaml
redis:
  image: redis:7.2-alpine
  container_name: redis
  restart: unless-stopped
  ports:
    - '127.0.0.1:6379:6379'
  volumes:
    - ./data/redis:/data
    - ./config/redis.conf:/usr/local/etc/redis/redis.conf
  networks:
    - app-network
  command: redis-server /usr/local/etc/redis/redis.conf
```

### Passo 2: Configurar Redis

```bash
mkdir -p config data/redis

nano config/redis.conf
```

```conf
# Redis Configuration
bind 127.0.0.1
port 6379
timeout 0
keepalive 300

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Logs
loglevel notice
logfile /var/log/redis/redis.log

# Security
protected-mode yes

# Performance
tcp-backlog 511
```

### Passo 3: Iniciar Redis

```bash
docker compose up -d redis

# Testar conexão
docker exec -it redis redis-cli ping
```

---

## 🌐 CONFIGURAÇÃO DO NGINX

### Passo 1: Instalar Nginx

```bash
sudo apt install -y nginx

# Verificar status
sudo systemctl status nginx
sudo systemctl enable nginx
```

### Passo 2: Configurar Site

```bash
sudo nano /etc/nginx/sites-available/enciclopedia-musical
```

```nginx
# Upstream para a aplicação Next.js
upstream nextjs_app {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=app:10m rate=5r/s;

# Server block para redirecionamento HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name seudominio.com www.seudominio.com dev.seudominio.com;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# Produção - seudominio.com
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    # SSL Configuration (será configurado pelo Certbot)
    # ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logs
    access_log /var/log/nginx/enciclopedia-musical.access.log;
    error_log /var/log/nginx/enciclopedia-musical.error.log;

    # Client upload limit
    client_max_body_size 50M;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri @nextjs;
    }

    # API routes with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;

        proxy_pass http://nextjs_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://nextjs_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_connect_timeout 1s;
        proxy_send_timeout 1s;
        proxy_read_timeout 1s;
    }

    # Main application
    location / {
        limit_req zone=app burst=10 nodelay;

        proxy_pass http://nextjs_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Fallback to Next.js
    location @nextjs {
        proxy_pass http://nextjs_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Desenvolvimento - dev.seudominio.com
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dev.seudominio.com;

    # SSL Configuration (será configurado pelo Certbot)
    # ssl_certificate /etc/letsencrypt/live/dev.seudominio.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/dev.seudominio.com/privkey.pem;

    # Security headers (menos restritivos para dev)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Logs separados para dev
    access_log /var/log/nginx/dev.enciclopedia-musical.access.log;
    error_log /var/log/nginx/dev.enciclopedia-musical.error.log;

    # Proxy para aplicação de desenvolvimento (porta 3001)
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Passo 3: Ativar Site

```bash
# Testar configuração
sudo nginx -t

# Ativar site
sudo ln -s /etc/nginx/sites-available/enciclopedia-musical /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm /etc/nginx/sites-enabled/default

# Recarregar Nginx
sudo systemctl reload nginx
```

⚠️ **Substitua** `seudominio.com` pelo seu domínio real em todos os lugares!

---

## 🔒 CONFIGURAÇÃO DO SSL (LET'S ENCRYPT)

### Passo 1: Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Passo 2: Configurar DNS no GoDaddy (Temporário)

1. **Vá para o painel do GoDaddy**
2. **DNS Management**
3. **Adicione os registros A:**
   ```
   Type: A, Name: @, Value: SEU_IP_DA_VPS, TTL: 1 Hour
   Type: A, Name: www, Value: SEU_IP_DA_VPS, TTL: 1 Hour
   Type: A, Name: dev, Value: SEU_IP_DA_VPS, TTL: 1 Hour
   ```

### Passo 3: Aguardar Propagação DNS

```bash
# Testar propagação (pode demorar até 24h, mas geralmente 1-2h)
nslookup seudominio.com
nslookup www.seudominio.com
nslookup dev.seudominio.com
```

### Passo 4: Gerar Certificados SSL

```bash
# Produção
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Desenvolvimento
sudo certbot --nginx -d dev.seudominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

### Passo 5: Configurar Renovação Automática

```bash
# Verificar se o timer está ativo
sudo systemctl status certbot.timer

# Se não estiver, ativar
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🎯 PREPARAÇÃO DO PROJETO NEXT.JS

### Passo 1: Configurar Dockerfile

**No seu projeto local**, crie:

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

### Passo 2: Configurar next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  output: 'standalone',

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    domains: ['localhost', 'seudominio.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-RateLimit-Limit',
            value: '100',
          },
          {
            key: 'X-RateLimit-Remaining',
            value: '100',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

### Passo 3: Adicionar Health Check

**pages/api/health.js** ou **app/api/health/route.js** (App Router):

```javascript
// app/api/health/route.js (Next.js 13+ App Router)
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected', // Add Redis check if needed
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

### Passo 4: Configurar PM2

**ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: 'enciclopedia-musical-prod',
      script: 'server.js',
      cwd: '/home/deploy/app/prod',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: '/home/deploy/app/logs/pm2-error.log',
      out_file: '/home/deploy/app/logs/pm2-out.log',
      log_file: '/home/deploy/app/logs/pm2-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
    },
    {
      name: 'enciclopedia-musical-dev',
      script: 'server.js',
      cwd: '/home/deploy/app/dev',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: '/home/deploy/app/logs/pm2-dev-error.log',
      out_file: '/home/deploy/app/logs/pm2-dev-out.log',
      log_file: '/home/deploy/app/logs/pm2-dev-combined.log',
      time: true,
      max_memory_restart: '512M',
    },
  ],
};
```

### Passo 5: Scripts de Deploy

**scripts/deploy.sh:**

```bash
#!/bin/bash

set -e

ENVIRONMENT=${1:-prod}
APP_DIR="/home/deploy/app"
PROJECT_DIR="$APP_DIR/$ENVIRONMENT"

echo "🚀 Starting deployment for $ENVIRONMENT environment..."

# Create directories if they don't exist
mkdir -p $PROJECT_DIR
mkdir -p $APP_DIR/logs

# Navigate to project directory
cd $PROJECT_DIR

# Pull latest code
echo "📥 Pulling latest code..."
if [ ! -d ".git" ]; then
    git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git .
fi

if [ "$ENVIRONMENT" = "prod" ]; then
    git checkout main
else
    git checkout dev
fi

git pull origin $(git branch --show-current)

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations (only for prod)
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "🗃️ Running database migrations..."
    npx prisma migrate deploy
fi

# Build application
echo "🏗️ Building application..."
npm run build

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Start/restart application with PM2
echo "🔄 Restarting application..."
if [ "$ENVIRONMENT" = "prod" ]; then
    pm2 startOrRestart ecosystem.config.js --only enciclopedia-musical-prod
else
    pm2 startOrRestart ecosystem.config.js --only enciclopedia-musical-dev
fi

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully!"
```

---

## 🔄 GITHUB ACTIONS CI/CD

### Passo 1: Configurar Secrets no GitHub

**No seu repositório GitHub:**

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** e adicione:

```
VPS_HOST=SEU_IP_DA_VPS
VPS_PORT=2222
VPS_USER=deploy
VPS_SSH_KEY=[sua chave SSH privada completa]

# Variáveis de ambiente da aplicação
DATABASE_URL=mongodb://app_user:SENHA@localhost:27017/enciclopedia_musical
NEXTAUTH_SECRET=sua_nextauth_secret
NEXTAUTH_URL=https://seudominio.com
OPENAI_API_KEY=sua_openai_key
GROQ_API_KEY=sua_groq_key
SPOTIFY_CLIENT_ID=seu_spotify_client_id
SPOTIFY_CLIENT_SECRET=seu_spotify_client_secret
YOUTUBE_API_KEY=sua_youtube_api_key
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app_gmail
REDIS_URL=redis://localhost:6379
```

### Passo 2: Workflow Principal

**.github/workflows/deploy.yml:**

```yaml
name: 🚀 Deploy to VPS

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  test:
    name: 🧪 Run Tests
    runs-on: ubuntu-latest

    steps:
      - name: 📚 Checkout code
        uses: actions/checkout@v4

      - name: 🏗️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🔧 Generate Prisma client
        run: npx prisma generate

      - name: 🧪 Run tests
        run: npm run test

      - name: 🔍 Run linting
        run: npm run lint

      - name: 🏗️ Test build
        run: npm run build

  deploy-dev:
    name: 🚀 Deploy to Development
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/dev'

    steps:
      - name: 🚀 Deploy to dev server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          port: ${{ secrets.VPS_PORT }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            export PATH=$PATH:/usr/local/bin:/home/deploy/.local/bin
            cd /home/deploy/app

            echo "🚀 Starting dev deployment..."

            # Create .env for development
            cat > dev/.env << EOF
            NODE_ENV=development
            DATABASE_URL=${{ secrets.DATABASE_URL_DEV }}
            NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}
            NEXTAUTH_URL=https://dev.seudominio.com
            OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
            GROQ_API_KEY=${{ secrets.GROQ_API_KEY }}
            SPOTIFY_CLIENT_ID=${{ secrets.SPOTIFY_CLIENT_ID }}
            SPOTIFY_CLIENT_SECRET=${{ secrets.SPOTIFY_CLIENT_SECRET }}
            YOUTUBE_API_KEY=${{ secrets.YOUTUBE_API_KEY }}
            GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }}
            GOOGLE_CLIENT_SECRET=${{ secrets.GOOGLE_CLIENT_SECRET }}
            SMTP_HOST=${{ secrets.SMTP_HOST }}
            SMTP_PORT=${{ secrets.SMTP_PORT }}
            SMTP_SECURE=${{ secrets.SMTP_SECURE }}
            SMTP_USER=${{ secrets.SMTP_USER }}
            SMTP_PASS=${{ secrets.SMTP_PASS }}
            REDIS_URL=${{ secrets.REDIS_URL }}
            EOF

            # Run deployment script
            chmod +x scripts/deploy.sh
            ./scripts/deploy.sh dev

            echo "✅ Dev deployment completed!"

  deploy-prod:
    name: 🚀 Deploy to Production
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: 🚀 Deploy to production server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          port: ${{ secrets.VPS_PORT }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            export PATH=$PATH:/usr/local/bin:/home/deploy/.local/bin
            cd /home/deploy/app

            echo "🚀 Starting production deployment..."

            # Create .env for production
            cat > prod/.env << EOF
            NODE_ENV=production
            DATABASE_URL=${{ secrets.DATABASE_URL }}
            NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}
            NEXTAUTH_URL=${{ secrets.NEXTAUTH_URL }}
            OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
            GROQ_API_KEY=${{ secrets.GROQ_API_KEY }}
            SPOTIFY_CLIENT_ID=${{ secrets.SPOTIFY_CLIENT_ID }}
            SPOTIFY_CLIENT_SECRET=${{ secrets.SPOTIFY_CLIENT_SECRET }}
            YOUTUBE_API_KEY=${{ secrets.YOUTUBE_API_KEY }}
            GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }}
            GOOGLE_CLIENT_SECRET=${{ secrets.GOOGLE_CLIENT_SECRET }}
            SMTP_HOST=${{ secrets.SMTP_HOST }}
            SMTP_PORT=${{ secrets.SMTP_PORT }}
            SMTP_SECURE=${{ secrets.SMTP_SECURE }}
            SMTP_USER=${{ secrets.SMTP_USER }}
            SMTP_PASS=${{ secrets.SMTP_PASS }}
            REDIS_URL=${{ secrets.REDIS_URL }}
            EOF

            # Run deployment script
            chmod +x scripts/deploy.sh
            ./scripts/deploy.sh prod

            echo "✅ Production deployment completed!"

      - name: 🔔 Notify deployment
        if: success()
        run: |
          echo "Production deployment successful! 🎉"
          echo "Site available at: https://seudominio.com"
```

---

## ☁️ CONFIGURAÇÃO DO CLOUDFLARE

### Passo 1: Criar Conta Cloudflare

1. **Acesse**: https://cloudflare.com
2. **Crie conta gratuita**
3. **Add site**: seu domínio

### Passo 2: Configurar DNS no Cloudflare

1. **Cloudflare detectará** automaticamente os registros DNS
2. **Adicione/Confirme** os registros:
   ```
   Type: A, Name: @, Content: SEU_IP_DA_VPS, Proxy: ON (laranja)
   Type: A, Name: www, Content: SEU_IP_DA_VPS, Proxy: ON (laranja)
   Type: A, Name: dev, Content: SEU_IP_DA_VPS, Proxy: ON (laranja)
   ```

### Passo 3: Alterar Nameservers no GoDaddy

1. **No Cloudflare**, copie os nameservers fornecidos:

   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```

2. **No GoDaddy**:
   - **My Products** → **DNS**
   - **Change Nameservers**
   - Cole os nameservers do Cloudflare
   - **Save**

⏰ **Aguarde 24-48h** para propagação completa.

### Passo 4: Configurar Cloudflare (Após Propagação)

**SSL/TLS:**

```
SSL/TLS → Overview → Full (strict)
SSL/TLS → Edge Certificates → Always Use HTTPS: ON
```

**Security:**

```
Security → Settings:
- Security Level: Medium
- Bot Fight Mode: ON
- Browser Integrity Check: ON

Firewall → Tools:
- Rate Limiting: Configure para APIs
```

**Speed:**

```
Speed → Optimization:
- Auto Minify: CSS, JavaScript, HTML
- Rocket Loader: ON
- Mirage: ON
- Brotli: ON

Caching → Configuration:
- Caching Level: Standard
- Browser Cache TTL: 4 hours
```

**Page Rules (Speed → Page Rules):**

```
1. seudominio.com/api/*
   - Cache Level: Bypass
   - Security Level: High

2. seudominio.com/_next/static/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 month

3. seudominio.com/*
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours
```

---

## 📊 MONITORAMENTO E LOGS

### Passo 1: Configurar Log Rotation

```bash
sudo nano /etc/logrotate.d/nginx-custom
```

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi \
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1
    endscript
}
```

```bash
sudo nano /etc/logrotate.d/app-logs
```

```
/home/deploy/app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 deploy deploy
    copytruncate
}
```

### Passo 2: Script de Monitoramento

```bash
nano ~/app/scripts/monitor.sh
```

```bash
#!/bin/bash

LOG_FILE="/home/deploy/app/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting system monitoring..." >> $LOG_FILE

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "[$DATE] WARNING: Memory usage is ${MEMORY_USAGE}%" >> $LOG_FILE
fi

# Check services
SERVICES=("nginx" "docker" "mongodb" "redis")
for service in "${SERVICES[@]}"; do
    if ! systemctl is-active --quiet $service; then
        echo "[$DATE] ERROR: $service is not running!" >> $LOG_FILE
    fi
done

# Check application health
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ "$HEALTH_CHECK" != "200" ]; then
    echo "[$DATE] ERROR: Application health check failed (HTTP: $HEALTH_CHECK)" >> $LOG_FILE
fi

# Check PM2 processes
PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="enciclopedia-musical-prod") | .pm2_env.status')
if [ "$PM2_STATUS" != "online" ]; then
    echo "[$DATE] ERROR: PM2 production process is $PM2_STATUS" >> $LOG_FILE
fi

echo "[$DATE] Monitoring completed." >> $LOG_FILE
```

```bash
chmod +x ~/app/scripts/monitor.sh

# Adicionar ao crontab
crontab -e
```

**Adicionar ao crontab:**

```
# Monitoring every 5 minutes
*/5 * * * * /home/deploy/app/scripts/monitor.sh

# Log rotation check daily
0 1 * * * /usr/sbin/logrotate /etc/logrotate.conf
```

### Passo 3: Dashboard de Monitoramento Simples

```bash
nano ~/app/scripts/status.sh
```

```bash
#!/bin/bash

clear
echo "=================================================="
echo "           SYSTEM STATUS DASHBOARD"
echo "=================================================="
echo "Date: $(date)"
echo ""

# System Info
echo "🖥️  SYSTEM INFO:"
echo "Uptime: $(uptime -p)"
echo "Load: $(cat /proc/loadavg | cut -d' ' -f1-3)"
echo ""

# Disk Usage
echo "💾 DISK USAGE:"
df -h / | tail -1 | awk '{print "Root: " $3 "/" $2 " (" $5 " used)"}'
df -h /home | tail -1 | awk '{print "Home: " $3 "/" $2 " (" $5 " used)"}'
echo ""

# Memory Usage
echo "🧠 MEMORY USAGE:"
free -h | grep Mem | awk '{print "Memory: " $3 "/" $2 " (" $3/$2*100 "% used)"}'
echo ""

# Services Status
echo "🔧 SERVICES STATUS:"
services=("nginx" "docker" "fail2ban")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✅ $service: Running"
    else
        echo "❌ $service: Stopped"
    fi
done
echo ""

# Docker Containers
echo "🐳 DOCKER CONTAINERS:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# PM2 Processes
echo "⚡ PM2 PROCESSES:"
pm2 status
echo ""

# Recent Errors (last 10)
echo "🚨 RECENT ERRORS (Last 10):"
tail -10 /var/log/nginx/enciclopedia-musical.error.log 2>/dev/null || echo "No recent errors"
echo ""

# Application Health
echo "🏥 APPLICATION HEALTH:"
HEALTH=$(curl -s http://localhost:3000/health | jq -r '.status' 2>/dev/null || echo "unreachable")
echo "Production: $HEALTH"

HEALTH_DEV=$(curl -s http://localhost:3001/health | jq -r '.status' 2>/dev/null || echo "unreachable")
echo "Development: $HEALTH_DEV"
```

```bash
chmod +x ~/app/scripts/status.sh

# Criar alias para facilitar
echo "alias status='~/app/scripts/status.sh'" >> ~/.bashrc
source ~/.bashrc
```

---

## 💾 BACKUP AUTOMÁTICO

### Passo 1: Script de Backup do MongoDB

```bash
nano ~/app/scripts/backup-mongodb.sh
```

```bash
#!/bin/bash

set -e

# Configuration
BACKUP_DIR="/home/deploy/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
LOG_FILE="/home/deploy/app/logs/backup.log"

# MongoDB configuration
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_USER="admin"
MONGO_PASS=$(grep MONGO_ROOT_PASSWORD /home/deploy/app/.env | cut -d'=' -f2)
MONGO_DB="enciclopedia_musical"

echo "$(date): Starting MongoDB backup..." >> $LOG_FILE

# Create backup directory
mkdir -p $BACKUP_DIR/mongodb

# Perform backup
BACKUP_PATH="$BACKUP_DIR/mongodb/backup_${DATE}"
docker exec mongodb mongodump \
    --host $MONGO_HOST:$MONGO_PORT \
    --username $MONGO_USER \
    --password $MONGO_PASS \
    --db $MONGO_DB \
    --authenticationDatabase admin \
    --out /data/db/backups/

# Move backup from container to host
docker cp mongodb:/data/db/backups/$MONGO_DB $BACKUP_PATH

# Compress backup
tar -czf "${BACKUP_PATH}.tar.gz" -C $BACKUP_DIR/mongodb $(basename $BACKUP_PATH)
rm -rf $BACKUP_PATH

# Remove old backups
find $BACKUP_DIR/mongodb -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Log backup completion
BACKUP_SIZE=$(du -h "${BACKUP_PATH}.tar.gz" | cut -f1)
echo "$(date): MongoDB backup completed. Size: $BACKUP_SIZE" >> $LOG_FILE

# Verify backup
if [ -f "${BACKUP_PATH}.tar.gz" ]; then
    echo "$(date): Backup verification successful" >> $LOG_FILE
else
    echo "$(date): ERROR: Backup verification failed!" >> $LOG_FILE
    exit 1
fi
```

### Passo 2: Script de Backup Completo da VPS

```bash
nano ~/app/scripts/backup-system.sh
```

```bash
#!/bin/bash

set -e

# Configuration
BACKUP_DIR="/home/deploy/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/home/deploy/app/logs/backup.log"

echo "$(date): Starting full system backup..." >> $LOG_FILE

# Create backup directories
mkdir -p $BACKUP_DIR/{system,configs,app}

# Backup important system configs
echo "$(date): Backing up system configurations..." >> $LOG_FILE
sudo tar -czf "$BACKUP_DIR/system/configs_${DATE}.tar.gz" \
    /etc/nginx/ \
    /etc/ssl/certs/ \
    /etc/letsencrypt/ \
    /etc/crontab \
    /etc/logrotate.d/ \
    /etc/fail2ban/ \
    2>/dev/null || true

# Backup application files
echo "$(date): Backing up application files..." >> $LOG_FILE
tar -czf "$BACKUP_DIR/app/app_${DATE}.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='logs' \
    --exclude='backups' \
    /home/deploy/app/

# Backup Docker volumes
echo "$(date): Backing up Docker volumes..." >> $LOG_FILE
docker run --rm \
    -v mongodb_data:/data \
    -v $BACKUP_DIR:/backup \
    alpine tar -czf /backup/system/mongodb_data_${DATE}.tar.gz -C /data .

# Database backup
echo "$(date): Running database backup..." >> $LOG_FILE
/home/deploy/app/scripts/backup-mongodb.sh

# Cleanup old backups
find $BACKUP_DIR/system -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR/app -name "*.tar.gz" -mtime +7 -delete

echo "$(date): Full system backup completed!" >> $LOG_FILE
```

### Passo 3: Script de Restauração

```bash
nano ~/app/scripts/restore.sh
```

```bash
#!/bin/bash

BACKUP_FILE=$1
RESTORE_TYPE=$2

if [ -z "$BACKUP_FILE" ] || [ -z "$RESTORE_TYPE" ]; then
    echo "Usage: $0 <backup_file> <mongodb|app|system>"
    exit 1
fi

LOG_FILE="/home/deploy/app/logs/restore.log"
echo "$(date): Starting restore of $RESTORE_TYPE from $BACKUP_FILE..." >> $LOG_FILE

case $RESTORE_TYPE in
    "mongodb")
        # Stop application
        pm2 stop all

        # Extract backup
        TEMP_DIR="/tmp/restore_$(date +%s)"
        mkdir -p $TEMP_DIR
        tar -xzf $BACKUP_FILE -C $TEMP_DIR

        # Restore to MongoDB
        docker exec -i mongodb mongorestore \
            --host localhost:27017 \
            --username admin \
            --password $(grep MONGO_ROOT_PASSWORD /home/deploy/app/.env | cut -d'=' -f2) \
            --authenticationDatabase admin \
            --drop \
            --dir /tmp/restore/

        # Cleanup
        rm -rf $TEMP_DIR

        # Restart application
        pm2 start all
        ;;

    "app")
        # Stop application
        pm2 stop all

        # Backup current app
        mv /home/deploy/app /home/deploy/app.backup.$(date +%s)

        # Extract new app
        mkdir -p /home/deploy/app
        tar -xzf $BACKUP_FILE -C /home/deploy/app --strip-components=3

        # Restore dependencies and restart
        cd /home/deploy/app/prod
        npm ci
        pm2 start all
        ;;

    "system")
        echo "System restore requires manual intervention. Please check the backup contents."
        tar -tzf $BACKUP_FILE
        ;;

    *)
        echo "Unknown restore type: $RESTORE_TYPE"
        exit 1
        ;;
esac

echo "$(date): Restore completed!" >> $LOG_FILE
```

### Passo 4: Automatizar Backups

```bash
chmod +x ~/app/scripts/backup-*.sh ~/app/scripts/restore.sh

# Adicionar ao crontab
crontab -e
```

**Adicionar ao crontab:**

```
# Daily MongoDB backup at 2 AM
0 2 * * * /home/deploy/app/scripts/backup-mongodb.sh

# Weekly full system backup at 3 AM on Sundays
0 3 * * 0 /home/deploy/app/scripts/backup-system.sh

# Monthly offsite backup (you can implement S3/Dropbox upload here)
0 4 1 * * /home/deploy/app/scripts/backup-system.sh && echo "Monthly backup completed"
```

---

## 🔒 SEGURANÇA AVANÇADA

### Passo 1: Configurar Fail2Ban

```bash
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[ssh]
enabled = true
port = 2222
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-badbots]
enabled = true
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2
```

### Passo 2: Filtros Personalizados do Fail2Ban

```bash
sudo nano /etc/fail2ban/filter.d/nginx-req-limit.conf
```

```ini
[Definition]
failregex = limiting requests, excess:.* by zone.*client: <HOST>
ignoreregex =
```

```bash
sudo nano /etc/fail2ban/filter.d/nginx-badbots.conf
```

```ini
[Definition]
failregex = ^<HOST> -.*"(GET|POST).*HTTP.*"(?:444|403|400|401|405)
ignoreregex =
```

### Passo 3: Configurar Firewall Avançado

```bash
# Regras específicas para aplicação
sudo ufw allow from any to any port 80,443 proto tcp

# Rate limiting via iptables
sudo iptables -A INPUT -p tcp --dport 443 -m conntrack --ctstate NEW -m limit --limit 50/minute --limit-burst 20 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j DROP

# Persistir regras
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

### Passo 4: Monitoramento de Segurança

```bash
nano ~/app/scripts/security-check.sh
```

```bash
#!/bin/bash

LOG_FILE="/home/deploy/app/logs/security.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Running security checks..." >> $LOG_FILE

# Check for failed login attempts
FAILED_LOGINS=$(grep "Failed password" /var/log/auth.log | grep "$(date '+%b %d')" | wc -l)
if [ $FAILED_LOGINS -gt 10 ]; then
    echo "[$DATE] WARNING: $FAILED_LOGINS failed login attempts today!" >> $LOG_FILE
fi

# Check for banned IPs
BANNED_IPS=$(sudo fail2ban-client status ssh | grep "Banned IP list" | wc -w)
if [ $BANNED_IPS -gt 2 ]; then
    echo "[$DATE] INFO: $BANNED_IPS IPs currently banned" >> $LOG_FILE
fi

# Check for unusual network connections
ESTABLISHED_CONNECTIONS=$(netstat -tn | grep ESTABLISHED | wc -l)
if [ $ESTABLISHED_CONNECTIONS -gt 100 ]; then
    echo "[$DATE] WARNING: High number of established connections: $ESTABLISHED_CONNECTIONS" >> $LOG_FILE
fi

# Check for suspicious processes
ps aux | grep -E "(nc|netcat|nmap)" | grep -v grep > /tmp/suspicious_processes
if [ -s /tmp/suspicious_processes ]; then
    echo "[$DATE] WARNING: Suspicious processes detected:" >> $LOG_FILE
    cat /tmp/suspicious_processes >> $LOG_FILE
fi

echo "[$DATE] Security checks completed." >> $LOG_FILE
```

### Passo 5: Ativar Serviços de Segurança

```bash
# Iniciar serviços
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Verificar status
sudo fail2ban-client status

# Adicionar monitoramento de segurança ao cron
crontab -e
```

**Adicionar:**

```
# Security monitoring every hour
0 * * * * /home/deploy/app/scripts/security-check.sh
```

---

## 🔧 TROUBLESHOOTING

### Problemas Comuns e Soluções

#### 1. **Aplicação Não Inicia**

**Sintomas**: PM2 mostra app como "errored" ou "stopped"

**Diagnóstico**:

```bash
# Verificar logs do PM2
pm2 logs enciclopedia-musical-prod

# Verificar se todas as dependências estão instaladas
cd ~/app/prod && npm list

# Verificar variáveis de ambiente
cat ~/app/prod/.env

# Testar build localmente
npm run build
```

**Soluções Comuns**:

- Verificar se o banco de dados está acessível
- Verificar se todas as variáveis de ambiente estão definidas
- Verificar se o Prisma client foi gerado: `npx prisma generate`
- Verificar logs do Docker: `docker compose logs`

#### 2. **Erro de Conexão com Banco de Dados**

**Sintomas**: "Cannot connect to database" ou timeout errors

**Diagnóstico**:

```bash
# Verificar se MongoDB está rodando
docker ps | grep mongodb

# Testar conexão direta
docker exec -it mongodb mongosh -u admin -p

# Verificar logs do MongoDB
docker compose logs mongodb

# Testar conectividade de rede
telnet localhost 27017
```

**Soluções**:

- Reiniciar container MongoDB: `docker compose restart mongodb`
- Verificar firewall: `sudo ufw status`
- Verificar espaço em disco: `df -h`

#### 3. **SSL/HTTPS Não Funciona**

**Sintomas**: "Certificate not valid" ou "Connection not secure"

**Diagnóstico**:

```bash
# Verificar certificados
sudo certbot certificates

# Testar configuração Nginx
sudo nginx -t

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Testar SSL
openssl s_client -connect seudominio.com:443
```

**Soluções**:

- Renovar certificados: `sudo certbot renew`
- Recarregar Nginx: `sudo systemctl reload nginx`
- Verificar DNS no Cloudflare

#### 4. **Deploy Falha no GitHub Actions**

**Sintomas**: Workflow fails ou timeout

**Diagnóstico**:

```bash
# Verificar conectividade SSH
ssh -p 2222 deploy@SEU_IP_DA_VPS

# Verificar logs no servidor
tail -f ~/app/logs/deploy.log

# Verificar permissões
ls -la ~/app/scripts/deploy.sh
```

**Soluções**:

- Verificar chave SSH nos secrets do GitHub
- Verificar se o usuário deploy tem permissões sudo
- Verificar se o repositório é acessível

#### 5. **Performance Lenta**

**Sintomas**: Site carrega devagar

**Diagnóstico**:

```bash
# Verificar uso de recursos
htop

# Verificar logs de aplicação
pm2 logs

# Testar velocidade de resposta
curl -w "@curl-format.txt" -o /dev/null -s https://seudominio.com
```

**Criar arquivo curl-format.txt**:

```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

**Soluções**:

- Verificar se Redis está funcionando
- Otimizar queries do banco de dados
- Verificar se Cloudflare está configurado corretamente

### Scripts de Emergência

#### Script de Restart Completo

```bash
nano ~/app/scripts/emergency-restart.sh
```

```bash
#!/bin/bash

echo "🚨 EMERGENCY RESTART INITIATED"

# Stop all services
pm2 stop all
sudo systemctl stop nginx
docker compose down

# Wait a bit
sleep 10

# Start everything back up
docker compose up -d
sudo systemctl start nginx
pm2 start all

# Check status
echo "🔍 Checking services..."
sudo systemctl status nginx
docker compose ps
pm2 status

echo "✅ Emergency restart completed"
```

#### Script de Diagnóstico Rápido

```bash
nano ~/app/scripts/quick-diagnosis.sh
```

```bash
#!/bin/bash

echo "🔍 QUICK SYSTEM DIAGNOSIS"
echo "========================"

echo "📊 System Resources:"
free -h
df -h /

echo "🔧 Services Status:"
sudo systemctl is-active nginx
docker compose ps

echo "⚡ PM2 Status:"
pm2 status

echo "🌐 Network Connectivity:"
curl -I http://localhost:3000/health
curl -I https://seudominio.com

echo "📋 Recent Errors:"
tail -5 /var/log/nginx/error.log
pm2 logs --lines 5

echo "🏁 Diagnosis completed"
```

---

## 📚 COMANDOS ÚTEIS

### Gerenciamento do Sistema

```bash
# Status geral do sistema
~/app/scripts/status.sh

# Reiniciar aplicação
pm2 restart all

# Ver logs em tempo real
pm2 logs --lines 50

# Reiniciar Nginx
sudo systemctl reload nginx

# Verificar certificados SSL
sudo certbot certificates

# Renovar SSL manualmente
sudo certbot renew

# Backup manual
~/app/scripts/backup-mongodb.sh

# Verificar espaço em disco
df -h

# Monitorar recursos
htop

# Ver logs do sistema
journalctl -f
```

### Docker e Banco de Dados

```bash
# Restart completo dos containers
docker compose restart

# Ver logs do MongoDB
docker compose logs -f mongodb

# Conectar ao MongoDB
docker exec -it mongodb mongosh -u admin -p

# Backup manual do banco
docker exec mongodb mongodump --out /data/db/backup

# Verificar volumes Docker
docker volume ls
```

### Debugging

```bash
# Testar aplicação localmente
curl http://localhost:3000/health

# Verificar conexões de rede
netstat -tulpn | grep :3000

# Ver processos Node.js
ps aux | grep node

# Limpar logs antigos
sudo find /var/log -name "*.log" -mtime +30 -delete

# Verificar uso de memória por processo
ps aux --sort=-%mem | head
```

### GitHub Actions & Deploy

```bash
# Forçar deploy manual
git push origin main --force-with-lease

# Ver último commit deployado
cd ~/app/prod && git log -1

# Reverter para commit anterior
cd ~/app/prod && git reset --hard HEAD~1 && pm2 restart all

# Verificar branches
cd ~/app/prod && git branch -a
```

---

## 🎉 FINALIZAÇÃO

### Checklist Final

- [ ] ✅ VPS configurada e segura
- [ ] ✅ Domínio apontando para VPS
- [ ] ✅ SSL funcionando (Let's Encrypt)
- [ ] ✅ Cloudflare configurado
- [ ] ✅ MongoDB rodando
- [ ] ✅ Redis funcionando
- [ ] ✅ Nginx proxy reverso configurado
- [ ] ✅ PM2 gerenciando aplicação
- [ ] ✅ GitHub Actions CI/CD funcionando
- [ ] ✅ Backup automático configurado
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Logs rotacionando
- [ ] ✅ Firewall e segurança configurados

### URLs Finais

- **Produção**: https://seudominio.com
- **Desenvolvimento**: https://dev.seudominio.com
- **Health Check**: https://seudominio.com/health

### Próximos Passos Recomendados

1. **Configure alertas via email/Discord** para monitoramento
2. **Implemente cache Redis** nas suas API routes
3. **Configure CDN** para assets estáticos
4. **Adicione testes automatizados** no pipeline
5. **Configure backup offsite** (S3, Dropbox)
6. **Monitore performance** com ferramentas como New Relic
7. **Implemente rate limiting** mais avançado nas APIs

### Manutenção Regular

- **Diário**: Verificar status com `status` command
- **Semanal**: Revisar logs de segurança e performance
- **Mensal**: Atualizar dependências e fazer backup completo
- **Trimestral**: Revisar e otimizar configurações

---

**🎊 PARABÉNS!** Sua infraestrutura está completa e pronta para produção! Esta arquitetura suporta crescimento e é facilmente escalável conforme sua aplicação evoluir.

**💡 Dica Final**: Mantenha este documento atualizado conforme você faz modificações na infraestrutura. É sua documentação viva do sistema!
