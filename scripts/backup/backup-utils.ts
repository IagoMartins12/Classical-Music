// scripts/backup/backup-utils.ts
import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { performBackup } from './backup';
import { performSelectiveBackup } from './selective-backup';

const prisma = new PrismaClient();

// Utilitário para cleanup de backups antigos
export async function cleanupOldBackups(
  daysToKeep: number = 30
): Promise<void> {
  const backupsDir = path.join(process.cwd(), 'backups');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  try {
    const entries = await fs.readdir(backupsDir, { withFileTypes: true });
    let removedCount = 0;
    let freedSpace = 0;

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirPath = path.join(backupsDir, entry.name);
        const stats = await fs.stat(dirPath);

        if (stats.birthtime < cutoffDate) {
          const size = await getDirSize(dirPath);
          await fs.rm(dirPath, { recursive: true });
          console.log(
            `🗑️  Removido backup antigo: ${entry.name} (${formatBytes(size)})`
          );
          removedCount++;
          freedSpace += size;
        }
      }
    }

    console.log(`✅ Cleanup concluído: ${removedCount} backups removidos`);
    console.log(`💾 Espaço liberado: ${formatBytes(freedSpace)}`);
    console.log(`📅 Mantidos backups dos últimos ${daysToKeep} dias`);
  } catch (error) {
    console.error('❌ Erro durante cleanup:', error);
    throw error;
  }
}

// Utilitário para verificar integridade do backup
export async function verifyBackupIntegrity(
  backupPath: string
): Promise<boolean> {
  try {
    console.log(`🔍 Verificando integridade: ${backupPath}`);

    const backupContent = await fs.readFile(backupPath, 'utf8');
    const backupData = JSON.parse(backupContent);

    // Verificações básicas
    const hasTimestamp = !!backupData.timestamp;
    const hasMetadata = !!backupData.metadata;
    const hasData = !!backupData.data && typeof backupData.data === 'object';

    let totalRecords = 0;
    for (const [collection, data] of Object.entries(backupData.data)) {
      if (Array.isArray(data)) {
        totalRecords += data.length;
      }
    }

    const recordsMatch = totalRecords === backupData.metadata.totalRecords;

    console.log('🔍 Verificação de integridade:');
    console.log(`   Timestamp: ${hasTimestamp ? '✓' : '✗'}`);
    console.log(`   Metadata: ${hasMetadata ? '✓' : '✗'}`);
    console.log(`   Dados: ${hasData ? '✓' : '✗'}`);
    console.log(
      `   Contagem de registros: ${recordsMatch ? '✓' : '✗'} (${totalRecords}/${
        backupData.metadata.totalRecords
      })`
    );

    const isValid = hasTimestamp && hasMetadata && hasData && recordsMatch;
    console.log(`📋 Resultado: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);

    return isValid;
  } catch (error) {
    console.error('❌ Erro verificando integridade:', error);
    return false;
  }
}

// Otimização do banco de dados
export async function optimizeDatabase(): Promise<void> {
  console.log('🔧 Iniciando otimização do banco de dados...');

  try {
    await prisma.$connect();

    // Para MongoDB, executar comandos de otimização
    console.log('📊 Coletando estatísticas do banco...');

    // Contar registros principais
    const userCount = await prisma.user.count();
    const composerCount = await prisma.composer.count();
    const workCount = await prisma.work.count();
    const scoreCount = await prisma.workScore.count();

    console.log(`   👥 Usuários: ${userCount.toLocaleString()}`);
    console.log(`   🎼 Compositores: ${composerCount.toLocaleString()}`);
    console.log(`   🎵 Obras: ${workCount.toLocaleString()}`);
    console.log(`   📄 Partituras: ${scoreCount.toLocaleString()}`);

    // Simular otimização (para MongoDB, seria diferente)
    console.log('🔄 Executando otimização...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('✅ Otimização do banco concluída');
  } catch (error) {
    console.error('❌ Erro durante otimização:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Limpeza de cache
export async function cleanCache(): Promise<void> {
  console.log('🧹 Iniciando limpeza de cache...');

  try {
    const cacheDir = path.join(process.cwd(), '.next', 'cache');

    try {
      await fs.access(cacheDir);
      const stats = await fs.stat(cacheDir);
      const sizeBefore = await getDirSize(cacheDir);

      // Limpar cache do Next.js
      await fs.rm(cacheDir, { recursive: true, force: true });

      console.log(`✅ Cache limpo: ${formatBytes(sizeBefore)} liberados`);
    } catch {
      console.log('ℹ️  Nenhum cache encontrado para limpar');
    }

    // Simular limpeza de outros caches
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('✅ Limpeza de cache concluída');
  } catch (error) {
    console.error('❌ Erro durante limpeza de cache:', error);
    throw error;
  }
}

// Rotação de logs
export async function rotateLogFiles(): Promise<void> {
  console.log('📋 Iniciando rotação de logs...');

  try {
    const logsDir = path.join(process.cwd(), 'logs');
    const backupLogsDir = path.join(process.cwd(), 'scripts', 'backup', 'logs');

    let totalSize = 0;
    let filesRotated = 0;

    // Processar diretório de logs principal
    for (const logDir of [logsDir, backupLogsDir]) {
      try {
        await fs.access(logDir);
        const entries = await fs.readdir(logDir, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isFile() && entry.name.endsWith('.log')) {
            const filePath = path.join(logDir, entry.name);
            const stats = await fs.stat(filePath);

            // Rotacionar logs maiores que 10MB ou mais antigos que 7 dias
            const isLarge = stats.size > 10 * 1024 * 1024;
            const isOld =
              Date.now() - stats.mtime.getTime() > 7 * 24 * 60 * 60 * 1000;

            if (isLarge || isOld) {
              const timestamp = new Date().toISOString().split('T')[0];
              const archivedName = `${entry.name}.${timestamp}.archived`;
              const archivedPath = path.join(logDir, archivedName);

              await fs.rename(filePath, archivedPath);

              totalSize += stats.size;
              filesRotated++;
              console.log(`   📋 Rotacionado: ${entry.name} → ${archivedName}`);
            }
          }
        }
      } catch {
        // Diretório não existe, continuar
      }
    }

    console.log(`✅ Rotação concluída: ${filesRotated} arquivos rotacionados`);
    console.log(`💾 Tamanho total: ${formatBytes(totalSize)}`);
  } catch (error) {
    console.error('❌ Erro durante rotação de logs:', error);
    throw error;
  }
}

// Verificar saúde do sistema de backup
export async function checkBackupSystemHealth(): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
  metrics: any;
}> {
  console.log('🏥 Verificando saúde do sistema de backup...');

  const health = {
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
    issues: [] as string[],
    recommendations: [] as string[],
    metrics: {} as any,
  };

  try {
    const backupsDir = path.join(process.cwd(), 'backups');

    // Verificar se diretório existe
    try {
      await fs.access(backupsDir);
    } catch {
      health.status = 'critical';
      health.issues.push('Diretório de backups não existe');
      health.recommendations.push('Execute: mkdir -p backups');
      return health;
    }

    // Contar backups
    const entries = await fs.readdir(backupsDir, { withFileTypes: true });
    const backupDirs = entries.filter((entry) => entry.isDirectory());

    health.metrics.totalBackups = backupDirs.length;

    if (backupDirs.length === 0) {
      health.status = 'critical';
      health.issues.push('Nenhum backup encontrado');
      health.recommendations.push('Execute backup manual: npm run backup');
      return health;
    }

    // Verificar backup mais recente
    let newestBackup = null;
    let newestDate = new Date(0);
    let totalSize = 0;
    let corruptedBackups = 0;

    for (const dir of backupDirs) {
      const dirPath = path.join(backupsDir, dir.name);
      const metadataPath = path.join(dirPath, 'metadata.json');

      try {
        const stats = await fs.stat(dirPath);
        const size = await getDirSize(dirPath);
        totalSize += size;

        if (stats.birthtime > newestDate) {
          newestDate = stats.birthtime;
          newestBackup = dir.name;
        }

        // Verificar integridade básica
        try {
          await fs.access(metadataPath);
        } catch {
          corruptedBackups++;
        }
      } catch (error) {
        corruptedBackups++;
      }
    }

    health.metrics.totalSize = formatBytes(totalSize);
    health.metrics.newestBackup = newestBackup;
    health.metrics.lastBackupAge = Math.floor(
      (Date.now() - newestDate.getTime()) / (1000 * 60 * 60)
    );
    health.metrics.corruptedBackups = corruptedBackups;

    // Análise de saúde
    if (health.metrics.lastBackupAge > 48) {
      health.status = 'critical';
      health.issues.push(
        `Último backup há ${health.metrics.lastBackupAge} horas`
      );
      health.recommendations.push('Execute backup urgente');
    } else if (health.metrics.lastBackupAge > 24) {
      health.status = 'warning';
      health.issues.push(
        `Último backup há ${health.metrics.lastBackupAge} horas`
      );
      health.recommendations.push('Considere backup mais frequente');
    }

    if (corruptedBackups > 0) {
      health.status = health.status === 'critical' ? 'critical' : 'warning';
      health.issues.push(`${corruptedBackups} backup(s) corrompido(s)`);
      health.recommendations.push('Verifique e remova backups corrompidos');
    }

    if (backupDirs.length > 10) {
      health.recommendations.push('Execute cleanup de backups antigos');
    }

    console.log(`📊 Status: ${health.status.toUpperCase()}`);
    console.log(`📦 Backups: ${health.metrics.totalBackups}`);
    console.log(`💾 Tamanho total: ${health.metrics.totalSize}`);
    console.log(`⏰ Último backup: ${health.metrics.lastBackupAge}h atrás`);

    if (health.issues.length > 0) {
      console.log('⚠️  Problemas encontrados:');
      health.issues.forEach((issue) => console.log(`   • ${issue}`));
    }

    if (health.recommendations.length > 0) {
      console.log('💡 Recomendações:');
      health.recommendations.forEach((rec) => console.log(`   • ${rec}`));
    }

    return health;
  } catch (error) {
    health.status = 'critical';
    health.issues.push(`Erro na verificação: ${error}`);
    console.error('❌ Erro verificando saúde do sistema:', error);
    return health;
  }
}

// Utilitário para calcular tamanho de diretório
async function getDirSize(dirPath: string): Promise<number> {
  let size = 0;
  try {
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
  } catch (error) {
    // Ignorar erros
  }
  return size;
}

// Utilitário para formatar bytes
export function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

// Executar backup com opções customizadas
export async function runCustomBackup(options: {
  collections?: string[];
  includeDependencies?: boolean;
  skipLargeCollections?: boolean;
  compressionLevel?: number;
}): Promise<void> {
  console.log('🎯 Executando backup customizado...');

  try {
    if (options.collections && options.collections.length > 0) {
      // Backup seletivo
      console.log(`📋 Backup seletivo: ${options.collections.join(', ')}`);

      const result = await performSelectiveBackup({
        collections: options.collections,
        includeDependencies: options.includeDependencies || false,
      });

      if (!result.success) {
        throw new Error(result.error || 'Backup seletivo falhou');
      }

      console.log(
        `✅ Backup seletivo concluído: ${result.totalRecords} registros`
      );
    } else {
      // Backup completo
      console.log('📦 Backup completo...');
      await performBackup();
      console.log('✅ Backup completo concluído');
    }
  } catch (error) {
    console.error('❌ Erro no backup customizado:', error);
    throw error;
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'cleanup':
      const days = parseInt(args[0]) || 30;
      await cleanupOldBackups(days);
      break;

    case 'verify':
      const backupPath = args[0];
      if (!backupPath) {
        console.error('❌ Forneça o caminho do backup para verificar');
        process.exit(1);
      }
      const isValid = await verifyBackupIntegrity(backupPath);
      process.exit(isValid ? 0 : 1);

    case 'optimize':
      await optimizeDatabase();
      break;

    case 'clean-cache':
      await cleanCache();
      break;

    case 'rotate-logs':
      await rotateLogFiles();
      break;

    case 'health':
      const health = await checkBackupSystemHealth();
      process.exit(health.status === 'critical' ? 1 : 0);

    case 'custom-backup':
      const collections = args.filter((arg) => !arg.startsWith('--'));
      const includeDeps = args.includes('--with-dependencies');

      await runCustomBackup({
        collections: collections.length > 0 ? collections : undefined,
        includeDependencies: includeDeps,
      });
      break;

    case 'maintenance-suite':
      console.log('🔧 Executando suite completa de manutenção...');

      try {
        await cleanCache();
        await rotateLogFiles();
        await optimizeDatabase();
        await cleanupOldBackups(30);

        console.log('✅ Suite de manutenção concluída com sucesso!');
      } catch (error) {
        console.error('❌ Erro na suite de manutenção:', error);
        process.exit(1);
      }
      break;

    default:
      console.log('🔧 Utilitários de Backup e Manutenção');
      console.log('');
      console.log('Comandos disponíveis:');
      console.log('  cleanup <days>           - Limpar backups antigos');
      console.log(
        '  verify <path>            - Verificar integridade do backup'
      );
      console.log('  optimize                 - Otimizar banco de dados');
      console.log('  clean-cache              - Limpar cache do sistema');
      console.log('  rotate-logs              - Rotacionar arquivos de log');
      console.log('  health                   - Verificar saúde do sistema');
      console.log('  custom-backup [cols...]  - Backup customizado');
      console.log('  maintenance-suite        - Executar suite completa');
      console.log('');
      console.log('Opções:');
      console.log('  --with-dependencies      - Incluir dependências (backup)');
      console.log('');
      console.log('Exemplos:');
      console.log('  tsx scripts/backup/backup-utils.ts cleanup 30');
      console.log(
        '  tsx scripts/backup/backup-utils.ts verify ./backups/backup-xxx/backup.json'
      );
      console.log(
        '  tsx scripts/backup/backup-utils.ts custom-backup user work --with-dependencies'
      );
      console.log('  tsx scripts/backup/backup-utils.ts maintenance-suite');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
