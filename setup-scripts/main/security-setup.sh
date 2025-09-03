#!/bin/bash

# =============================================================================
# SCRIPT DE HARDENING E SEGURANÇA - OPUS ATLAS
# =============================================================================
# Este script configura todas as medidas de segurança essenciais
# Execute como root na VPS Linode

set -euo pipefail  # Fail on any error

echo "🔐 INICIANDO CONFIGURAÇÃO DE SEGURANÇA..."

# =============================================================================
# 1. CRIAÇÃO DE USUÁRIO NÃO-ROOT
# =============================================================================

USER_NAME="opusatlas"
echo "👤 Criando usuário: $USER_NAME"

# Criar usuário
adduser --disabled-password --gecos "" $USER_NAME

# Adicionar ao grupo sudo
usermod -aG sudo $USER_NAME

# Criar diretório SSH
mkdir -p /home/$USER_NAME/.ssh
chmod 700 /home/$USER_NAME/.ssh

echo "✅ Usuário $USER_NAME criado com sucesso"

# =============================================================================
# 2. CONFIGURAÇÃO DE CHAVES SSH
# =============================================================================

echo "🔑 Configurando chaves SSH..."

# Você deve executar isso no seu computador LOCAL primeiro:
echo "ATENÇÃO: Execute este comando no SEU COMPUTADOR LOCAL:"
echo "ssh-keygen -t ed25519 -C 'opusatlas-prod' -f ~/.ssh/opusatlas"
echo ""
echo "Depois copie a chave pública com:"
echo "ssh-copy-id -i ~/.ssh/opusatlas.pub $USER_NAME@SEU_IP"
echo ""
read -p "Pressione ENTER após configurar as chaves SSH..."

# =============================================================================
# 3. CONFIGURAÇÃO SSH SEGURA
# =============================================================================

echo "🚪 Configurando SSH seguro..."

# Backup da configuração original
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Nova configuração SSH segura
cat > /etc/ssh/sshd_config << 'EOF'
# SSH Configuration - Opus Atlas Production
# Configuração ultra-segura para produção

# Configurações básicas
Port 22
Protocol 2
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key

# Configurações de autenticação
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
ChallengeResponseAuthentication no
UsePAM yes

# Usuários permitidos
AllowUsers opusatlas

# Configurações de segurança
PermitEmptyPasswords no
X11Forwarding no
MaxAuthTries 3
MaxSessions 2
MaxStartups 2:30:10
LoginGraceTime 30

# Configurações de rede
ClientAliveInterval 300
ClientAliveCountMax 2
TCPKeepAlive no

# Logging
SyslogFacility AUTH
LogLevel VERBOSE

# Banner de aviso
Banner /etc/ssh/banner

# Subsistemas
Subsystem sftp /usr/lib/openssh/sftp-server -l INFO
EOF

# Criar banner de aviso
cat > /etc/ssh/banner << 'EOF'
******************************** ATENÇÃO ********************************
*                                                                      *
*  Este é um sistema privado autorizado apenas para usuários          *
*  autorizados. Todas as atividades são monitoradas e registradas.    *
*  Acesso não autorizado é proibido e será processado judicialmente.  *
*                                                                      *
*                      OPUS ATLAS - PRODUÇÃO                          *
*                                                                      *
************************************************************************
EOF

echo "✅ SSH configurado com segurança máxima"

# =============================================================================
# 4. CONFIGURAÇÃO DO FIREWALL UFW
# =============================================================================

echo "🛡️ Configurando firewall UFW..."

# Instalar UFW se não estiver instalado
apt install -y ufw

# Reset para configuração limpa
ufw --force reset

# Políticas padrão (negar tudo, permitir saída)
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH (essencial!)
ufw allow 22/tcp comment 'SSH'

# Permitir HTTP e HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Permitir ping (ICMP)
ufw allow in on any to any proto icmp

# Rate limiting para SSH (proteção contra ataques)
ufw limit ssh comment 'Rate limit SSH'

# Ativar firewall
ufw --force enable

# Status do firewall
ufw status verbose

echo "✅ Firewall UFW configurado e ativo"

# =============================================================================
# 5. INSTALAÇÃO E CONFIGURAÇÃO DO FAIL2BAN
# =============================================================================

echo "🚫 Instalando e configurando Fail2ban..."

apt install -y fail2ban

# Configuração personalizada do Fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
# Configuração global Fail2ban - Opus Atlas

# Tempo de banimento (1 hora)
bantime = 3600

# Tempo de observação (10 minutos)
findtime = 600

# Máximo de tentativas antes de banir
maxretry = 3

# Ação de banimento (UFW)
banaction = ufw

# Email para notificações (configure depois)
destemail = root@localhost
sender = fail2ban@localhost

# Ação com email
action = %(action_mw)s

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 1800

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 1800
EOF

# Reiniciar Fail2ban
systemctl enable fail2ban
systemctl restart fail2ban

echo "✅ Fail2ban configurado e ativo"

# =============================================================================
# 6. CONFIGURAÇÕES ADICIONAIS DE SEGURANÇA
# =============================================================================

echo "🔧 Aplicando configurações adicionais de segurança..."

# Configurar timezone
timedatectl set-timezone America/Sao_Paulo

# Instalar pacotes essenciais de segurança
apt install -y \
    unattended-upgrades \
    logwatch \
    chkrootkit \
    rkhunter \
    htop \
    curl \
    wget \
    git \
    vim \
    tree

# Configurar atualizações automáticas de segurança
cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

# Configurar atualizações apenas de segurança
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::Package-Blacklist {
    "nginx*";
    "docker*";
    "mongodb*";
    "redis*";
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Mail "root";
EOF

# Configurar limites de sistema
cat >> /etc/security/limits.conf << 'EOF'
# Opus Atlas - System Limits
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
opusatlas soft nofile 65536
opusatlas hard nofile 65536
EOF

# Configurar parâmetros do kernel para performance e segurança
cat >> /etc/sysctl.conf << 'EOF'

# Opus Atlas - Kernel Parameters
# Segurança de rede
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1

# Performance de rede
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 65536 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_congestion_control = bbr

# File handles
fs.file-max = 2097152

# Virtual memory
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

# Aplicar configurações do kernel
sysctl -p

echo "✅ Configurações de segurança aplicadas"

# =============================================================================
# 7. CONFIGURAÇÃO DE LOGS DETALHADOS
# =============================================================================

echo "📊 Configurando sistema de logs..."

# Configurar logrotate para logs do sistema
cat > /etc/logrotate.d/opus-atlas << 'EOF'
/var/log/opus-atlas/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 opusatlas opusatlas
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Criar diretório de logs da aplicação
mkdir -p /var/log/opus-atlas
chown opusatlas:opusatlas /var/log/opus-atlas

echo "✅ Sistema de logs configurado"

# =============================================================================
# 8. REINICIALIZAÇÃO DOS SERVIÇOS
# =============================================================================

echo "🔄 Reiniciando serviços..."

# Reiniciar SSH (cuidado aqui!)
echo "ATENÇÃO: Reiniciando SSH. Certifique-se que as chaves estão configuradas!"
read -p "Pressione ENTER para continuar (Ctrl+C para cancelar)..."

systemctl restart sshd
systemctl enable fail2ban
systemctl restart fail2ban

echo "✅ Serviços reiniciados"

# =============================================================================
# 9. VERIFICAÇÕES FINAIS
# =============================================================================

echo "🔍 Executando verificações finais..."

# Status dos serviços
echo "Status SSH:"
systemctl status sshd --no-pager

echo "Status Fail2ban:"
systemctl status fail2ban --no-pager

echo "Status UFW:"
ufw status

echo "Últimas tentativas de login:"
lastb | head -10

echo "✅ Verificações concluídas"

# =============================================================================
# 10. INFORMAÇÕES IMPORTANTES
# =============================================================================

echo ""
echo "🎉 CONFIGURAÇÃO DE SEGURANÇA CONCLUÍDA!"
echo ""
echo "📋 INFORMAÇÕES IMPORTANTES:"
echo "├── Usuário criado: $USER_NAME"
echo "├── Login root: DESABILITADO"
echo "├── SSH: Apenas chaves (sem senha)"
echo "├── Firewall: UFW ativo"
echo "├── Fail2ban: Ativo"
echo "├── Atualizações: Automáticas (segurança)"
echo "└── Timezone: America/Sao_Paulo"
echo ""
echo "🚨 PRÓXIMOS PASSOS OBRIGATÓRIOS:"
echo "1. Configure as chaves SSH no seu computador"
echo "2. Teste o login com o novo usuário"
echo "3. Desconecte da sessão root"
echo "4. Conecte como $USER_NAME"
echo ""
echo "Comandos para testar:"
echo "ssh -i ~/.ssh/opusatlas $USER_NAME@SEU_IP"
echo ""
echo "Se conseguir conectar, a configuração está correta!"
echo ""

# Mostrar informações do sistema
echo "📊 INFORMAÇÕES DO SISTEMA:"
echo "CPU: $(nproc) cores"
echo "RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Disco: $(df -h / | awk 'NR==2 {print $2}')"
echo "IP: $(curl -s ifconfig.me)"
echo ""

echo "Configuração concluída! 🚀"