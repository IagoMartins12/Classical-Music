# 🛠️ Comandos Operacionais - Opus Atlas

> Guia completo de operação, manutenção, backup e comandos essenciais para gerenciamento da plataforma em produção.

## Índice

1. [Visão Geral Operacional](#visão-geral-operacional)
2. [Comandos de Deploy](#comandos-de-deploy)
3. [Gerenciamento de Containers](#gerenciamento-de-containers)
4. [Operações de Banco de Dados](#operações-de-banco-de-dados)
5. [Sistema de Backup](#sistema-de-backup)
6. [Manutenção de Sistema](#manutenção-de-sistema)
7. [Monitoramento Operacional](#monitoramento-operacional)
8. [Logs e Debugging](#logs-e-debugging)
9. [SSL/Certificados](#sslcertificados)
10. [Segurança Operacional](#segurança-operacional)
11. [Automação e Cron Jobs](#automação-e-cron-jobs)
12. [Disaster Recovery](#disaster-recovery)

---

## Visão Geral Operacional

### Stack Operacional

```bash
# Componentes principais em produção
SERVIDOR: Hostinger VPS KVM 2 (8GB RAM, 2 vCPUs, 100GB)
OS: Ubuntu 24.04.3 LTS
DOCKER: 28.4.0 + Docker Compose v2.39.2
NGINX: 1.25-alpine (Reverse Proxy + SSL)
MONGODB: 7.0 (Replica Set rs0)
REDIS: 7.2 (Cache/Sessions)
APP: Next.js 15.3.2 (247 páginas, 124 APIs)
```

### Estrutura de Diretórios Operacional

```bash
/opt/opus-atlas/                    # 🏠 Diretório raiz
├── app-source/Classical-Music/     # 📦 Código da aplicação
├── docker-compose.yml             # 🐳 Orquestração principal
├── .env.infrastructure           # ⚙️ Variáveis de infraestrutura
├── .env.production               # 🔐 Variáveis de produção
├── scripts/                      # 📜 Scripts de automação
│   ├── mongodb-backup.sh        # 💾 Backup do MongoDB
│   ├── docker-cleanup.sh        # 🧹 Limpeza Docker
│   ├── ssl-renew.sh            # 🔒 Renovação SSL
│   ├── health-check.sh         # 🏥 Verificação de saúde
│   ├── deploy.sh               # 🚀 Script de deploy
│   └── log-rotate.sh           # 📝 Rotação de logs
├── logs/                        # 📊 Logs centralizados
├── backups/                     # 💾 Backups locais
├── monitoring/                  # 📈 Configurações de monitoramento
└── nginx/                       # 🌐 Configurações Nginx
```

### Credenciais e Acessos

```bash
# SSH
Host: 72.60.145.88
User: opusatlas
Auth: ED25519 keys only

# MongoDB
User: opusatlas
Pass: SenhaSuperSegura!

# Redis
Pass: SenhaSuperSeguraRedis!

# Monitoring
User: admin
Pass: SenhaMonitorMonitor

# URLs
Production: https://opusatlas.com.br
Monitoring: https://monitor.opusatlas.com.br
Analytics: https://analytics.opusatlas.com.br
```

---

## Comandos de Deploy

### Deploy Manual Completo

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/deploy.sh
set -e

echo "🚀 Iniciando deploy do Opus Atlas..."

# Diretório base
cd /opt/opus-atlas

# Backup antes do deploy
echo "💾 Criando backup de segurança..."
./scripts/mongodb-backup.sh

# Atualizar código
echo "📦 Atualizando código..."
cd app-source/Classical-Music
git fetch origin
git checkout main
git pull origin main

# Build nova versão
echo "🔨 Building nova versão..."
cd /opt/opus-atlas
docker-compose build --no-cache app-prod

# Parar aplicação (manter DB e cache)
echo "⏹️ Parando aplicação..."
docker-compose stop app-prod

# Aguardar conexões finalizarem
sleep 10

# Iniciar nova versão
echo "▶️ Iniciando nova versão..."
docker-compose up -d app-prod

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 60

# Health check
echo "🏥 Verificando saúde da aplicação..."
for i in {1..5}; do
    if curl -f -H "Host: opusatlas.com.br" http://localhost:3000/api/health; then
        echo "✅ Deploy concluído com sucesso!"
        echo "📊 Verificando no monitoramento..."
        curl -f https://monitor.opusatlas.com.br:3003/api/health

        # Limpeza pós-deploy
        echo "🧹 Limpeza pós-deploy..."
        docker image prune -f

        # Enviar notificação
        echo "$(date): Deploy realizado com sucesso" | \
        mail -s "[OPUS ATLAS] Deploy Completed" opusatlas@gmail.com

        exit 0
    fi
    echo "⏳ Tentativa $i/5 falhou, aguardando..."
    sleep 30
done

# Se chegou até aqui, deploy falhou
echo "❌ Deploy falhou! Iniciando rollback..."
./scripts/rollback.sh
exit 1
```

### Deploy Rápido (Hot Reload)

```bash
# Deploy apenas do código (sem rebuild)
deploy-quick() {
    echo "🔥 Deploy rápido em andamento..."

    cd /opt/opus-atlas/app-source/Classical-Music
    git pull origin main

    # Restart apenas da aplicação
    docker-compose restart app-prod

    # Quick health check
    sleep 30
    curl -f http://localhost:3000/api/health && echo "✅ Deploy rápido concluído!"
}
```

### Rollback

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/rollback.sh

echo "🔄 Iniciando rollback..."

cd /opt/opus-atlas/app-source/Classical-Music

# Obter último commit estável
CURRENT_COMMIT=$(git rev-parse HEAD)
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)

echo "📋 Rollback de $CURRENT_COMMIT para $PREVIOUS_COMMIT"

# Voltar ao commit anterior
git checkout $PREVIOUS_COMMIT

# Rebuild e restart
cd /opt/opus-atlas
docker-compose build --no-cache app-prod
docker-compose up -d app-prod

# Health check
sleep 60
if curl -f http://localhost:3000/api/health; then
    echo "✅ Rollback concluído com sucesso!"
    echo "$(date): Rollback realizado - $CURRENT_COMMIT -> $PREVIOUS_COMMIT" | \
    mail -s "[OPUS ATLAS] Rollback Completed" opusatlas@gmail.com
else
    echo "❌ Rollback falhou! Intervenção manual necessária!"
    echo "$(date): CRÍTICO - Rollback falhou!" | \
    mail -s "[OPUS ATLAS] CRITICAL - Rollback Failed" opusatlas@gmail.com
fi
```

### Deploy via GitHub Actions (Trigger Manual)

```bash
# Trigger deploy via GitHub API
trigger-deploy() {
    local branch=${1:-main}

    curl -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/repos/IagoMartins12/Classical-Music/actions/workflows/deploy.yml/dispatches \
      -d "{\"ref\":\"$branch\"}"

    echo "🚀 Deploy triggered for branch: $branch"
}
```

---

## Gerenciamento de Containers

### Status e Overview

```bash
# Status completo
docker-status() {
    echo "📊 OPUS ATLAS CONTAINER STATUS"
    echo "=============================="

    docker-compose ps
    echo ""

    echo "📈 RESOURCE USAGE:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.PIDs}}"
    echo ""

    echo "🔍 CONTAINER DETAILS:"
    for container in opus-atlas-app-prod opus-atlas-mongodb-prod opus-atlas-redis opus-atlas-nginx; do
        echo "▶️ $container:"
        docker inspect $container --format '  Status: {{.State.Status}} | Started: {{.State.StartedAt}} | Restarts: {{.RestartCount}}'
    done
}

# Logs combinados
docker-logs() {
    local service=${1:-app-prod}
    local lines=${2:-50}

    echo "📝 Logs do $service (últimas $lines linhas):"
    docker-compose logs --tail=$lines -f $service
}

# Health check de todos os containers
docker-health() {
    echo "🏥 HEALTH CHECK DOS CONTAINERS"
    echo "==============================="

    # Aplicação
    echo -n "🔍 App-Prod: "
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | \
    case $(cat) in
        200) echo "✅ Healthy" ;;
        *) echo "❌ Unhealthy" ;;
    esac

    # MongoDB
    echo -n "🔍 MongoDB: "
    docker exec opus-atlas-mongodb-prod mongosh \
      --quiet --username opusatlas --password SenhaSuperSegura! \
      --authenticationDatabase admin --eval "db.adminCommand('ping').ok" 2>/dev/null | \
    case $(cat) in
        1) echo "✅ Healthy" ;;
        *) echo "❌ Unhealthy" ;;
    esac

    # Redis
    echo -n "🔍 Redis: "
    docker exec opus-atlas-redis redis-cli -a SenhaSuperSeguraRedis! ping 2>/dev/null | \
    case $(cat) in
        PONG) echo "✅ Healthy" ;;
        *) echo "❌ Unhealthy" ;;
    esac

    # Nginx
    echo -n "🔍 Nginx: "
    docker exec opus-atlas-nginx nginx -t 2>/dev/null && echo "✅ Healthy" || echo "❌ Unhealthy"
}
```

### Operações de Container

```bash
# Restart inteligente (ordem correta)
restart-all() {
    echo "🔄 Reiniciando todos os containers..."

    # Parar aplicação primeiro
    docker-compose stop app-prod

    # Restart infraestrutura
    docker-compose restart nginx redis mongodb-prod

    # Aguardar estabilização
    sleep 30

    # Restart aplicação
    docker-compose up -d app-prod

    # Restart monitoramento
    docker-compose restart prometheus grafana

    echo "✅ Restart completo finalizado!"
}

# Restart apenas da aplicação
restart-app() {
    echo "🔄 Reiniciando apenas a aplicação..."
    docker-compose restart app-prod

    sleep 30
    docker-health
}

# Rebuild completo
rebuild-all() {
    echo "🔨 Rebuild completo iniciado..."

    # Backup antes de rebuild
    ./scripts/mongodb-backup.sh

    # Parar tudo
    docker-compose down

    # Limpeza
    docker system prune -f

    # Rebuild
    docker-compose build --no-cache

    # Subir tudo
    docker-compose up -d

    # Health check
    sleep 120
    docker-health
}

# Limpeza de containers órfãos
cleanup-containers() {
    echo "🧹 Limpeza de containers e images..."

    # Parar containers órfãos
    docker ps -a -q -f status=exited | xargs -r docker rm

    # Remover images sem tag
    docker images -f "dangling=true" -q | xargs -r docker rmi

    # Remover volumes não utilizados
    docker volume prune -f

    # Remover networks não utilizados
    docker network prune -f

    echo "✅ Limpeza concluída!"
    docker system df
}
```

### Monitoramento de Recursos

```bash
# Uso detalhado de recursos
resource-usage() {
    echo "📊 RESOURCE USAGE REPORT"
    echo "======================="

    # System resources
    echo "🖥️ SYSTEM:"
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)% used"
    echo "Memory: $(free | grep Mem | awk '{printf "%.1f%% used", $3/$2 * 100.0}')"
    echo "Disk: $(df -h / | awk 'NR==2{printf "%s used", $5}')"
    echo ""

    # Docker resources
    echo "🐳 DOCKER:"
    docker system df
    echo ""

    # Top containers by resource usage
    echo "🔝 TOP CONTAINERS:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -6
}

# Alertas de recursos
check-resources() {
    # CPU check
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d'.' -f1)
    if [ $CPU_USAGE -gt 80 ]; then
        echo "⚠️ WARNING: High CPU usage: ${CPU_USAGE}%"
    fi

    # Memory check
    MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ $MEM_USAGE -gt 85 ]; then
        echo "⚠️ WARNING: High memory usage: ${MEM_USAGE}%"
    fi

    # Disk check
    DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1)
    if [ $DISK_USAGE -gt 85 ]; then
        echo "⚠️ WARNING: High disk usage: ${DISK_USAGE}%"
    fi
}
```

---

## Operações de Banco de Dados

### MongoDB Operations

```bash
# Conexão segura ao MongoDB
mongo-connect() {
    docker exec -it opus-atlas-mongodb-prod mongosh \
      --username opusatlas \
      --password SenhaSuperSegura! \
      --authenticationDatabase admin
}

# Queries rápidas de status
mongo-status() {
    echo "📊 MONGODB STATUS"
    echo "================"

    # Conexões
    echo "🔗 Conexões ativas:"
    docker exec opus-atlas-mongodb-prod mongosh \
      --quiet --username opusatlas --password SenhaSuperSegura! \
      --authenticationDatabase admin \
      --eval "db.serverStatus().connections" 2>/dev/null

    # Replica set status
    echo "🔄 Replica set status:"
    docker exec opus-atlas-mongodb-prod mongosh \
      --quiet --username opusatlas --password SenhaSuperSegura! \
      --authenticationDatabase admin \
      --eval "rs.status().ok" 2>/dev/null

    # Database stats
    echo "📈 Database stats:"
    docker exec opus-atlas-mongodb-prod mongosh \
      --quiet --username opusatlas --password SenhaSuperSegura! \
      --authenticationDatabase admin \
      --eval "use opus_atlas_prod; db.stats().dataSize" 2>/dev/null | \
      numfmt --to=iec --suffix=B
}

# Contagem de documentos
mongo-counts() {
    echo "📊 DOCUMENT COUNTS"
    echo "=================="

    docker exec opus-atlas-mongodb-prod mongosh \
      --quiet --username opusatlas --password SenhaSuperSegura! \
      --authenticationDatabase admin \
      --eval "
        use opus_atlas_prod;
        print('Users: ' + db.User.countDocuments());
        print('Composers: ' + db.Composer.countDocuments());
        print('Works: ' + db.Work.countDocuments());
        print('WorkScores: ' + db.WorkScore.countDocuments());
        print('Annotations: ' + db.WorkAnnotation.countDocuments());
        print('Teachers: ' + db.Teacher.countDocuments());
        print('Students: ' + db.Student.countDocuments());
        print('Lessons: ' + db.Lesson.countDocuments());
      " 2>/dev/null
}

# Queries lentas
mongo-slow-queries() {
    echo "🐌 SLOW QUERIES (>1s)"
    echo "==================="

    docker exec opus-atlas-mongodb-prod mongosh \
      --quiet --username opusatlas --password SenhaSuperSegura! \
      --authenticationDatabase admin \
      --eval "
        use opus_atlas_prod;
        db.system.profile.find().limit(5).sort({ts:-1}).forEach(printjson);
      " 2>/dev/null
}

# Limpeza de logs do MongoDB
mongo-cleanup() {
    echo "🧹 Limpeza de logs do MongoDB..."

    # Rotacionar logs
    docker exec opus-atlas-mongodb-prod mongosh \
      --username opusatlas --password SenhaSuperSegura! \
      --authenticationDatabase admin \
      --eval "db.adminCommand('logRotate')" 2>/dev/null

    # Compactar collections se necessário
    docker exec opus-atlas-mongodb-prod mongosh \
      --username opusatlas --password SenhaSuperSegura! \
      --authenticationDatabase admin \
      --eval "
        use opus_atlas_prod;
        db.runCommand({compact: 'WorkScore'});
      " 2>/dev/null

    echo "✅ Limpeza do MongoDB concluída!"
}
```

### Redis Operations

```bash
# Redis status
redis-status() {
    echo "📊 REDIS STATUS"
    echo "==============="

    docker exec opus-atlas-redis redis-cli -a SenhaSuperSeguraRedis! INFO memory 2>/dev/null | \
    grep -E "(used_memory_human|used_memory_peak_human|mem_fragmentation_ratio)"

    echo ""
    docker exec opus-atlas-redis redis-cli -a SenhaSuperSeguraRedis! INFO stats 2>/dev/null | \
    grep -E "(total_commands_processed|instantaneous_ops_per_sec|keyspace_hits|keyspace_misses)"
}

# Redis keys analysis
redis-keys() {
    echo "🔑 REDIS KEYS ANALYSIS"
    echo "====================="

    echo "Total keys:"
    docker exec opus-atlas-redis redis-cli -a SenhaSuperSeguraRedis! DBSIZE 2>/dev/null

    echo ""
    echo "Sample keys:"
    docker exec opus-atlas-redis redis-cli -a SenhaSuperSeguraRedis! --scan --count 10 2>/dev/null | head -10
}

# Flush Redis (CUIDADO!)
redis-flush() {
    read -p "⚠️ Isso irá apagar TODOS os dados do Redis. Confirma? (yes/no): " confirm
    if [[ $confirm == "yes" ]]; then
        docker exec opus-atlas-redis redis-cli -a SenhaSuperSeguraRedis! FLUSHALL 2>/dev/null
        echo "🗑️ Redis flushed!"
    else
        echo "❌ Operação cancelada."
    fi
}
```

---

## Sistema de Backup

### Backup Automático do MongoDB

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/mongodb-backup.sh

set -e

BACKUP_DIR="/opt/opus-atlas/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
LOG_FILE="/opt/opus-atlas/logs/backup.log"

echo "$(date): Iniciando backup do MongoDB..." | tee -a $LOG_FILE

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Verificar espaço em disco
AVAILABLE_SPACE=$(df -BG $BACKUP_DIR | awk 'NR==2 {print $4}' | sed 's/G//')
if [ $AVAILABLE_SPACE -lt 5 ]; then
    echo "$(date): ERRO - Espaço insuficiente em disco: ${AVAILABLE_SPACE}GB" | tee -a $LOG_FILE
    exit 1
fi

# Criar backup
echo "$(date): Criando backup..." | tee -a $LOG_FILE
docker exec opus-atlas-mongodb-prod mongodump \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --db opus_atlas_prod \
  --gzip \
  --out /data/backup_${DATE}

# Copiar para host
echo "$(date): Copiando backup para host..." | tee -a $LOG_FILE
docker cp opus-atlas-mongodb-prod:/data/backup_${DATE} ${BACKUP_DIR}/

# Comprimir
echo "$(date): Comprimindo backup..." | tee -a $LOG_FILE
tar -czf ${BACKUP_DIR}/opus_atlas_${DATE}.tar.gz -C ${BACKUP_DIR} backup_${DATE}

# Remover diretório temporário
rm -rf ${BACKUP_DIR}/backup_${DATE}
docker exec opus-atlas-mongodb-prod rm -rf /data/backup_${DATE}

# Verificar integridade
BACKUP_FILE="${BACKUP_DIR}/opus_atlas_${DATE}.tar.gz"
if tar -tzf $BACKUP_FILE > /dev/null 2>&1; then
    BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "$(date): Backup criado com sucesso - $BACKUP_SIZE" | tee -a $LOG_FILE

    # Calcular checksum
    SHA256=$(sha256sum $BACKUP_FILE | awk '{print $1}')
    echo "$(date): Backup checksum: $SHA256" | tee -a $LOG_FILE
    echo "$SHA256  opus_atlas_${DATE}.tar.gz" >> ${BACKUP_DIR}/checksums.txt
else
    echo "$(date): ERRO - Falha na verificação do backup!" | tee -a $LOG_FILE
    rm -f $BACKUP_FILE
    exit 1
fi

# Limpeza de backups antigos
echo "$(date): Limpando backups antigos..." | tee -a $LOG_FILE
find ${BACKUP_DIR} -name "opus_atlas_*.tar.gz" -mtime +${RETENTION_DAYS} -delete

# Estatísticas finais
TOTAL_BACKUPS=$(ls -1 ${BACKUP_DIR}/opus_atlas_*.tar.gz | wc -l)
TOTAL_SIZE=$(du -sh ${BACKUP_DIR} | cut -f1)

echo "$(date): Backup concluído! Total: $TOTAL_BACKUPS backups ($TOTAL_SIZE)" | tee -a $LOG_FILE

# Enviar notificação se backup diário
if [ "$(date +%H)" -eq 2 ]; then
    echo "Backup diário concluído com sucesso!

Arquivo: opus_atlas_${DATE}.tar.gz
Tamanho: $BACKUP_SIZE
Checksum: $SHA256
Total de backups: $TOTAL_BACKUPS
Espaço total: $TOTAL_SIZE

Dashboard: https://monitor.opusatlas.com.br:3003" | \
    mail -s "[OPUS ATLAS] Backup Completed" opusatlas@gmail.com
fi
```

### Restore do Backup

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/mongodb-restore.sh

set -e

BACKUP_DIR="/opt/opus-atlas/backups/mongodb"
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Uso: $0 <backup_file.tar.gz>"
    echo "📋 Backups disponíveis:"
    ls -la $BACKUP_DIR/opus_atlas_*.tar.gz | tail -10
    exit 1
fi

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "❌ Arquivo não encontrado: $BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

echo "⚠️ ATENÇÃO: Este processo irá SUBSTITUIR todos os dados atuais!"
echo "📁 Arquivo: $BACKUP_FILE"
echo "📊 Tamanho: $(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)"

read -p "🤔 Deseja continuar? (yes/no): " confirm
if [[ $confirm != "yes" ]]; then
    echo "❌ Restore cancelado."
    exit 0
fi

# Backup de segurança antes do restore
echo "💾 Criando backup de segurança antes do restore..."
./scripts/mongodb-backup.sh

# Extrair backup
TEMP_DIR="/tmp/restore_$(date +%Y%m%d_%H%M%S)"
mkdir -p $TEMP_DIR
echo "📦 Extraindo backup..."
tar -xzf $BACKUP_DIR/$BACKUP_FILE -C $TEMP_DIR

# Parar aplicação
echo "⏹️ Parando aplicação..."
docker-compose stop app-prod

# Copiar dados para container
EXTRACT_DIR=$(find $TEMP_DIR -name "backup_*" -type d | head -1)
docker cp $EXTRACT_DIR opus-atlas-mongodb-prod:/data/restore_data

# Executar restore
echo "🔄 Executando restore..."
docker exec opus-atlas-mongodb-prod mongorestore \
  --username opusatlas \
  --password SenhaSuperSegura! \
  --authenticationDatabase admin \
  --db opus_atlas_prod \
  --drop \
  --gzip \
  /data/restore_data/opus_atlas_prod

# Limpeza
rm -rf $TEMP_DIR
docker exec opus-atlas-mongodb-prod rm -rf /data/restore_data

# Restart aplicação
echo "▶️ Reiniciando aplicação..."
docker-compose up -d app-prod

# Health check
sleep 60
echo "🏥 Verificando saúde da aplicação..."
if curl -f http://localhost:3000/api/health; then
    echo "✅ Restore concluído com sucesso!"
else
    echo "❌ Falha no health check pós-restore!"
    exit 1
fi
```

### Backup Verification

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/verify-backups.sh

BACKUP_DIR="/opt/opus-atlas/backups/mongodb"
CHECKSUMS_FILE="$BACKUP_DIR/checksums.txt"

echo "🔍 VERIFICAÇÃO DE BACKUPS"
echo "========================"

if [ ! -f "$CHECKSUMS_FILE" ]; then
    echo "❌ Arquivo de checksums não encontrado!"
    exit 1
fi

TOTAL=0
VERIFIED=0
FAILED=0

while read -r checksum filename; do
    if [ -f "$BACKUP_DIR/$filename" ]; then
        TOTAL=$((TOTAL + 1))
        CURRENT_CHECKSUM=$(sha256sum "$BACKUP_DIR/$filename" | awk '{print $1}')

        if [ "$checksum" = "$CURRENT_CHECKSUM" ]; then
            echo "✅ $filename - OK"
            VERIFIED=$((VERIFIED + 1))
        else
            echo "❌ $filename - CHECKSUM MISMATCH!"
            FAILED=$((FAILED + 1))
        fi
    fi
done < "$CHECKSUMS_FILE"

echo ""
echo "📊 RESULTADO:"
echo "Total: $TOTAL"
echo "Verificados: $VERIFIED"
echo "Falhas: $FAILED"

if [ $FAILED -gt 0 ]; then
    echo "$(date): Falha na verificação de $FAILED backups!" | \
    mail -s "[OPUS ATLAS] Backup Verification Failed" opusatlas@gmail.com
    exit 1
else
    echo "✅ Todos os backups verificados com sucesso!"
fi
```

---

## Manutenção de Sistema

### Atualizações do Sistema

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/system-update.sh

echo "🔄 Iniciando atualização do sistema..."

# Backup antes da atualização
echo "💾 Criando backup de segurança..."
./scripts/mongodb-backup.sh

# Atualizar lista de pacotes
echo "📋 Atualizando lista de pacotes..."
apt update

# Verificar atualizações disponíveis
UPDATES=$(apt list --upgradable 2>/dev/null | wc -l)
echo "📦 $UPDATES atualizações disponíveis"

if [ $UPDATES -gt 1 ]; then
    # Atualizar sistema
    echo "⬆️ Aplicando atualizações..."
    apt upgrade -y

    # Atualizar Docker se necessário
    echo "🐳 Verificando Docker..."
    docker version

    # Limpeza
    echo "🧹 Limpeza pós-atualização..."
    apt autoremove -y
    apt autoclean

    # Verificar se reinicialização é necessária
    if [ -f /var/run/reboot-required ]; then
        echo "🔄 Reinicialização necessária!"
        echo "$(date): Sistema atualizado - reinicialização necessária" | \
        mail -s "[OPUS ATLAS] System Update - Reboot Required" opusatlas@gmail.com
    else
        echo "✅ Atualização concluída sem necessidade de reinicialização"
    fi
else
    echo "✅ Sistema já está atualizado"
fi
```

### Limpeza Geral

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/system-cleanup.sh

echo "🧹 LIMPEZA GERAL DO SISTEMA"
echo "==========================="

# Limpeza Docker
echo "🐳 Limpeza Docker..."
docker system prune -f --volumes
docker image prune -a -f

# Limpeza de logs
echo "📝 Limpeza de logs..."
journalctl --vacuum-time=7d
find /opt/opus-atlas/logs -name "*.log" -mtime +7 -exec gzip {} \;
find /opt/opus-atlas/logs -name "*.log.gz" -mtime +30 -delete

# Limpeza de cache do sistema
echo "💾 Limpeza de cache..."
sync && echo 3 > /proc/sys/vm/drop_caches

# Limpeza APT
echo "📦 Limpeza APT..."
apt autoremove -y
apt autoclean

# Limpeza de arquivos temporários
echo "🗑️ Limpeza de temporários..."
find /tmp -type f -mtime +7 -delete
find /var/tmp -type f -mtime +7 -delete

# Relatório de espaço
echo "📊 RELATÓRIO DE ESPAÇO:"
df -h /
echo ""
echo "🐳 ESPAÇO DOCKER:"
docker system df

echo "✅ Limpeza geral concluída!"
```

### Monitoramento de Saúde

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/health-monitor.sh

LOG_FILE="/opt/opus-atlas/logs/health-monitor.log"
ALERT_EMAIL="opusatlas@gmail.com"
CRITICAL_ISSUES=0

echo "$(date): Iniciando monitoramento de saúde..." >> $LOG_FILE

# Função para alertas
alert() {
    local severity=$1
    local message=$2
    echo "$(date): [$severity] $message" >> $LOG_FILE

    if [ "$severity" = "CRITICAL" ]; then
        CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
    fi
}

# Verificar containers
echo "🐳 Verificando containers..."
for container in opus-atlas-app-prod opus-atlas-mongodb-prod opus-atlas-redis opus-atlas-nginx; do
    if ! docker ps | grep -q $container; then
        alert "CRITICAL" "Container $container não está rodando!"
    fi
done

# Verificar recursos
echo "📊 Verificando recursos..."

# CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d'.' -f1)
if [ $CPU_USAGE -gt 80 ]; then
    alert "WARNING" "Alto uso de CPU: ${CPU_USAGE}%"
fi

# Memória
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEM_USAGE -gt 85 ]; then
    alert "CRITICAL" "Alto uso de memória: ${MEM_USAGE}%"
fi

# Disco
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1)
if [ $DISK_USAGE -gt 85 ]; then
    alert "CRITICAL" "Alto uso de disco: ${DISK_USAGE}%"
fi

# Verificar aplicação
echo "🌐 Verificando aplicação..."
if ! curl -f -m 10 http://localhost:3000/api/health > /dev/null 2>&1; then
    alert "CRITICAL" "Aplicação não está respondendo!"
fi

# Verificar SSL
echo "🔒 Verificando SSL..."
SSL_DAYS=$(openssl x509 -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem -noout -dates | \
           grep notAfter | cut -d= -f2 | xargs -I {} date -d {} +%s)
CURRENT_DATE=$(date +%s)
DAYS_LEFT=$(( (SSL_DAYS - CURRENT_DATE) / 86400 ))

if [ $DAYS_LEFT -lt 7 ]; then
    alert "WARNING" "Certificado SSL expira em $DAYS_LEFT dias"
fi

# Verificar backups
echo "💾 Verificando backups..."
LATEST_BACKUP=$(ls -t /opt/opus-atlas/backups/mongodb/opus_atlas_*.tar.gz 2>/dev/null | head -n1)
if [ -n "$LATEST_BACKUP" ]; then
    BACKUP_AGE=$(find "$LATEST_BACKUP" -mtime +1)
    if [ -n "$BACKUP_AGE" ]; then
        alert "WARNING" "Último backup tem mais de 24 horas"
    fi
else
    alert "CRITICAL" "Nenhum backup encontrado!"
fi

# Enviar alerta se houver problemas críticos
if [ $CRITICAL_ISSUES -gt 0 ]; then
    SUMMARY=$(tail -20 $LOG_FILE | grep -E "(CRITICAL|WARNING)")

    echo "OPUS ATLAS HEALTH ALERT

$CRITICAL_ISSUES problema(s) crítico(s) detectado(s):

$SUMMARY

Dashboard: https://monitor.opusatlas.com.br:3003
Logs: $LOG_FILE

Ação necessária: Investigar imediatamente!" | \
    mail -s "[OPUS ATLAS] Health Alert - $CRITICAL_ISSUES Critical Issues" $ALERT_EMAIL
fi

echo "$(date): Monitoramento concluído - $CRITICAL_ISSUES problemas críticos" >> $LOG_FILE
```

---

## Monitoramento Operacional

### Métricas em Tempo Real

```bash
# Dashboard em tempo real
live-dashboard() {
    while true; do
        clear
        echo "📊 OPUS ATLAS - LIVE DASHBOARD"
        echo "=============================="
        echo "🕐 $(date)"
        echo ""

        # System metrics
        echo "🖥️ SYSTEM:"
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')"
        echo "Memory: $(free | grep Mem | awk '{printf "%.1f%% used", $3/$2 * 100.0}')"
        echo "Disk: $(df -h / | awk 'NR==2{printf "%s used", $5}')"
        echo ""

        # Container status
        echo "🐳 CONTAINERS:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep opus-atlas
        echo ""

        # Application metrics
        echo "🌐 APPLICATION:"
        echo -n "Health: "
        curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health
        echo ""
        echo -n "Response time: "
        curl -s -o /dev/null -w "%{time_total}s" http://localhost:3000/api/health
        echo ""

        # Database
        echo "🗄️ DATABASE:"
        echo "MongoDB: $(docker exec opus-atlas-mongodb-prod mongosh --quiet --username opusatlas --password SenhaSuperSegura! --authenticationDatabase admin --eval 'rs.status().ok' 2>/dev/null || echo 'Error')"
        echo "Redis: $(docker exec opus-atlas-redis redis-cli -a SenhaSuperSeguraRedis! ping 2>/dev/null || echo 'Error')"

        sleep 5
    done
}

# Métricas de performance
performance-metrics() {
    echo "⚡ PERFORMANCE METRICS"
    echo "===================="

    # Load average
    echo "📊 Load Average:"
    uptime

    # Top processes
    echo ""
    echo "🔝 Top processes:"
    ps aux --sort=-%cpu | head -6

    # Network connections
    echo ""
    echo "🌐 Network connections:"
    netstat -an | grep ESTABLISHED | wc -l | xargs echo "Active connections:"

    # Disk I/O
    echo ""
    echo "💿 Disk I/O:"
    iostat -d 1 1 | grep -A 3 "Device"
}
```

### Alertas Inteligentes

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/smart-alerts.sh

# Configuração de thresholds
CPU_WARNING=70
CPU_CRITICAL=85
MEMORY_WARNING=80
MEMORY_CRITICAL=90
DISK_WARNING=80
DISK_CRITICAL=90
RESPONSE_TIME_WARNING=2.0
RESPONSE_TIME_CRITICAL=5.0

check_and_alert() {
    local metric=$1
    local value=$2
    local warning_threshold=$3
    local critical_threshold=$4
    local unit=${5:-""}

    if (( $(echo "$value > $critical_threshold" | bc -l) )); then
        echo "🚨 CRITICAL: $metric is ${value}${unit} (threshold: ${critical_threshold}${unit})"
        return 2
    elif (( $(echo "$value > $warning_threshold" | bc -l) )); then
        echo "⚠️ WARNING: $metric is ${value}${unit} (threshold: ${warning_threshold}${unit})"
        return 1
    else
        echo "✅ OK: $metric is ${value}${unit}"
        return 0
    fi
}

# Verificar CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
check_and_alert "CPU Usage" $CPU_USAGE $CPU_WARNING $CPU_CRITICAL "%"

# Verificar Memory
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
check_and_alert "Memory Usage" $MEMORY_USAGE $MEMORY_WARNING $MEMORY_CRITICAL "%"

# Verificar Disk
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1)
check_and_alert "Disk Usage" $DISK_USAGE $DISK_WARNING $DISK_CRITICAL "%"

# Verificar Response Time
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/api/health)
check_and_alert "Response Time" $RESPONSE_TIME $RESPONSE_TIME_WARNING $RESPONSE_TIME_CRITICAL "s"
```

---

## Logs e Debugging

### Análise de Logs

```bash
# Análise de logs da aplicação
analyze-app-logs() {
    local hours=${1:-1}

    echo "📊 ANÁLISE DE LOGS ($hours hora(s))"
    echo "================================"

    # Logs de erro
    echo "❌ ERROS:"
    docker logs opus-atlas-app-prod --since="${hours}h" 2>&1 | grep -i error | tail -10

    # Logs de warning
    echo ""
    echo "⚠️ WARNINGS:"
    docker logs opus-atlas-app-prod --since="${hours}h" 2>&1 | grep -i warning | tail -10

    # Requisições mais comuns
    echo ""
    echo "🌐 TOP REQUESTS:"
    docker exec opus-atlas-nginx cat /var/log/nginx/access.log | \
    awk '{print $7}' | sort | uniq -c | sort -rn | head -10

    # Status codes
    echo ""
    echo "📊 STATUS CODES:"
    docker exec opus-atlas-nginx cat /var/log/nginx/access.log | \
    awk '{print $9}' | sort | uniq -c | sort -rn
}

# Debug específico
debug-issue() {
    local component=$1

    case $component in
        "app"|"application")
            echo "🐛 DEBUG APPLICATION"
            docker logs opus-atlas-app-prod --tail 50 -f
            ;;
        "db"|"database"|"mongodb")
            echo "🐛 DEBUG MONGODB"
            docker logs opus-atlas-mongodb-prod --tail 50 -f
            ;;
        "redis")
            echo "🐛 DEBUG REDIS"
            docker logs opus-atlas-redis --tail 50 -f
            ;;
        "nginx")
            echo "🐛 DEBUG NGINX"
            docker logs opus-atlas-nginx --tail 50 -f
            ;;
        *)
            echo "❌ Componente inválido. Use: app, db, redis, nginx"
            ;;
    esac
}

# Logs consolidados
consolidated-logs() {
    local since=${1:-"1h"}

    echo "📝 LOGS CONSOLIDADOS ($since)"
    echo "========================="

    echo "🔍 Application:"
    docker logs opus-atlas-app-prod --since=$since --timestamps | head -5

    echo ""
    echo "🔍 MongoDB:"
    docker logs opus-atlas-mongodb-prod --since=$since --timestamps | head -5

    echo ""
    echo "🔍 Nginx:"
    docker logs opus-atlas-nginx --since=$since --timestamps | head -5

    echo ""
    echo "🔍 System:"
    journalctl --since=$since | head -5
}
```

---

## SSL/Certificados

### Gerenciamento SSL

```bash
# Status SSL
ssl-status() {
    echo "🔒 SSL CERTIFICATE STATUS"
    echo "========================="

    for domain in opusatlas.com.br www.opusatlas.com.br monitor.opusatlas.com.br; do
        echo "🌐 $domain:"
        echo -n "  Status: "
        if openssl x509 -checkend 86400 -noout -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem; then
            echo "✅ Valid"
        else
            echo "❌ Expires soon"
        fi

        echo "  Expires: $(openssl x509 -enddate -noout -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem | cut -d= -f2)"
        echo ""
    done
}

# Renovação SSL
ssl-renew() {
    echo "🔄 Renovando certificados SSL..."

    # Parar nginx
    docker-compose stop nginx

    # Renovar
    docker run --rm \
      -v /etc/letsencrypt:/etc/letsencrypt \
      -v /var/www/certbot:/var/www/certbot \
      -p 80:80 \
      certbot/certbot renew --standalone

    # Restart nginx
    docker-compose start nginx

    # Verificar
    ssl-status

    echo "✅ Renovação SSL concluída!"
}

# Teste SSL
ssl-test() {
    echo "🧪 Testando configuração SSL..."

    # Teste de conectividade
    echo -n "🔗 Conectividade: "
    if openssl s_client -connect opusatlas.com.br:443 -servername opusatlas.com.br < /dev/null > /dev/null 2>&1; then
        echo "✅ OK"
    else
        echo "❌ Falha"
    fi

    # Teste de certificado
    echo -n "📜 Certificado: "
    if openssl x509 -checkend 86400 -noout -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem; then
        echo "✅ Válido"
    else
        echo "❌ Problema"
    fi

    # Teste de cipher suites
    echo "🔐 Testing strong ciphers..."
    nmap --script ssl-enum-ciphers -p 443 opusatlas.com.br
}
```

---

## Segurança Operacional

### Monitoramento de Segurança

```bash
# Verificar tentativas de login
security-check() {
    echo "🛡️ SECURITY CHECK"
    echo "================="

    # SSH failures
    echo "🔐 SSH Failures (últimas 24h):"
    journalctl --since "24 hours ago" | grep "Failed password" | wc -l

    # Fail2ban status
    echo ""
    echo "🚫 Fail2ban Status:"
    fail2ban-client status

    # IPs banidos
    echo ""
    echo "🚷 IPs Banidos:"
    fail2ban-client status sshd | grep "Banned IP list" | cut -d: -f2

    # Firewall status
    echo ""
    echo "🔥 Firewall Status:"
    ufw status numbered | head -10

    # Processos suspeitos
    echo ""
    echo "👀 Processos com alta CPU:"
    ps aux --sort=-%cpu | head -6
}

# Auditoria rápida
quick-audit() {
    echo "🔍 QUICK SECURITY AUDIT"
    echo "======================="

    # Verificações básicas
    checks=(
        "SSH root login disabled:grep '^PermitRootLogin no' /etc/ssh/sshd_config"
        "UFW firewall enabled:ufw status | grep -q active"
        "Fail2ban running:systemctl is-active fail2ban"
        "No password auth:grep '^PasswordAuthentication no' /etc/ssh/sshd_config"
        "SSL certificate valid:openssl x509 -checkend 86400 -noout -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem"
    )

    for check in "${checks[@]}"; do
        description=$(echo $check | cut -d: -f1)
        command=$(echo $check | cut -d: -f2-)

        echo -n "$description: "
        if eval $command > /dev/null 2>&1; then
            echo "✅ PASS"
        else
            echo "❌ FAIL"
        fi
    done
}
```

---

## Automação e Cron Jobs

### Crontab de Produção

```bash
# /etc/crontab completo para produção
# Visualizar: crontab -l
# Editar: crontab -e

# Backup diário às 2:00 AM
0 2 * * * /opt/opus-atlas/scripts/mongodb-backup.sh

# Limpeza Docker semanal (domingos às 3:00 AM)
0 3 * * 0 /opt/opus-atlas/scripts/docker-cleanup.sh

# Verificação SSL mensal (dia 1 às 1:00 AM)
0 1 1 * * /opt/opus-atlas/scripts/ssl-renew.sh

# Rotação de logs diária (4:00 AM)
0 4 * * * /opt/opus-atlas/scripts/log-rotate.sh

# Health check a cada 15 minutos
*/15 * * * * /opt/opus-atlas/scripts/health-monitor.sh

# Verificação de segurança diária (5:00 AM)
0 5 * * * /opt/opus-atlas/scripts/security-check.sh

# Atualização do sistema semanal (sábados 6:00 AM)
0 6 * * 6 /opt/opus-atlas/scripts/system-update.sh

# Limpeza geral mensal (primeiro domingo 7:00 AM)
0 7 1-7 * 0 /opt/opus-atlas/scripts/system-cleanup.sh

# Verificação de backups diária (8:00 AM)
0 8 * * * /opt/opus-atlas/scripts/verify-backups.sh
```

### Scripts de Automação

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/automation-manager.sh

# Gerenciador de automação
case $1 in
    "status")
        echo "📋 STATUS DA AUTOMAÇÃO"
        echo "===================="
        echo "Cron jobs ativos:"
        crontab -l | grep -v "^#"
        echo ""
        echo "Último backup:"
        ls -la /opt/opus-atlas/backups/mongodb/opus_atlas_*.tar.gz | tail -1
        echo ""
        echo "Status dos serviços:"
        systemctl status cron
        ;;

    "logs")
        echo "📝 LOGS DE AUTOMAÇÃO"
        echo "==================="
        tail -20 /opt/opus-atlas/logs/backup.log
        echo ""
        tail -10 /opt/opus-atlas/logs/health-monitor.log
        ;;

    "test")
        echo "🧪 TESTE DE AUTOMAÇÃO"
        echo "==================="

        # Teste de backup
        echo "Testando backup..."
        /opt/opus-atlas/scripts/mongodb-backup.sh

        # Teste de health check
        echo "Testando health check..."
        /opt/opus-atlas/scripts/health-monitor.sh

        echo "✅ Testes concluídos!"
        ;;

    *)
        echo "Uso: $0 {status|logs|test}"
        ;;
esac
```

---

## Disaster Recovery

### Plano de Recuperação

```bash
#!/bin/bash
# /opt/opus-atlas/scripts/disaster-recovery.sh

disaster_recovery() {
    local scenario=$1

    echo "🆘 DISASTER RECOVERY - $scenario"
    echo "================================"

    case $scenario in
        "database")
            echo "🗄️ Recuperação de banco de dados..."

            # Encontrar backup mais recente
            LATEST_BACKUP=$(ls -t /opt/opus-atlas/backups/mongodb/opus_atlas_*.tar.gz | head -1)
            echo "📁 Usando backup: $LATEST_BACKUP"

            # Executar restore
            ./scripts/mongodb-restore.sh $(basename $LATEST_BACKUP)
            ;;

        "complete")
            echo "🏗️ Recuperação completa do sistema..."

            # 1. Parar todos os serviços
            docker-compose down

            # 2. Backup de emergência
            ./scripts/mongodb-backup.sh

            # 3. Limpar e reconstruir
            docker system prune -a -f
            docker-compose build --no-cache

            # 4. Restaurar dados
            LATEST_BACKUP=$(ls -t /opt/opus-atlas/backups/mongodb/opus_atlas_*.tar.gz | head -1)
            docker-compose up -d mongodb-prod redis
            sleep 30
            ./scripts/mongodb-restore.sh $(basename $LATEST_BACKUP)

            # 5. Subir aplicação
            docker-compose up -d

            # 6. Verificar
            sleep 60
            ./scripts/health-monitor.sh
            ;;

        "security")
            echo "🛡️ Resposta a incidente de segurança..."

            # Isolar sistema
            ufw --force reset
            ufw default deny incoming
            ufw default deny outgoing
            ufw allow out 53
            ufw limit 22/tcp
            ufw enable

            # Parar aplicação
            docker-compose stop app-prod nginx

            # Coletar evidências
            ./scripts/collect-evidence.sh

            echo "🔒 Sistema isolado. Investigação necessária."
            ;;

        *)
            echo "Cenários disponíveis: database, complete, security"
            ;;
    esac
}

# Recovery checklist
recovery_checklist() {
    echo "✅ CHECKLIST DE RECUPERAÇÃO"
    echo "=========================="

    checks=(
        "Containers rodando:docker ps | grep -c opus-atlas"
        "App respondendo:curl -f http://localhost:3000/api/health"
        "MongoDB ativo:docker exec opus-atlas-mongodb-prod mongosh --quiet --username opusatlas --password SenhaSuperSegura! --authenticationDatabase admin --eval 'rs.status().ok'"
        "Redis ativo:docker exec opus-atlas-redis redis-cli -a SenhaSuperSeguraRedis! ping"
        "SSL válido:openssl x509 -checkend 86400 -noout -in /etc/letsencrypt/live/opusatlas.com.br/cert.pem"
        "Firewall ativo:ufw status | grep -q active"
        "Backup recente:find /opt/opus-atlas/backups/mongodb -name 'opus_atlas_*.tar.gz' -mtime -1"
    )

    for check in "${checks[@]}"; do
        description=$(echo $check | cut -d: -f1)
        command=$(echo $check | cut -d: -f2-)

        echo -n "$description: "
        if eval $command > /dev/null 2>&1; then
            echo "✅"
        else
            echo "❌"
        fi
    done
}

# Executar baseado no argumento
case ${1:-"checklist"} in
    "database"|"complete"|"security")
        disaster_recovery $1
        ;;
    "checklist")
        recovery_checklist
        ;;
    *)
        echo "Uso: $0 {database|complete|security|checklist}"
        ;;
esac
```

### Procedimento de Emergência

```bash
# SOS - Emergency procedures
emergency_stop() {
    echo "🚨 PARADA DE EMERGÊNCIA"
    docker-compose down
    ufw deny 80
    ufw deny 443
}

emergency_start() {
    echo "🚑 INICIALIZAÇÃO DE EMERGÊNCIA"
    docker-compose up -d
    ufw allow 80
    ufw allow 443
}

emergency_status() {
    echo "🆘 STATUS DE EMERGÊNCIA"
    echo "======================"
    docker ps
    systemctl status docker
    ufw status
    df -h
    free -h
}
```

---

## Aliases Úteis

```bash
# Adicionar ao ~/.bashrc do usuário opusatlas

# Navegação rápida
alias cdopus='cd /opt/opus-atlas'
alias cdlogs='cd /opt/opus-atlas/logs'
alias cdbackups='cd /opt/opus-atlas/backups'

# Docker shortcuts
alias dps='docker ps'
alias dlog='docker logs'
alias dexec='docker exec -it'
alias dstats='docker stats --no-stream'

# Compose shortcuts
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dcps='docker-compose ps'
alias dclog='docker-compose logs'
alias dcbuild='docker-compose build --no-cache'

# Aplicação específica
alias app-logs='docker logs opus-atlas-app-prod -f'
alias mongo-connect='docker exec -it opus-atlas-mongodb-prod mongosh --username opusatlas --password SenhaSuperSegura! --authenticationDatabase admin'
alias redis-connect='docker exec -it opus-atlas-redis redis-cli -a SenhaSuperSeguraRedis!'

# Monitoramento
alias status='docker-compose ps && df -h && free -h'
alias health='curl -s http://localhost:3000/api/health | jq'
alias monitor='cd /opt/opus-atlas && ./scripts/live-dashboard.sh'

# Manutenção
alias backup-now='/opt/opus-atlas/scripts/mongodb-backup.sh'
alias cleanup='/opt/opus-atlas/scripts/system-cleanup.sh'
alias security-check='/opt/opus-atlas/scripts/security-check.sh'

# Deploy
alias deploy='/opt/opus-atlas/scripts/deploy.sh'
alias rollback='/opt/opus-atlas/scripts/rollback.sh'
```

---

## Conclusão

Este guia operacional fornece todos os comandos e procedimentos necessários para:

**✅ Operação Diária:**

- Deploy e rollback automatizados
- Monitoramento em tempo real
- Backup e restore seguros
- Manutenção preventiva

**✅ Resolução de Problemas:**

- Debugging avançado
- Análise de logs
- Health checks automáticos
- Recovery procedures

**✅ Automação:**

- Cron jobs configurados
- Scripts de manutenção
- Alertas inteligentes
- Disaster recovery

**📞 Suporte Operacional:**

- Documentação: docs/OPERATIONS.md
- Troubleshooting: docs/TROUBLESHOOTING.md
- Email: opusatlas@gmail.com
- Monitoramento: https://monitor.opusatlas.com.br

---

**Responsável**: Claude (Anthropic)  
**Implementação**: 04-08/09/2025  
**Status**: ✅ Produção Operacional  
**Próxima revisão**: Mensal
