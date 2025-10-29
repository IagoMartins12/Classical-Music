# Deploy Completo em Produção - Opus Atlas

Este guia cobre o deploy completo do Opus Atlas em produção, incluindo infraestrutura VPS, Docker, Nginx, SSL, monitoramento e segurança enterprise.

## Especificações de Infraestrutura

### Servidor Recomendado

- **RAM**: 8GB (mínimo 4GB)
- **CPU**: 2 vCPUs
- **Storage**: 100GB NVMe SSD
- **Transfer**: 8TB/mês
- **OS**: Ubuntu 24.04.3 LTS

### Arquitetura de Produção

```
🌍 INTERNET
    │
┌───▼───┐
│CLOUDFLARE│
│CDN + DDoS│
└───┬───┘
    │
┌───▼───────────┐
│  VPS UBUNTU   │
│ 8GB | 2 vCPUs │
└───┬───────────┘
    │
┌───▼───┐
│ NGINX │
│SSL+Proxy│
└─┬─────┘
  │
┌─▼──────┐ ┌────────┐
│PROD APP│ │MONITOR │
│MongoDB │ │Grafana │
│Redis   │ │Prometheus│
└────────┘ └────────┘
```

---

## 1. Preparação do Servidor

### 1.1 Acesso Inicial

```bash
# Conectar ao servidor (substituir pelo seu IP)
ssh root@SEU_IP

# Atualizar sistema
apt update && apt upgrade -y

# Instalar pacotes essenciais
apt install -y curl wget git vim nano htop ufw fail2ban
```

### 1.2 Criar Usuário de Deploy

```bash
# Criar usuário
useradd -m -s /bin/bash opusatlas
usermod -aG sudo opusatlas

# Configurar SSH
mkdir -p /home/opusatlas/.ssh
chmod 700 /home/opusatlas/.ssh
chown opusatlas:opusatlas /home/opusatlas/.ssh

# Copiar chave SSH (do seu computador local)
ssh-copy-id opusatlas@SEU_IP

# Testar acesso
ssh opusatlas@SEU_IP
```

### 1.3 Hardening de Segurança

```bash
# Configurar SSH (/etc/ssh/sshd_config)
sudo nano /etc/ssh/sshd_config

# Aplicar configurações:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers opusatlas
Port 22
Protocol 2
MaxAuthTries 3

# Reiniciar SSH
sudo systemctl restart ssh

# Configurar Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw limit 22/tcp comment 'SSH with rate limiting'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable

# Configurar Fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 2. Instalação de Dependências

### 2.1 Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker opusatlas

# Reiniciar sessão
exit
ssh opusatlas@SEU_IP

# Testar Docker
docker --version
docker run hello-world
```

### 2.2 Docker Compose

```bash
# Instalar Docker Compose
sudo apt install -y docker-compose-plugin

# Verificar instalação
docker compose version
```

### 2.3 Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Iniciar e habilitar
sudo systemctl start nginx
sudo systemctl enable nginx

# Testar
curl http://localhost
```

### 2.4 Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Verificar instalação
certbot --version
```

---

## 3. Estrutura de Diretórios

### 3.1 Criar Estrutura

```bash
# Criar diretório principal
sudo mkdir -p /opt/opus-atlas
sudo chown opusatlas:opusatlas /opt/opus-atlas
cd /opt/opus-atlas

# Estrutura completa
mkdir -p {nginx/conf.d,mongodb,monitoring/{grafana,prometheus},logs/{nginx,mongodb,app-prod,monitoring},backups,scripts,certbot-webroot}
```

### 3.2 Clonar Código

```bash
# Clonar repositório
cd /opt/opus-atlas
git clone https://github.com/IagoMartins12/Classical-Music.git app-source/Classical-Music

# Configurar Git para pulls automáticos
cd app-source/Classical-Music
git config pull.rebase false
```

---

## 4. Configuração DNS e Cloudflare

### 4.1 Configuração DNS

No painel do Cloudflare:

```
Tipo  Nome      Conteúdo        Proxy    TTL
A     @         SEU_IP         ✅       Auto
A     www       SEU_IP         ✅       Auto
A     monitor   SEU_IP         ✅       Auto
A     analytics SEU_IP         ✅       Auto
```

### 4.2 Configurações Cloudflare

**SSL/TLS:**

- Encryption: Full (strict)
- Always Use HTTPS: On
- HSTS: Enabled

**Speed:**

- Auto Minify: CSS, JS, HTML
- Brotli: On
- HTTP/3: On

**Security:**

- Security Level: Medium
- Bot Fight Mode: On

---

## 5. Configuração Docker Compose

### 5.1 Docker Compose Principal

Criar `/opt/opus-atlas/docker-compose.yml`:

```yaml
services:
  # ==========================================
  # PRODUÇÃO
  # ==========================================
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
      - ./mongodb/keyfile:/etc/mongodb-keyfile:ro
    command: ['mongod', '--config', '/etc/mongod.conf', '--replSet', 'rs0']
    networks:
      - opus-atlas-network
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  redis:
    image: redis:7.2-alpine
    container_name: opus-atlas-redis
    restart: unless-stopped
    command: redis-server --requirepass SenhaSuperSeguraRedis! --appendonly yes --appendfsync everysec
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - opus-atlas-network
    deploy:
      resources:
        limits:
          memory: 200M

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
        reservations:
          memory: 512M
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 90s

  # ==========================================
  # NGINX REVERSE PROXY
  # ==========================================
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
      - ./nginx/.htpasswd:/etc/nginx/.htpasswd:ro
      - ./nginx/html:/usr/share/nginx/html:ro
      - ./logs/nginx:/var/log/nginx
      - nginx_cache:/var/cache/nginx
      - ./certbot-webroot:/var/www/certbot:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    networks:
      - opus-atlas-network
    depends_on:
      - app-prod

  # ==========================================
  # MONITORAMENTO
  # ==========================================
  prometheus:
    image: prom/prometheus:v2.48.0
    container_name: opus-atlas-prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--storage.tsdb.retention.size=2GB'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - '9090:9090'
    networks:
      - opus-atlas-network
    deploy:
      resources:
        limits:
          memory: 200M
        reservations:
          memory: 100M

  grafana:
    image: grafana/grafana:10.2.2
    container_name: opus-atlas-grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=SenhaMonitorMonitor
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=https://monitor.opusatlas.com.br/grafana/
      - GF_SERVER_SERVE_FROM_SUB_PATH=true
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
      - ./monitoring/grafana/dashboards:/etc/grafana/dashboards:ro
    ports:
      - '3003:3000'
    networks:
      - opus-atlas-network
    deploy:
      resources:
        limits:
          memory: 200M

  node-exporter:
    image: prom/node-exporter:v1.7.0
    container_name: opus-atlas-node-exporter
    restart: unless-stopped
    ports:
      - '9100:9100'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($|/)'
    networks:
      - opus-atlas-network

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.49.1
    container_name: opus-atlas-cadvisor
    restart: unless-stopped
    ports:
      - '8080:8080'
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker:/var/lib/docker:ro
      - /dev/disk:/dev/disk:ro
    privileged: true
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

  mongo-express:
    image: mongo-express:1.0.2
    container_name: opus-atlas-mongo-express
    restart: unless-stopped
    ports:
      - '8081:8081'
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: opusatlas
      ME_CONFIG_MONGODB_ADMINPASSWORD: SenhaSuperSegura!
      ME_CONFIG_MONGODB_URL: mongodb://opusatlas:SenhaSuperSegura!@opus-atlas-mongodb-prod:27017/
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: SenhaMonitorMonitor
    depends_on:
      - mongodb-prod
    networks:
      - opus-atlas-network

networks:
  opus-atlas-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  mongodb_data:
  redis_data:
  prometheus_data:
  grafana_data:
  uptime-kuma-data:
  nginx_cache:
```

### 5.2 Variáveis de Ambiente

Criar `/opt/opus-atlas/.env.production`:

```env
# =============================================================================
# OPUS ATLAS - PRODUÇÃO
# =============================================================================

NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# =============================================================================
# DATABASE
# =============================================================================
DATABASE_URL="mongodb://opusatlas:SenhaSuperSegura!@opus-atlas-mongodb-prod:27017/opus_atlas_prod?authSource=admin&replicaSet=rs0"

# =============================================================================
# REDIS
# =============================================================================
REDIS_URL="redis://:SenhaSuperSeguraRedis!@opus-atlas-redis:6379"

# =============================================================================
# NEXTAUTH.JS
# =============================================================================
NEXTAUTH_URL="https://opusatlas.com.br"
NEXTAUTH_SECRET="super-secret-production-key-change-this-in-prod-2024"

# =============================================================================
# GOOGLE SERVICES
# =============================================================================
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-client-secret"
YOUTUBE_API_KEY="AIzaSyYour-YouTube-API-Key"

# =============================================================================
# SPOTIFY API
# =============================================================================
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"

# =============================================================================
# AI SERVICES
# =============================================================================
OPENAI_API_KEY="sk-proj-your-openai-api-key"
GROQ_API_KEY="gsk_your-groq-api-key"

# =============================================================================
# EMAIL SMTP
# =============================================================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="opusatlas@gmail.com"
SMTP_PASS="your-gmail-app-password"

# =============================================================================
# CLOUDINARY
# =============================================================================
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
CLOUDINARY_UPLOAD_PRESET="musical-encyclopedia"

# =============================================================================
# BACKUP E MANUTENÇÃO
# =============================================================================
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE_ENABLED=true
BACKUP_SCHEDULE_CRON="0 2 * * *"
```

---

## 6. Configuração MongoDB

### 6.1 MongoDB Config

Criar `/opt/opus-atlas/mongodb/mongod.conf`:

```yaml
# Storage
storage:
  dbPath: /data/db
  journal:
    enabled: true
  engine: wiredTiger
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1.5

# Network
net:
  port: 27017
  bindIp: 0.0.0.0

# Security
security:
  authorization: enabled
  keyFile: /etc/mongodb-keyfile/mongodb-keyfile

# Replication
replication:
  replSetName: rs0

# Logging
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  logRotate: reopen

# Process Management
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
```

### 6.2 Replica Set Key

```bash
# Criar keyfile para replica set
mkdir -p /opt/opus-atlas/mongodb/keyfile
openssl rand -base64 756 > /opt/opus-atlas/mongodb/keyfile/mongodb-keyfile
chmod 400 /opt/opus-atlas/mongodb/keyfile/mongodb-keyfile
sudo chown 999:999 /opt/opus-atlas/mongodb/keyfile/mongodb-keyfile
```

---

## 7. Configuração Nginx

### 7.1 Nginx Principal

Criar `/opt/opus-atlas/nginx/nginx.conf`:

```nginx
user nginx;
worker_processes auto;
worker_rlimit_nofile 65535;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=50r/s;
    limit_conn_zone $binary_remote_addr zone=perip:10m;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    server_tokens off;

    include /etc/nginx/conf.d/*.conf;
}
```

### 7.2 Virtual Host Principal

Criar `/opt/opus-atlas/nginx/conf.d/prod.conf`:

```nginx
# HTTP → HTTPS Redirect
server {
    listen 80;
    server_name opusatlas.com.br www.opusatlas.com.br;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Production
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name opusatlas.com.br www.opusatlas.com.br;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/opusatlas.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/opusatlas.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Next.js Static Assets
    location /_next/static/ {
        proxy_pass http://opus-atlas-app-prod:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API Routes
    location /api/ {
        proxy_pass http://opus-atlas-app-prod:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        limit_req zone=general burst=20 nodelay;
        limit_conn perip 20;
    }

    # Main Application
    location / {
        proxy_pass http://opus-atlas-app-prod:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        limit_req zone=general burst=20 nodelay;
        limit_conn perip 20;
    }

    # Health Check
    location /health {
        return 200 "nginx-prod-https-ok";
        add_header Content-Type text/plain;
        access_log off;
    }
}
```

### 7.3 Virtual Host Monitoramento

Criar `/opt/opus-atlas/nginx/conf.d/monitor.conf`:

```nginx
server {
    listen 80;
    server_name monitor.opusatlas.com.br;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name monitor.opusatlas.com.br;

    ssl_certificate /etc/letsencrypt/live/opusatlas.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/opusatlas.com.br/privkey.pem;

    # Basic Auth para todas as rotas
    auth_basic "Opus Atlas - Monitoring Dashboard";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # Landing Page
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy para serviços (redirecionamento direto)
    location /grafana {
        return 301 https://monitor.opusatlas.com.br:3003/;
    }

    location /prometheus {
        return 301 https://monitor.opusatlas.com.br:9090/;
    }

    location /uptime {
        return 301 https://monitor.opusatlas.com.br:3002/;
    }

    location /mongo {
        return 301 https://monitor.opusatlas.com.br:8081/;
    }
}
```

### 7.4 Basic Auth

```bash
# Criar usuário para monitoramento
sudo apt install -y apache2-utils
htpasswd -c /opt/opus-atlas/nginx/.htpasswd admin
# Senha: SenhaMonitorMonitor
```

---

## 8. SSL/TLS Configuration

### 8.1 Obter Certificados

```bash
# Parar nginx temporariamente
docker compose down nginx 2>/dev/null || true

# Obter certificados para todos os domínios
sudo docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --agree-tos \
  --email opusatlas@gmail.com \
  --domains opusatlas.com.br,www.opusatlas.com.br,monitor.opusatlas.com.br

# Verificar certificados
sudo ls -la /etc/letsencrypt/live/opusatlas.com.br/
```

### 8.2 Auto-renewal

```bash
# Criar script de renovação
cat > /opt/opus-atlas/scripts/ssl-renew.sh << 'EOF'
#!/bin/bash

LOG_FILE="/opt/opus-atlas/logs/ssl-renewal.log"
echo "$(date): Starting SSL renewal check" >> $LOG_FILE

# Renovar certificados
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot renew >> $LOG_FILE 2>&1

# Reload nginx se certificados foram renovados
if [ $? -eq 0 ]; then
    echo "$(date): SSL renewal successful, reloading nginx" >> $LOG_FILE
    cd /opt/opus-atlas
    docker compose exec nginx nginx -s reload
else
    echo "$(date): SSL renewal failed" >> $LOG_FILE
fi
EOF

chmod +x /opt/opus-atlas/scripts/ssl-renew.sh

# Adicionar ao cron (primeiro dia do mês)
crontab -e
0 1 1 * * /opt/opus-atlas/scripts/ssl-renew.sh
```

---

## 9. Deploy da Aplicação

### 9.1 Build e Deploy Inicial

```bash
cd /opt/opus-atlas

# Subir infraestrutura base
docker compose up -d mongodb-prod redis

# Aguardar MongoDB iniciar
sleep 30

# Inicializar replica set
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'opus-atlas-mongodb-prod:27017'}]})"

# Build aplicação
docker compose build app-prod

# Deploy aplicação
docker compose up -d app-prod

# Deploy nginx
docker compose up -d nginx

# Deploy monitoramento
docker compose up -d prometheus grafana node-exporter cadvisor uptime-kuma mongo-express
```

### 9.2 Verificar Deploy

```bash
# Status dos containers
docker compose ps

# Logs da aplicação
docker compose logs -f app-prod --tail 50

# Testar conectividade
curl -I http://localhost:3000/api/health
curl -I https://opusatlas.com.br/api/health

# Verificar MongoDB
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --eval "rs.status()"
```

---

## 10. Scripts de Automação

### 10.1 Backup Automático

Criar `/opt/opus-atlas/scripts/mongodb-backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/opus-atlas/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="opus_atlas_${DATE}"
RETENTION_DAYS=7

# Criar diretório se não existir
mkdir -p ${BACKUP_DIR}

echo "$(date): Starting MongoDB backup - ${BACKUP_NAME}" >> ${BACKUP_DIR}/backup.log

# Criar backup
docker exec opus-atlas-mongodb-prod mongodump \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --db opus_atlas_prod \
  --gzip \
  --out /data/backup_${DATE} >> ${BACKUP_DIR}/backup.log 2>&1

# Copiar para host
docker cp opus-atlas-mongodb-prod:/data/backup_${DATE} ${BACKUP_DIR}/

# Comprimir
tar -czf ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz -C ${BACKUP_DIR} backup_${DATE}
rm -rf ${BACKUP_DIR}/backup_${DATE}

# Remover backups antigos
find ${BACKUP_DIR} -name "opus_atlas_*.tar.gz" -mtime +${RETENTION_DAYS} -delete

# Log final
BACKUP_SIZE=$(du -h ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz | cut -f1)
echo "$(date): Backup completed - ${BACKUP_NAME}.tar.gz (${BACKUP_SIZE})" >> ${BACKUP_DIR}/backup.log

# Limpar backup temporário do container
docker exec opus-atlas-mongodb-prod rm -rf /data/backup_${DATE}
```

### 10.2 Docker Cleanup

Criar `/opt/opus-atlas/scripts/docker-cleanup.sh`:

```bash
#!/bin/bash

LOG_FILE="/opt/opus-atlas/logs/maintenance.log"
echo "$(date): Starting Docker cleanup" >> $LOG_FILE

# Remove containers parados
docker container prune -f >> $LOG_FILE 2>&1

# Remove images não utilizadas
docker image prune -f >> $LOG_FILE 2>&1

# Remove volumes não utilizados
docker volume prune -f >> $LOG_FILE 2>&1

# Remove networks não utilizadas
docker network prune -f >> $LOG_FILE 2>&1

# Log space saved
echo "Docker system df after cleanup:" >> $LOG_FILE
docker system df >> $LOG_FILE

echo "$(date): Docker cleanup completed" >> $LOG_FILE
```

### 10.3 Health Check

Criar `/opt/opus-atlas/scripts/health-check.sh`:

```bash
#!/bin/bash

# Configurações
ALERT_EMAIL="opusatlas@gmail.com"
LOG_FILE="/opt/opus-atlas/logs/health-check.log"

echo "$(date): Starting health check" >> $LOG_FILE

# Verificar containers
FAILED_CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -v "Up" | wc -l)

# Verificar uso de disco
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

# Verificar uso de memória
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')

# Verificar aplicação
APP_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)

# Verificar expiração SSL
SSL_DAYS=$(openssl x509 -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem -noout -dates | grep notAfter | cut -d= -f2 | xargs -I {} date -d {} +%s)
CURRENT_DATE=$(date +%s)
DAYS_LEFT=$(( (SSL_DAYS - CURRENT_DATE) / 86400 ))

# Alertas
ALERT=""
if [ $FAILED_CONTAINERS -gt 1 ]; then
    ALERT="$ALERT\n- Failed containers: $FAILED_CONTAINERS"
fi

if [ $DISK_USAGE -gt 85 ]; then
    ALERT="$ALERT\n- Disk usage: $DISK_USAGE%"
fi

if [ $MEM_USAGE -gt 90 ]; then
    ALERT="$ALERT\n- Memory usage: $MEM_USAGE%"
fi

if [ "$APP_HEALTH" != "200" ]; then
    ALERT="$ALERT\n- Application health check failed: $APP_HEALTH"
fi

if [ $DAYS_LEFT -lt 7 ]; then
    ALERT="$ALERT\n- SSL certificate expires in $DAYS_LEFT days"
fi

# Enviar alerta se necessário
if [ ! -z "$ALERT" ]; then
    SUBJECT="OPUS ATLAS - Health Alert"
    MESSAGE="Health check detected issues:\n$ALERT"

    echo -e "$MESSAGE" | mail -s "$SUBJECT" $ALERT_EMAIL
    echo "$(date): ALERT sent - $ALERT" >> $LOG_FILE
else
    echo "$(date): All checks passed" >> $LOG_FILE
fi
```

### 10.4 Cron Jobs

```bash
# Configurar cron jobs
crontab -e

# Adicionar:
# Backup diário às 2:00 AM
0 2 * * * /opt/opus-atlas/scripts/mongodb-backup.sh

# Docker cleanup semanal (domingo 3:00 AM)
0 3 * * 0 /opt/opus-atlas/scripts/docker-cleanup.sh

# Health check a cada 30 minutos
*/30 * * * * /opt/opus-atlas/scripts/health-check.sh

# SSL renewal check mensal
0 1 1 * * /opt/opus-atlas/scripts/ssl-renew.sh
```

---

## 11. Configuração de Monitoramento

### 11.1 Prometheus

Criar `/opt/opus-atlas/monitoring/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'opus-atlas-monitor'

rule_files: []

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['opus-atlas-node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['opus-atlas-cadvisor:8080']

  - job_name: 'app-prod'
    static_configs:
      - targets: ['opus-atlas-app-prod:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

storage:
  tsdb:
    retention.time: 30d
    retention.size: 2GB
```

### 11.2 Grafana Provisioning

Criar estrutura:

```bash
mkdir -p /opt/opus-atlas/monitoring/grafana/{provisioning,dashboards}
```

---

## 12. Verificação Final

### 12.1 Checklist de Deploy

```bash
# ✅ Containers rodando
docker compose ps

# ✅ Aplicação respondendo
curl https://opusatlas.com.br/api/health

# ✅ SSL funcionando
openssl s_client -connect opusatlas.com.br:443 -servername opusatlas.com.br < /dev/null

# ✅ MongoDB replica set
docker exec opus-atlas-mongodb-prod mongosh --eval "rs.status()" --quiet

# ✅ Monitoramento acessível
curl https://monitor.opusatlas.com.br:3003/api/health

# ✅ Logs sendo gerados
ls -la /opt/opus-atlas/logs/
```

### 12.2 URLs de Produção

- **Aplicação**: https://opusatlas.com.br
- **Monitoramento**: https://monitor.opusatlas.com.br
- **Grafana**: https://monitor.opusatlas.com.br:3003
- **Prometheus**: https://monitor.opusatlas.com.br:9090
- **Uptime Kuma**: https://monitor.opusatlas.com.br:3002
- **MongoDB Express**: https://monitor.opusatlas.com.br:8081

### 12.3 Credenciais de Produção

```bash
# SSH
Host: SEU_IP
User: opusatlas
Auth: SSH Key

# MongoDB
User: opusatlas
Pass: SenhaSuperSegura!

# Redis
Pass: SenhaSuperSeguraRedis!

# Monitoring Basic Auth
User: admin
Pass: SenhaMonitorMonitor

# Grafana
User: admin
Pass: SenhaMonitorMonitor
```

---

## 13. Manutenção Contínua

### 13.1 Deploy de Atualizações

```bash
# Deploy manual via SSH
cd /opt/opus-atlas/app-source/Classical-Music
git pull origin main
cd /opt/opus-atlas
docker compose build --no-cache app-prod
docker compose up -d app-prod

# Verificar deploy
curl https://opusatlas.com.br/api/health
```

### 13.2 Rollback

```bash
# Rollback para commit anterior
cd /opt/opus-atlas/app-source/Classical-Music
git checkout HEAD~1
cd /opt/opus-atlas
docker compose build --no-cache app-prod
docker compose up -d app-prod
```

### 13.3 Logs

```bash
# Logs em tempo real
docker compose logs -f app-prod

# Logs nginx
docker compose logs nginx --tail 100

# Logs sistema
journalctl -u docker -f
```

---

**Deploy concluído com sucesso! 🚀**

Sua aplicação está rodando em produção com infraestrutura enterprise completa incluindo monitoramento, backup automático, SSL e segurança hardened.
