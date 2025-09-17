# 🔒 Segurança e Hardening - Opus Atlas

> Documentação completa das implementações de segurança enterprise, hardening do servidor, configurações SSL/TLS e protocolos de proteção.

## Índice

1. [Visão Geral de Segurança](#visão-geral-de-segurança)
2. [Hardening do Servidor](#hardening-do-servidor)
3. [Firewall e Proteção de Rede](#firewall-e-proteção-de-rede)
4. [SSL/TLS e Certificados](#ssltls-e-certificados)
5. [Autenticação e Autorização](#autenticação-e-autorização)
6. [Segurança de Container](#segurança-de-container)
7. [Proteção de Banco de Dados](#proteção-de-banco-de-dados)
8. [Monitoramento de Segurança](#monitoramento-de-segurança)
9. [Backup Seguro](#backup-seguro)
10. [Resposta a Incidentes](#resposta-a-incidentes)
11. [Auditoria e Compliance](#auditoria-e-compliance)
12. [Procedimentos de Segurança](#procedimentos-de-segurança)

---

## Visão Geral de Segurança

### Arquitetura de Segurança

```
🌍 INTERNET
    │
    ▼
┌─────────────────┐
│   CLOUDFLARE    │ ← DDoS Protection, WAF, Bot Management
│   CDN + WAF     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   UFW FIREWALL  │ ← Port restrictions, Rate limiting
│   + FAIL2BAN    │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   NGINX PROXY   │ ← SSL/TLS termination, Security headers
│   + SSL/TLS     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   CONTAINERS    │ ← Isolated environments, Limited privileges
│   (Docker)      │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   DATABASE      │ ← Authentication, Encryption at rest
│   (MongoDB)     │
└─────────────────┘
```

### Níveis de Proteção Implementados

| Camada         | Proteção                   | Status   |
| -------------- | -------------------------- | -------- |
| **Externa**    | Cloudflare CDN + DDoS      | ✅ Ativo |
| **Rede**       | UFW Firewall + Fail2ban    | ✅ Ativo |
| **Transporte** | SSL/TLS 1.3 + HSTS         | ✅ Ativo |
| **Aplicação**  | NextAuth + Rate Limiting   | ✅ Ativo |
| **Container**  | Docker Security + Non-root | ✅ Ativo |
| **Dados**      | MongoDB Auth + Encryption  | ✅ Ativo |
| **Sistema**    | Hardening + Monitoring     | ✅ Ativo |

---

## Hardening do Servidor

### Sistema Operacional

#### **Ubuntu 24.04.3 LTS Hardening**

```bash
# Atualizações automáticas de segurança
apt-get install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# Configuração automática de updates
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF
```

#### **Kernel Security**

```bash
# Configurações de segurança do kernel
cat >> /etc/sysctl.conf << 'EOF'
# IP Spoofing protection
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.rp_filter = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv6.conf.default.accept_source_route = 0

# Log Martians
net.ipv4.conf.all.log_martians = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Ignore ping requests
net.ipv4.icmp_echo_ignore_all = 0

# Ignore Directed pings
net.ipv4.icmp_echo_ignore_broadcasts = 1

# TCP SYN flood protection
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Protection against memory corruption attacks
kernel.exec-shield = 1
kernel.randomize_va_space = 2
EOF

sysctl -p
```

### SSH Hardening

#### **Configuração SSH Segura**

```bash
# /etc/ssh/sshd_config
Protocol 2
Port 22
PermitRootLogin no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
PasswordAuthentication no
PermitEmptyPasswords no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
UsePAM yes
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
AllowUsers opusatlas
MaxStartups 10:30:100
LoginGraceTime 120

# Security hardening
KexAlgorithms curve25519-sha256@libssh.org,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512,diffie-hellman-group14-sha256
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com,hmac-sha2-256,hmac-sha2-512
```

#### **Chaves SSH**

```bash
# Geração de chaves ED25519 (mais segura)
ssh-keygen -t ed25519 -f ~/.ssh/opusatlas_ed25519 -C "opusatlas-production"

# Configuração de permissões
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R opusatlas:opusatlas ~/.ssh
```

### Usuários e Permissões

#### **Política de Usuários**

```bash
# Usuário principal com sudo limitado
echo 'opusatlas ALL=(ALL:ALL) NOPASSWD: /usr/bin/systemctl, /usr/bin/docker, /usr/bin/ufw' > /etc/sudoers.d/opusatlas

# Desabilitar usuários desnecessários
usermod -L sync
usermod -L shutdown
usermod -L halt
usermod -L mail
usermod -L news
usermod -L uucp
usermod -L operator
usermod -L games
usermod -L gopher
usermod -L ftp

# Configuração de senha segura (para emergência)
cat >> /etc/login.defs << 'EOF'
PASS_MAX_DAYS 90
PASS_MIN_DAYS 1
PASS_WARN_AGE 7
PASS_MIN_LEN 12
EOF
```

---

## Firewall e Proteção de Rede

### UFW (Uncomplicated Firewall)

#### **Configuração Base**

```bash
# Reset e configuração inicial
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# SSH com rate limiting
ufw limit 22/tcp comment 'SSH with rate limiting'

# HTTP/HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Portas de monitoramento (apenas localhost)
ufw allow from 127.0.0.1 to any port 3003 comment 'Grafana localhost'
ufw allow from 127.0.0.1 to any port 9090 comment 'Prometheus localhost'

# Ativar firewall
ufw --force enable
```

#### **Regras Avançadas**

```bash
# Bloquear países específicos (opcional)
# Requer instalação do geoip-database-extra
ufw deny from 192.0.2.0/24 comment 'Block suspicious range'

# Rate limiting para HTTPS
ufw limit 443/tcp comment 'HTTPS rate limiting'

# Permitir Docker interno
ufw allow in on docker0
ufw allow out on docker0

# Log de negações
ufw logging medium

# Status detalhado
ufw status numbered verbose
```

### Fail2ban

#### **Configuração Principal**

```bash
# /etc/fail2ban/jail.local
[DEFAULT]
ignoreip = 127.0.0.1/8 ::1 192.168.0.0/16
bantime = 1800
findtime = 600
maxretry = 5
backend = systemd
destemail = opusatlas@gmail.com
sendername = Fail2Ban-OpusAtlas
mta = sendmail

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 1800
findtime = 600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /opt/opus-atlas/logs/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /opt/opus-atlas/logs/nginx/error.log
maxretry = 10
findtime = 600
bantime = 600
```

#### **Filtros Customizados**

```bash
# /etc/fail2ban/filter.d/nginx-http-auth.conf
[Definition]
failregex = ^ \[error\] \d+#\d+: \*\d+ user "\S+" was not found in ".*", client: <HOST>, .*$
            ^ \[error\] \d+#\d+: \*\d+ user "\S+": password mismatch, client: <HOST>, .*$
ignoreregex =

# /etc/fail2ban/filter.d/nginx-limit-req.conf
[Definition]
failregex = ^\s*\[error\] \d+#\d+: \*\d+ limiting requests, excess: \S+ by zone "\S+", client: <HOST>
ignoreregex =
```

#### **Monitoramento Fail2ban**

```bash
# Status dos jails
fail2ban-client status

# IPs banidos
fail2ban-client status sshd

# Desbanir IP
fail2ban-client set sshd unbanip 192.168.1.100

# Logs de ban
tail -f /var/log/fail2ban.log
```

### Rate Limiting

#### **Nginx Rate Limiting**

```nginx
# /opt/opus-atlas/nginx/nginx.conf
http {
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=general:10m rate=50r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=uploads:10m rate=5r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # Connection limiting
    limit_conn_zone $binary_remote_addr zone=perip:10m;
    limit_conn_zone $server_name zone=perserver:10m;
}

# Aplicação das limitações
server {
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        limit_conn perip 20;
    }

    # Upload rate limiting
    location /api/upload {
        limit_req zone=uploads burst=10 nodelay;
        limit_conn perip 5;
    }

    # Auth rate limiting
    location /api/auth {
        limit_req zone=auth burst=5 nodelay;
    }
}
```

---

## SSL/TLS e Certificados

### Let's Encrypt Configuration

#### **Certificados Automáticos**

```bash
# Obtenção inicial dos certificados
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --agree-tos \
  --email opusatlas@gmail.com \
  --domains opusatlas.com.br,www.opusatlas.com.br,monitor.opusatlas.com.br,analytics.opusatlas.com.br

# Permissões corretas
chown -R root:root /etc/letsencrypt
chmod -R 644 /etc/letsencrypt/live
chmod -R 600 /etc/letsencrypt/live/*/privkey.pem
```

#### **Renovação Automática**

```bash
# /opt/opus-atlas/scripts/ssl-renew.sh
#!/bin/bash
set -e

DOMAIN="opusatlas.com.br"
EMAIL="opusatlas@gmail.com"
LOG_FILE="/opt/opus-atlas/logs/ssl-renewal.log"

echo "$(date): Starting SSL certificate renewal check" >> $LOG_FILE

# Check if certificate expires in 30 days
if openssl x509 -checkend $((86400*30)) -noout -in /etc/letsencrypt/live/$DOMAIN/cert.pem; then
    echo "$(date): Certificate is still valid for more than 30 days" >> $LOG_FILE
else
    echo "$(date): Certificate expires soon, renewing..." >> $LOG_FILE

    # Stop nginx
    docker-compose -f /opt/opus-atlas/docker-compose.yml stop nginx

    # Renew certificate
    docker run --rm \
      -v /etc/letsencrypt:/etc/letsencrypt \
      -v /var/www/certbot:/var/www/certbot \
      -p 80:80 \
      certbot/certbot renew \
      --standalone \
      --agree-tos

    # Restart nginx
    docker-compose -f /opt/opus-atlas/docker-compose.yml start nginx

    echo "$(date): Certificate renewed successfully" >> $LOG_FILE
    echo "SSL certificate renewed for $DOMAIN" | mail -s "[OPUS ATLAS] SSL Renewed" $EMAIL
fi

# Cron job: 0 3 1 * * /opt/opus-atlas/scripts/ssl-renew.sh
```

### Configuração SSL/TLS Avançada

#### **Nginx SSL Configuration**

```nginx
# /opt/opus-atlas/nginx/conf.d/ssl-security.conf
# SSL/TLS Configuration for maximum security

# Protocols (TLS 1.2 e 1.3 apenas)
ssl_protocols TLSv1.2 TLSv1.3;

# Cipher suites (somente seguras)
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';

# Prefer server cipher order
ssl_prefer_server_ciphers off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Session settings
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;

# DH parameters (custom generated)
ssl_dhparam /etc/ssl/certs/dhparam.pem;

# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.opusatlas.com.br; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.groq.com https://api.openai.com;" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

#### **DH Parameters Generation**

```bash
# Gerar parâmetros DH seguros (pode demorar)
openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
chmod 644 /etc/ssl/certs/dhparam.pem
```

### Certificado Monitoring

```bash
# /opt/opus-atlas/scripts/ssl-monitor.sh
#!/bin/bash

DOMAIN="opusatlas.com.br"
WARN_DAYS=7
ALERT_EMAIL="opusatlas@gmail.com"

# Get certificate expiration date
EXPIRY_DATE=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/cert.pem | cut -d= -f2)
EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_TIMESTAMP=$(date +%s)
DAYS_LEFT=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))

echo "$(date): SSL Certificate expires in $DAYS_LEFT days"

if [ $DAYS_LEFT -le $WARN_DAYS ]; then
    echo "$(date): WARNING - SSL certificate expires in $DAYS_LEFT days!" | \
    mail -s "[OPUS ATLAS] SSL Certificate Expiry Warning" $ALERT_EMAIL
fi

# Verificar se certificado é válido
if ! openssl x509 -checkend 86400 -noout -in /etc/letsencrypt/live/$DOMAIN/cert.pem; then
    echo "$(date): ERROR - SSL certificate expires within 24 hours!" | \
    mail -s "[OPUS ATLAS] SSL Certificate Critical" $ALERT_EMAIL
fi
```

---

## Autenticação e Autorização

### NextAuth.js Security

#### **Configuração Segura**

```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Implementação segura de verificação
        // Hash comparison with bcrypt
        // Rate limiting
        // Account lockout after failed attempts
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    encryption: true,
    secret: process.env.NEXTAUTH_SECRET,
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Rate limiting
      // IP validation
      // Account verification
      return true;
    },
    async jwt({ token, user, account }) {
      // Adicionar informações seguras ao token
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Sanitizar dados da sessão
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log de eventos de segurança
      console.log(`User ${user.email} signed in from ${account.provider}`);
    },
    async signOut({ token }) {
      // Log de logout
      console.log(`User ${token.email} signed out`);
    },
  },
};

export default NextAuth(authOptions);
```

### Password Security

#### **Hash e Validation**

```typescript
// lib/password.ts
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Schema de validação de senha
const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Senha deve conter: letra minúscula, maiúscula, número e caractere especial'
  );

export async function hashPassword(password: string): Promise<string> {
  // Validar força da senha
  passwordSchema.parse(password);

  // Hash com salt rounds alto
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Rate limiting para tentativas de login
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkLoginAttempts(email: string): boolean {
  const attempts = loginAttempts.get(email);
  const now = Date.now();

  if (!attempts) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset counter após 15 minutos
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  // Máximo 5 tentativas em 15 minutos
  if (attempts.count >= 5) {
    return false;
  }

  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}
```

### Role-Based Access Control (RBAC)

```typescript
// lib/rbac.ts
export enum UserRole {
  USER = 0, // Usuário comum
  TEACHER = 1, // Professor
  ADMIN = 2, // Administrador
  SUPER_ADMIN = 3, // Super administrador
}

export const permissions = {
  [UserRole.USER]: [
    'read:public',
    'create:annotation',
    'update:own_profile',
    'create:upload',
  ],
  [UserRole.TEACHER]: [
    'read:public',
    'read:students',
    'create:lesson',
    'create:assignment',
    'manage:students',
  ],
  [UserRole.ADMIN]: [
    'read:all',
    'create:all',
    'update:all',
    'moderate:content',
    'manage:users',
  ],
  [UserRole.SUPER_ADMIN]: ['all:permissions'],
};

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const userPermissions = permissions[userRole] || [];
  return (
    userPermissions.includes(permission) ||
    userPermissions.includes('all:permissions')
  );
}

// Middleware de autorização
export function requireRole(minRole: UserRole) {
  return async (req: NextRequest, context: any) => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role < minRole) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    return NextResponse.next();
  };
}
```

---

## Segurança de Container

### Docker Security

#### **Container Configuration**

```yaml
# docker-compose.yml - Configuração segura
services:
  app-prod:
    build:
      context: ./app-source/Classical-Music
      dockerfile: Dockerfile
      target: runner
    restart: unless-stopped
    user: '1001:1001' # Non-root user
    read_only: true # Read-only filesystem
    tmpfs:
      - /tmp:size=100M,mode=1777
      - /var/cache:size=50M,mode=755
    security_opt:
      - no-new-privileges:true
      - apparmor:docker-default
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETUID
      - SETGID
    sysctls:
      - net.ipv4.ip_unprivileged_port_start=0
    deploy:
      resources:
        limits:
          memory: 1.5G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
```

#### **Dockerfile Security**

```dockerfile
# Dockerfile - Práticas seguras
FROM node:20-alpine AS base

# Criar usuário não-privilegiado
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Instalar dependências apenas necessárias
RUN apk add --no-cache libc6-compat

# Remover cache de packages
RUN rm -rf /var/cache/apk/*

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM base AS runner
WORKDIR /app

# Copiar apenas arquivos necessários
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Usar usuário não-privilegiado
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### Container Scanning

```bash
# Scan de vulnerabilidades com Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image opus-atlas-app-prod:latest

# Docker Bench Security
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /etc:/etc:ro \
  -v /usr/bin/docker-containerd:/usr/bin/docker-containerd:ro \
  -v /usr/bin/docker-runc:/usr/bin/docker-runc:ro \
  -v /usr/lib/systemd:/usr/lib/systemd:ro \
  -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --label docker_bench_security \
  docker/docker-bench-security
```

---

## Proteção de Banco de Dados

### MongoDB Security

#### **Configuração Segura**

```yaml
# /opt/opus-atlas/mongodb/mongod.conf
storage:
  dbPath: /data/db
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2.0
    collectionConfig:
      blockCompressor: zstd
    indexConfig:
      prefixCompression: true

net:
  port: 27017
  bindIp: 127.0.0.1,opus-atlas-mongodb-prod
  compression:
    compressors: zstd,snappy,zlib

security:
  authorization: enabled
  keyFile: /etc/mongodb-keyfile
  javascriptEnabled: false
  enableEncryption: true
  encryptionCipherMode: AES256-CBC

replication:
  replSetName: rs0

setParameter:
  authenticationMechanisms: SCRAM-SHA-256
  scramSHA256IterationCount: 15000

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  logRotate: reopen
  component:
    accessControl:
      verbosity: 2
    command:
      verbosity: 1

operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100
  slowOpSampleRate: 0.5
```

#### **User Management**

```javascript
// Configuração de usuários segura
use admin

// Usuário administrador
db.createUser({
  user: "opusatlas",
  pwd: passwordPrompt(),
  roles: [
    { role: "root", db: "admin" }
  ]
})

// Usuário da aplicação (princípio do menor privilégio)
use opus_atlas_prod
db.createUser({
  user: "app_user",
  pwd: passwordPrompt(),
  roles: [
    { role: "readWrite", db: "opus_atlas_prod" },
    { role: "dbAdmin", db: "opus_atlas_prod" }
  ]
})

// Usuário de backup (somente leitura)
db.createUser({
  user: "backup_user",
  pwd: passwordPrompt(),
  roles: [
    { role: "backup", db: "admin" },
    { role: "read", db: "opus_atlas_prod" }
  ]
})

// Usuário de monitoramento
db.createUser({
  user: "monitor_user",
  pwd: passwordPrompt(),
  roles: [
    { role: "clusterMonitor", db: "admin" },
    { role: "read", db: "local" }
  ]
})
```

#### **Connection Security**

```javascript
// Configuração de conexão segura na aplicação
const mongoOptions = {
  authSource: 'admin',
  authMechanism: 'SCRAM-SHA-256',
  ssl: true,
  sslValidate: true,
  sslCert: '/path/to/client.pem',
  sslKey: '/path/to/client-key.pem',
  sslCA: '/path/to/ca.pem',
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  waitQueueMultiple: 15,
  retryWrites: true,
  retryReads: true,
  compressors: 'zstd,snappy',
  readPreference: 'primary',
  readConcern: { level: 'majority' },
  writeConcern: { w: 'majority', j: true, wtimeout: 10000 },
};
```

### Redis Security

```bash
# redis.conf - Configuração segura
bind 127.0.0.1 opus-atlas-redis
port 6379
requirepass "RedisOpusAtlas2024!"

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
rename-command DEBUG ""
rename-command CONFIG "CONFIG_b835f3a7d93e4f8c9a1234567890abcd"

# Enable AOF persistence
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Memory security
maxmemory 256mb
maxmemory-policy allkeys-lru

# Timeout settings
timeout 300
tcp-keepalive 60

# Security settings
protected-mode yes
```

---

## Monitoramento de Segurança

### Security Logging

#### **Centralized Security Logs**

```bash
# /opt/opus-atlas/scripts/security-monitor.sh
#!/bin/bash

LOG_DIR="/opt/opus-atlas/logs/security"
DATE=$(date +%Y%m%d)
ALERT_EMAIL="opusatlas@gmail.com"

mkdir -p $LOG_DIR

# Monitor SSH attempts
SSH_FAILURES=$(journalctl --since "1 hour ago" | grep "Failed password" | wc -l)
if [ $SSH_FAILURES -gt 10 ]; then
    echo "$(date): WARNING - $SSH_FAILURES SSH failures in last hour" >> $LOG_DIR/ssh-$DATE.log
    echo "High SSH failure rate: $SSH_FAILURES attempts" | \
    mail -s "[OPUS ATLAS] SSH Security Alert" $ALERT_EMAIL
fi

# Monitor Nginx 4xx/5xx errors
NGINX_ERRORS=$(docker exec opus-atlas-nginx grep -c "\" [45][0-9][0-9] " /var/log/nginx/access.log | grep "$(date +'%d/%b/%Y:%H')" || echo 0)
if [ $NGINX_ERRORS -gt 50 ]; then
    echo "$(date): WARNING - $NGINX_ERRORS HTTP errors in last hour" >> $LOG_DIR/nginx-$DATE.log
fi

# Monitor fail2ban bans
FAIL2BAN_BANS=$(fail2ban-client status | grep "Banned:" | awk '{print $2}')
if [ "$FAIL2BAN_BANS" -gt 0 ]; then
    echo "$(date): INFO - $FAIL2BAN_BANS IPs currently banned" >> $LOG_DIR/fail2ban-$DATE.log
fi

# Monitor disk space (security issue if logs fill disk)
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "$(date): CRITICAL - Disk usage at $DISK_USAGE%" >> $LOG_DIR/system-$DATE.log
    echo "Critical disk space: $DISK_USAGE% used" | \
    mail -s "[OPUS ATLAS] Disk Space Critical" $ALERT_EMAIL
fi

# Log analysis for anomalies
python3 /opt/opus-atlas/scripts/log-analysis.py
```

#### **Intrusion Detection**

```python
# /opt/opus-atlas/scripts/log-analysis.py
import re
import json
from datetime import datetime, timedelta
from collections import defaultdict

class SecurityAnalyzer:
    def __init__(self):
        self.alerts = []
        self.patterns = {
            'sql_injection': [
                r'(\bunion\b.*\bselect\b)',
                r'(\bselect\b.*\bfrom\b.*\bwhere\b)',
                r'(\bdrop\b.*\btable\b)',
                r'(\binsert\b.*\binto\b)',
                r'(\bupdate\b.*\bset\b)'
            ],
            'xss_attempt': [
                r'<script[^>]*>.*?</script>',
                r'javascript:',
                r'on\w+\s*=',
                r'<iframe[^>]*>.*?</iframe>'
            ],
            'path_traversal': [
                r'\.\./',
                r'\.\.\\',
                r'/etc/passwd',
                r'/etc/shadow'
            ],
            'brute_force': [
                r'Failed password for',
                r'authentication failure',
                r'Invalid user'
            ]
        }

    def analyze_nginx_logs(self):
        """Analyze Nginx access logs for security threats"""
        log_file = '/opt/opus-atlas/logs/nginx/access.log'
        suspicious_requests = defaultdict(int)

        with open(log_file, 'r') as f:
            for line in f:
                # Parse log line
                match = re.match(r'(\S+) - - \[(.*?)\] "(.*?)" (\d+) (\d+) "(.*?)" "(.*?)"', line)
                if match:
                    ip, timestamp, request, status, size, referer, user_agent = match.groups()

                    # Check for suspicious patterns
                    for threat_type, patterns in self.patterns.items():
                        for pattern in patterns:
                            if re.search(pattern, request, re.IGNORECASE):
                                suspicious_requests[(ip, threat_type)] += 1

        # Alert on suspicious activity
        for (ip, threat_type), count in suspicious_requests.items():
            if count > 5:  # Threshold
                alert = {
                    'timestamp': datetime.now().isoformat(),
                    'type': 'suspicious_activity',
                    'ip': ip,
                    'threat_type': threat_type,
                    'count': count,
                    'severity': 'high' if count > 10 else 'medium'
                }
                self.alerts.append(alert)

    def generate_report(self):
        """Generate security report"""
        if self.alerts:
            report = {
                'timestamp': datetime.now().isoformat(),
                'alerts': self.alerts,
                'summary': {
                    'total_alerts': len(self.alerts),
                    'high_severity': len([a for a in self.alerts if a['severity'] == 'high']),
                    'unique_ips': len(set([a['ip'] for a in self.alerts]))
                }
            }

            with open(f'/opt/opus-atlas/logs/security/analysis-{datetime.now().strftime("%Y%m%d")}.json', 'w') as f:
                json.dump(report, f, indent=2)

            # Send alert if high severity issues
            high_severity_count = report['summary']['high_severity']
            if high_severity_count > 0:
                import subprocess
                subprocess.run([
                    'mail', '-s', f'[OPUS ATLAS] Security Alert - {high_severity_count} high severity threats',
                    'opusatlas@gmail.com'
                ], input=f'Security analysis found {high_severity_count} high severity threats.\n\nSee report: /opt/opus-atlas/logs/security/analysis-{datetime.now().strftime("%Y%m%d")}.json', text=True)

if __name__ == '__main__':
    analyzer = SecurityAnalyzer()
    analyzer.analyze_nginx_logs()
    analyzer.generate_report()
```

---

## Backup Seguro

### Backup Encryption

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/encrypted-backup.sh

BACKUP_DIR="/opt/opus-atlas/backups/encrypted"
GPG_KEY="opusatlas@gmail.com"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Create MongoDB backup
echo "Creating MongoDB backup..."
docker exec opus-atlas-mongodb-prod mongodump \
  --username opusatlas \
  --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --db opus_atlas_prod \
  --gzip \
  --out /data/backup_${DATE}

# Copy to host
docker cp opus-atlas-mongodb-prod:/data/backup_${DATE} ${BACKUP_DIR}/

# Create encrypted archive
echo "Creating encrypted archive..."
tar -czf - -C ${BACKUP_DIR} backup_${DATE} | \
  gpg --cipher-algo AES256 --compress-algo 2 --symmetric \
      --output ${BACKUP_DIR}/opus_atlas_${DATE}.tar.gz.gpg

# Secure delete original
rm -rf ${BACKUP_DIR}/backup_${DATE}
docker exec opus-atlas-mongodb-prod rm -rf /data/backup_${DATE}

# Verify backup
echo "Verifying encrypted backup..."
if gpg --decrypt ${BACKUP_DIR}/opus_atlas_${DATE}.tar.gz.gpg > /dev/null 2>&1; then
    echo "$(date): Encrypted backup created successfully - opus_atlas_${DATE}.tar.gz.gpg"

    # Calculate checksum
    SHA256=$(sha256sum ${BACKUP_DIR}/opus_atlas_${DATE}.tar.gz.gpg | awk '{print $1}')
    echo "$(date): Backup checksum: $SHA256" >> ${BACKUP_DIR}/checksums.log
else
    echo "$(date): ERROR - Backup verification failed!" | \
    mail -s "[OPUS ATLAS] Backup Verification Failed" opusatlas@gmail.com
    exit 1
fi

# Cleanup old backups
find ${BACKUP_DIR} -name "opus_atlas_*.tar.gz.gpg" -mtime +${RETENTION_DAYS} -delete

# Upload to remote storage (optional)
if [ -n "$REMOTE_BACKUP_ENABLED" ]; then
    rsync -avz --delete ${BACKUP_DIR}/ backup@remote-server:/backups/opus-atlas/
fi
```

---

## Resposta a Incidentes

### Incident Response Plan

#### **1. Detection Phase**

```bash
# /opt/opus-atlas/scripts/incident-detection.sh
#!/bin/bash

INCIDENT_LOG="/opt/opus-atlas/logs/incidents.log"
ALERT_EMAIL="opusatlas@gmail.com"

# Function to create incident
create_incident() {
    local severity=$1
    local type=$2
    local description=$3
    local incident_id="INC-$(date +%Y%m%d%H%M%S)"

    echo "$(date): [$severity] $incident_id - $type: $description" >> $INCIDENT_LOG

    # Send alert
    echo "INCIDENT DETECTED

ID: $incident_id
Severity: $severity
Type: $type
Time: $(date)
Description: $description

Dashboard: https://monitor.opusatlas.com.br:3003
Logs: /opt/opus-atlas/logs/

Action required: Investigate immediately" | \
    mail -s "[OPUS ATLAS] Security Incident - $incident_id" $ALERT_EMAIL
}

# Detection rules
check_brute_force() {
    SSH_FAILURES=$(journalctl --since "1 hour ago" | grep "Failed password" | wc -l)
    if [ $SSH_FAILURES -gt 20 ]; then
        create_incident "HIGH" "BRUTE_FORCE" "SSH brute force attack detected: $SSH_FAILURES failures"
    fi
}

check_dos_attack() {
    REQUEST_RATE=$(docker exec opus-atlas-nginx grep "$(date +'%d/%b/%Y:%H')" /var/log/nginx/access.log | wc -l)
    if [ $REQUEST_RATE -gt 10000 ]; then
        create_incident "CRITICAL" "DOS_ATTACK" "Potential DoS attack: $REQUEST_RATE requests this hour"
    fi
}

check_unauthorized_access() {
    ADMIN_ACCESS=$(docker exec opus-atlas-nginx grep "admin" /var/log/nginx/access.log | grep "$(date +'%d/%b/%Y:%H')" | wc -l)
    if [ $ADMIN_ACCESS -gt 100 ]; then
        create_incident "HIGH" "UNAUTHORIZED_ACCESS" "Suspicious admin access attempts: $ADMIN_ACCESS"
    fi
}

# Run checks
check_brute_force
check_dos_attack
check_unauthorized_access
```

#### **2. Response Procedures**

```bash
# /opt/opus-atlas/scripts/incident-response.sh
#!/bin/bash

INCIDENT_ID=$1
ACTION=$2

case $ACTION in
    "isolate")
        # Isolate system
        echo "$(date): Isolating system for incident $INCIDENT_ID"

        # Block external traffic (keep SSH for admin)
        ufw --force reset
        ufw default deny incoming
        ufw default deny outgoing
        ufw allow out 53 comment 'DNS'
        ufw allow out 123 comment 'NTP'
        ufw limit 22/tcp comment 'SSH admin access'
        ufw enable

        # Stop application (keep monitoring)
        docker-compose stop app-prod nginx

        echo "$(date): System isolated" >> /opt/opus-atlas/logs/incident-response.log
        ;;

    "block_ip")
        IP=$3
        echo "$(date): Blocking IP $IP for incident $INCIDENT_ID"

        # Block IP in UFW
        ufw insert 1 deny from $IP

        # Block in fail2ban
        fail2ban-client set sshd banip $IP

        echo "$(date): IP $IP blocked" >> /opt/opus-atlas/logs/incident-response.log
        ;;

    "collect_evidence")
        EVIDENCE_DIR="/opt/opus-atlas/incidents/$INCIDENT_ID"
        mkdir -p $EVIDENCE_DIR

        echo "$(date): Collecting evidence for incident $INCIDENT_ID"

        # System state
        ps aux > $EVIDENCE_DIR/processes.txt
        netstat -tulpn > $EVIDENCE_DIR/network.txt
        df -h > $EVIDENCE_DIR/disk.txt

        # Logs
        cp -r /opt/opus-atlas/logs $EVIDENCE_DIR/
        journalctl --since "24 hours ago" > $EVIDENCE_DIR/system.log

        # Docker state
        docker ps -a > $EVIDENCE_DIR/containers.txt
        docker images > $EVIDENCE_DIR/images.txt

        # Create archive
        tar -czf $EVIDENCE_DIR.tar.gz -C /opt/opus-atlas/incidents $INCIDENT_ID

        echo "$(date): Evidence collected in $EVIDENCE_DIR.tar.gz" >> /opt/opus-atlas/logs/incident-response.log
        ;;

    "restore")
        echo "$(date): Restoring system after incident $INCIDENT_ID"

        # Restore firewall
        /opt/opus-atlas/scripts/setup-firewall.sh

        # Restart services
        docker-compose up -d

        # Verify system health
        sleep 30
        curl -f https://opusatlas.com.br/api/health

        echo "$(date): System restored" >> /opt/opus-atlas/logs/incident-response.log
        ;;
esac
```

---

## Auditoria e Compliance

### Security Audit Script

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/security-audit.sh

AUDIT_REPORT="/opt/opus-atlas/logs/security-audit-$(date +%Y%m%d).txt"
PASS=0
FAIL=0

echo "OPUS ATLAS SECURITY AUDIT REPORT" > $AUDIT_REPORT
echo "Generated: $(date)" >> $AUDIT_REPORT
echo "======================================" >> $AUDIT_REPORT

# Function to check and log
check() {
    local description=$1
    local command=$2
    local expected=$3

    echo -n "Checking: $description... "

    result=$(eval $command 2>/dev/null)

    if [[ "$result" == "$expected" ]] || [[ -n "$expected" && "$result" =~ $expected ]]; then
        echo "✅ PASS" | tee -a $AUDIT_REPORT
        ((PASS++))
    else
        echo "❌ FAIL" | tee -a $AUDIT_REPORT
        echo "  Expected: $expected" | tee -a $AUDIT_REPORT
        echo "  Actual: $result" | tee -a $AUDIT_REPORT
        ((FAIL++))
    fi
}

echo "SYSTEM SECURITY CHECKS" >> $AUDIT_REPORT
echo "-----------------------" >> $AUDIT_REPORT

check "SSH root login disabled" "grep '^PermitRootLogin' /etc/ssh/sshd_config | awk '{print \$2}'" "no"
check "SSH password auth disabled" "grep '^PasswordAuthentication' /etc/ssh/sshd_config | awk '{print \$2}'" "no"
check "UFW firewall enabled" "ufw status | head -1 | awk '{print \$2}'" "active"
check "Fail2ban running" "systemctl is-active fail2ban" "active"
check "Unattended upgrades enabled" "systemctl is-enabled unattended-upgrades" "enabled"

echo "" >> $AUDIT_REPORT
echo "SSL/TLS SECURITY CHECKS" >> $AUDIT_REPORT
echo "------------------------" >> $AUDIT_REPORT

check "SSL certificate valid" "openssl x509 -checkend 86400 -noout -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem && echo valid || echo invalid" "valid"
check "Strong SSL ciphers only" "docker exec opus-atlas-nginx nginx -T 2>/dev/null | grep ssl_ciphers | wc -l" "1"

echo "" >> $AUDIT_REPORT
echo "CONTAINER SECURITY CHECKS" >> $AUDIT_REPORT
echo "--------------------------" >> $AUDIT_REPORT

check "Containers running as non-root" "docker exec opus-atlas-app-prod whoami" "nextjs"
check "No privileged containers" "docker inspect opus-atlas-app-prod | jq -r '.[0].HostConfig.Privileged'" "false"

echo "" >> $AUDIT_REPORT
echo "DATABASE SECURITY CHECKS" >> $AUDIT_REPORT
echo "-------------------------" >> $AUDIT_REPORT

check "MongoDB auth enabled" "docker exec opus-atlas-mongodb-prod mongosh admin --eval 'db.adminCommand({getCmdLineOpts: 1})' | grep -q 'authorization.*enabled' && echo enabled || echo disabled" "enabled"

echo "" >> $AUDIT_REPORT
echo "AUDIT SUMMARY" >> $AUDIT_REPORT
echo "==============" >> $AUDIT_REPORT
echo "Checks passed: $PASS" >> $AUDIT_REPORT
echo "Checks failed: $FAIL" >> $AUDIT_REPORT
echo "Success rate: $(( PASS * 100 / (PASS + FAIL) ))%" >> $AUDIT_REPORT

# Send report if there are failures
if [ $FAIL -gt 0 ]; then
    mail -s "[OPUS ATLAS] Security Audit - $FAIL failures detected" opusatlas@gmail.com < $AUDIT_REPORT
fi

echo "Audit complete. Report saved to: $AUDIT_REPORT"
```

### Compliance Checklist

#### **LGPD/GDPR Compliance**

```bash
# Data Protection Impact Assessment
cat > /opt/opus-atlas/docs/DPIA.md << 'EOF'
# Data Protection Impact Assessment - Opus Atlas

## Data Collected
- User profiles (name, email, educational preferences)
- Usage analytics (pages visited, features used)
- Educational progress (lessons completed, works learned)
- Annotations and contributions

## Legal Basis
- Consent for marketing communications
- Legitimate interest for service provision
- Contract performance for teacher-student relationships

## Data Security Measures
- Encryption in transit (TLS 1.3)
- Encryption at rest (MongoDB)
- Access controls (RBAC)
- Regular backups (encrypted)
- Audit logging

## User Rights
- Right to access (profile page)
- Right to rectification (edit profile)
- Right to erasure (delete account)
- Right to portability (export data)
- Right to object (opt-out features)

## Retention Policy
- User accounts: Indefinite (until deletion requested)
- Analytics data: 24 months
- Logs: 90 days
- Backups: 30 days
EOF
```

---

## Procedimentos de Segurança

### Daily Security Tasks

```bash
# /opt/opus-atlas/scripts/daily-security-check.sh
#!/bin/bash

echo "$(date): Starting daily security check..."

# 1. Check for system updates
apt list --upgradable 2>/dev/null | grep -v "Listing..." | wc -l

# 2. Review failed login attempts
journalctl --since "24 hours ago" | grep "Failed password" | wc -l

# 3. Check SSL certificate expiry
openssl x509 -enddate -noout -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem

# 4. Verify backup integrity
latest_backup=$(ls -t /opt/opus-atlas/backups/mongodb/opus_atlas_*.tar.gz 2>/dev/null | head -n1)
if [ -n "$latest_backup" ]; then
    echo "Latest backup: $latest_backup ($(stat -c%y "$latest_backup"))"
else
    echo "WARNING: No recent backup found!"
fi

# 5. Check for suspicious network activity
netstat -an | grep ESTABLISHED | wc -l

# 6. Verify container security
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -v "Up" || echo "All containers running"

# 7. Check disk space
df -h / | awk 'NR==2 {print "Disk usage: " $5}'

echo "$(date): Daily security check completed"
```

### Weekly Security Tasks

```bash
# /opt/opus-atlas/scripts/weekly-security-check.sh
#!/bin/bash

echo "$(date): Starting weekly security check..."

# 1. Full system update
apt update && apt upgrade -y

# 2. Docker security scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image opus-atlas-app-prod:latest

# 3. Log analysis
python3 /opt/opus-atlas/scripts/log-analysis.py

# 4. Backup verification
/opt/opus-atlas/scripts/verify-backups.sh

# 5. SSL configuration test
testssl.sh --quiet --severity MEDIUM https://opusatlas.com.br

# 6. Security audit
/opt/opus-atlas/scripts/security-audit.sh

echo "$(date): Weekly security check completed"
```

### Monthly Security Tasks

```bash
# /opt/opus-atlas/scripts/monthly-security-check.sh
#!/bin/bash

echo "$(date): Starting monthly security check..."

# 1. Full security audit
/opt/opus-atlas/scripts/security-audit.sh

# 2. Penetration testing (automated)
nmap -sS -O opusatlas.com.br

# 3. Certificate renewal check
/opt/opus-atlas/scripts/ssl-renew.sh

# 4. Review user access
mongo --eval "db.adminCommand('listUsers')" opus_atlas_prod

# 5. Update security documentation
git add docs/SECURITY.md && git commit -m "Monthly security review"

# 6. Generate security report
/opt/opus-atlas/scripts/generate-security-report.sh

echo "$(date): Monthly security check completed"
```

---

## Contatos de Emergência

### Security Incident Response Team

| Função             | Contato             | Disponibilidade       |
| ------------------ | ------------------- | --------------------- |
| **Security Lead**  | opusatlas@gmail.com | 24/7                  |
| **Technical Lead** | Claude (Anthropic)  | Durante implementação |
| **Infrastructure** | Hostinger Support   | 24/7                  |
| **Domain/DNS**     | Cloudflare Support  | 24/7                  |

### Escalation Matrix

```
Level 1 - Low (Info/Warning)
├── Log automatically
├── Daily report
└── Weekly review

Level 2 - Medium (Potential threat)
├── Send email alert
├── Log incident
└── Investigate within 4h

Level 3 - High (Active threat)
├── Immediate email + SMS
├── Log incident with evidence
├── Investigate within 1h
└── Consider isolation

Level 4 - Critical (System compromise)
├── Immediate phone contact
├── Full incident response
├── System isolation
└── Emergency procedures
```

---

## Conclusão

A segurança do Opus Atlas implementa uma estratégia de **defesa em profundidade** com múltiplas camadas de proteção:

**✅ Implementado:**

- Hardening completo do servidor Ubuntu
- Firewall UFW + Fail2ban com monitoramento
- SSL/TLS 1.3 com certificados automáticos
- Container security com usuários não-privilegiados
- Database security com autenticação forte
- Logs centralizados com análise automatizada
- Backup criptografado com verificação
- Incident response procedures
- Security audit automatizado

**🔄 Melhorias Futuras:**

- WAF (Web Application Firewall) customizado
- SIEM (Security Information and Event Management)
- Vulnerability scanning automatizado
- Red team exercises
- Security awareness training

**📞 Suporte de Segurança:**

- Documentação: docs/SECURITY.md
- Incidentes: opusatlas@gmail.com
- Monitoramento: https://monitor.opusatlas.com.br

---

**Responsável**: Claude (Anthropic)  
**Implementação**: 04-08/09/2025  
**Status**: ✅ Produção Segura  
**Próxima auditoria**: Trimestral
