// scripts/backup/backup-monitor.ts
import fs from 'fs/promises';
import path from 'path';

interface BackupHealth {
  lastBackupDate: string | null;
  backupCount: number;
  totalSize: string;
  oldestBackup: string | null;
  newestBackup: string | null;
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
}

export async function checkBackupHealth(): Promise<BackupHealth> {
  const backupsDir = path.join(process.cwd(), 'backups');
  const health: BackupHealth = {
    lastBackupDate: null,
    backupCount: 0,
    totalSize: '0 MB',
    oldestBackup: null,
    newestBackup: null,
    status: 'healthy',
    issues: [],
  };

  try {
    const entries = await fs.readdir(backupsDir, { withFileTypes: true });
    const backupDirs = entries.filter((entry) => entry.isDirectory());

    health.backupCount = backupDirs.length;

    if (backupDirs.length === 0) {
      health.status = 'critical';
      health.issues.push('Nenhum backup encontrado');
      return health;
    }

    // Analisar cada backup
    let totalSizeBytes = 0;
    let oldestDate = new Date();
    let newestDate = new Date(0);

    for (const dir of backupDirs) {
      const dirPath = path.join(backupsDir, dir.name);
      const stats = await fs.stat(dirPath);

      totalSizeBytes += await getDirSize(dirPath);

      if (stats.birthtime < oldestDate) {
        oldestDate = stats.birthtime;
        health.oldestBackup = dir.name;
      }

      if (stats.birthtime > newestDate) {
        newestDate = stats.birthtime;
        health.newestBackup = dir.name;
      }
    }

    health.lastBackupDate = newestDate.toISOString();
    health.totalSize = formatBytes(totalSizeBytes);

    // Verificar se o último backup é muito antigo
    const hoursSinceLastBackup =
      (Date.now() - newestDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastBackup > 48) {
      health.status = 'critical';
      health.issues.push(
        `Último backup há ${Math.round(hoursSinceLastBackup)} horas`
      );
    } else if (hoursSinceLastBackup > 24) {
      health.status = 'warning';
      health.issues.push(
        `Último backup há ${Math.round(hoursSinceLastBackup)} horas`
      );
    }

    return health;
  } catch (error) {
    health.status = 'critical';
    health.issues.push(`Erro verificando backups: ${error}`);
    return health;
  }
}

async function getDirSize(dirPath: string): Promise<number> {
  let size = 0;
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      size += await getDirSize(entryPath);
    } else {
      const stats = await fs.stat(entryPath);
      size += stats.size;
    }
  }

  return size;
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

// CLI para verificação manual
if (require.main === module) {
  checkBackupHealth().then((health) => {
    console.log('🏥 Status do Sistema de Backup');
    console.log('================================');
    console.log(
      `Status: ${
        health.status === 'healthy'
          ? '✅'
          : health.status === 'warning'
          ? '⚠️'
          : '❌'
      } ${health.status.toUpperCase()}`
    );
    console.log(
      `Último backup: ${
        health.lastBackupDate
          ? new Date(health.lastBackupDate).toLocaleString('pt-BR')
          : 'N/A'
      }`
    );
    console.log(`Total de backups: ${health.backupCount}`);
    console.log(`Tamanho total: ${health.totalSize}`);
    console.log(`Backup mais antigo: ${health.oldestBackup || 'N/A'}`);
    console.log(`Backup mais recente: ${health.newestBackup || 'N/A'}`);

    if (health.issues.length > 0) {
      console.log('\n⚠️  Problemas encontrados:');
      health.issues.forEach((issue) => console.log(`   • ${issue}`));
    }
  });
}
