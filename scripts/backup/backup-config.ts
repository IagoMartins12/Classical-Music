// scripts/backup/backup-config.ts
import path from 'path';

export interface BackupConfig {
  // Configurações básicas
  maxBackups: number;
  retentionDays: number;
  backupLocation: string;
  logLocation: string;

  // Configurações de performance
  batchSize: number;
  parallelCollections: number;
  timeoutMinutes: number;

  // Configurações de agendamento
  scheduleEnabled: boolean;
  defaultSchedule: string; // Cron expression
  healthCheckSchedule: string;

  // Configurações de manutenção
  autoCleanup: boolean;
  autoOptimization: boolean;
  logRotation: boolean;
  cacheCleanup: boolean;

  // Configurações de collections
  largeCollections: string[];
  skipCollections: string[];
  dependencyMap: { [key: string]: string[] };

  // Configurações de notificação
  notificationsEnabled: boolean;
  notificationEmail?: string;
  webhookUrl?: string;

  // Configurações de segurança
  encryptionEnabled: boolean;
  encryptionKey?: string;
}

// Configuração padrão
export const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  // Básicas
  maxBackups: 5,
  retentionDays: 30,
  backupLocation: path.join(process.cwd(), 'backups'),
  logLocation: path.join(process.cwd(), 'scripts', 'backup', 'logs'),

  // Performance
  batchSize: 100,
  parallelCollections: 3,
  timeoutMinutes: 60,

  // Agendamento
  scheduleEnabled: true,
  defaultSchedule: '0 2 * * *', // 2:00 AM diário
  healthCheckSchedule: '0 */2 * * *', // A cada 2 horas

  // Manutenção
  autoCleanup: true,
  autoOptimization: false,
  logRotation: true,
  cacheCleanup: true,

  // Collections
  largeCollections: ['work', 'composer', 'workScore', 'user'],
  skipCollections: [],
  dependencyMap: {
    user: [],
    epoch: [],
    role: [],
    instrument: [],
    workGenre: [],
    composer: ['epoch', 'role', 'user'],
    work: ['composer', 'epoch', 'instrument', 'user'],
    workScore: ['work'],
    userInstrument: ['user', 'instrument'],
    annotation: ['user', 'work'],
    pdfAnnotation: ['user', 'work'],
    favoriteWork: ['user', 'work'],
    favoriteComposer: ['user', 'composer'],
    newsletterSubscriber: ['user'],
    newsletterTemplate: ['user'],
    advertisement: ['user', 'instrument'],
  },

  // Notificações
  notificationsEnabled: false,

  // Segurança
  encryptionEnabled: false,
};

// Configurações para diferentes ambientes
export const ENVIRONMENT_CONFIGS = {
  development: {
    ...DEFAULT_BACKUP_CONFIG,
    maxBackups: 3,
    retentionDays: 7,
    scheduleEnabled: false,
  },

  staging: {
    ...DEFAULT_BACKUP_CONFIG,
    maxBackups: 7,
    retentionDays: 14,
    notificationsEnabled: true,
  },

  production: {
    ...DEFAULT_BACKUP_CONFIG,
    maxBackups: 10,
    retentionDays: 60,
    encryptionEnabled: true,
    notificationsEnabled: true,
    autoOptimization: true,
  },
};

// Função para carregar configuração
export function loadBackupConfig(
  environment: string = 'development'
): BackupConfig {
  const envConfig =
    ENVIRONMENT_CONFIGS[environment as keyof typeof ENVIRONMENT_CONFIGS];

  if (!envConfig) {
    console.warn(
      `⚠️  Ambiente '${environment}' não reconhecido, usando 'development'`
    );
    return ENVIRONMENT_CONFIGS.development;
  }

  // Sobrescrever com variáveis de ambiente se disponíveis
  const config = {
    ...envConfig,
    maxBackups:
      parseInt(process.env.BACKUP_MAX_BACKUPS || '') || envConfig.maxBackups,
    retentionDays:
      parseInt(process.env.BACKUP_RETENTION_DAYS || '') ||
      envConfig.retentionDays,
    scheduleEnabled:
      process.env.BACKUP_SCHEDULE_ENABLED === 'true' ||
      envConfig.scheduleEnabled,
    notificationsEnabled:
      process.env.BACKUP_NOTIFICATIONS_ENABLED === 'true' ||
      envConfig.notificationsEnabled,
    notificationEmail:
      process.env.BACKUP_NOTIFICATION_EMAIL || envConfig.notificationEmail,
    webhookUrl: process.env.BACKUP_WEBHOOK_URL || envConfig.webhookUrl,
    encryptionEnabled:
      process.env.BACKUP_ENCRYPTION_ENABLED === 'true' ||
      envConfig.encryptionEnabled,
    encryptionKey: process.env.BACKUP_ENCRYPTION_KEY || envConfig.encryptionKey,
  };

  return config;
}

// Validar configuração
export function validateBackupConfig(config: BackupConfig): string[] {
  const errors: string[] = [];

  if (config.maxBackups < 1) {
    errors.push('maxBackups deve ser maior que 0');
  }

  if (config.retentionDays < 1) {
    errors.push('retentionDays deve ser maior que 0');
  }

  if (config.batchSize < 1) {
    errors.push('batchSize deve ser maior que 0');
  }

  if (config.parallelCollections < 1) {
    errors.push('parallelCollections deve ser maior que 0');
  }

  if (config.timeoutMinutes < 1) {
    errors.push('timeoutMinutes deve ser maior que 0');
  }

  if (config.encryptionEnabled && !config.encryptionKey) {
    errors.push('encryptionKey é obrigatório quando encryptionEnabled é true');
  }

  if (
    config.notificationsEnabled &&
    !config.notificationEmail &&
    !config.webhookUrl
  ) {
    errors.push(
      'notificationEmail ou webhookUrl é obrigatório quando notificationsEnabled é true'
    );
  }

  return errors;
}

// Criar arquivo de configuração
export async function createConfigFile(
  config: BackupConfig,
  filePath?: string
): Promise<void> {
  const fs = await import('fs/promises');

  const configPath =
    filePath ||
    path.join(process.cwd(), 'scripts', 'backup', 'backup-config.json');

  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Arquivo de configuração criado: ${configPath}`);
  } catch (error) {
    console.error('❌ Erro criando arquivo de configuração:', error);
    throw error;
  }
}

// Carregar configuração de arquivo
export async function loadConfigFromFile(
  filePath?: string
): Promise<BackupConfig> {
  const fs = await import('fs/promises');

  const configPath =
    filePath ||
    path.join(process.cwd(), 'scripts', 'backup', 'backup-config.json');

  try {
    const content = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(content) as BackupConfig;

    const errors = validateBackupConfig(config);
    if (errors.length > 0) {
      console.warn('⚠️  Configuração possui erros:');
      errors.forEach((error) => console.warn(`   • ${error}`));
    }

    return config;
  } catch (error) {
    console.warn(
      `⚠️  Não foi possível carregar configuração de ${configPath}, usando padrão`
    );
    return DEFAULT_BACKUP_CONFIG;
  }
}

// Exemplo de uso
if (require.main === module) {
  const command = process.argv[2];
  const environment = process.argv[3] || 'development';

  switch (command) {
    case 'create':
      const config = loadBackupConfig(environment);
      createConfigFile(config).then(() => {
        console.log(
          `✅ Configuração para '${environment}' criada com sucesso!`
        );
      });
      break;

    case 'validate':
      const configPath = process.argv[3];
      loadConfigFromFile(configPath).then((config) => {
        const errors = validateBackupConfig(config);
        if (errors.length === 0) {
          console.log('✅ Configuração válida!');
        } else {
          console.log('❌ Configuração inválida:');
          errors.forEach((error) => console.log(`   • ${error}`));
          process.exit(1);
        }
      });
      break;

    case 'show':
      const showConfig = loadBackupConfig(environment);
      console.log(`📋 Configuração para '${environment}':`);
      console.log(JSON.stringify(showConfig, null, 2));
      break;

    default:
      console.log('🔧 Gerenciador de Configuração de Backup');
      console.log('');
      console.log('Comandos:');
      console.log('  create [environment]  - Criar arquivo de configuração');
      console.log('  validate [file]       - Validar arquivo de configuração');
      console.log('  show [environment]    - Mostrar configuração');
      console.log('');
      console.log('Ambientes disponíveis: development, staging, production');
      console.log('');
      console.log('Exemplos:');
      console.log('  tsx scripts/backup/backup-config.ts create production');
      console.log(
        '  tsx scripts/backup/backup-config.ts validate ./backup-config.json'
      );
      console.log('  tsx scripts/backup/backup-config.ts show staging');
  }
}
