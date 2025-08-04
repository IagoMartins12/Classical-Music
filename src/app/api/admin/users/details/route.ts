// app/api/admin/users/details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface UserDetailsData {
  profile: {
    totalFavoriteWorks: number;
    totalFavoriteComposers: number;
    totalAnnotations: number;
    lastActivity: string;
    joinedDaysAgo: number;
  };
  recentActivity: Array<{
    type: 'annotation' | 'study' | 'favorite' | 'upload';
    title: string;
    subtitle: string;
    date: string;
    workTitle?: string;
    composerName?: string;
  }>;
  contributions: {
    topAnnotations: Array<{
      id: string;
      workTitle: string;
      composerName: string;
      content: string;
      helpfulCount: number;
      createdAt: string;
    }>;
    recentUploads: Array<{
      id: string;
      type: 'composer' | 'work' | 'score';
      title: string;
      status: string;
      createdAt: string;
    }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Buscar dados em paralelo para performance
    const [
      favoriteWorksCount,
      favoriteComposersCount,
      annotationsData,
      topAnnotations,
      recentUploads,
      recentFavorites,
    ] = await Promise.all([
      // Contagem de favoritos
      prisma.favoriteWork.count({
        where: { userId },
      }),

      prisma.favoriteComposer.count({
        where: { userId },
      }),

      // Dados de anotações
      prisma.workAnnotation.findMany({
        where: { userId },
        select: {
          id: true,
          content: true,
          helpfulCount: true,
          createdAt: true,
          work: {
            select: {
              title: true,
              composer: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limitar para performance
      }),

      // Top anotações mais úteis
      prisma.workAnnotation.findMany({
        where: {
          userId,
          isPublic: true,
          helpfulCount: { gt: 0 },
        },
        select: {
          id: true,
          content: true,
          helpfulCount: true,
          createdAt: true,
          work: {
            select: {
              title: true,
              composer: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { helpfulCount: 'desc' },
        take: 10,
      }),

      // Uploads recentes (simulando dados - ajustar conforme schema real)
      prisma.uploadHistory.findMany({
        where: { userId },
        select: {
          id: true,
          entityType: true,
          entityId: true,
          action: true,
          changes: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Favoritos recentes para atividade
      prisma.favoriteWork.findMany({
        where: { userId },
        select: {
          id: true,
          work: {
            select: {
              title: true,
              composer: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { id: 'desc' }, // Assumindo que não tem createdAt
        take: 5,
      }),
    ]);

    // Calcular dados derivados
    const totalAnnotations = annotationsData.length;
    const joinedDaysAgo = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Atividade recente combinada
    const recentActivity: UserDetailsData['recentActivity'] = [];

    // Adicionar anotações recentes
    annotationsData.slice(0, 5).forEach((annotation) => {
      recentActivity.push({
        type: 'annotation',
        title: 'Criou uma anotação',
        subtitle:
          annotation.content.substring(0, 100) +
          (annotation.content.length > 100 ? '...' : ''),
        date: annotation.createdAt.toISOString(),
        workTitle: annotation.work.title,
        composerName: annotation.work.composer.name,
      });
    });

    // Adicionar favoritos recentes
    recentFavorites.forEach((favorite) => {
      recentActivity.push({
        type: 'favorite',
        title: 'Adicionou aos favoritos',
        subtitle: 'Nova obra favorita',
        date: new Date().toISOString(), // Placeholder - ajustar se tiver createdAt
        workTitle: favorite.work.title,
        composerName: favorite.work.composer.name,
      });
    });

    // Adicionar uploads recentes
    recentUploads.forEach((upload) => {
      recentActivity.push({
        type: 'upload',
        title: `Upload de ${upload.entityType}`,
        subtitle:
          upload.action === 'create'
            ? 'Novo item adicionado'
            : 'Item atualizado',
        date: upload.createdAt.toISOString(),
      });
    });

    // Ordenar atividade por data
    recentActivity.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Montar resposta
    const details: UserDetailsData = {
      profile: {
        totalFavoriteWorks: favoriteWorksCount,
        totalFavoriteComposers: favoriteComposersCount,
        totalAnnotations,
        lastActivity: user.updatedAt.toISOString(),
        joinedDaysAgo,
      },
      recentActivity: recentActivity.slice(0, 20), // Limitar a 20 itens
      contributions: {
        topAnnotations: topAnnotations.map((annotation) => ({
          id: annotation.id,
          workTitle: annotation.work.title,
          composerName: annotation.work.composer.name,
          content: annotation.content,
          helpfulCount: annotation.helpfulCount,
          createdAt: annotation.createdAt.toISOString(),
        })),
        recentUploads: recentUploads.map((upload) => ({
          id: upload.id,
          type: upload.entityType as 'composer' | 'work' | 'score',
          title: `${upload.entityType} - ${upload.action}`,
          status: 'approved', // Placeholder - implementar lógica real
          createdAt: upload.createdAt.toISOString(),
        })),
      },
    };

    return NextResponse.json({
      success: true,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do usuário:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: null,
      },
      { status: 500 }
    );
  }
}
