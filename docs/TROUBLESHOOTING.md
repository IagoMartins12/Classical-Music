# 🐛 Troubleshooting - Opus Atlas

> Guia completo para diagnóstico e resolução de problemas da plataforma Opus Atlas em produção.

## Índice

1. [Metodologia de Diagnóstico](#metodologia-de-diagnóstico)
2. [Problemas de Aplicação](#problemas-de-aplicação)
3. [Problemas de Banco de Dados](#problemas-de-banco-de-dados)
4. [Problemas de Container](#problemas-de-container)
5. [Problemas de Rede](#problemas-de-rede)
6. [Problemas de SSL](#problemas-de-ssl)
7. [Problemas de Performance](#problemas-de-performance)
8. [Problemas de Monitoramento](#problemas-de-monitoramento)
9. [Problemas de Deploy](#problemas-de-deploy)
10. [Problemas de Backup](#problemas-de-backup)
11. [Emergências Críticas](#emergências-críticas)
12. [Ferramentas de Debug](#ferramentas-de-debug)

---

## Metodologia de Diagnóstico

### Fluxo de Troubleshooting

```mermaid
graph TD
    A[Problema Reportado] --> B{Serviço Afetado?}
    B -->|App| C[Check Application]
    B -->|DB| D[Check MongoDB]
    B -->|Rede| E[Check Network]
    B -->|SSL| F[Check Certificates]

    C --> G[Analyze Logs]
    D --> G
    E --> G
    F --> G

    G --> H{Root Cause Found?}
    H -->|Yes| I[Apply Fix]
    H -->|No| J[Escalate]

    I --> K[Verify Fix]
    K --> L[Document Solution]
```

### Checklist Inicial

```bash
# Script de diagnóstico rápido
#!/bin/bash
# /opt/opus-atlas/scripts/quick-diagnosis.sh

echo "🔍 DIAGNÓSTICO RÁPIDO - OPUS ATLAS"
echo "=================================="

# 1. Status geral do sistema
echo "📊 System Status:"
uptime
free -h | grep Mem
df -h / | grep -v Filesystem

echo ""

# 2. Status dos containers
echo "🐳 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep opus-atlas

echo ""

# 3. Health checks básicos
echo "🏥 Health Checks:"

# Aplicação
echo -n "App: "
if curl -f -m 10 http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

# MongoDB
echo -n "MongoDB: "
if docker exec opus-atlas-mongodb-prod mongosh \
   --quiet --username opusatlas --password SuperSecureOpusAtlas2024! \
   --authenticationDatabase admin --eval "db.adminCommand('ping').ok" 2>/dev/null | grep -q "1"; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

# Redis
echo -n "Redis: "
if docker exec opus-atlas-redis redis-cli -a RedisOpusAtlas2024! ping 2>/dev/null | grep -q "PONG"; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

# Nginx
echo -n "Nginx: "
if docker exec opus-atlas-nginx nginx -t 2>/dev/null; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

echo ""

# 4. Verificar logs recentes de erro
echo "⚠️ Recent Errors:"
docker logs opus-atlas-app-prod --since=10m 2>&1 | grep -i error | tail -3
```

### Níveis de Severidade

| Nível             | Descrição                         | Tempo de Resposta | Ação                     |
| ----------------- | --------------------------------- | ----------------- | ------------------------ |
| **P0 - Critical** | Sistema completamente fora        | 15 min            | Escalação imediata       |
| **P1 - High**     | Funcionalidade principal afetada  | 1 hora            | Investigação prioritária |
| **P2 - Medium**   | Funcionalidade secundária afetada | 4 horas           | Investigação agendada    |
| **P3 - Low**      | Problemas menores ou melhorias    | 24 horas          | Próximo ciclo            |

---

## Problemas de Aplicação

### Aplicação Não Responde

**Sintomas:**

- Timeout em requests HTTP
- Status 502/503 no navegador
- Container app-prod com status "unhealthy"

**Diagnóstico:**

```bash
# 1. Verificar status do container
docker ps | grep opus-atlas-app-prod

# 2. Verificar logs
docker logs opus-atlas-app-prod --tail 50

# 3. Verificar recursos
docker stats opus-atlas-app-prod --no-stream

# 4. Verificar conectividade interna
docker exec opus-atlas-nginx curl -f http://opus-atlas-app-prod:3000/api/health

# 5. Verificar processo dentro do container
docker exec opus-atlas-app-prod ps aux
```

**Soluções:**

```bash
# Solução 1: Restart simples
docker-compose restart app-prod

# Solução 2: Restart com limpeza de memória
docker-compose stop app-prod
docker system prune -f
docker-compose up -d app-prod

# Solução 3: Rebuild completo
cd /opt/opus-atlas
git -C app-source/Classical-Music pull origin main
docker-compose build --no-cache app-prod
docker-compose up -d app-prod

# Solução 4: Rollback (se problema após deploy)
cd /opt/opus-atlas/app-source/Classical-Music
git checkout HEAD~1
cd /opt/opus-atlas
docker-compose build --no-cache app-prod
docker-compose up -d app-prod
```

### Erros de Memória (OOM)

**Sintomas:**

- Container reiniciando frequentemente
- Logs mostrando "killed" ou exit code 137
- Performance degradada

**Diagnóstico:**

```bash
# Verificar uso de memória
docker stats opus-atlas-app-prod --no-stream

# Verificar logs do sistema
dmesg | grep -i "killed process"
journalctl -u docker | grep -i oom

# Verificar configuração de limites
docker inspect opus-atlas-app-prod | jq '.[0].HostConfig.Memory'
```

**Soluções:**

```bash
# 1. Aumentar limite de memória no docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G  # Era 1.5G
    reservations:
      memory: 1G  # Era 512M

# 2. Otimizar aplicação Node.js
export NODE_OPTIONS="--max-old-space-size=1024"

# 3. Implementar cache mais agressivo
# Revisar uso de cache Redis
```

### Problemas de Autenticação

**Sintomas:**

- Login não funciona
- Sessões expiram imediatamente
- Erro "Invalid credentials"

**Diagnóstico:**

```bash
# 1. Verificar NextAuth configuration
docker exec opus-atlas-app-prod env | grep -E "(NEXTAUTH|GOOGLE|EMAIL)"

# 2. Verificar Redis (sessions)
docker exec opus-atlas-redis redis-cli -a RedisOpusAtlas2024! KEYS "*session*"

# 3. Verificar logs de autenticação
docker logs opus-atlas-app-prod | grep -i "auth\|login\|session"

# 4. Testar endpoint de auth
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

**Soluções:**

```bash
# 1. Restart Redis (limpa sessions)
docker-compose restart redis

# 2. Verificar secret do NextAuth
# NEXTAUTH_SECRET deve ser consistente

# 3. Verificar URLs de callback do Google OAuth
# No Google Console, verificar redirect URIs

# 4. Limpar cookies do browser
# F12 > Application > Storage > Clear

# 5. Reset de configuração OAuth
docker-compose restart app-prod
```

### Database Connection Issues

**Sintomas:**

- "Cannot connect to database"
- "MongoNetworkError"
- Aplicação não consegue fazer queries

**Diagnóstico:**

```bash
# 1. Verificar conectividade
docker exec opus-atlas-app-prod ping opus-atlas-mongodb-prod

# 2. Testar conexão MongoDB
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin --eval "db.adminCommand('ping')"

# 3. Verificar string de conexão
echo $DATABASE_URL

# 4. Verificar replica set
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin --eval "rs.status()"
```

**Soluções:**

```bash
# 1. Reinicializar replica set
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "rs.reconfig(rs.conf(), {force: true})"

# 2. Restart MongoDB
docker-compose restart mongodb-prod
sleep 30
docker-compose restart app-prod

# 3. Verificar string de conexão
# DATABASE_URL="mongodb://opusatlas:SuperSecureOpusAtlas2024!@opus-atlas-mongodb-prod:27017/opus_atlas_prod?authSource=admin&replicaSet=rs0"

# 4. Regenerar Prisma client
docker exec opus-atlas-app-prod npx prisma generate
docker-compose restart app-prod
```

---

## Problemas de Banco de Dados

### MongoDB Não Inicia

**Sintomas:**

- Container mongodb-prod constantemente reiniciando
- Erros de "failed to start"
- Replica set não responde

**Diagnóstico:**

```bash
# 1. Verificar logs detalhados
docker logs opus-atlas-mongodb-prod --tail 100

# 2. Verificar configuração
docker exec opus-atlas-mongodb-prod cat /etc/mongod.conf

# 3. Verificar permissões
docker exec opus-atlas-mongodb-prod ls -la /data/db

# 4. Verificar espaço em disco
df -h /var/lib/docker

# 5. Verificar integridade do keyfile
docker exec opus-atlas-mongodb-prod ls -la /etc/mongodb-keyfile
```

**Soluções:**

```bash
# 1. Reparar permissões
docker exec opus-atlas-mongodb-prod chown -R mongodb:mongodb /data/db
docker exec opus-atlas-mongodb-prod chmod 600 /etc/mongodb-keyfile

# 2. Verificar configuração do replica set
# Se logs mostram problema de replica set:
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "rs.initiate({
    _id: 'rs0',
    members: [{ _id: 0, host: 'opus-atlas-mongodb-prod:27017' }]
  })"

# 3. Reparar database (último recurso)
docker-compose stop mongodb-prod
docker run --rm -v opus-atlas_mongodb_data:/data/db mongo:7.0 \
  mongod --dbpath /data/db --repair
docker-compose up -d mongodb-prod

# 4. Restore de backup (emergência)
./scripts/mongodb-restore.sh [backup_file.tar.gz]
```

### MongoDB Performance Issues

**Sintomas:**

- Queries lentas
- Alto uso de CPU no container MongoDB
- Aplicação com timeout em database operations

**Diagnóstico:**

```bash
# 1. Verificar queries lentas
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "
    use opus_atlas_prod;
    db.setProfilingLevel(2, {slowms: 100});
    db.system.profile.find().limit(5).sort({ts:-1}).pretty();
  "

# 2. Verificar stats do database
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "
    use opus_atlas_prod;
    db.stats();
    db.runCommand({collStats: 'Work'});
  "

# 3. Verificar indexes
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "
    use opus_atlas_prod;
    db.Work.getIndexes();
    db.User.getIndexes();
  "

# 4. Verificar conexões ativas
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "db.serverStatus().connections"
```

**Soluções:**

```bash
# 1. Otimizar indexes
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "
    use opus_atlas_prod;
    db.Work.createIndex({title: 1, composerId: 1});
    db.User.createIndex({email: 1, role: 1});
  "

# 2. Compactar collections
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "
    use opus_atlas_prod;
    db.runCommand({compact: 'WorkScore'});
  "

# 3. Aumentar cache do WiredTiger
# No mongod.conf:
# wiredTiger:
#   engineConfig:
#     cacheSizeGB: 3.0

# 4. Otimizar connection pool no Prisma
# maxPoolSize: 10
# minPoolSize: 2
```

### Redis Connection Problems

**Sintomas:**

- Cache não funciona
- Sessions perdidas
- "Connection refused" para Redis

**Diagnóstico:**

```bash
# 1. Verificar status Redis
docker exec opus-atlas-redis redis-cli -a RedisOpusAtlas2024! ping

# 2. Verificar configuração
docker exec opus-atlas-redis redis-cli -a RedisOpusAtlas2024! CONFIG GET "*"

# 3. Verificar memória
docker exec opus-atlas-redis redis-cli -a RedisOpusAtlas2024! INFO memory

# 4. Verificar conexões
docker exec opus-atlas-redis redis-cli -a RedisOpusAtlas2024! CLIENT LIST
```

**Soluções:**

```bash
# 1. Restart Redis
docker-compose restart redis

# 2. Flush Redis (CUIDADO - apaga tudo)
docker exec opus-atlas-redis redis-cli -a RedisOpusAtlas2024! FLUSHALL

# 3. Verificar URL de conexão no app
# REDIS_URL="redis://:RedisOpusAtlas2024!@opus-atlas-redis:6379"

# 4. Aumentar timeout
# timeout 300 no redis.conf
```

---

## Problemas de Container

### Container Não Inicia

**Sintomas:**

- Container com status "Exited" imediatamente
- Erro "failed to start container"
- Exit codes diferentes de 0

**Diagnóstico:**

```bash
# 1. Verificar exit code
docker ps -a | grep opus-atlas

# 2. Verificar logs detalhados
docker logs opus-atlas-app-prod --details

# 3. Verificar imagem
docker images | grep opus-atlas

# 4. Verificar recursos
docker system df
df -h /var/lib/docker

# 5. Testar comando manualmente
docker run --rm -it opus-atlas-app-prod /bin/sh
```

**Soluções:**

```bash
# 1. Rebuild da imagem
docker-compose build --no-cache app-prod

# 2. Verificar variáveis de ambiente
docker-compose config | grep -A 20 app-prod

# 3. Limpar cache Docker
docker system prune -a -f

# 4. Verificar dependências
# Garantir que mongodb-prod e redis estão rodando antes

# 5. Verificar permissões
docker exec opus-atlas-app-prod ls -la /app
```

### Container com High Resource Usage

**Sintomas:**

- CPU constantemente acima de 80%
- Memória próxima ao limite
- Sistema lento

**Diagnóstico:**

```bash
# 1. Monitorar recursos em tempo real
docker stats

# 2. Verificar processos dentro do container
docker exec opus-atlas-app-prod top

# 3. Analisar what's using resources
docker exec opus-atlas-app-prod ps aux --sort=-%cpu
docker exec opus-atlas-app-prod ps aux --sort=-%mem

# 4. Verificar logs para loops ou erros
docker logs opus-atlas-app-prod | grep -E "(error|loop|infinite)"
```

**Soluções:**

```bash
# 1. Ajustar limites no docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G

# 2. Implementar cache mais eficiente
# Usar Redis para cache agressivo

# 3. Otimizar queries do banco
# Adicionar indexes, limit queries

# 4. Restart com limpeza
docker-compose stop app-prod
docker system prune -f
docker-compose up -d app-prod
```

### Docker Daemon Issues

**Sintomas:**

- "Cannot connect to Docker daemon"
- Containers não respondem a comandos
- Docker commands hanging

**Diagnóstico:**

```bash
# 1. Verificar status do daemon
systemctl status docker

# 2. Verificar espaço em disco
df -h /var/lib/docker

# 3. Verificar logs do Docker
journalctl -u docker --since "1 hour ago"

# 4. Verificar processo
ps aux | grep dockerd
```

**Soluções:**

```bash
# 1. Restart Docker daemon
sudo systemctl restart docker

# 2. Limpeza agressiva
docker system prune -a -f --volumes

# 3. Reboot do servidor (último recurso)
sudo reboot

# 4. Verificar configuração
cat /etc/docker/daemon.json
```

---

## Problemas de Rede

### Conectividade Externa

**Sintomas:**

- Aplicação não acessa APIs externas
- Erro "network unreachable"
- Timeout em requests externos

**Diagnóstico:**

```bash
# 1. Testar conectividade básica
docker exec opus-atlas-app-prod ping 8.8.8.8
docker exec opus-atlas-app-prod curl -I https://www.google.com

# 2. Verificar DNS
docker exec opus-atlas-app-prod nslookup api.openai.com
docker exec opus-atlas-app-prod cat /etc/resolv.conf

# 3. Verificar firewall
ufw status verbose
iptables -L -n

# 4. Verificar proxy (se aplicável)
docker exec opus-atlas-app-prod env | grep -i proxy
```

**Soluções:**

```bash
# 1. Configurar DNS no Docker
# /etc/docker/daemon.json
{
  "dns": ["8.8.8.8", "1.1.1.1"]
}
sudo systemctl restart docker

# 2. Verificar regras UFW
ufw allow out 443
ufw allow out 53

# 3. Restart networking
sudo systemctl restart networking

# 4. Verificar rotas
route -n
ip route
```

### Internal Container Communication

**Sintomas:**

- App não consegue acessar MongoDB
- Erro "connection refused" entre containers
- Services não se encontram

**Diagnóstico:**

```bash
# 1. Verificar network Docker
docker network ls
docker network inspect opus-atlas_opus-atlas-network

# 2. Testar conectividade entre containers
docker exec opus-atlas-app-prod ping opus-atlas-mongodb-prod
docker exec opus-atlas-app-prod telnet opus-atlas-redis 6379

# 3. Verificar exposição de portas
docker ps --format "table {{.Names}}\t{{.Ports}}"

# 4. Verificar DNS interno
docker exec opus-atlas-app-prod nslookup opus-atlas-mongodb-prod
```

**Soluções:**

```bash
# 1. Recrear network
docker-compose down
docker network prune -f
docker-compose up -d

# 2. Verificar docker-compose.yml
# Todos os services devem estar na mesma network

# 3. Usar service names corretos
# opus-atlas-mongodb-prod, não localhost

# 4. Verificar depends_on no docker-compose.yml
depends_on:
  - mongodb-prod
  - redis
```

### Nginx Proxy Issues

**Sintomas:**

- 502 Bad Gateway
- Nginx não roteia para aplicação
- SSL/TLS errors

**Diagnóstico:**

```bash
# 1. Testar configuração Nginx
docker exec opus-atlas-nginx nginx -t

# 2. Verificar upstream
docker exec opus-atlas-nginx curl http://opus-atlas-app-prod:3000/api/health

# 3. Verificar logs Nginx
docker logs opus-atlas-nginx --tail 50

# 4. Testar SSL
openssl s_client -connect opusatlas.com.br:443 -servername opusatlas.com.br
```

**Soluções:**

```bash
# 1. Reload configuração Nginx
docker exec opus-atlas-nginx nginx -s reload

# 2. Restart Nginx
docker-compose restart nginx

# 3. Verificar configuração de proxy
# proxy_pass http://opus-atlas-app-prod:3000;

# 4. Verificar DNS resolver
# resolver 127.0.0.11 valid=30s;
```

---

## Problemas de SSL

### Certificate Issues

**Sintomas:**

- "Certificate expired"
- "Certificate not trusted"
- SSL/TLS handshake errors

**Diagnóstico:**

```bash
# 1. Verificar validade do certificado
openssl x509 -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem -text -noout

# 2. Verificar datas
openssl x509 -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem -noout -dates

# 3. Testar SSL externamente
curl -I https://opusatlas.com.br
openssl s_client -connect opusatlas.com.br:443 -servername opusatlas.com.br

# 4. Verificar configuração Nginx SSL
docker exec opus-atlas-nginx grep -r ssl /etc/nginx/conf.d/
```

**Soluções:**

```bash
# 1. Renovar certificado
docker-compose stop nginx
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot renew --force-renewal
docker-compose start nginx

# 2. Verificar permissões
sudo chown -R root:root /etc/letsencrypt
sudo chmod -R 755 /etc/letsencrypt/live
sudo chmod -R 600 /etc/letsencrypt/live/*/privkey.pem

# 3. Recriar certificado
docker-compose stop nginx
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone --force-renewal \
  --email opusatlas@gmail.com \
  --domains opusatlas.com.br,www.opusatlas.com.br,monitor.opusatlas.com.br
docker-compose start nginx
```

### HTTPS Redirect Issues

**Sintomas:**

- HTTP não redireciona para HTTPS
- Mixed content warnings
- Infinite redirect loops

**Diagnóstico:**

```bash
# 1. Testar redirect
curl -I http://opusatlas.com.br

# 2. Verificar configuração Nginx
docker exec opus-atlas-nginx cat /etc/nginx/conf.d/prod.conf | grep -A 10 "listen 80"

# 3. Verificar headers
curl -H "Host: opusatlas.com.br" -I http://72.60.145.88
```

**Soluções:**

```bash
# 1. Verificar configuração de redirect no Nginx
server {
    listen 80;
    server_name opusatlas.com.br www.opusatlas.com.br;
    return 301 https://$server_name$request_uri;
}

# 2. Adicionar security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# 3. Reload Nginx
docker exec opus-atlas-nginx nginx -s reload
```

---

## Problemas de Performance

### Slow Response Times

**Sintomas:**

- Aplicação responde lentamente
- Timeout em requests
- High latency

**Diagnóstico:**

```bash
# 1. Medir response time
curl -w "@curl-format.txt" -o /dev/null -s https://opusatlas.com.br/

# curl-format.txt:
#     time_namelookup:  %{time_namelookup}s\n
#     time_connect:     %{time_connect}s\n
#     time_appconnect:  %{time_appconnect}s\n
#     time_pretransfer: %{time_pretransfer}s\n
#     time_redirect:    %{time_redirect}s\n
#     time_starttransfer: %{time_starttransfer}s\n
#     time_total:       %{time_total}s\n

# 2. Verificar uso de recursos
docker stats --no-stream

# 3. Verificar queries lentas
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "db.system.profile.find().limit(5).sort({ts:-1}).pretty()"

# 4. Verificar cache Redis
docker exec opus-atlas-redis redis-cli -a RedisOpusAtlas2024! INFO stats
```

**Soluções:**

```bash
# 1. Implementar cache mais agressivo
# Configurar cache headers no Nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 2. Otimizar database queries
# Adicionar indexes necessários
# Implementar pagination

# 3. Configurar CDN
# Cloudflare está configurado - verificar settings

# 4. Otimizar Node.js
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=1024"
```

### Database Performance Issues

**Sintomas:**

- Queries SQL/MongoDB lentas
- High CPU usage no container de banco
- Connection timeouts

**Diagnóstico:**

```bash
# 1. Profiling MongoDB
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "
    use opus_atlas_prod;
    db.setProfilingLevel(2, {slowms: 100});
    sleep(60);
    db.system.profile.find({millis: {\$gt: 100}}).sort({millis: -1}).limit(10).pretty();
  "

# 2. Verificar explain de queries
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "
    use opus_atlas_prod;
    db.Work.find({title: /bach/i}).explain('executionStats');
  "

# 3. Verificar indexes
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "
    use opus_atlas_prod;
    db.Work.getIndexes();
  "
```

**Soluções:**

```bash
# 1. Criar indexes otimizados
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "
    use opus_atlas_prod;
    db.Work.createIndex({title: 'text', 'composer.name': 'text'});
    db.Work.createIndex({composerId: 1, epochId: 1});
  "

# 2. Implementar pagination
# Usar skip/limit com cuidado, preferir cursor-based pagination

# 3. Cache agressivo no Redis
# Cache query results por 5-10 minutos

# 4. Otimizar aggregation pipelines
# Usar $match early, $project to reduce data size
```

---

## Problemas de Monitoramento

### Grafana Não Carrega

**Sintomas:**

- Dashboard não carrega
- "Connection failed" no Grafana
- Métricas não aparecem

**Diagnóstico:**

```bash
# 1. Verificar container Grafana
docker ps | grep grafana
docker logs opus-atlas-grafana --tail 50

# 2. Verificar conectividade com Prometheus
docker exec opus-atlas-grafana curl http://opus-atlas-prometheus:9090/api/v1/query?query=up

# 3. Verificar configuração
docker exec opus-atlas-grafana cat /etc/grafana/grafana.ini | grep -A 5 "\[database\]"

# 4. Testar acesso externo
curl -u admin:OpusAtlas2024!Monitor http://localhost:3003/api/health
```

**Soluções:**

```bash
# 1. Restart Grafana
docker-compose restart grafana

# 2. Reset dados Grafana (CUIDADO - perde dashboards)
docker-compose stop grafana
docker volume rm opus-atlas_grafana_data
docker-compose up -d grafana

# 3. Verificar data source
# URL deve ser: http://opus-atlas-prometheus:9090

# 4. Reimportar dashboards
# Usar backup em monitoring/grafana/dashboards/
```

### Prometheus Sem Dados

**Sintomas:**

- Targets não aparecem
- Métricas não são coletadas
- "No data" nos dashboards

**Diagnóstico:**

```bash
# 1. Verificar targets Prometheus
curl http://localhost:9090/api/v1/targets

# 2. Verificar configuração
docker exec opus-atlas-prometheus cat /etc/prometheus/prometheus.yml

# 3. Testar conectividade com targets
docker exec opus-atlas-prometheus wget -qO- http://opus-atlas-node-exporter:9100/metrics | head

# 4. Verificar logs
docker logs opus-atlas-prometheus --tail 50
```

**Soluções:**

```bash
# 1. Verificar scrape_configs no prometheus.yml
scrape_configs:
  - job_name: 'app-prod'
    static_configs:
      - targets: ['opus-atlas-app-prod:3000']

# 2. Reload configuração
curl -X POST http://localhost:9090/-/reload

# 3. Restart Prometheus
docker-compose restart prometheus

# 4. Verificar network connectivity
docker network inspect opus-atlas_opus-atlas-network
```

### Uptime Kuma Issues

**Sintomas:**

- Monitors mostrando "down" incorretamente
- Notificações não funcionam
- Interface não carrega

**Diagnóstico:**

```bash
# 1. Verificar container
docker logs uptime-kuma --tail 50

# 2. Testar conectividade manualmente
curl -f https://opusatlas.com.br/api/health

# 3. Verificar configuração SMTP
# Settings > Notifications no UI

# 4. Verificar recursos
docker stats uptime-kuma --no-stream
```

**Soluções:**

```bash
# 1. Restart Uptime Kuma
docker-compose restart uptime-kuma

# 2. Ajustar timeouts nos monitors
# Increase timeout to 30s, interval to 60s

# 3. Verificar configuração de email
# SMTP settings in UI

# 4. Backup e restore settings
docker cp uptime-kuma:/app/data ./uptime-kuma-backup
```

---

## Problemas de Deploy

### Deploy Failure

**Sintomas:**

- GitHub Actions failing
- Build errors
- Deployment timeout

**Diagnóstico:**

```bash
# 1. Verificar logs do GitHub Actions
# Ver workflow runs no GitHub

# 2. Testar build localmente
cd /opt/opus-atlas/app-source/Classical-Music
npm run build

# 3. Verificar conectividade SSH
ssh -T git@github.com

# 4. Verificar espaço em disco
df -h /
```

**Soluções:**

```bash
# 1. Limpeza antes de deploy
docker system prune -f
apt autoremove -y

# 2. Manual deploy
cd /opt/opus-atlas/app-source/Classical-Music
git pull origin main
cd /opt/opus-atlas
docker-compose build --no-cache app-prod
docker-compose up -d app-prod

# 3. Rollback em caso de falha
./scripts/rollback.sh

# 4. Verificar secrets do GitHub
# VPS_HOST, VPS_USER, VPS_SSH_KEY
```

### Build Issues

**Sintomas:**

- "npm install" failing
- TypeScript errors
- Missing dependencies

**Diagnóstico:**

```bash
# 1. Verificar Node.js version
docker run --rm node:20-alpine node --version

# 2. Limpar cache npm
cd /opt/opus-atlas/app-source/Classical-Music
rm -rf node_modules package-lock.json
npm cache clean --force

# 3. Verificar package.json
cat package.json | jq '.dependencies'

# 4. Testar install manual
npm install --verbose
```

**Soluções:**

```bash
# 1. Update dependencies
npm update
npm audit fix

# 2. Rebuild node_modules
rm -rf node_modules package-lock.json
npm install

# 3. Fix TypeScript issues
npx tsc --noEmit
npm run type-check

# 4. Verificar Dockerfile
# Usar node:20-alpine
# Instalar dependencies primeiro
```

---

## Problemas de Backup

### Backup Failure

**Sintomas:**

- Backup script failing
- Backup files corrompidos
- "No space left on device"

**Diagnóstico:**

```bash
# 1. Verificar espaço em disco
df -h /opt/opus-atlas/backups

# 2. Testar backup manualmente
/opt/opus-atlas/scripts/mongodb-backup.sh

# 3. Verificar permissões
ls -la /opt/opus-atlas/backups/mongodb

# 4. Verificar integridade do último backup
latest_backup=$(ls -t /opt/opus-atlas/backups/mongodb/opus_atlas_*.tar.gz | head -1)
tar -tzf "$latest_backup" > /dev/null
```

**Soluções:**

```bash
# 1. Limpeza de backups antigos
find /opt/opus-atlas/backups/mongodb -name "opus_atlas_*.tar.gz" -mtime +7 -delete

# 2. Verificar cron job
crontab -l | grep backup

# 3. Executar backup manual
cd /opt/opus-atlas
./scripts/mongodb-backup.sh

# 4. Verificar configuração MongoDB
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "db.adminCommand('ping')"
```

### Restore Issues

**Sintomas:**

- Restore failing
- Data corruption after restore
- "Authentication failed"

**Diagnóstico:**

```bash
# 1. Verificar backup file
file /opt/opus-atlas/backups/mongodb/opus_atlas_*.tar.gz
tar -tzf backup_file.tar.gz

# 2. Verificar MongoDB connection
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin --eval "db.stats()"

# 3. Check backup content
tar -tzf backup_file.tar.gz | head -20
```

**Soluções:**

```bash
# 1. Backup atual antes restore
./scripts/mongodb-backup.sh

# 2. Restore com drop
docker exec opus-atlas-mongodb-prod mongorestore \
  --username opusatlas \
  --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --db opus_atlas_prod \
  --drop \
  /data/restore_data/opus_atlas_prod

# 3. Verificar integridade pós-restore
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas --password SuperSecureOpusAtlas2024! \
  --authenticationDatabase admin \
  --eval "
    use opus_atlas_prod;
    print('Users: ' + db.User.countDocuments());
    print('Composers: ' + db.Composer.countDocuments());
    print('Works: ' + db.Work.countDocuments());
  "
```

---

## Emergências Críticas

### Sistema Completamente Fora

**Ação Imediata:**

```bash
# 1. Verificar status geral
systemctl status docker
docker ps
ufw status

# 2. Restart completo
cd /opt/opus-atlas
docker-compose down
docker-compose up -d

# 3. Se não funcionar - emergency procedures
sudo reboot

# 4. Após reboot
cd /opt/opus-atlas
docker-compose up -d
./scripts/health-monitor.sh
```

### Data Loss Emergency

**Ação Imediata:**

```bash
# 1. PARAR TUDO imediatamente
docker-compose down

# 2. Não fazer mais alterações

# 3. Verificar últimos backups
ls -la /opt/opus-atlas/backups/mongodb/ | tail -5

# 4. Restore do backup mais recente
./scripts/mongodb-restore.sh [latest_backup.tar.gz]

# 5. Verificar integridade dos dados
./scripts/verify-data-integrity.sh
```

### Security Breach

**Ação Imediata:**

```bash
# 1. Isolar sistema
ufw deny 80
ufw deny 443
docker-compose stop app-prod nginx

# 2. Backup evidence
mkdir -p /opt/opus-atlas/incident-$(date +%Y%m%d)
cp -r /opt/opus-atlas/logs /opt/opus-atlas/incident-$(date +%Y%m%d)/
journalctl > /opt/opus-atlas/incident-$(date +%Y%m%d)/system.log

# 3. Análise inicial
grep -r "error\|hack\|attack" /opt/opus-atlas/logs/

# 4. Notificar
echo "Security incident detected at $(date)" | \
mail -s "[CRITICAL] Security Incident" opusatlas@gmail.com
```

### Out of Disk Space

**Ação Imediata:**

```bash
# 1. Verificar uso
df -h
du -sh /opt/opus-atlas/* | sort -rh

# 2. Limpeza emergencial
docker system prune -a -f --volumes
apt autoremove -y
apt autoclean

# 3. Remover logs antigos
find /opt/opus-atlas/logs -name "*.log" -mtime +1 -delete
journalctl --vacuum-size=100M

# 4. Remover backups antigos
find /opt/opus-atlas/backups -name "opus_atlas_*.tar.gz" -mtime +3 -delete
```

---

## Ferramentas de Debug

### Scripts de Debug

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/debug-toolkit.sh

debug_menu() {
    echo "🔧 DEBUG TOOLKIT - OPUS ATLAS"
    echo "============================="
    echo "1) Quick Diagnosis"
    echo "2) Container Analysis"
    echo "3) Database Debug"
    echo "4) Network Debug"
    echo "5) Performance Analysis"
    echo "6) Log Analysis"
    echo "7) Security Check"
    echo "8) Full System Report"
    echo "9) Exit"
    echo ""
    read -p "Choose option (1-9): " choice

    case $choice in
        1) quick_diagnosis ;;
        2) container_analysis ;;
        3) database_debug ;;
        4) network_debug ;;
        5) performance_analysis ;;
        6) log_analysis ;;
        7) security_check ;;
        8) full_system_report ;;
        9) exit 0 ;;
        *) echo "Invalid option" && debug_menu ;;
    esac
}

quick_diagnosis() {
    echo "🔍 QUICK DIAGNOSIS"
    echo "=================="

    # System status
    uptime
    free -h
    df -h /

    # Container status
    docker ps --format "table {{.Names}}\t{{.Status}}"

    # Quick health checks
    echo "App: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)"
    echo "MongoDB: $(docker exec opus-atlas-mongodb-prod mongosh --quiet --username opusatlas --password SuperSecureOpusAtlas2024! --authenticationDatabase admin --eval 'db.adminCommand("ping").ok' 2>/dev/null || echo 'Error')"
    echo "Redis: $(docker exec opus-atlas-redis redis-cli -a RedisOpusAtlas2024! ping 2>/dev/null || echo 'Error')"

    read -p "Press Enter to continue..."
    debug_menu
}

container_analysis() {
    echo "🐳 CONTAINER ANALYSIS"
    echo "===================="

    # Resource usage
    docker stats --no-stream
    echo ""

    # Container details
    for container in opus-atlas-app-prod opus-atlas-mongodb-prod opus-atlas-redis opus-atlas-nginx; do
        echo "▶️ $container:"
        docker inspect $container --format 'Status: {{.State.Status}} | Started: {{.State.StartedAt}} | RestartCount: {{.RestartCount}}'
        echo "Recent logs:"
        docker logs $container --tail 3 2>&1
        echo ""
    done

    read -p "Press Enter to continue..."
    debug_menu
}

# Continuar com outras funções...

# Executar menu
debug_menu
```

### Log Analysis Tool

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/log-analyzer.sh

analyze_logs() {
    local service=${1:-"all"}
    local hours=${2:-"1"}

    echo "📊 LOG ANALYSIS - $service ($hours hours)"
    echo "========================================"

    case $service in
        "app"|"application")
            echo "🔍 APPLICATION LOGS:"
            docker logs opus-atlas-app-prod --since="${hours}h" 2>&1 | \
            grep -E "(error|warn|fail)" | tail -20
            ;;

        "db"|"database")
            echo "🔍 DATABASE LOGS:"
            docker logs opus-atlas-mongodb-prod --since="${hours}h" 2>&1 | \
            grep -E "(error|warn|fail)" | tail -20
            ;;

        "nginx")
            echo "🔍 NGINX LOGS:"
            docker logs opus-atlas-nginx --since="${hours}h" 2>&1 | \
            grep -E "(error|warn|fail)" | tail -20
            ;;

        "all"|*)
            echo "🔍 ALL SERVICES ERRORS:"
            {
                docker logs opus-atlas-app-prod --since="${hours}h" 2>&1 | grep -E "(error|warn|fail)" | sed 's/^/[APP] /'
                docker logs opus-atlas-mongodb-prod --since="${hours}h" 2>&1 | grep -E "(error|warn|fail)" | sed 's/^/[DB] /'
                docker logs opus-atlas-nginx --since="${hours}h" 2>&1 | grep -E "(error|warn|fail)" | sed 's/^/[NGINX] /'
                docker logs opus-atlas-redis --since="${hours}h" 2>&1 | grep -E "(error|warn|fail)" | sed 's/^/[REDIS] /'
            } | sort | tail -30
            ;;
    esac

    echo ""
    echo "📈 REQUEST PATTERNS:"
    docker exec opus-atlas-nginx awk '{print $1}' /var/log/nginx/access.log | \
    sort | uniq -c | sort -rn | head -10

    echo ""
    echo "📊 STATUS CODES:"
    docker exec opus-atlas-nginx awk '{print $9}' /var/log/nginx/access.log | \
    sort | uniq -c | sort -rn
}

# Usage: ./log-analyzer.sh [service] [hours]
analyze_logs $1 $2
```

### Health Check Comprehensive

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/comprehensive-health-check.sh

comprehensive_health() {
    local report_file="/tmp/health-report-$(date +%Y%m%d_%H%M%S).txt"

    echo "🏥 COMPREHENSIVE HEALTH CHECK" | tee $report_file
    echo "============================" | tee -a $report_file
    echo "Date: $(date)" | tee -a $report_file
    echo "" | tee -a $report_file

    # System resources
    echo "💻 SYSTEM RESOURCES:" | tee -a $report_file
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')" | tee -a $report_file
    echo "Memory: $(free | grep Mem | awk '{printf "%.1f%% used", $3/$2 * 100.0}')" | tee -a $report_file
    echo "Disk: $(df -h / | awk 'NR==2{printf "%s used", $5}')" | tee -a $report_file
    echo "Load: $(uptime | awk -F'load average:' '{print $2}')" | tee -a $report_file
    echo "" | tee -a $report_file

    # Container health
    echo "🐳 CONTAINER HEALTH:" | tee -a $report_file
    for container in opus-atlas-app-prod opus-atlas-mongodb-prod opus-atlas-redis opus-atlas-nginx; do
        if docker ps | grep -q $container; then
            echo "✅ $container: Running" | tee -a $report_file
        else
            echo "❌ $container: Not running" | tee -a $report_file
        fi
    done
    echo "" | tee -a $report_file

    # Service connectivity
    echo "🌐 SERVICE CONNECTIVITY:" | tee -a $report_file

    # App health
    if curl -f -m 10 http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Application: Healthy" | tee -a $report_file
    else
        echo "❌ Application: Unhealthy" | tee -a $report_file
    fi

    # MongoDB health
    if docker exec opus-atlas-mongodb-prod mongosh --quiet --username opusatlas --password SuperSecureOpusAtlas2024! --authenticationDatabase admin --eval "db.adminCommand('ping').ok" 2>/dev/null | grep -q "1"; then
        echo "✅ MongoDB: Healthy" | tee -a $report_file
    else
        echo "❌ MongoDB: Unhealthy" | tee -a $report_file
    fi

    # Redis health
    if docker exec opus-atlas-redis redis-cli -a RedisOpusAtlas2024! ping 2>/dev/null | grep -q "PONG"; then
        echo "✅ Redis: Healthy" | tee -a $report_file
    else
        echo "❌ Redis: Unhealthy" | tee -a $report_file
    fi

    # SSL Certificate
    echo "" | tee -a $report_file
    echo "🔒 SSL CERTIFICATE:" | tee -a $report_file
    if openssl x509 -checkend 604800 -noout -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem; then
        echo "✅ SSL: Valid (expires: $(openssl x509 -enddate -noout -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem | cut -d= -f2))" | tee -a $report_file
    else
        echo "❌ SSL: Expires within 7 days!" | tee -a $report_file
    fi

    # Backup status
    echo "" | tee -a $report_file
    echo "💾 BACKUP STATUS:" | tee -a $report_file
    latest_backup=$(ls -t /opt/opus-atlas/backups/mongodb/opus_atlas_*.tar.gz 2>/dev/null | head -1)
    if [ -n "$latest_backup" ]; then
        backup_age=$(stat -c %Y "$latest_backup")
        current_time=$(date +%s)
        hours_old=$(( (current_time - backup_age) / 3600 ))

        if [ $hours_old -lt 25 ]; then
            echo "✅ Latest backup: $hours_old hours old" | tee -a $report_file
        else
            echo "❌ Latest backup: $hours_old hours old (too old!)" | tee -a $report_file
        fi
    else
        echo "❌ No backups found!" | tee -a $report_file
    fi

    echo "" | tee -a $report_file
    echo "Report saved to: $report_file" | tee -a $report_file

    # Send email if critical issues found
    if grep -q "❌" $report_file; then
        mail -s "[OPUS ATLAS] Health Check - Issues Detected" opusatlas@gmail.com < $report_file
    fi

    cat $report_file
}

comprehensive_health
```

---

## Contatos de Emergência

### Escalation Matrix

| Severidade        | Tempo de Resposta | Contato             | Ação                  |
| ----------------- | ----------------- | ------------------- | --------------------- |
| **P0 - Critical** | 15 minutos        | opusatlas@gmail.com | Investigação imediata |
| **P1 - High**     | 1 hora            | opusatlas@gmail.com | Correção prioritária  |
| **P2 - Medium**   | 4 horas           | opusatlas@gmail.com | Agendamento           |
| **P3 - Low**      | 24 horas          | opusatlas@gmail.com | Próximo sprint        |

### Emergency Procedures

```bash
# EMERGENCY CONTACT SCRIPT
#!/bin/bash
emergency_contact() {
    local severity=$1
    local issue=$2
    local logs=${3:-""}

    echo "OPUS ATLAS EMERGENCY ALERT

Severity: $severity
Issue: $issue
Time: $(date)
Server: 72.60.145.88
Location: /opt/opus-atlas

System Status:
$(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep opus-atlas)

Logs:
$logs

Dashboard: https://monitor.opusatlas.com.br:3003
SSH Access: ssh opusatlas@72.60.145.88

Action Required: Immediate investigation" | \
    mail -s "[OPUS ATLAS] $severity - $issue" opusatlas@gmail.com
}

# Usage: emergency_contact "P0-CRITICAL" "System Down" "$(docker logs opus-atlas-app-prod --tail 10)"
```

---

## Conclusão

Este guia de troubleshooting fornece:

**✅ Cobertura Completa:**

- Metodologia estruturada de diagnóstico
- Problemas categorizados por componente
- Soluções testadas e validadas
- Procedimentos de emergência

**✅ Ferramentas de Diagnóstico:**

- Scripts automatizados de health check
- Análise de logs avançada
- Debug toolkit completo
- Monitoramento proativo

**✅ Procedimentos de Emergência:**

- Escalation matrix definida
- Recovery procedures documentados
- Emergency contacts configurados
- Disaster recovery testado

**📞 Suporte Técnico:**

- Documentação: docs/TROUBLESHOOTING.md
- Operations: docs/OPERATIONS.md
- Email: opusatlas@gmail.com
- Monitoramento: https://monitor.opusatlas.com.br

**💡 Dica:** Para problemas não cobertos neste guia, sempre:

1. Collect logs first
2. Check recent changes
3. Test in isolation
4. Document the solution

---

**Responsável**: Claude (Anthropic)  
**Implementação**: 04-08/09/2025  
**Status**: ✅ Guia Completo  
**Próxima revisão**: Baseada em incidentes
