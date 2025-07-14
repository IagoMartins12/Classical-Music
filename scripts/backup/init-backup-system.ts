// scripts/backup/init-backup-system.ts
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// Configurações do sistema
const BACKUP_CONFIG = {
  MAX_BACKUPS: 5,
  RETENTION_DAYS: 30,
  BACKUP_LOCATION: path.join(process.cwd(), 'backups'),
  LOG_LOCATION: path.join(process.cwd(), 'scripts', 'backup', 'logs'),
  SCRIPTS_LOCATION: path.join(process.cwd(), 'scripts', 'backup'),
};

interface InitOptions {
  maxBackups?: number;
  retentionDays?: number;
  skipDependencies?: boolean;
  enableScheduler?: boolean;
  runInitialBackup?: boolean;
}

async function log(message: string): Promise<void> {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Criar estrutura de diretórios
async function createDirectories(): Promise<void> {
  await log('📁 Criando estrutura de diretórios...');

  const directories = [
    BACKUP_CONFIG.BACKUP_LOCATION,
    BACKUP_CONFIG.LOG_LOCATION,
    BACKUP_CONFIG.SCRIPTS_LOCATION,
    path.join(BACKUP_CONFIG.BACKUP_LOCATION, 'temp'),
  ];

  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      await log(`   ✓ ${dir}`);
    } catch (error) {
      await log(`   ✗ Erro criando ${dir}: ${error}`);
    }
  }
}

// Verificar dependências
async function checkDependencies(): Promise<void> {
  await log('📦 Verificando dependências...');

  try {
    // Verificar se o tsx está instalado
    execSync('npx tsx --version', { stdio: 'pipe' });
    await log('   ✓ tsx instalado');

    // Verificar se o node-cron está instalado
    execSync('npm list node-cron', { stdio: 'pipe' });
    await log('   ✓ node-cron instalado');

    // Verificar se o prisma está configurado
    execSync('npx prisma --version', { stdio: 'pipe' });
    await log('   ✓ prisma instalado');
  } catch (error) {
    await log('   ⚠️ Algumas dependências podem estar faltando');
    throw new Error('Dependências não encontradas. Execute: npm install');
  }
}

// Criar arquivo de configuração
async function createConfigFile(options: InitOptions): Promise<void> {
  await log('⚙️ Criando arquivo de configuração...');

  const configPath = path.join(
    BACKUP_CONFIG.SCRIPTS_LOCATION,
    'backup-config.json'
  );

  const config = {
    maxBackups: options.maxBackups || BACKUP_CONFIG.MAX_BACKUPS,
    retentionDays: options.retentionDays || BACKUP_CONFIG.RETENTION_DAYS,
    backupLocation: BACKUP_CONFIG.BACKUP_LOCATION,
    logLocation: BACKUP_CONFIG.LOG_LOCATION,
    enableScheduler: options.enableScheduler || true,
    createdAt: new Date().toISOString(),
    version: '1.0.0',
  };

  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    await log(`   ✓ Configuração salva em: ${configPath}`);
  } catch (error) {
    await log(`   ✗ Erro criando configuração: ${error}`);
  }
}

// Criar arquivo de variáveis de ambiente
async function createEnvFile(): Promise<void> {
  await log('🔧 Criando arquivo de variáveis de ambiente...');

  const envPath = path.join(process.cwd(), '.env.backup');

  const envContent = `
# Configuração do Sistema de Backup
# Gerado automaticamente em ${new Date().toISOString()}

# Configurações básicas
BACKUP_LOCATION="${BACKUP_CONFIG.BACKUP_LOCATION}"
BACKUP_RETENTION_DAYS=${BACKUP_CONFIG.RETENTION_DAYS}
BACKUP_MAX_BACKUPS=${BACKUP_CONFIG.MAX_BACKUPS}

# Configurações de performance
BACKUP_BATCH_SIZE=100
BACKUP_PARALLEL_COLLECTIONS=3
BACKUP_TIMEOUT_MINUTES=60

# Configurações de log
BACKUP_LOG_LEVEL="info"
BACKUP_LOG_LOCATION="${BACKUP_CONFIG.LOG_LOCATION}"

# Configurações de agendamento
BACKUP_SCHEDULE_ENABLED=true
BACKUP_SCHEDULE_CRON="0 2 * * *"
BACKUP_HEALTH_CHECK_CRON="0 */2 * * *"

# Configurações de segurança
BACKUP_ENCRYPTION_ENABLED=false
# BACKUP_ENCRYPTION_KEY=""

# Configurações de notificação
BACKUP_NOTIFICATIONS_ENABLED=false
# BACKUP_NOTIFICATION_EMAIL=""
# BACKUP_WEBHOOK_URL=""
`.trim();

  try {
    await fs.writeFile(envPath, envContent);
    await log(`   ✓ Arquivo de ambiente criado: ${envPath}`);
  } catch (error) {
    await log(`   ✗ Erro criando arquivo de ambiente: ${error}`);
  }
}

// Atualizar package.json com scripts
async function updatePackageJson(): Promise<void> {
  await log('📦 Atualizando package.json...');

  const packageJsonPath = path.join(process.cwd(), 'package.json');

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

    const backupScripts = {
      // Scripts básicos
      backup:
        'node --max-old-space-size=4096 -r tsx/cjs scripts/backup/backup.ts backup',
      'backup:restore':
        'node --max-old-space-size=4096 -r tsx/cjs scripts/backup/backup.ts restore',
      'backup:list': 'tsx scripts/backup/backup.ts list',
      'backup:verify': 'tsx scripts/backup/backup.ts verify',

      // Scripts de agendamento
      'backup:scheduler': 'tsx scripts/backup/scheduled-backup.ts',
      'backup:scheduler:start': 'tsx scripts/backup/scheduled-backup.ts start',
      'backup:scheduler:stop': 'tsx scripts/backup/scheduled-backup.ts stop',
      'backup:scheduler:status':
        'tsx scripts/backup/scheduled-backup.ts status',

      // Scripts de utilitários
      'backup:cleanup': 'tsx scripts/backup/scheduled-backup.ts cleanup',
      'backup:health': 'tsx scripts/backup/scheduled-backup.ts health',
      'backup:now': 'tsx scripts/backup/scheduled-backup.ts backup-now',

      // Scripts de diagnóstico
      'backup:diagnose': 'tsx scripts/backup/diagnose-backup.ts',
      'backup:monitor': 'tsx scripts/backup/backup-monitor.ts',

      // Scripts de configuração
      'backup:init': 'tsx scripts/backup/init-backup-system.ts',
      'backup:setup': 'tsx scripts/backup/setup-backup.ts',
    };

    // Mesclar scripts mantendo os existentes
    packageJson.scripts = { ...packageJson.scripts, ...backupScripts };

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    await log('   ✓ Scripts de backup adicionados ao package.json');
  } catch (error) {
    await log(`   ✗ Erro atualizando package.json: ${error}`);
  }
}

// Verificar conexão com banco de dados
async function testDatabaseConnection(): Promise<void> {
  await log('🗄️ Testando conexão com banco de dados...');

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.$connect();
    await log('   ✓ Conexão com banco de dados OK');

    // Testar uma query simples
    const userCount = await prisma.user.count();
    await log(`   ✓ Teste de query OK (${userCount} usuários)`);

    await prisma.$disconnect();
  } catch (error) {
    await log(`   ✗ Erro na conexão com banco: ${error}`);
    throw new Error('Não foi possível conectar ao banco de dados');
  }
}

// Executar backup inicial
async function runInitialBackup(): Promise<void> {
  await log('🔄 Executando backup inicial...');

  try {
    const { performBackup } = await import('./backup');
    await performBackup();
    await log('   ✓ Backup inicial concluído');
  } catch (error) {
    await log(`   ✗ Erro no backup inicial: ${error}`);
    throw new Error('Falha no backup inicial');
  }
}

// Criar status do sistema
async function createSystemStatus(): Promise<void> {
  await log('📊 Criando status do sistema...');

  const statusPath = path.join(
    BACKUP_CONFIG.SCRIPTS_LOCATION,
    'system-status.json'
  );

  const status = {
    initialized: true,
    initializedAt: new Date().toISOString(),
    version: '1.0.0',
    maxBackups: BACKUP_CONFIG.MAX_BACKUPS,
    retentionDays: BACKUP_CONFIG.RETENTION_DAYS,
    backupLocation: BACKUP_CONFIG.BACKUP_LOCATION,
    lastHealthCheck: new Date().toISOString(),
    systemHealth: 'healthy',
    features: {
      scheduledBackups: true,
      incrementalBackups: true,
      backupVerification: true,
      automaticCleanup: true,
      webInterface: true,
    },
  };

  try {
    await fs.writeFile(statusPath, JSON.stringify(status, null, 2));
    await log(`   ✓ Status do sistema criado: ${statusPath}`);
  } catch (error) {
    await log(`   ✗ Erro criando status: ${error}`);
  }
}

// Função principal de inicialização
async function initializeBackupSystem(
  options: InitOptions = {}
): Promise<void> {
  try {
    await log('🚀 Inicializando Sistema de Backup...');
    await log(
      `📊 Configurações: MAX_BACKUPS=${
        options.maxBackups || BACKUP_CONFIG.MAX_BACKUPS
      }, RETENTION_DAYS=${
        options.retentionDays || BACKUP_CONFIG.RETENTION_DAYS
      }`
    );

    // 1. Verificar dependências
    if (!options.skipDependencies) {
      await checkDependencies();
    }

    // 2. Criar estrutura de diretórios
    await createDirectories();

    // 3. Criar arquivo de configuração
    await createConfigFile(options);

    // 4. Criar arquivo de ambiente
    await createEnvFile();

    // 5. Atualizar package.json
    await updatePackageJson();

    // 6. Testar conexão com banco
    await testDatabaseConnection();

    // 7. Executar backup inicial se solicitado
    if (options.runInitialBackup) {
      await runInitialBackup();
    }

    // 8. Criar status do sistema
    await createSystemStatus();

    await log('✅ Sistema de Backup inicializado com sucesso!');
    await log('');
    await log('📋 Próximos passos:');
    await log('   1. Execute "npm run backup" para criar um backup manual');
    await log(
      '   2. Execute "npm run backup:scheduler:start" para iniciar backups automáticos'
    );
    await log('   3. Acesse /admin/backup no painel administrativo');
    await log('');
    await log('🔧 Comandos disponíveis:');
    await log('   npm run backup:list          - Listar backups');
    await log('   npm run backup:health         - Verificar saúde do sistema');
    await log('   npm run backup:scheduler:start - Iniciar agendamento');
    await log('   npm run backup:cleanup        - Limpar backups antigos');
  } catch (error) {
    await log(`❌ Erro durante inicialização: ${error}`);
    process.exit(1);
  }
}

// Interface CLI
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  const options: InitOptions = {
    maxBackups: BACKUP_CONFIG.MAX_BACKUPS,
    retentionDays: BACKUP_CONFIG.RETENTION_DAYS,
    skipDependencies: args.includes('--skip-deps'),
    enableScheduler: !args.includes('--no-scheduler'),
    runInitialBackup: args.includes('--initial-backup'),
  };

  // Parsing de argumentos
  const maxBackupsIndex = args.indexOf('--max-backups');
  if (maxBackupsIndex !== -1 && args[maxBackupsIndex + 1]) {
    options.maxBackups = parseInt(args[maxBackupsIndex + 1]);
  }

  const retentionIndex = args.indexOf('--retention');
  if (retentionIndex !== -1 && args[retentionIndex + 1]) {
    options.retentionDays = parseInt(args[retentionIndex + 1]);
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔧 Inicializador do Sistema de Backup

Uso:
  tsx scripts/backup/init-backup-system.ts [opções]

Opções:
  --max-backups <n>     Número máximo de backups (padrão: 5)
  --retention <days>    Dias para manter backups (padrão: 30)
  --skip-deps           Pular verificação de dependências
  --no-scheduler        Não configurar agendamento automático
  --initial-backup      Executar backup inicial após configuração
  --help, -h            Mostrar esta ajuda

Exemplos:
  tsx scripts/backup/init-backup-system.ts
  tsx scripts/backup/init-backup-system.ts --max-backups 10 --retention 60
  tsx scripts/backup/init-backup-system.ts --initial-backup
`);
    return;
  }

  await initializeBackupSystem(options);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { initializeBackupSystem, BACKUP_CONFIG };
