// app/api/admin/media-batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e permissões
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 2) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { action, filter } = await request.json();

    switch (action) {
      case 'start':
        return await startBatchJob(filter);

      case 'pause':
        return await pauseBatchJob();

      case 'resume':
        return await resumeBatchJob();

      case 'cancel':
        return await cancelBatchJob();

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [ADMIN-BATCH] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function startBatchJob(filter: string) {
  // Verificar se já existe um job ativo
  const activeJob = await getActiveBatchJob();
  if (activeJob) {
    return NextResponse.json(
      { error: 'Já existe um job em execução' },
      { status: 409 }
    );
  }

  // Construir query baseada no filtro
  const whereClause = buildFilterClause(filter);

  // Contar obras que serão processadas
  const totalWorks = await prisma.work.count({
    where: whereClause,
  });

  if (totalWorks === 0) {
    return NextResponse.json(
      { error: 'Nenhuma obra encontrada com o filtro especificado' },
      { status: 400 }
    );
  }

  // Criar job (implementar conforme sua arquitetura)
  const jobId = await createBatchJob({
    filter,
    totalWorks,
    status: 'running',
    startedAt: new Date(),
  });

  // Iniciar processamento em background
  // Aqui você pode usar uma fila de jobs (Bull, Agenda, etc.)
  // ou processar em background threads
  processWorksInBackground(jobId, whereClause);

  return NextResponse.json({
    success: true,
    message: `Job iniciado com ${totalWorks} obras`,
    jobId,
  });
}

async function pauseBatchJob() {
  // Implementar lógica para pausar job
  return NextResponse.json({
    success: true,
    message: 'Job pausado com sucesso',
  });
}

async function resumeBatchJob() {
  // Implementar lógica para retomar job
  return NextResponse.json({
    success: true,
    message: 'Job retomado com sucesso',
  });
}

async function cancelBatchJob() {
  // Implementar lógica para cancelar job
  return NextResponse.json({
    success: true,
    message: 'Job cancelado com sucesso',
  });
}

function buildFilterClause(filter: string) {
  const baseClause = {
    AND: [{ spotifyTrackId: null }, { youtubeVideoId: null }],
  };

  switch (filter) {
    case 'individual':
      return {
        ...baseClause,
        workType: 'INDIVIDUAL',
      };

    case 'collections-small':
      return {
        ...baseClause,
        workType: 'COLLECTED_WORKS',
        movementNumber: { lte: 5 },
      };

    case 'collections-medium':
      return {
        ...baseClause,
        workType: 'COLLECTED_WORKS',
        movementNumber: { gte: 6, lte: 10 },
      };

    case 'errors-only':
      return {
        ...baseClause,
        mediaSearchStatus: 'error',
      };

    case 'high-priority':
      // Compositores famosos - ajuste conforme sua base de dados
      const famousComposerIds = [
        'id_chopin',
        'id_bach',
        'id_mozart',
        'id_beethoven',
        'id_debussy',
        'id_liszt', // etc.
      ];
      return {
        ...baseClause,
        composerId: { in: famousComposerIds },
      };

    default: // 'all'
      return baseClause;
  }
}

async function createBatchJob(jobData: any): Promise<string> {
  // Implementar criação de job - pode ser em tabela no banco ou Redis
  const jobId = `batch_${Date.now()}`;

  // Salvar no banco ou cache
  // await prisma.batchJob.create({ data: { ...jobData, id: jobId } });

  return jobId;
}

async function processWorksInBackground(jobId: string, whereClause: any) {
  // Esta função roda em background
  // Implementar usando workers, queues, etc.

  console.log(`🚀 [BATCH-JOB] Iniciando processamento em background: ${jobId}`);

  // Exemplo de implementação simples (para produção, use uma fila adequada):
  setImmediate(async () => {
    try {
      const works = await prisma.work.findMany({
        where: whereClause,
        include: {
          composer: true,
          instrument: true,
        },
        take: 1000, // Limitar por segurança
      });

      console.log(`📊 [BATCH-JOB] ${works.length} obras para processar`);

      // Processar em lotes
      const batchSize = 10;
      for (let i = 0; i < works.length; i += batchSize) {
        const batch = works.slice(i, i + batchSize);

        // Processar lote
        await Promise.allSettled(
          batch.map((work) => processWorkForMedia(work))
        );

        // Atualizar progresso do job
        const progress = ((i + batchSize) / works.length) * 100;
        await updateJobProgress(jobId, progress, i + batchSize);

        // Delay entre lotes
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      // Marcar como completo
      await completeJob(jobId);
      console.log(`✅ [BATCH-JOB] Job ${jobId} completado`);
    } catch (error) {
      console.error(`❌ [BATCH-JOB] Erro no job ${jobId}:`, error);
      await markJobAsError(jobId, error);
    }
  });
}

async function processWorkForMedia(work: any) {
  // Usar a mesma lógica da API de busca individual
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/media-search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workId: work.id }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error(`❌ Erro ao processar obra ${work.title}:`, error);
    throw error;
  }
}

async function updateJobProgress(
  jobId: string,
  progress: number,
  processed: number
) {
  // Atualizar progresso no banco/cache
  console.log(
    `📈 [BATCH-JOB] ${jobId}: ${progress.toFixed(
      1
    )}% (${processed} processadas)`
  );
}

async function completeJob(jobId: string) {
  // Marcar job como completo
  console.log(`✅ [BATCH-JOB] Job ${jobId} marcado como completo`);
}

async function markJobAsError(jobId: string, error: any) {
  // Marcar job como erro
  console.log(`❌ [BATCH-JOB] Job ${jobId} marcado como erro:`, error);
}

// Reutilizar função do arquivo anterior
async function getActiveBatchJob() {
  // Implementar busca de job ativo
  return null;
}
