// scripts/backup/scheduled-backup.ts - VERSÃO MELHORADA
import cron from 'node-cron';
import { performBackup } from './backup';
import { cleanupOldBackups } from './backup-utils';
import fs from 'fs/promises';
import path from 'path';

// Configuração máxima de backups (mesma variável da API)
const MAX_BACKUPS = 5;
const BACKUP_RETENTION_DAYS = parseInt(
  process.env.BACKUP_RETENTION_DAYS || '30'
);

const LOG_FILE = path.join(
  process.cwd(),
  'scripts',
  'backup',
  'logs',
  'scheduler.log'
);
const LOCK_FILE = path.join(process.cwd(), 'scripts', 'backup', 'backup.lock');

async function log(message: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  console.log(message);

  try {
    // Garantir que o diretório de logs existe
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
    await fs.appendFile(LOG_FILE, logMessage);
  } catch (error) {
    console.error('Erro ao escrever no log:', error);
  }
}

async function createLockFile(): Promise<void> {
  try {
    await fs.mkdir(path.dirname(LOCK_FILE), { recursive: true });
    await fs.writeFile(
      LOCK_FILE,
      JSON.stringify({
        startTime: new Date().toISOString(),
        pid: process.pid,
        type: 'scheduled',
      })
    );
  } catch (error) {
    console.error('Erro ao criar arquivo de lock:', error);
  }
}

async function removeLockFile(): Promise<void> {
  try {
    await fs.unlink(LOCK_FILE);
  } catch (error) {
    // Ignorar se o arquivo não existe
  }
}

async function isBackupRunning(): Promise<boolean> {
  try {
    await fs.access(LOCK_FILE);
    return true;
  } catch {
    return false;
  }
}

// Limpar backups antigos para manter apenas MAX_BACKUPS
async function cleanupByCount(): Promise<void> {
  const backupsDir = path.join(process.cwd(), 'backups');

  try {
    const entries = await fs.readdir(backupsDir, { withFileTypes: true });
    const backupDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: entry.name,
        path: path.join(backupsDir, entry.name),
      }));

    // Ordenar por data (mais recente primeiro)
    const sortedBackups = backupDirs.sort((a, b) =>
      b.name.localeCompare(a.name)
    );

    // Remover backups excedentes
    if (sortedBackups.length > MAX_BACKUPS) {
      const backupsToRemove = sortedBackups.slice(MAX_BACKUPS);

      for (const backup of backupsToRemove) {
        await fs.rm(backup.path, { recursive: true });
        await log(`🗑️ Backup removido por limite: ${backup.name}`);
      }

      await log(
        `✅ Cleanup por quantidade: ${backupsToRemove.length} backups removidos (mantidos ${MAX_BACKUPS})`
      );
    }
  } catch (error) {
    await log(`❌ Erro durante cleanup por quantidade: ${error}`);
  }
}

// Função para verificar saúde do sistema
async function checkSystemHealth(): Promise<void> {
  try {
    const backupsDir = path.join(process.cwd(), 'backups');

    // Verificar se diretório de backups existe
    try {
      await fs.access(backupsDir);
    } catch {
      await fs.mkdir(backupsDir, { recursive: true });
      await log('📁 Diretório de backups criado');
    }

    // Verificar espaço em disco (simulado)
    const stats = await fs.stat(backupsDir);
    await log(`💾 Verificação de saúde concluída - Backups dir: ${backupsDir}`);

    // Verificar se há backups órfãos ou corrompidos
    const entries = await fs.readdir(backupsDir, { withFileTypes: true });
    const backupDirs = entries.filter((entry) => entry.isDirectory());

    let corruptedCount = 0;
    for (const dir of backupDirs) {
      const metadataPath = path.join(backupsDir, dir.name, 'metadata.json');
      try {
        await fs.access(metadataPath);
      } catch {
        corruptedCount++;
      }
    }

    if (corruptedCount > 0) {
      await log(
        `⚠️ Encontrados ${corruptedCount} backups possivelmente corrompidos`
      );
    }

    await log(
      `✅ Sistema saudável - ${backupDirs.length} backups, ${corruptedCount} corrompidos`
    );
  } catch (error) {
    await log(`❌ Erro na verificação de saúde: ${error}`);
  }
}

// Backup agendado principal
async function performScheduledBackup(): Promise<void> {
  // Verificar se já há backup rodando
  if (await isBackupRunning()) {
    await log('⚠️ Backup já em execução, pulando backup agendado');
    return;
  }

  await log('🕐 Iniciando backup agendado...');
  await createLockFile();

  try {
    // Cleanup preventivo antes do backup
    await cleanupByCount();

    // Executar backup
    await performBackup();
    await log('✅ Backup agendado concluído com sucesso');

    // Cleanup por data após backup
    await cleanupOldBackups(BACKUP_RETENTION_DAYS);
    await log(
      `🗑️ Cleanup por data executado (retenção: ${BACKUP_RETENTION_DAYS} dias)`
    );

    // Cleanup final por quantidade
    await cleanupByCount();
  } catch (error) {
    await log(`❌ Erro no backup agendado: ${error}`);
  } finally {
    await removeLockFile();
  }
}

// Configurar agendamentos
function setupScheduledTasks(): void {
  // Backup diário às 2:00 AM
  cron.schedule(
    '0 2 * * *',
    async () => {
      await performScheduledBackup();
    },
    {
      // scheduled: true,
      timezone: 'America/Sao_Paulo',
    }
  );

  // Verificação de saúde a cada 2 horas
  cron.schedule(
    '0 */2 * * *',
    async () => {
      if (!(await isBackupRunning())) {
        await log('🏥 Verificação de saúde do sistema de backup');
        await checkSystemHealth();
      }
    },
    {
      // scheduled: true,
      timezone: 'America/Sao_Paulo',
    }
  );

  // Cleanup adicional diário às 4:00 AM (2 horas após o backup)
  cron.schedule(
    '0 4 * * *',
    async () => {
      if (!(await isBackupRunning())) {
        await log('🧹 Cleanup diário adicional');
        await cleanupByCount();
        await cleanupOldBackups(BACKUP_RETENTION_DAYS);
      }
    },
    {
      // scheduled: true,
      timezone: 'America/Sao_Paulo',
    }
  );
}

// Função para parar o serviço graciosamente
async function stopService(): Promise<void> {
  await log('🛑 Parando serviço de backup agendado...');

  // Verificar se há backup em execução
  if (await isBackupRunning()) {
    await log('⚠️ Backup em execução, aguardando conclusão...');

    // Aguardar até 30 minutos pela conclusão
    let attempts = 0;
    const maxAttempts = 180; // 30 minutos (30 * 60 / 10)

    while ((await isBackupRunning()) && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 segundos
      attempts++;
    }

    if (await isBackupRunning()) {
      await log(
        '⚠️ Backup ainda em execução após 30 minutos, forçando parada...'
      );
      await removeLockFile();
    }
  }

  await log('✅ Serviço de backup agendado parado');
  process.exit(0);
}

// Manipular sinais de sistema
process.on('SIGINT', stopService);
process.on('SIGTERM', stopService);

// Inicializar serviço
async function initializeService(): Promise<void> {
  try {
    await log('🚀 Inicializando sistema de backup agendado...');
    await log(
      `📊 Configurações: MAX_BACKUPS=${MAX_BACKUPS}, RETENTION_DAYS=${BACKUP_RETENTION_DAYS}`
    );

    // Verificar se há backup órfão rodando
    if (await isBackupRunning()) {
      await log('⚠️ Encontrado lock file órfão, removendo...');
      await removeLockFile();
    }

    // Verificação inicial de saúde
    await checkSystemHealth();

    // Configurar tarefas agendadas
    setupScheduledTasks();

    await log('✅ Sistema de backup agendado iniciado com sucesso');
    await log('📅 Próximo backup agendado: hoje às 02:00');
  } catch (error) {
    await log(`❌ Erro ao inicializar serviço: ${error}`);
    process.exit(1);
  }
}

// Função principal CLI
async function main(): Promise<void> {
  const command = process.argv[2];

  switch (command) {
    case 'start':
      await initializeService();
      break;

    case 'stop':
      await stopService();
      break;

    case 'status':
      const isRunning = await isBackupRunning();
      console.log(
        `Status: ${isRunning ? 'Backup em execução' : 'Sistema livre'}`
      );
      break;

    case 'backup-now':
      await performScheduledBackup();
      break;

    case 'cleanup':
      await log('🧹 Executando cleanup manual...');
      await cleanupByCount();
      await cleanupOldBackups(BACKUP_RETENTION_DAYS);
      await log('✅ Cleanup manual concluído');
      break;

    case 'health':
      await checkSystemHealth();
      break;

    default:
      await initializeService();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(async (error) => {
    await log(`💥 Erro crítico: ${error}`);
    process.exit(1);
  });
}
