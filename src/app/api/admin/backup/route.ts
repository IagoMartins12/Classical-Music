// app/api/admin/backup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

// Configuração máxima de backups (variável configurável)
const MAX_BACKUPS = 5;

interface BackupInfo {
  id: string;
  name: string;
  size: string;
  date: Date;
  status: 'completed' | 'failed' | 'in_progress';
  totalRecords?: number;
  collections?: number;
  duration?: string;
  error?: string;
}

interface BackupStats {
  totalBackups: number;
  lastBackupDate: Date | null;
  totalSize: string;
  oldestBackup: string | null;
  newestBackup: string | null;
  maxBackups: number;
  isBackupRunning: boolean;
  scheduledBackupStatus: 'active' | 'inactive';
}

// Função para obter informações de um backup
async function getBackupInfo(backupDir: string): Promise<BackupInfo | null> {
  try {
    const metadataPath = path.join(backupDir, 'metadata.json');
    const errorPath = path.join(backupDir, 'error.json');

    // Verificar se há erro primeiro
    try {
      const errorData = JSON.parse(await fs.readFile(errorPath, 'utf8'));
      return {
        id: path.basename(backupDir),
        name: path.basename(backupDir),
        size: '0 MB',
        date: new Date(errorData.timestamp),
        status: 'failed',
        error: errorData.error,
      };
    } catch {
      // Não há arquivo de erro, continuar
    }

    // Ler metadados
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

    // Calcular tamanho do diretório
    const size = await getDirSize(backupDir);

    return {
      id: path.basename(backupDir),
      name: path.basename(backupDir),
      size: formatBytes(size),
      date: new Date(metadata.timestamp),
      status: metadata.status || 'completed',
      totalRecords: metadata.totalRecords,
      collections: metadata.collectionsCount || metadata.collections?.length,
      duration: metadata.duration,
    };
  } catch (error) {
    console.error(`Erro lendo backup ${backupDir}:`, error);
    return null;
  }
}

// Função recursiva para calcular tamanho do diretório
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
    console.error(`Erro calculando tamanho de ${dirPath}:`, error);
  }

  return size;
}

// Formatar bytes em formato legível
function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

// Verificar se há backup em execução
async function isBackupRunning(): Promise<boolean> {
  try {
    const lockPath = path.join(
      process.cwd(),
      'scripts',
      'backup',
      'backup.lock'
    );
    await fs.access(lockPath);
    return true;
  } catch {
    return false;
  }
}

// Executar comando de backup
function executeBackup(): Promise<{
  success: boolean;
  output: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const backupProcess = spawn('npm', ['run', 'backup'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
    });

    let output = '';
    let errorOutput = '';

    backupProcess.stdout?.on('data', (data) => {
      output += data.toString();
    });

    backupProcess.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });

    backupProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        resolve({
          success: false,
          output,
          error: errorOutput || `Processo terminou com código ${code}`,
        });
      }
    });

    // Timeout de 30 minutos
    setTimeout(
      () => {
        backupProcess.kill();
        resolve({
          success: false,
          output,
          error: 'Timeout: Backup levou mais de 30 minutos',
        });
      },
      30 * 60 * 1000
    );
  });
}

// Executar restore
function executeRestore(
  backupPath: string
): Promise<{ success: boolean; output: string; error?: string }> {
  return new Promise((resolve) => {
    const restoreProcess = spawn('npm', ['run', 'backup:restore', backupPath], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
    });

    let output = '';
    let errorOutput = '';

    restoreProcess.stdout?.on('data', (data) => {
      output += data.toString();
    });

    restoreProcess.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });

    restoreProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        resolve({
          success: false,
          output,
          error: errorOutput || `Processo terminou com código ${code}`,
        });
      }
    });

    // Timeout de 30 minutos
    setTimeout(
      () => {
        restoreProcess.kill();
        resolve({
          success: false,
          output,
          error: 'Timeout: Restore levou mais de 30 minutos',
        });
      },
      30 * 60 * 1000
    );
  });
}

// Limpar backups antigos para manter apenas MAX_BACKUPS
async function cleanupOldBackups(): Promise<void> {
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
        console.log(`🗑️ Backup removido: ${backup.name}`);
      }
    }
  } catch (error) {
    console.error('Erro durante cleanup:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    const backupsDir = path.join(process.cwd(), 'backups');

    // Verificar se o diretório existe
    try {
      await fs.access(backupsDir);
    } catch {
      await fs.mkdir(backupsDir, { recursive: true });
    }

    switch (action) {
      case 'list': {
        const entries = await fs.readdir(backupsDir, { withFileTypes: true });
        const backupDirs = entries.filter((entry) => entry.isDirectory());

        const backups: BackupInfo[] = [];
        for (const dir of backupDirs) {
          // NOVO: Filtrar apenas backups gerais (NÃO seletivos)
          const metadataPath = path.join(backupsDir, dir.name, 'metadata.json');
          let isGeneralBackup = true;

          try {
            const metadata = JSON.parse(
              await fs.readFile(metadataPath, 'utf8')
            );
            isGeneralBackup = metadata.type !== 'selective';
          } catch {
            // Se não conseguir ler metadados, verificar pelo nome
            isGeneralBackup = !dir.name.includes('selective-backup-');
          }
          // NOVO: Só processar se for backup geral
          if (isGeneralBackup) {
            const backupInfo = await getBackupInfo(
              path.join(backupsDir, dir.name)
            );
            if (backupInfo) {
              backups.push(backupInfo);
            }
          }
        }

        // Ordenar por data (mais recente primeiro)
        backups.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Calcular estatísticas
        const totalSize = backups.reduce((sum, backup) => {
          const sizeInBytes =
            parseFloat(backup.size.split(' ')[0]) *
            (backup.size.includes('GB')
              ? 1024 * 1024 * 1024
              : backup.size.includes('MB')
                ? 1024 * 1024
                : backup.size.includes('KB')
                  ? 1024
                  : 1);
          return sum + sizeInBytes;
        }, 0);

        const stats: BackupStats = {
          totalBackups: backups.length,
          lastBackupDate: backups.length > 0 ? new Date(backups[0].date) : null,
          totalSize: formatBytes(totalSize),
          oldestBackup:
            backups.length > 0 ? backups[backups.length - 1].name : null,
          newestBackup: backups.length > 0 ? backups[0].name : null,
          maxBackups: MAX_BACKUPS,
          isBackupRunning: await isBackupRunning(),
          scheduledBackupStatus: 'active', // TODO: verificar status real do cron
        };

        return NextResponse.json({
          success: true,
          backups,
          stats,
        });
      }

      case 'status': {
        return NextResponse.json({
          success: true,
          isRunning: await isBackupRunning(),
          maxBackups: MAX_BACKUPS,
        });
      }

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro na API de backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { action, backupId } = await request.json();

    switch (action) {
      case 'create': {
        // Verificar se já há backup rodando
        if (await isBackupRunning()) {
          return NextResponse.json(
            {
              success: false,
              error: 'Já há um backup em execução',
            },
            { status: 409 }
          );
        }

        // Limpar backups antigos antes de criar novo
        await cleanupOldBackups();

        // Executar backup
        const result = await executeBackup();

        if (result.success) {
          // Limpar novamente após backup para garantir limite
          await cleanupOldBackups();
        }

        return NextResponse.json({
          success: result.success,
          message: result.success
            ? 'Backup iniciado com sucesso'
            : 'Erro ao executar backup',
          output: result.output,
          error: result.error,
        });
      }

      case 'restore': {
        if (!backupId) {
          return NextResponse.json(
            {
              success: false,
              error: 'ID do backup é obrigatório',
            },
            { status: 400 }
          );
        }

        const backupPath = path.join(
          process.cwd(),
          'backups',
          backupId,
          'backup.json'
        );

        // Verificar se o backup existe
        try {
          await fs.access(backupPath);
        } catch {
          return NextResponse.json(
            {
              success: false,
              error: 'Backup não encontrado',
            },
            { status: 404 }
          );
        }

        // Executar restore
        const result = await executeRestore(backupPath);

        return NextResponse.json({
          success: result.success,
          message: result.success
            ? 'Restore executado com sucesso'
            : 'Erro ao executar restore',
          output: result.output,
          error: result.error,
        });
      }

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro na API de backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');

    if (!backupId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID do backup é obrigatório',
        },
        { status: 400 }
      );
    }

    const backupPath = path.join(process.cwd(), 'backups', backupId);

    // Verificar se o backup existe
    try {
      await fs.access(backupPath);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Backup não encontrado',
        },
        { status: 404 }
      );
    }

    // Remover backup
    await fs.rm(backupPath, { recursive: true });

    return NextResponse.json({
      success: true,
      message: 'Backup removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
