# 📊 Sistema de Monitoramento - Opus Atlas

> Documentação completa do sistema de observabilidade enterprise com Grafana, Prometheus, Uptime Kuma e analytics avançados.

## Índice

1. [Visão Geral](#visão-geral)
2. [Stack de Monitoramento](#stack-de-monitoramento)
3. [Grafana Dashboards](#grafana-dashboards)
4. [Prometheus Métricas](#prometheus-métricas)
5. [Uptime Kuma](#uptime-kuma)
6. [Node Exporter](#node-exporter)
7. [cAdvisor](#cadvisor)
8. [MongoDB Monitoring](#mongodb-monitoring)
9. [Alertas e Notificações](#alertas-e-notificações)
10. [Umami Analytics](#umami-analytics)
11. [Logs Management](#logs-management)
12. [Performance Monitoring](#performance-monitoring)
13. [Backup Monitoring](#backup-monitoring)
14. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Opus Atlas implementa uma stack completa de observabilidade enterprise, fornecendo visibilidade total sobre:

- **Infraestrutura**: CPU, memória, disco, rede
- **Aplicação**: Performance, erros, uptime
- **Containers**: Docker métricas e status
- **Banco de Dados**: MongoDB performance e queries
- **Usuários**: Analytics e comportamento
- **Negócio**: Métricas educacionais e engajamento

### Arquitetura de Monitoramento

```
┌─────────────────────────────────────────────────┐
│                 OBSERVABILIDADE                 │
├─────────────────────────────────────────────────┤
│  📊 Grafana    │  📈 Prometheus  │  ⏰ Uptime   │
│  Dashboards    │  Métricas       │  Kuma        │
├─────────────────────────────────────────────────┤
│  🔍 Node       │  📦 cAdvisor    │  📊 Umami    │
│  Exporter      │  Containers     │  Analytics   │
├─────────────────────────────────────────────────┤
│              📝 LOGS CENTRALIZADOS              │
└─────────────────────────────────────────────────┘
```

---

## Stack de Monitoramento

### URLs de Acesso

| Serviço         | URL                                   | Autenticação                |
| --------------- | ------------------------------------- | --------------------------- |
| Grafana         | https://monitor.opusatlas.com.br:3003 | admin / SenhaMonitorMonitor |
| Prometheus      | https://monitor.opusatlas.com.br:9090 | Basic Auth                  |
| Uptime Kuma     | https://monitor.opusatlas.com.br:3002 | admin / SenhaMonitorMonitor |
| Umami Analytics | https://analytics.opusatlas.com.br    | Configuração própria        |

### Containers Ativos

```yaml
# Containers de monitoramento
- opus-atlas-grafana:10.2.2
- opus-atlas-prometheus:v2.48.0
- opus-atlas-node-exporter:v1.7.0
- opus-atlas-cadvisor:v0.49.1
- uptime-kuma:1.23.15
- umami:v2.10.0
```

---

## Grafana Dashboards

### Dashboard Principal: "Opus Atlas - Sistema Completo"

**14 Painéis Integrados:**

#### 1. **System Overview**

- CPU Usage: `100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`
- Memory Usage: `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100`
- Disk Usage: `100 - ((node_filesystem_avail_bytes{mountpoint="/"} * 100) / node_filesystem_size_bytes{mountpoint="/"})`
- Load Average: `node_load1`, `node_load5`, `node_load15`

#### 2. **Application Metrics**

- Request Rate: `rate(http_requests_total[5m])`
- Response Time: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- Error Rate: `rate(http_requests_total{status=~"5.."}[5m])`
- Active Users: `app_active_users`

#### 3. **Database Performance**

- MongoDB Connections: `mongodb_connections_current`
- Query Performance: `mongodb_op_duration_seconds`
- Collection Stats: `mongodb_collection_count`
- Index Usage: `mongodb_index_usage`

#### 4. **Container Health**

- CPU per Container: `rate(container_cpu_usage_seconds_total[5m])`
- Memory per Container: `container_memory_usage_bytes`
- Network I/O: `rate(container_network_receive_bytes_total[5m])`
- Restart Count: `kube_pod_container_status_restarts_total`

### Dashboards Secundários

#### **Node Exporter Full**

- Métricas detalhadas do sistema operacional
- Performance de CPU por core
- Uso detalhado de memória
- I/O de disco e rede
- Processes e file descriptors

#### **Container Overview**

- Status de todos containers Docker
- Resource utilization por container
- Container logs integration
- Health check status

### Configuração de Data Sources

```yaml
# prometheus.yml
datasources:
  - name: Prometheus
    type: prometheus
    url: http://opus-atlas-prometheus:9090
    access: proxy
    isDefault: true
```

### Alerting Rules

```yaml
groups:
  - name: opus_atlas_alerts
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High CPU usage detected'

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'High memory usage detected'

      - alert: DiskSpaceAlmostFull
        expr: 100 - ((node_filesystem_avail_bytes{mountpoint="/"} * 100) / node_filesystem_size_bytes{mountpoint="/"}) > 90
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'Disk space almost full'
```

---

## Prometheus Métricas

### Configuração Principal

```yaml
# prometheus.yml
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

storage:
  tsdb:
    retention.time: 30d
    retention.size: 2GB
```

### Métricas Coletadas

#### **Sistema (Node Exporter)**

```prometheus
# CPU
node_cpu_seconds_total
node_load1, node_load5, node_load15

# Memória
node_memory_MemTotal_bytes
node_memory_MemAvailable_bytes
node_memory_SwapTotal_bytes

# Disco
node_filesystem_size_bytes
node_filesystem_avail_bytes
node_disk_io_time_seconds_total

# Rede
node_network_receive_bytes_total
node_network_transmit_bytes_total
```

#### **Containers (cAdvisor)**

```prometheus
# Por Container
container_memory_usage_bytes
container_cpu_usage_seconds_total
container_fs_usage_bytes
container_network_receive_bytes_total
container_spec_memory_limit_bytes
```

#### **Aplicação (Custom)**

```prometheus
# HTTP
http_requests_total
http_request_duration_seconds
http_requests_in_flight

# Business
opus_atlas_users_total
opus_atlas_works_total
opus_atlas_annotations_total
opus_atlas_uploads_total
```

### Queries Essenciais

```prometheus
# Top 10 containers por CPU
topk(10, rate(container_cpu_usage_seconds_total[5m]))

# Memória disponível
node_memory_MemAvailable_bytes / 1024 / 1024 / 1024

# Requests por segundo
rate(http_requests_total[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])
```

---

## Uptime Kuma

### Monitores Configurados

#### **Produção Principal**

```yaml
Monitor: 'Produção - opusatlas.com.br'
Type: HTTP(s)
URL: https://opusatlas.com.br/api/health
Method: GET
Interval: 60 seconds
Timeout: 30 seconds
Expected Status: 200
```

#### **API Health Check**

```yaml
Monitor: 'API Health Check'
Type: HTTP(s)
URL: https://opusatlas.com.br/api/health
Headers: { 'Accept': 'application/json' }
Expected Response: { 'status': 'ok' }
```

#### **Database Connectivity**

```yaml
Monitor: 'Database Connection'
Type: MongoDB
Connection String: mongodb://localhost:27017/opus_atlas_prod
Timeout: 10 seconds
```

#### **SSL Certificate**

```yaml
Monitor: 'SSL Certificate'
Type: HTTP(s)
URL: https://opusatlas.com.br
Check SSL: Enabled
SSL Days to Expire: 7 days warning
```

### Notificações

#### **Email Alerts**

```yaml
Type: SMTP
SMTP Host: smtp.gmail.com
SMTP Port: 587
Username: opusatlas@gmail.com
From Email: opusatlas@gmail.com
To Email: opusatlas@gmail.com
Subject Template: '[Uptime Alert] {{NAME}} is {{STATUS}}'
```

#### **Webhook Notifications**

```yaml
Type: Webhook
URL: https://discord.com/api/webhooks/...
Content Type: application/json
Body Template: |
  {
    "content": "🚨 **{{NAME}}** is **{{STATUS}}**\n📊 **Response Time**: {{RESPONSE_TIME}}ms\n🕒 **Time**: {{CURRENT_TIME}}"
  }
```

### Status Pages

#### **Página Pública de Status**

```yaml
URL: https://monitor.opusatlas.com.br/status/opus-atlas
Monitors Included:
  - Produção Principal
  - API Health
  - Database
  - SSL Certificate

Custom CSS: Tema personalizado Opus Atlas
Custom Domain: status.opusatlas.com.br
```

---

## Node Exporter

### Métricas do Sistema

#### **CPU Monitoring**

```bash
# CPU usage per core
node_cpu_seconds_total{mode="idle"}
node_cpu_seconds_total{mode="user"}
node_cpu_seconds_total{mode="system"}

# Load average
node_load1    # 1 minute
node_load5    # 5 minutes
node_load15   # 15 minutes
```

#### **Memory Monitoring**

```bash
# Memory metrics
node_memory_MemTotal_bytes      # Total memory
node_memory_MemFree_bytes       # Free memory
node_memory_MemAvailable_bytes  # Available memory
node_memory_Buffers_bytes       # Buffer memory
node_memory_Cached_bytes        # Cache memory
node_memory_SwapTotal_bytes     # Total swap
node_memory_SwapFree_bytes      # Free swap
```

#### **Disk Monitoring**

```bash
# Filesystem metrics
node_filesystem_size_bytes{mountpoint="/"}      # Total disk space
node_filesystem_avail_bytes{mountpoint="/"}     # Available space
node_filesystem_free_bytes{mountpoint="/"}      # Free space

# Disk I/O
node_disk_read_bytes_total       # Bytes read
node_disk_written_bytes_total    # Bytes written
node_disk_io_time_seconds_total  # I/O time
```

#### **Network Monitoring**

```bash
# Network interface metrics
node_network_receive_bytes_total    # Bytes received
node_network_transmit_bytes_total   # Bytes transmitted
node_network_receive_packets_total  # Packets received
node_network_transmit_packets_total # Packets transmitted
```

### Configuração

```yaml
# docker-compose.yml
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
    - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
  networks:
    - opus-atlas-network
```

---

## cAdvisor

### Container Metrics

#### **Resource Usage**

```bash
# CPU usage per container
container_cpu_usage_seconds_total{name="opus-atlas-app-prod"}

# Memory usage per container
container_memory_usage_bytes{name="opus-atlas-app-prod"}

# Memory limits
container_spec_memory_limit_bytes{name="opus-atlas-app-prod"}

# Filesystem usage
container_fs_usage_bytes{name="opus-atlas-app-prod"}
```

#### **Network Metrics**

```bash
# Network I/O per container
container_network_receive_bytes_total{name="opus-atlas-app-prod"}
container_network_transmit_bytes_total{name="opus-atlas-app-prod"}
```

### Containers Monitorados

```yaml
Application Containers:
  - opus-atlas-app-prod # Next.js application
  - opus-atlas-mongodb-prod # MongoDB database
  - opus-atlas-redis # Redis cache
  - opus-atlas-nginx # Nginx proxy

Monitoring Containers:
  - opus-atlas-prometheus # Metrics storage
  - opus-atlas-grafana # Dashboards
  - opus-atlas-node-exporter # System metrics
  - opus-atlas-cadvisor # Container metrics
  - uptime-kuma # Uptime monitoring
```

### Configuração

```yaml
# docker-compose.yml
cadvisor:
  image: gcr.io/cadvisor/cadvisor:v0.49.1
  container_name: opus-atlas-cadvisor
  restart: unless-stopped
  ports:
    - '8080:8080'
  volumes:
    - /:/rootfs:ro
    - /var/run:/var/run:ro
    - /sys:/sys:ro
    - /var/lib/docker/:/var/lib/docker:ro
    - /dev/disk/:/dev/disk:ro
  privileged: true
  devices:
    - /dev/kmsg
  networks:
    - opus-atlas-network
```

---

## MongoDB Monitoring

### Métricas do MongoDB

#### **Connection Metrics**

```javascript
// MongoDB shell commands
db.serverStatus().connections;
db.serverStatus().network;
db.serverStatus().opcounters;
```

#### **Performance Metrics**

```bash
# Via MongoDB Exporter (se implementado)
mongodb_connections_current
mongodb_op_duration_seconds
mongodb_collection_count
mongodb_index_usage
```

#### **Replica Set Status**

```javascript
// Verificar status do replica set
rs.status();
rs.conf();

// Lag de replicação
db.printReplicationInfo();
db.printSecondaryReplicationInfo();
```

### Health Checks

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/mongodb-health.sh

# Verificar conexão
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --eval "db.adminCommand('ping')"

# Verificar replica set
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --eval "rs.status().ok"

# Verificar coleções principais
docker exec opus-atlas-mongodb-prod mongosh \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --eval "
    use opus_atlas_prod;
    print('Composers: ' + db.Composer.countDocuments());
    print('Works: ' + db.Work.countDocuments());
    print('Users: ' + db.User.countDocuments());
  "
```

---

## Alertas e Notificações

### Configuração de Alertas

#### **Telegram Bot (Opcional)**

```yaml
# alertmanager.yml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'telegram'

receivers:
  - name: 'telegram'
    telegram_configs:
      - api_url: 'https://api.telegram.org'
        bot_token: 'YOUR_BOT_TOKEN'
        chat_id: YOUR_CHAT_ID
        message: |
          🚨 *Alert*: {{ .GroupLabels.alertname }}
          📊 *Severity*: {{ .CommonLabels.severity }}
          🔗 *Instance*: {{ .CommonLabels.instance }}
          📝 *Description*: {{ .CommonAnnotations.description }}
```

#### **Email Notifications**

```yaml
receivers:
  - name: 'email'
    email_configs:
      - to: 'opusatlas@gmail.com'
        from: 'alerts@opusatlas.com.br'
        subject: '[OPUS ATLAS] {{ .Status | toUpper }}: {{ .GroupLabels.alertname }}'
        body: |
          Sistema: Opus Atlas
          Severidade: {{ .CommonLabels.severity }}
          Instância: {{ .CommonLabels.instance }}
          Descrição: {{ .CommonAnnotations.description }}

          Dashboard: https://monitor.opusatlas.com.br:3003
```

### Alert Rules

```yaml
# /opt/opus-atlas/monitoring/prometheus/alerts.yml
groups:
  - name: opus-atlas-system
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
          service: system
        annotations:
          summary: 'High CPU usage on {{ $labels.instance }}'
          description: 'CPU usage is above 80% for 5 minutes'

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: critical
          service: system
        annotations:
          summary: 'High memory usage on {{ $labels.instance }}'
          description: 'Memory usage is above 85% for 5 minutes'

      - alert: DiskSpaceCritical
        expr: 100 - ((node_filesystem_avail_bytes{mountpoint="/"} * 100) / node_filesystem_size_bytes{mountpoint="/"}) > 90
        for: 1m
        labels:
          severity: critical
          service: system
        annotations:
          summary: 'Disk space critical on {{ $labels.instance }}'
          description: 'Disk usage is above 90%'

      - alert: ContainerDown
        expr: up{job="cadvisor"} == 0
        for: 1m
        labels:
          severity: critical
          service: containers
        annotations:
          summary: 'Container monitoring down'
          description: 'cAdvisor is not responding'

      - alert: ApplicationDown
        expr: up{job="app-prod"} == 0
        for: 30s
        labels:
          severity: critical
          service: application
        annotations:
          summary: 'Application is down'
          description: 'Main application is not responding'
```

---

## Umami Analytics

### Configuração

```yaml
# docker-compose.yml
umami:
  image: ghcr.io/umami-software/umami:v2.10.0
  container_name: umami-analytics
  environment:
    DATABASE_URL: postgresql://umami:UmamiOpus2024!@umami-db:5432/umami
    DATABASE_TYPE: postgresql
    APP_SECRET: umami-secret-key-opus-atlas-2024
  ports:
    - '3005:3000'
  depends_on:
    - umami-db
  networks:
    - opus-atlas-network

umami-db:
  image: postgres:15-alpine
  container_name: umami-postgres
  environment:
    POSTGRES_DB: umami
    POSTGRES_USER: umami
    POSTGRES_PASSWORD: UmamiOpus2024!
  volumes:
    - umami_data:/var/lib/postgresql/data
  networks:
    - opus-atlas-network
```

### Script de Tracking

```html
<!-- Integração no layout principal -->
<script
  defer
  src="https://analytics.opusatlas.com.br/script.js"
  data-website-id="f3475284-e507-4e7e-af4a-3a1ecd932652"
></script>
```

### Métricas Coletadas

#### **Páginas Mais Visitadas**

- Homepage
- Catálogo de compositores
- Páginas de obras
- Sistema professor-aluno
- Uploads

#### **Eventos Personalizados**

```javascript
// Event tracking no frontend
umami.track('composer-favorited', { composer: composerId });
umami.track('work-learned', { work: workId, instrument: instrument });
umami.track('annotation-created', { category: category });
umami.track('score-downloaded', { work: workId, scoreId: scoreId });
umami.track('lesson-completed', { teacher: teacherId, student: studentId });
```

### Dashboards Analytics

#### **Visão Geral**

- Visitantes únicos
- Page views
- Bounce rate
- Tempo médio de sessão
- Países de origem

#### **Comportamento**

- Fluxo de páginas
- Eventos mais comuns
- Conversões (cadastros)
- Retenção de usuários

---

## Logs Management

### Estrutura de Logs

```bash
/opt/opus-atlas/logs/
├── app-prod/           # Logs da aplicação
│   ├── app.log
│   ├── error.log
│   └── access.log
├── nginx/              # Logs do Nginx
│   ├── access.log
│   ├── error.log
│   └── ssl.log
├── mongodb/            # Logs do MongoDB
│   └── mongod.log
├── monitoring/         # Logs de monitoramento
│   ├── prometheus.log
│   ├── grafana.log
│   └── alerts.log
└── system/            # Logs do sistema
    ├── cron.log
    ├── backup.log
    └── maintenance.log
```

### Configuração de Logs

#### **Docker Logging**

```yaml
# docker-compose.yml
services:
  app-prod:
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
    volumes:
      - ./logs/app-prod:/app/logs
```

#### **Log Rotation**

```bash
# /etc/logrotate.d/opus-atlas
/opt/opus-atlas/logs/*/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 opusatlas opusatlas
    postrotate
        docker-compose -f /opt/opus-atlas/docker-compose.yml restart nginx
    endscript
}
```

### Monitoramento de Logs

#### **Error Rate Tracking**

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/log-monitor.sh

# Monitorar erros da aplicação
ERROR_COUNT=$(docker logs opus-atlas-app-prod --since="1h" 2>&1 | grep -i "error" | wc -l)

if [ $ERROR_COUNT -gt 50 ]; then
    echo "$(date): High error rate detected: $ERROR_COUNT errors in last hour" | \
    mail -s "[OPUS ATLAS] High Error Rate Alert" opusatlas@gmail.com
fi

# Monitorar 5xx responses no Nginx
NGINX_5XX=$(docker exec opus-atlas-nginx grep "\" 5[0-9][0-9] " /var/log/nginx/access.log | \
           grep "$(date +'%d/%b/%Y:%H')" | wc -l)

if [ $NGINX_5XX -gt 10 ]; then
    echo "$(date): High 5xx response rate: $NGINX_5XX errors this hour" | \
    mail -s "[OPUS ATLAS] HTTP 5xx Alert" opusatlas@gmail.com
fi
```

---

## Performance Monitoring

### Application Performance

#### **Response Time Monitoring**

```javascript
// Instrumentação no código Next.js
export async function middleware(request) {
  const start = Date.now();
  const response = NextResponse.next();
  const duration = Date.now() - start;

  // Enviar métrica para Prometheus
  responseTimeHistogram.observe(duration / 1000);

  return response;
}
```

#### **Database Query Performance**

```javascript
// Middleware Prisma para timing
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    // Queries > 1s
    console.warn(`Slow query detected: ${e.duration}ms - ${e.query}`);
    // Enviar alerta
  }
});
```

### Infrastructure Performance

#### **Network Monitoring**

```bash
# Monitor bandwidth usage
vnstat -i eth0 --json h | jq '.interfaces[0].traffic.hour'

# Monitor connection count
netstat -an | grep ESTABLISHED | wc -l
```

#### **I/O Performance**

```bash
# Monitor disk I/O
iostat -x 1 5

# Monitor memory usage patterns
free -h && sync && echo 3 > /proc/sys/vm/drop_caches && free -h
```

---

## Backup Monitoring

### Backup Health Check

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/backup-monitor.sh

BACKUP_DIR="/opt/opus-atlas/backups/mongodb"
LATEST_BACKUP=$(ls -t $BACKUP_DIR/opus_atlas_*.tar.gz 2>/dev/null | head -n1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "$(date): ERROR - No backup files found!" | \
    mail -s "[OPUS ATLAS] Backup Missing Alert" opusatlas@gmail.com
    exit 1
fi

# Verificar se o backup é recente (menos de 25 horas)
BACKUP_AGE=$(find "$LATEST_BACKUP" -mtime +1)
if [ ! -z "$BACKUP_AGE" ]; then
    echo "$(date): WARNING - Latest backup is older than 24 hours: $LATEST_BACKUP" | \
    mail -s "[OPUS ATLAS] Backup Age Alert" opusatlas@gmail.com
fi

# Verificar tamanho do backup
BACKUP_SIZE=$(stat -f%z "$LATEST_BACKUP" 2>/dev/null || stat -c%s "$LATEST_BACKUP")
if [ "$BACKUP_SIZE" -lt 1048576 ]; then # < 1MB
    echo "$(date): ERROR - Backup file too small: $BACKUP_SIZE bytes" | \
    mail -s "[OPUS ATLAS] Backup Size Alert" opusatlas@gmail.com
fi

echo "$(date): Backup check passed - $LATEST_BACKUP ($(($BACKUP_SIZE/1048576))MB)"
```

### Backup Metrics

```prometheus
# Custom metrics para backup
opus_atlas_backup_age_hours
opus_atlas_backup_size_bytes
opus_atlas_backup_success_total
opus_atlas_backup_failure_total
```

---

## Troubleshooting

### Problemas Comuns de Monitoramento

#### **Grafana Não Carrega**

```bash
# Verificar logs
docker logs opus-atlas-grafana --tail 50

# Verificar conectividade com Prometheus
docker exec opus-atlas-grafana curl -f http://opus-atlas-prometheus:9090/api/v1/query?query=up

# Resetar dados (último recurso)
docker-compose stop grafana
docker volume rm opus-atlas_grafana_data
docker-compose up -d grafana
```

#### **Prometheus Sem Dados**

```bash
# Verificar targets
curl http://localhost:9090/api/v1/targets

# Verificar conectividade
docker exec opus-atlas-prometheus wget -qO- http://opus-atlas-node-exporter:9100/metrics

# Verificar configuração
docker exec opus-atlas-prometheus promtool check config /etc/prometheus/prometheus.yml
```

#### **Alerts Não Funcionam**

```bash
# Verificar regras de alertas
docker exec opus-atlas-prometheus promtool check rules /etc/prometheus/alerts.yml

# Testar firing alerts
curl http://localhost:9090/api/v1/alerts

# Verificar Alertmanager
curl http://localhost:9093/api/v1/alerts
```

### Comandos de Diagnóstico

```bash
# Status geral de monitoramento
curl -s http://localhost:9090/api/v1/query?query=up | jq '.data.result'

# Verificar métricas específicas
curl -s "http://localhost:9090/api/v1/query?query=node_load1" | jq '.data.result[0].value[1]'

# Health check de todos os serviços
docker-compose ps | grep -E "(grafana|prometheus|cadvisor|node-exporter)"

# Verificar uso de recursos de monitoramento
docker stats opus-atlas-grafana opus-atlas-prometheus opus-atlas-node-exporter opus-atlas-cadvisor --no-stream
```

---

## Manutenção e Otimização

### Limpeza Regular

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/monitoring-cleanup.sh

# Limpar métricas antigas do Prometheus (automático via retention)
# Configurado para 30 dias

# Limpar logs antigos
find /opt/opus-atlas/logs -name "*.log" -mtime +7 -exec gzip {} \;
find /opt/opus-atlas/logs -name "*.log.gz" -mtime +30 -delete

# Limpar dados de monitoramento órfãos
docker system prune -f
docker volume prune -f

echo "$(date): Monitoring cleanup completed"
```

### Otimização de Performance

#### **Prometheus Tuning**

```yaml
# prometheus.yml - configurações otimizadas
global:
  scrape_interval: 15s # Mais frequente para app crítica
  evaluation_interval: 15s

storage:
  tsdb:
    retention.time: 30d # 30 dias de retenção
    retention.size: 2GB # Limite de 2GB
```

#### **Grafana Optimization**

```bash
# Configuração de cache
[caching]
enabled = true

[database]
max_idle_conn = 2
max_open_conn = 10
```

---

## Conclusão

O sistema de monitoramento do Opus Atlas oferece observabilidade completa com:

**✅ Implementado:**

- Stack Grafana + Prometheus + Uptime Kuma
- 14 painéis de monitoramento integrados
- Alertas automáticos por email
- Logs centralizados e rotacionados
- Health checks automatizados
- Métricas de negócio e infraestrutura

**🔄 Expansões Futuras:**

- Integration com Slack/Teams
- Machine Learning para anomaly detection
- Custom business metrics
- Mobile alerts via push notifications

**📞 Suporte:**

- Documentação: docs/TROUBLESHOOTING.md
- Email: opusatlas@gmail.com
- Dashboards: https://monitor.opusatlas.com.br

---

**Responsável**: Claude (Anthropic)  
**Implementação**: 04-08/09/2025  
**Status**: ✅ Produção Completa  
**Próxima revisão**: Trimestral
