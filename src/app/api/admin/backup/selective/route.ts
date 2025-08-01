// app/api/admin/backup/selective/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

// Configuração máxima de backups seletivos
const MAX_SELECTIVE_BACKUPS = 25;

interface SelectiveBackupInfo {
  id: string;
  name: string;
  size: string;
  date: Date;
  status: 'completed' | 'failed' | 'in_progress';
  collections: string[];
  totalRecords?: number;
  duration?: string;
  error?: string;
  type: 'selective';
}

// Lista de collections disponíveis com suas dependências
const AVAILABLE_COLLECTIONS = [
  {
    name: 'user',
    displayName: 'Usuários',
    dependencies: [],
    description: 'Contas de usuários do sistema',
  },
  {
    name: 'composer',
    displayName: 'Compositores',
    dependencies: ['epoch', 'role', 'user'],
    description: 'Dados dos compositores',
  },
  {
    name: 'work',
    displayName: 'Obras',
    dependencies: ['composer', 'epoch', 'instrument', 'user'],
    description: 'Obras musicais cadastradas',
  },
  {
    name: 'workScore',
    displayName: 'Partituras',
    dependencies: ['work'],
    description: 'Partituras das obras',
  },
  {
    name: 'epoch',
    displayName: 'Épocas',
    dependencies: [],
    description: 'Períodos musicais',
  },
  {
    name: 'role',
    displayName: 'Funções',
    dependencies: [],
    description: 'Funções dos compositores',
  },
  {
    name: 'instrument',
    displayName: 'Instrumentos',
    dependencies: [],
    description: 'Instrumentos musicais',
  },
  {
    name: 'annotation',
    displayName: 'Anotações',
    dependencies: ['user', 'work'],
    description: 'Anotações dos usuários',
  },
  {
    name: 'workAnnotation',
    displayName: 'Anotações de Obras',
    dependencies: ['user', 'work'],
    description: 'Anotações específicas das obras',
  },
  {
    name: 'favoriteWork',
    displayName: 'Obras Favoritas',
    dependencies: ['user', 'work'],
    description: 'Obras marcadas como favoritas',
  },
  {
    name: 'favoriteComposer',
    displayName: 'Compositores Favoritos',
    dependencies: ['user', 'composer'],
    description: 'Compositores favoritos dos usuários',
  },
  {
    name: 'favoriteScore',
    displayName: 'Partituras Favoritas',
    dependencies: ['user', 'work'],
    description: 'Partituras marcadas como favoritas',
  },
  {
    name: 'studySession',
    displayName: 'Sessões de Estudo',
    dependencies: ['user', 'work'],
    description: 'Registros de sessões de estudo',
  },
  {
    name: 'userInstrument',
    displayName: 'Instrumentos dos Usuários',
    dependencies: ['user', 'instrument'],
    description: 'Relação usuários-instrumentos',
  },
  {
    name: 'wantToLearn',
    displayName: 'Lista de Desejos',
    dependencies: ['user', 'work'],
    description: 'Obras que usuários querem aprender',
  },
  {
    name: 'learned',
    displayName: 'Obras Aprendidas',
    dependencies: ['user', 'work'],
    description: 'Obras que usuários já aprenderam',
  },
  {
    name: 'newsletterSubscriber',
    displayName: 'Assinantes Newsletter',
    dependencies: ['user'],
    description: 'Assinantes da newsletter',
  },
  {
    name: 'advertisement',
    displayName: 'Publicidades',
    dependencies: ['user', 'instrument'],
    description: 'Anúncios do sistema',
  },
];

// Função para obter informações de um backup seletivo
async function getSelectiveBackupInfo(
  backupDir: string
): Promise<SelectiveBackupInfo | null> {
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
        collections: [],
        error: errorData.error,
        type: 'selective',
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
      name: metadata.name || path.basename(backupDir),
      size: formatBytes(size),
      date: new Date(metadata.timestamp),
      status: metadata.status || 'completed',
      collections: metadata.selectedCollections || metadata.collections || [],
      totalRecords: metadata.totalRecords,
      duration: metadata.duration,
      type: 'selective',
    };
  } catch (error) {
    console.error(`Erro lendo backup seletivo ${backupDir}:`, error);
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

// Executar comando de backup seletivo
function executeSelectiveBackup(
  collections: string[],
  includeDependencies: boolean,
  name?: string
): Promise<{
  success: boolean;
  output: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const args = [
      'scripts/backup/selective-backup.ts',
      'backup',
      ...collections,
    ];
    if (includeDependencies) {
      args.push('--with-dependencies');
    }
    if (name) {
      args.push(`--name=${name}`);
    }

    const backupProcess = spawn('tsx', args, {
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
    setTimeout(() => {
      backupProcess.kill();
      resolve({
        success: false,
        output,
        error: 'Timeout: Backup levou mais de 30 minutos',
      });
    }, 30 * 60 * 1000);
  });
}

// Executar restore de backup seletivo
function executeSelectiveRestore(backupPath: string): Promise<{
  success: boolean;
  output: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const args = ['scripts/backup/selective-backup.ts', 'restore', backupPath];

    const restoreProcess = spawn('tsx', args, {
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
    setTimeout(() => {
      restoreProcess.kill();
      resolve({
        success: false,
        output,
        error: 'Timeout: Restore levou mais de 30 minutos',
      });
    }, 30 * 60 * 1000);
  });
}

// Limpar backups seletivos antigos para manter apenas MAX_SELECTIVE_BACKUPS
async function cleanupOldSelectiveBackups(): Promise<void> {
  const backupsDir = path.join(process.cwd(), 'backups');

  try {
    const entries = await fs.readdir(backupsDir, { withFileTypes: true });
    const selectiveBackupDirs = [];

    // Filtrar apenas backups seletivos
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metadataPath = path.join(backupsDir, entry.name, 'metadata.json');
        try {
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          if (metadata.type === 'selective') {
            selectiveBackupDirs.push({
              name: entry.name,
              path: path.join(backupsDir, entry.name),
              timestamp: metadata.timestamp,
            });
          }
        } catch {
          // Se não conseguir ler metadados, verifica se é backup seletivo pelo nome
          if (entry.name.includes('selective-backup-')) {
            selectiveBackupDirs.push({
              name: entry.name,
              path: path.join(backupsDir, entry.name),
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }

    // Ordenar por data (mais recente primeiro)
    const sortedBackups = selectiveBackupDirs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Remover backups excedentes
    if (sortedBackups.length > MAX_SELECTIVE_BACKUPS) {
      const backupsToRemove = sortedBackups.slice(MAX_SELECTIVE_BACKUPS);

      for (const backup of backupsToRemove) {
        await fs.rm(backup.path, { recursive: true });
        console.log(`🗑️ Backup seletivo removido: ${backup.name}`);
      }
    }
  } catch (error) {
    console.error('Erro durante cleanup de backups seletivos:', error);
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
        const backups: SelectiveBackupInfo[] = [];

        for (const dir of entries) {
          if (dir.isDirectory()) {
            // Filtrar apenas backups seletivos (que contêm 'selective-backup-' no nome OU têm metadata.type === 'selective')
            const metadataPath = path.join(
              backupsDir,
              dir.name,
              'metadata.json'
            );
            let isSelectiveBackup = false;

            try {
              const metadata = JSON.parse(
                await fs.readFile(metadataPath, 'utf8')
              );
              isSelectiveBackup = metadata.type === 'selective';
            } catch {
              // Se não conseguir ler metadados, verificar pelo nome
              isSelectiveBackup = dir.name.includes('selective-backup-');
            }

            if (isSelectiveBackup) {
              const backupInfo = await getSelectiveBackupInfo(
                path.join(backupsDir, dir.name)
              );
              if (backupInfo) {
                backups.push(backupInfo);
              }
            }
          }
        }

        // Ordenar por data (mais recente primeiro)
        backups.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return NextResponse.json({
          success: true,
          backups,
          maxBackups: MAX_SELECTIVE_BACKUPS,
          totalBackups: backups.length,
        });
      }

      case 'collections': {
        return NextResponse.json({
          success: true,
          collections: AVAILABLE_COLLECTIONS,
        });
      }

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro na API de backup seletivo:', error);
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

    const { action, collections, includeDependencies, name, backupId } =
      await request.json();

    switch (action) {
      case 'create': {
        if (
          !collections ||
          !Array.isArray(collections) ||
          collections.length === 0
        ) {
          return NextResponse.json(
            { error: 'Selecione pelo menos uma tabela para backup' },
            { status: 400 }
          );
        }

        // Verificar se as collections são válidas
        const validCollections = AVAILABLE_COLLECTIONS.map((c) => c.name);
        const invalidCollections = collections.filter(
          (c) => !validCollections.includes(c)
        );

        if (invalidCollections.length > 0) {
          return NextResponse.json(
            { error: `Tabelas inválidas: ${invalidCollections.join(', ')}` },
            { status: 400 }
          );
        }

        // Limpar backups seletivos antigos antes de criar novo
        await cleanupOldSelectiveBackups();

        // Executar backup seletivo
        const result = await executeSelectiveBackup(
          collections,
          includeDependencies || false,
          name
        );

        if (result.success) {
          // Limpar novamente após backup para garantir limite
          await cleanupOldSelectiveBackups();
        }

        return NextResponse.json({
          success: result.success,
          message: result.success
            ? 'Backup seletivo criado com sucesso'
            : 'Erro ao executar backup seletivo',
          output: result.output,
          error: result.error,
          collections: collections,
          maxBackups: MAX_SELECTIVE_BACKUPS,
        });
      }

      case 'restore': {
        if (!backupId) {
          return NextResponse.json(
            { error: 'ID do backup é obrigatório para restauração' },
            { status: 400 }
          );
        }

        const backupPath = path.join(process.cwd(), 'backups', backupId);

        // Verificar se é backup seletivo
        const metadataPath = path.join(backupPath, 'metadata.json');
        try {
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          if (metadata.type !== 'selective') {
            return NextResponse.json(
              { error: 'Este não é um backup seletivo' },
              { status: 400 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: 'Backup não encontrado ou metadados corrompidos' },
            { status: 404 }
          );
        }

        // Verificar se o backup existe
        try {
          await fs.access(backupPath);
        } catch {
          return NextResponse.json(
            { error: 'Backup não encontrado' },
            { status: 404 }
          );
        }

        // Executar restore
        const result = await executeSelectiveRestore(
          path.join(backupPath, 'backup.json')
        );

        return NextResponse.json({
          success: result.success,
          message: result.success
            ? 'Backup seletivo restaurado com sucesso'
            : 'Erro ao executar restauração',
          output: result.output,
          error: result.error,
        });
      }

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro na API de backup seletivo:', error);
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
        { error: 'ID do backup é obrigatório' },
        { status: 400 }
      );
    }

    const backupPath = path.join(process.cwd(), 'backups', backupId);

    // Verificar se é backup seletivo
    const metadataPath = path.join(backupPath, 'metadata.json');
    try {
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      if (metadata.type !== 'selective') {
        return NextResponse.json(
          { error: 'Este não é um backup seletivo' },
          { status: 400 }
        );
      }
    } catch {
      // Se não conseguir ler metadados, verificar pelo nome
      if (!backupId.includes('selective-backup-')) {
        return NextResponse.json(
          { error: 'Backup não encontrado ou não é seletivo' },
          { status: 404 }
        );
      }
    }

    // Verificar se o backup existe
    try {
      await fs.access(backupPath);
    } catch {
      return NextResponse.json(
        { error: 'Backup não encontrado' },
        { status: 404 }
      );
    }

    // Remover backup
    await fs.rm(backupPath, { recursive: true });

    return NextResponse.json({
      success: true,
      message: 'Backup seletivo removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover backup seletivo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
