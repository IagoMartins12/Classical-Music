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
  // ==========================================
  // 📊 SISTEMA BASE
  // ==========================================
  {
    name: 'user',
    displayName: 'Usuários',
    dependencies: [],
    description: 'Contas de usuários do sistema',
  },
  {
    name: 'epoch',
    displayName: 'Épocas Musicais',
    dependencies: [],
    description: 'Períodos musicais (Barroco, Clássico, etc.)',
  },
  {
    name: 'role',
    displayName: 'Funções',
    dependencies: [],
    description: 'Funções dos compositores (Compositor, Pianista, etc.)',
  },
  {
    name: 'instrument',
    displayName: 'Instrumentos',
    dependencies: [],
    description: 'Instrumentos musicais disponíveis',
  },
  {
    name: 'workGenre',
    displayName: 'Gêneros Musicais',
    dependencies: [],
    description: 'Gêneros das obras musicais',
  },

  // ==========================================
  // 🎼 CONTEÚDO MUSICAL
  // ==========================================
  {
    name: 'composer',
    displayName: 'Compositores',
    dependencies: ['epoch', 'role', 'user'],
    description: 'Dados dos compositores',
  },
  {
    name: 'work',
    displayName: 'Obras Musicais',
    dependencies: ['composer', 'epoch', 'instrument', 'user'],
    description: 'Obras musicais cadastradas',
  },
  {
    name: 'workScore',
    displayName: 'Partituras',
    dependencies: ['work'],
    description: 'Partituras das obras musicais',
  },

  // ==========================================
  // 👤 DADOS DOS USUÁRIOS
  // ==========================================
  {
    name: 'userInstrument',
    displayName: 'Instrumentos dos Usuários',
    dependencies: ['user', 'instrument'],
    description: 'Relação usuários-instrumentos',
  },
  {
    name: 'account',
    displayName: 'Contas OAuth',
    dependencies: ['user'],
    description: 'Contas de login social (Google, etc.)',
  },
  {
    name: 'session',
    displayName: 'Sessões',
    dependencies: ['user'],
    description: 'Sessões ativas dos usuários',
  },
  {
    name: 'userToken',
    displayName: 'Tokens de Usuários',
    dependencies: ['user'],
    description: 'Tokens de confirmação e reset de senha',
  },

  // ==========================================
  // 🏫 SISTEMA PROFESSOR-ALUNO (🆕)
  // ==========================================
  {
    name: 'teacher',
    displayName: 'Professores',
    dependencies: ['user'],
    description: 'Dados dos professores cadastrados',
  },
  {
    name: 'student',
    displayName: 'Alunos',
    dependencies: ['user'],
    description: 'Dados dos alunos cadastrados',
  },
  {
    name: 'teacherStudent',
    displayName: 'Relações Professor-Aluno',
    dependencies: ['teacher', 'student'],
    description: 'Relacionamentos entre professores e alunos',
  },
  {
    name: 'lesson',
    displayName: 'Aulas',
    dependencies: ['teacher', 'student'],
    description: 'Aulas agendadas e realizadas',
  },
  {
    name: 'assignment',
    displayName: 'Tarefas',
    dependencies: ['lesson', 'student'],
    description: 'Tarefas e trabalhos dos alunos',
  },

  // ==========================================
  // 📋 RELATÓRIOS COMPARTILHADOS (🆕)
  // ==========================================
  {
    name: 'sharedProgressReport',
    displayName: 'Relatórios Compartilhados',
    dependencies: ['teacher', 'student'],
    description: 'Relatórios de progresso compartilhados',
  },
  {
    name: 'sharedReportComment',
    displayName: 'Comentários nos Relatórios',
    dependencies: ['sharedProgressReport', 'student'],
    description: 'Comentários dos alunos nos relatórios',
  },

  // ==========================================
  // 🔔 NOTIFICAÇÕES E ATIVIDADES (🆕)
  // ==========================================
  {
    name: 'notification',
    displayName: 'Notificações',
    dependencies: ['user'],
    description: 'Sistema de notificações do usuário',
  },
  {
    name: 'schoolActivity',
    displayName: 'Atividades Escolares',
    dependencies: ['user'],
    description: 'Log de atividades do sistema escolar',
  },

  // ==========================================
  // 🏆 SISTEMA DE CONQUISTAS (🆕)
  // ==========================================
  {
    name: 'userAchievement',
    displayName: 'Conquistas dos Usuários',
    dependencies: ['user'],
    description: 'Conquistas desbloqueadas pelos usuários',
  },
  {
    name: 'achievementProgress',
    displayName: 'Progresso das Conquistas',
    dependencies: ['user'],
    description: 'Progresso para desbloquear conquistas',
  },

  // ==========================================
  // 💭 INTERAÇÕES E ANOTAÇÕES
  // ==========================================
  {
    name: 'annotation',
    displayName: 'Anotações Pessoais',
    dependencies: ['user', 'work'],
    description: 'Anotações privadas dos usuários',
  },
  {
    name: 'workAnnotation',
    displayName: 'Anotações Públicas',
    dependencies: ['user', 'work'],
    description: 'Anotações públicas nas obras',
  },
  {
    name: 'annotationHelpfulVote',
    displayName: 'Votos nas Anotações',
    dependencies: ['user', 'workAnnotation'],
    description: 'Votos de utilidade nas anotações',
  },

  // ==========================================
  // ❤️ FAVORITOS E LISTAS
  // ==========================================
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
    name: 'scoreFavoriteStats',
    displayName: 'Estatísticas de Favoritos',
    dependencies: ['work'],
    description: 'Estatísticas de partituras favoritas',
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

  // ==========================================
  // 🔧 CONTROLE E MODERAÇÃO
  // ==========================================
  {
    name: 'uploadHistory',
    displayName: 'Histórico de Uploads',
    dependencies: ['user'],
    description: 'Histórico de uploads de conteúdo',
  },
  {
    name: 'uploadModeration',
    displayName: 'Moderação de Uploads',
    dependencies: ['user'],
    description: 'Sistema de moderação de conteúdo',
  },
  {
    name: 'generatedReport',
    displayName: 'Relatórios Gerados',
    dependencies: ['user'],
    description: 'Relatórios administrativos gerados',
  },

  // ==========================================
  // 📢 SISTEMA DE PUBLICIDADE
  // ==========================================
  {
    name: 'advertisement',
    displayName: 'Publicidades',
    dependencies: ['user', 'instrument'],
    description: 'Anúncios e publicidades do sistema',
  },
  {
    name: 'adStats',
    displayName: 'Estatísticas de Anúncios',
    dependencies: ['advertisement', 'user'],
    description: 'Métricas e estatísticas dos anúncios',
  },

  // ==========================================
  // 📧 SISTEMA DE NEWSLETTER
  // ==========================================
  {
    name: 'newsletterSubscriber',
    displayName: 'Assinantes da Newsletter',
    dependencies: ['user'],
    description: 'Inscritos na newsletter do sistema',
  },
  {
    name: 'newsletterTemplate',
    displayName: 'Templates de Email',
    dependencies: [],
    description: 'Templates para emails da newsletter',
  },
  {
    name: 'newsletterCampaign',
    displayName: 'Campanhas de Email',
    dependencies: ['newsletterTemplate'],
    description: 'Campanhas de marketing por email',
  },
  {
    name: 'newsletterCampaignSend',
    displayName: 'Envios de Campanha',
    dependencies: ['newsletterCampaign', 'newsletterSubscriber'],
    description: 'Registros de envios de campanhas',
  },
  {
    name: 'newsletterEmailEvent',
    displayName: 'Eventos de Email',
    dependencies: ['newsletterSubscriber', 'newsletterCampaign'],
    description: 'Eventos dos emails (abrir, clicar, etc.)',
  },
  {
    name: 'testEmailList',
    displayName: 'Listas de Teste',
    dependencies: [],
    description: 'Listas de emails para testes',
  },
  {
    name: 'templateFragment',
    displayName: 'Fragmentos de Template',
    dependencies: [],
    description: 'Fragmentos reutilizáveis de templates',
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
