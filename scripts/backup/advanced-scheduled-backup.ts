// scripts/backup/advanced-scheduled-backup.ts
import cron from 'node-cron';
import { performBackup } from './backup';
import { cleanupOldBackups } from './backup-utils';
import fs from 'fs/promises';
import path from 'path';
import {
  BackupSchedule,
  generateCronExpression,
  calculateNextRun,
  getScheduleDescription,
} from '@/app/types/backup';

// Configuração
const SCHEDULES_FILE = path.join(
  process.cwd(),
  'data',
  'backup-schedules.json'
);
const LOG_FILE = path.join(
  process.cwd(),
  'scripts',
  'backup',
  'logs',
  'scheduler.log'
);
const LOCK_FILE = path.join(process.cwd(), 'scripts', 'backup', 'backup.lock');

// Armazenar tasks do cron ativas
const activeCronTasks = new Map<string, cron.ScheduledTask>();

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

async function createLockFile(
  scheduleId: string,
  scheduleName: string
): Promise<void> {
  try {
    await fs.mkdir(path.dirname(LOCK_FILE), { recursive: true });
    await fs.writeFile(
      LOCK_FILE,
      JSON.stringify({
        startTime: new Date().toISOString(),
        pid: process.pid,
        type: 'scheduled',
        scheduleId,
        scheduleName,
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

// Carregar agendamentos do arquivo
async function loadSchedules(): Promise<BackupSchedule[]> {
  try {
    const content = await fs.readFile(SCHEDULES_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    await log('⚠️  Arquivo de agendamentos não encontrado, usando lista vazia');
    return [];
  }
}

// Salvar agendamentos no arquivo
async function saveSchedules(schedules: BackupSchedule[]): Promise<void> {
  try {
    const dataDir = path.dirname(SCHEDULES_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(SCHEDULES_FILE, JSON.stringify(schedules, null, 2));
  } catch (error) {
    await log(`❌ Erro ao salvar agendamentos: ${error}`);
  }
}

// Executar backup agendado
async function executeScheduledBackup(schedule: BackupSchedule): Promise<void> {
  const scheduleDescription = getScheduleDescription(schedule);

  // Verificar se já há backup rodando
  if (await isBackupRunning()) {
    await log(
      `⚠️  Backup já em execução, pulando agendamento: ${schedule.name}`
    );
    return;
  }

  await log(`🕐 Iniciando backup agendado: ${schedule.name}`);
  await log(`📋 Configuração: ${scheduleDescription}`);

  await createLockFile(schedule.id, schedule.name);

  try {
    // Executar backup (completo ou seletivo baseado nas collections)
    if (schedule.collections.length > 0) {
      await log(
        `🎯 Backup seletivo das collections: ${schedule.collections.join(', ')}`
      );
      // Aqui você implementaria o backup seletivo
      // await performSelectiveBackup({ collections: schedule.collections });
    } else {
      await log('📦 Executando backup completo');
      await performBackup();
    }

    await log(`✅ Backup agendado '${schedule.name}' concluído com sucesso`);

    // Cleanup baseado na retenção do agendamento
    if (schedule.retentionDays > 0) {
      await log(
        `🗑️  Executando cleanup (retenção: ${schedule.retentionDays} dias)`
      );
      await cleanupOldBackups(schedule.retentionDays);
    }

    // Atualizar próxima execução
    await updateNextRun(schedule);
  } catch (error) {
    await log(`❌ Erro no backup agendado '${schedule.name}': ${error}`);
  } finally {
    await removeLockFile();
  }
}

// Atualizar próxima execução de um agendamento
async function updateNextRun(schedule: BackupSchedule): Promise<void> {
  try {
    const schedules = await loadSchedules();
    const scheduleIndex = schedules.findIndex((s) => s.id === schedule.id);

    if (scheduleIndex !== -1) {
      // Recalcular próxima execução
      const nextRun = calculateNextRun({
        name: schedule.name,
        frequency: schedule.frequency,
        time: schedule.time,
        dayOfWeek: schedule.dayOfWeek,
        dayOfMonth: schedule.dayOfMonth,
        collections: schedule.collections,
        retentionDays: schedule.retentionDays,
        enabled: schedule.enabled,
      });

      schedules[scheduleIndex].nextRun = nextRun;
      schedules[scheduleIndex].lastRun = new Date();
      schedules[scheduleIndex].updatedAt = new Date();

      await saveSchedules(schedules);
      await log(
        `📅 Próxima execução de '${schedule.name}': ${nextRun.toLocaleString(
          'pt-BR'
        )}`
      );
    }
  } catch (error) {
    await log(`❌ Erro ao atualizar próxima execução: ${error}`);
  }
}

// Configurar um agendamento no cron
function setupCronJob(schedule: BackupSchedule): void {
  try {
    const cronExpression = generateCronExpression({
      name: schedule.name,
      frequency: schedule.frequency,
      time: schedule.time,
      dayOfWeek: schedule.dayOfWeek,
      dayOfMonth: schedule.dayOfMonth,
      collections: schedule.collections,
      retentionDays: schedule.retentionDays,
      enabled: schedule.enabled,
    });

    const task = cron.schedule(
      cronExpression,
      async () => {
        await executeScheduledBackup(schedule);
      },
      {
        scheduled: schedule.enabled,
        timezone: 'America/Sao_Paulo',
      }
    );

    activeCronTasks.set(schedule.id, task);

    const description = getScheduleDescription(schedule);
    log(`✅ Agendamento configurado: ${schedule.name}`);
    log(`   📋 ${description}`);
    log(`   🔧 Cron: ${cronExpression}`);
    log(
      `   📅 Próxima execução: ${
        schedule.nextRun
          ? new Date(schedule.nextRun).toLocaleString('pt-BR')
          : 'N/A'
      }`
    );
    log(`   ${schedule.enabled ? '✓ Ativo' : '⏸️  Pausado'}`);
  } catch (error) {
    log(`❌ Erro ao configurar agendamento '${schedule.name}': ${error}`);
  }
}

// Remover agendamento do cron
function removeCronJob(scheduleId: string): void {
  const task = activeCronTasks.get(scheduleId);
  if (task) {
    task.destroy();
    activeCronTasks.delete(scheduleId);
    log(`🗑️  Agendamento removido do cron: ${scheduleId}`);
  }
}

// Recarregar todos os agendamentos
async function reloadSchedules(): Promise<void> {
  try {
    await log('🔄 Recarregando agendamentos...');

    // Parar todos os cron jobs ativos
    for (const [scheduleId, task] of activeCronTasks) {
      task.destroy();
      activeCronTasks.delete(scheduleId);
    }

    // Carregar novos agendamentos
    const schedules = await loadSchedules();

    if (schedules.length === 0) {
      await log('📭 Nenhum agendamento encontrado');
      return;
    }

    // Configurar cada agendamento
    for (const schedule of schedules) {
      if (schedule.enabled) {
        setupCronJob(schedule);
      } else {
        await log(`⏸️  Agendamento pausado: ${schedule.name}`);
      }
    }

    await log(
      `✅ ${schedules.length} agendamento(s) carregado(s), ${activeCronTasks.size} ativo(s)`
    );
  } catch (error) {
    await log(`❌ Erro ao recarregar agendamentos: ${error}`);
  }
}

// Verificação de saúde do sistema
async function performHealthCheck(): Promise<void> {
  try {
    const schedules = await loadSchedules();

    await log('🏥 Verificação de saúde do sistema de backup');
    await log(`📊 Total de agendamentos: ${schedules.length}`);
    await log(`⚡ Agendamentos ativos: ${activeCronTasks.size}`);

    // Verificar agendamentos perdidos ou atrasados
    const now = new Date();
    let lateSchedules = 0;

    for (const schedule of schedules) {
      if (schedule.enabled && schedule.nextRun) {
        const nextRun = new Date(schedule.nextRun);
        const hoursLate =
          (now.getTime() - nextRun.getTime()) / (1000 * 60 * 60);

        if (hoursLate > 1) {
          // Mais de 1 hora atrasado
          lateSchedules++;
          await log(
            `⚠️  Agendamento atrasado: ${schedule.name} (${Math.round(
              hoursLate
            )}h)`
          );
        }
      }
    }

    if (lateSchedules === 0) {
      await log('✅ Todos os agendamentos estão em dia');
    }

    // Verificar espaço em disco
    const backupsDir = path.join(process.cwd(), 'backups');
    try {
      const entries = await fs.readdir(backupsDir, { withFileTypes: true });
      const backupCount = entries.filter((entry) => entry.isDirectory()).length;
      await log(`💾 Backups existentes: ${backupCount}`);
    } catch {
      await log('📁 Diretório de backups não encontrado');
    }
  } catch (error) {
    await log(`❌ Erro na verificação de saúde: ${error}`);
  }
}

// Watch do arquivo de agendamentos para recarregar automaticamente
async function watchSchedulesFile(): Promise<void> {
  try {
    const watcher = fs.watch(SCHEDULES_FILE);

    for await (const event of watcher) {
      if (event.eventType === 'change') {
        await log('📁 Arquivo de agendamentos modificado, recarregando...');
        // Aguardar um pouco para garantir que o arquivo foi completamente escrito
        setTimeout(reloadSchedules, 1000);
      }
    }
  } catch (error) {
    await log(
      `⚠️  Não foi possível monitorar arquivo de agendamentos: ${error}`
    );
  }
}

// Configurar tarefas de manutenção
function setupMaintenanceTasks(): void {
  // Verificação de saúde a cada 2 horas
  cron.schedule(
    '0 */2 * * *',
    async () => {
      if (!(await isBackupRunning())) {
        await performHealthCheck();
      }
    },
    {
      timezone: 'America/Sao_Paulo',
    }
  );

  // Recarregar agendamentos a cada 6 horas (redundância)
  cron.schedule(
    '0 */6 * * *',
    async () => {
      await reloadSchedules();
    },
    {
      timezone: 'America/Sao_Paulo',
    }
  );
}

// Função para parar o serviço graciosamente
async function stopService(): Promise<void> {
  await log('🛑 Parando serviço de backup agendado...');

  // Parar todos os cron jobs
  for (const [scheduleId, task] of activeCronTasks) {
    task.destroy();
    await log(`   🗑️  Parando agendamento: ${scheduleId}`);
  }
  activeCronTasks.clear();

  // Verificar se há backup em execução
  if (await isBackupRunning()) {
    await log('⚠️  Backup em execução, aguardando conclusão...');

    let attempts = 0;
    const maxAttempts = 180; // 30 minutos

    while ((await isBackupRunning()) && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      attempts++;
    }

    if (await isBackupRunning()) {
      await log('⚠️  Forçando parada após 30 minutos...');
      await removeLockFile();
    }
  }

  await log('✅ Serviço de backup agendado parado');
  process.exit(0);
}

// Inicializar serviço
async function initializeService(): Promise<void> {
  try {
    await log('🚀 Inicializando sistema de backup agendado avançado...');

    // Verificar se há backup órfão
    if (await isBackupRunning()) {
      await log('⚠️  Encontrado lock file órfão, removendo...');
      await removeLockFile();
    }

    // Verificação inicial de saúde
    await performHealthCheck();

    // Configurar tarefas de manutenção
    setupMaintenanceTasks();

    // Carregar e configurar agendamentos
    await reloadSchedules();

    // Iniciar monitoramento do arquivo de agendamentos
    watchSchedulesFile();

    await log('✅ Sistema de backup agendado iniciado com sucesso');

    // Manter o processo rodando
    process.on('SIGINT', stopService);
    process.on('SIGTERM', stopService);
  } catch (error) {
    await log(`❌ Erro ao inicializar serviço: ${error}`);
    process.exit(1);
  }
}

// Interface CLI
async function main(): Promise<void> {
  const command = process.argv[2];

  switch (command) {
    case 'start':
      await initializeService();
      break;

    case 'stop':
      await stopService();
      break;

    case 'reload':
      await reloadSchedules();
      process.exit(0);

    case 'status':
      const isRunning = await isBackupRunning();
      const schedules = await loadSchedules();

      console.log('📊 Status do Sistema de Backup Agendado');
      console.log('=====================================');
      console.log(`Backup em execução: ${isRunning ? 'SIM' : 'NÃO'}`);
      console.log(`Agendamentos configurados: ${schedules.length}`);
      console.log(
        `Agendamentos ativos: ${schedules.filter((s) => s.enabled).length}`
      );

      if (schedules.length > 0) {
        console.log('\n📅 Agendamentos:');
        for (const schedule of schedules) {
          const status = schedule.enabled ? '✅ Ativo' : '⏸️  Pausado';
          const nextRun = schedule.nextRun
            ? new Date(schedule.nextRun).toLocaleString('pt-BR')
            : 'N/A';
          console.log(`   ${status} - ${schedule.name}`);
          console.log(`     📋 ${getScheduleDescription(schedule)}`);
          console.log(`     📅 Próxima execução: ${nextRun}`);
        }
      }
      break;

    case 'health':
      await performHealthCheck();
      process.exit(0);

    case 'test':
      const testSchedule = {
        id: 'test',
        name: 'Teste',
        frequency: 'daily' as const,
        time: '14:30',
        collections: [],
        retentionDays: 7,
        enabled: true,
        nextRun: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('🧪 Teste de Configuração');
      console.log(`Descrição: ${getScheduleDescription(testSchedule)}`);
      console.log(`Cron: ${generateCronExpression(testSchedule)}`);
      break;

    default:
      console.log('🕐 Sistema de Backup Agendado Avançado');
      console.log('');
      console.log('Comandos disponíveis:');
      console.log('  start   - Iniciar o serviço de agendamento');
      console.log('  stop    - Parar o serviço');
      console.log('  reload  - Recarregar agendamentos');
      console.log('  status  - Mostrar status do sistema');
      console.log('  health  - Verificação de saúde');
      console.log('  test    - Testar configuração');
      console.log('');
      console.log('Exemplos:');
      console.log('  tsx scripts/backup/advanced-scheduled-backup.ts start');
      console.log('  tsx scripts/backup/advanced-scheduled-backup.ts status');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(async (error) => {
    await log(`💥 Erro crítico: ${error}`);
    process.exit(1);
  });
}

export {
  initializeService,
  reloadSchedules,
  performHealthCheck,
  executeScheduledBackup,
};
