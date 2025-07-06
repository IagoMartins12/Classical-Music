// scripts/setup-backup.ts
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

interface SetupConfig {
  autoSchedule: boolean;
  retentionDays: number;
  backupLocation: string;
  remoteBackup: boolean;
  notificationEmail?: string;
}

async function setupBackupSystem(config: SetupConfig): Promise<void> {
  console.log('🚀 Configurando sistema de backup...');

  try {
    // 1. Criar diretórios necessários
    await createDirectories(config.backupLocation);

    // 2. Instalar dependências se necessário
    await installDependencies();

    // 3. Configurar variáveis de ambiente
    await setupEnvironment(config);

    // 4. Configurar agendamento automático se solicitado
    if (config.autoSchedule) {
      await setupScheduledBackup();
    }

    // 5. Criar script de monitoramento
    await createMonitoringScript();

    // 6. Atualizar package.json
    await updatePackageJson();

    // 7. Teste inicial
    await runInitialTest();

    console.log('✅ Sistema de backup configurado com sucesso!');
    console.log(`📁 Localização dos backups: ${config.backupLocation}`);
    console.log(`🗓️  Retenção: ${config.retentionDays} dias`);
    console.log(
      `⏰ Agendamento automático: ${
        config.autoSchedule ? 'Ativado' : 'Desativado'
      }`
    );
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    throw error;
  }
}

async function createDirectories(backupLocation: string): Promise<void> {
  const dirs = [
    backupLocation,
    path.join(backupLocation, 'logs'),
    path.join(backupLocation, 'temp'),
    path.join(process.cwd(), 'scripts', 'backup'),
    path.join(process.cwd(), 'scripts', 'backup', 'logs'),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
    console.log(`📁 Criado diretório: ${dir}`);
  }
}

async function installDependencies(): Promise<void> {
  console.log('📦 Verificando dependências...');

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

  const requiredDeps = {
    tsx: '^4.0.0',
    'node-cron': '^3.0.2',
    '@types/node-cron': '^3.0.8',
  };

  let needsInstall = false;
  const currentDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  for (const [dep, version] of Object.entries(requiredDeps)) {
    if (!currentDeps[dep]) {
      needsInstall = true;
      break;
    }
  }

  if (needsInstall) {
    console.log('⬇️  Instalando dependências necessárias...');
    execSync('npm install tsx node-cron @types/node-cron --save-dev', {
      stdio: 'inherit',
    });
  } else {
    console.log('✓ Todas as dependências já estão instaladas');
  }
}

async function setupEnvironment(config: SetupConfig): Promise<void> {
  const envPath = path.join(process.cwd(), '.env.backup');

  const envContent = `
# Configuração do Sistema de Backup
BACKUP_LOCATION="${config.backupLocation}"
BACKUP_RETENTION_DAYS=${config.retentionDays}
BACKUP_AUTO_SCHEDULE=${config.autoSchedule}
BACKUP_REMOTE_ENABLED=${config.remoteBackup}
${
  config.notificationEmail
    ? `BACKUP_NOTIFICATION_EMAIL="${config.notificationEmail}"`
    : ''
}
BACKUP_LOG_LEVEL="info"
BACKUP_COMPRESSION_ENABLED=true
BACKUP_VERIFICATION_ENABLED=true

# Configurações de Performance
BACKUP_BATCH_SIZE=100
BACKUP_PARALLEL_COLLECTIONS=3
BACKUP_TIMEOUT_MINUTES=60

# Configurações de Segurança
BACKUP_ENCRYPTION_ENABLED=false
# BACKUP_ENCRYPTION_KEY="your-encryption-key"
`.trim();

  await fs.writeFile(envPath, envContent);
  console.log('🔧 Arquivo de configuração criado: .env.backup');
}

async function setupScheduledBackup(): Promise<void> {
  const schedulerScript = `// scripts/backup/scheduled-backup.ts
import cron from 'node-cron'
import { performBackup } from './backup'
import { cleanupOldBackups } from './backup-utils'
import fs from 'fs/promises'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'scripts', 'backup', 'logs', 'scheduler.log')

async function log(message: string): Promise<void> {
  const timestamp = new Date().toISOString()
  const logMessage = \`[\${timestamp}] \${message}\\n\`
  
  console.log(message)
  await fs.appendFile(LOG_FILE, logMessage).catch(console.error)
}

// Backup diário às 2:00 AM
cron.schedule('0 2 * * *', async () => {
  await log('🕐 Iniciando backup agendado...')
  
  try {
    await performBackup()
    await log('✅ Backup agendado concluído com sucesso')
    
    // Cleanup de backups antigos a cada backup
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30')
    await cleanupOldBackups(retentionDays)
    await log(\`🗑️  Cleanup executado (retenção: \${retentionDays} dias)\`)
    
  } catch (error) {
    await log(\`❌ Erro no backup agendado: \${error}\`)
  }
})

// Verificação de saúde a cada hora
cron.schedule('0 * * * *', async () => {
  await log('🏥 Verificação de saúde do sistema de backup')
  
  // Verificar espaço em disco, conectividade do banco, etc.
  // Implementar conforme necessário
})

console.log('⏰ Sistema de backup agendado iniciado')
`;

  const schedulerPath = path.join(
    process.cwd(),
    'scripts',
    'backup',
    'scheduled-backup.ts'
  );
  await fs.writeFile(schedulerPath, schedulerScript);
  console.log('⏰ Script de agendamento criado');
}

async function createMonitoringScript(): Promise<void> {
  const monitoringScript = `// scripts/backup/backup-monitor.ts
import fs from 'fs/promises'
import path from 'path'

interface BackupHealth {
  lastBackupDate: string | null
  backupCount: number
  totalSize: string
  oldestBackup: string | null
  newestBackup: string | null
  status: 'healthy' | 'warning' | 'critical'
  issues: string[]
}

export async function checkBackupHealth(): Promise<BackupHealth> {
  const backupsDir = path.join(process.cwd(), 'backups')
  const health: BackupHealth = {
    lastBackupDate: null,
    backupCount: 0,
    totalSize: '0 MB',
    oldestBackup: null,
    newestBackup: null,
    status: 'healthy',
    issues: []
  }

  try {
    const entries = await fs.readdir(backupsDir, { withFileTypes: true })
    const backupDirs = entries.filter(entry => entry.isDirectory())
    
    health.backupCount = backupDirs.length
    
    if (backupDirs.length === 0) {
      health.status = 'critical'
      health.issues.push('Nenhum backup encontrado')
      return health
    }

    // Analisar cada backup
    let totalSizeBytes = 0
    let oldestDate = new Date()
    let newestDate = new Date(0)
    
    for (const dir of backupDirs) {
      const dirPath = path.join(backupsDir, dir.name)
      const stats = await fs.stat(dirPath)
      
      totalSizeBytes += await getDirSize(dirPath)
      
      if (stats.birthtime < oldestDate) {
        oldestDate = stats.birthtime
        health.oldestBackup = dir.name
      }
      
      if (stats.birthtime > newestDate) {
        newestDate = stats.birthtime
        health.newestBackup = dir.name
      }
    }
    
    health.lastBackupDate = newestDate.toISOString()
    health.totalSize = formatBytes(totalSizeBytes)
    
    // Verificar se o último backup é muito antigo
    const hoursSinceLastBackup = (Date.now() - newestDate.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceLastBackup > 48) {
      health.status = 'critical'
      health.issues.push(\`Último backup há \${Math.round(hoursSinceLastBackup)} horas\`)
    } else if (hoursSinceLastBackup > 24) {
      health.status = 'warning'
      health.issues.push(\`Último backup há \${Math.round(hoursSinceLastBackup)} horas\`)
    }
    
    return health
    
  } catch (error) {
    health.status = 'critical'
    health.issues.push(\`Erro verificando backups: \${error}\`)
    return health
  }
}

async function getDirSize(dirPath: string): Promise<number> {
  let size = 0
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      size += await getDirSize(entryPath)
    } else {
      const stats = await fs.stat(entryPath)
      size += stats.size
    }
  }
  
  return size
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// CLI para verificação manual
if (require.main === module) {
  checkBackupHealth().then(health => {
    console.log('🏥 Status do Sistema de Backup')
    console.log('================================')
    console.log(\`Status: \${health.status === 'healthy' ? '✅' : health.status === 'warning' ? '⚠️' : '❌'} \${health.status.toUpperCase()}\`)
    console.log(\`Último backup: \${health.lastBackupDate ? new Date(health.lastBackupDate).toLocaleString('pt-BR') : 'N/A'}\`)
    console.log(\`Total de backups: \${health.backupCount}\`)
    console.log(\`Tamanho total: \${health.totalSize}\`)
    console.log(\`Backup mais antigo: \${health.oldestBackup || 'N/A'}\`)
    console.log(\`Backup mais recente: \${health.newestBackup || 'N/A'}\`)
    
    if (health.issues.length > 0) {
      console.log('\\n⚠️  Problemas encontrados:')
      health.issues.forEach(issue => console.log(\`   • \${issue}\`))
    }
  })
}

export { checkBackupHealth }
`;

  const monitorPath = path.join(
    process.cwd(),
    'scripts',
    'backup',
    'backup-monitor.ts'
  );
  await fs.writeFile(monitorPath, monitoringScript);
  console.log('📊 Script de monitoramento criado');
}

async function createBackupUtilsScript(): Promise<void> {
  const utilsScript = `// scripts/backup/backup-utils.ts
import fs from 'fs/promises'
import path from 'path'
import { performBackup, performRestore } from './backup'

// Utilitário para cleanup de backups antigos
export async function cleanupOldBackups(daysToKeep: number = 30): Promise<void> {
  const backupsDir = path.join(process.cwd(), 'backups')
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  try {
    const entries = await fs.readdir(backupsDir, { withFileTypes: true })
    let removedCount = 0
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirPath = path.join(backupsDir, entry.name)
        const stats = await fs.stat(dirPath)
        
        if (stats.birthtime < cutoffDate) {
          await fs.rm(dirPath, { recursive: true })
          console.log(\`🗑️  Removido backup antigo: \${entry.name}\`)
          removedCount++
        }
      }
    }
    
    console.log(\`✅ Cleanup concluído: \${removedCount} backups removidos (mantidos dos últimos \${daysToKeep} dias)\`)
  } catch (error) {
    console.error('❌ Erro durante cleanup:', error)
  }
}

// Utilitário para verificar integridade do backup
export async function verifyBackupIntegrity(backupPath: string): Promise<boolean> {
  try {
    const backupContent = await fs.readFile(backupPath, 'utf8')
    const backupData = JSON.parse(backupContent)
    
    // Verificações básicas
    const hasTimestamp = !!backupData.timestamp
    const hasMetadata = !!backupData.metadata
    const hasData = !!backupData.data && typeof backupData.data === 'object'
    
    let totalRecords = 0
    for (const [collection, data] of Object.entries(backupData.data)) {
      if (Array.isArray(data)) {
        totalRecords += data.length
      }
    }
    
    const recordsMatch = totalRecords === backupData.metadata.totalRecords
    
    console.log('🔍 Verificação de integridade:')
    console.log(\`   Timestamp: \${hasTimestamp ? '✓' : '✗'}\`)
    console.log(\`   Metadata: \${hasMetadata ? '✓' : '✗'}\`)
    console.log(\`   Dados: \${hasData ? '✓' : '✗'}\`)
    console.log(\`   Contagem de registros: \${recordsMatch ? '✓' : '✗'} (\${totalRecords}/\${backupData.metadata.totalRecords})\`)
    
    const isValid = hasTimestamp && hasMetadata && hasData && recordsMatch
    console.log(\`📋 Resultado: \${isValid ? 'VÁLIDO' : 'INVÁLIDO'}\`)
    
    return isValid
  } catch (error) {
    console.error('❌ Erro verificando integridade:', error)
    return false
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2]
  const args = process.argv.slice(3)
  
  switch (command) {
    case 'cleanup':
      const days = parseInt(args[0]) || 30
      await cleanupOldBackups(days)
      break
      
    case 'verify':
      const backupPath = args[0]
      if (!backupPath) {
        console.error('❌ Forneça o caminho do backup para verificar')
        process.exit(1)
      }
      await verifyBackupIntegrity(backupPath)
      break
      
    default:
      console.log('🔧 Utilitários de Backup')
      console.log('')
      console.log('Comandos disponíveis:')
      console.log('  cleanup <days>  - Limpar backups antigos')
      console.log('  verify <path>   - Verificar integridade do backup')
      console.log('')
      console.log('Exemplos:')
      console.log('  tsx scripts/backup/backup-utils.ts cleanup 30')
      console.log('  tsx scripts/backup/backup-utils.ts verify ./backups/backup-xxx/backup.json')
  }
}

if (require.main === module) {
  main().catch(console.error)
}
`;

  const utilsPath = path.join(
    process.cwd(),
    'scripts',
    'backup',
    'backup-utils.ts'
  );
  await fs.writeFile(utilsPath, utilsScript);
  console.log('🛠️ Script de utilitários criado');
}

async function updatePackageJson(): Promise<void> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

    const newScripts = {
      backup: 'tsx scripts/backup/backup.ts backup',
      'backup:restore': 'tsx scripts/backup/backup.ts restore',
      'backup:list': 'tsx scripts/backup/backup.ts list',
      'backup:scheduled': 'tsx scripts/backup/scheduled-backup.ts',
      'backup:setup': 'tsx scripts/backup/setup-backup.ts',
      'backup:monitor': 'tsx scripts/backup/backup-monitor.ts',
      'backup:health': 'tsx scripts/backup/backup-monitor.ts',
      'backup:utils': 'tsx scripts/backup/backup-utils.ts',
    };

    packageJson.scripts = { ...packageJson.scripts, ...newScripts };

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('📦 Scripts adicionados ao package.json');
  } catch (error) {
    console.log('⚠️  Não foi possível atualizar package.json automaticamente');
    console.log('📝 Adicione manualmente os scripts de backup ao package.json');
  }
}

async function runInitialTest(): Promise<void> {
  console.log('🧪 Executando teste inicial...');

  try {
    // Testar conectividade com o banco
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.$connect();
    console.log('✓ Conectividade com banco de dados OK');

    // Testar criação de diretório de backup
    const testDir = path.join(process.cwd(), 'backups', 'test-' + Date.now());
    await fs.mkdir(testDir, { recursive: true });
    await fs.rmdir(testDir);
    console.log('✓ Permissões de escrita OK');

    await prisma.$disconnect();
    console.log('✅ Teste inicial concluído com sucesso');
  } catch (error) {
    console.error('❌ Falha no teste inicial:', error);
    throw error;
  }
}

// Interface CLI para configuração
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔧 Configurador do Sistema de Backup

Uso:
  tsx scripts/setup-backup.ts [opções]

Opções:
  --auto-schedule    Ativar backup automático diário
  --retention <days> Dias para manter backups (padrão: 30)
  --location <path>  Localização dos backups (padrão: ./backups)
  --remote           Ativar backup remoto (requer configuração adicional)
  --email <email>    Email para notificações
  --quick           Configuração rápida com padrões
  
Exemplos:
  tsx scripts/setup-backup.ts --quick
  tsx scripts/setup-backup.ts --auto-schedule --retention 60 --email admin@empresa.com
`);
    return;
  }

  const config: SetupConfig = {
    autoSchedule: args.includes('--auto-schedule'),
    retentionDays: parseInt(args[args.indexOf('--retention') + 1]) || 30,
    backupLocation:
      args[args.indexOf('--location') + 1] ||
      path.join(process.cwd(), 'backups'),
    remoteBackup: args.includes('--remote'),
    notificationEmail: args[args.indexOf('--email') + 1] || undefined,
  };

  if (args.includes('--quick')) {
    config.autoSchedule = true;
    config.retentionDays = 30;
  }

  await setupBackupSystem(config);
  await createBackupUtilsScript();
}

if (require.main === module) {
  main().catch(console.error);
}

export { setupBackupSystem };
