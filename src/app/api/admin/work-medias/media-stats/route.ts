// app/api/admin/media-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e permissões de admin
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 2) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar estatísticas gerais
    const [total, withSpotify, withYoutube, withBoth, pending, errors] =
      await Promise.all([
        // Total de obras
        prisma.work.count(),

        // Com Spotify
        prisma.work.count({
          where: { spotifyTrackId: { not: null } },
        }),

        // Com YouTube
        prisma.work.count({
          where: { youtubeVideoId: { not: null } },
        }),

        // Com ambos
        prisma.work.count({
          where: {
            AND: [
              { spotifyTrackId: { not: null } },
              { youtubeVideoId: { not: null } },
            ],
          },
        }),

        // Pendentes (sem mídia e sem status de "not_found")
        prisma.work.count({
          where: {
            AND: [
              { spotifyTrackId: null },
              { youtubeVideoId: null },
              {
                OR: [
                  { mediaSearchStatus: null },
                  { mediaSearchStatus: 'pending' },
                ],
              },
            ],
          },
        }),

        // Com erro
        prisma.work.count({
          where: { mediaSearchStatus: 'error' },
        }),
      ]);

    const withNone = total - (withSpotify + withYoutube - withBoth);

    // Buscar job em lote ativo (simulado - você pode implementar uma tabela de jobs)
    const activeBatchJob = await getActiveBatchJob();

    const stats = {
      total,
      withSpotify,
      withYoutube,
      withBoth,
      withNone,
      pending,
      errors,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      stats,
      batchJob: activeBatchJob,
    });
  } catch (error) {
    console.error('❌ [ADMIN-STATS] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função simulada para job em lote - implemente conforme sua arquitetura
async function getActiveBatchJob() {
  // Aqui você pode implementar uma tabela de jobs ou usar Redis
  // Por enquanto, retorna null (sem job ativo)
  return null;

  // Exemplo de retorno:
  // return {
  //   id: 'batch-001',
  //   status: 'running',
  //   progress: 45.2,
  //   total: 1000,
  //   processed: 452,
  //   found: 320,
  //   errors: 15,
  //   startedAt: '2025-07-17T10:00:00Z',
  //   estimatedCompletion: '2025-07-17T14:30:00Z',
  // };
}
