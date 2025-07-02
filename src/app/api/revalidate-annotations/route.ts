// app/api/revalidate-annotations/route.ts - VERSÃO MELHORADA
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, workId, action } = body;

    console.log('🔄 Invalidando cache de anotações:', {
      userId,
      workId,
      action,
      timestamp: new Date().toISOString(),
    });

    // 🔧 NOVO: Tags mais específicas e granulares
    const tagsToRevalidate = [
      // Tags gerais de anotações
      'user-annotations',
      'user-annotations-stats',
      'user-top-annotations',
      'user-most-annotated-works',
      'annotation-stats',
      'annotations-popular',
    ];

    // Tags específicas do usuário
    if (userId) {
      tagsToRevalidate.push(
        `user-annotations-${userId}`,
        `user-annotations-stats-${userId}`,
        `user-top-annotations-${userId}`,
        `user-most-annotated-works-${userId}`
      );
    }

    // Tags específicas da obra
    if (workId) {
      tagsToRevalidate.push(
        `work-annotations-${workId}`,
        `work-details-${workId}`,
        `work-stats-${workId}`
      );
    }

    // Invalidar todas as tags
    for (const tag of tagsToRevalidate) {
      revalidateTag(tag);
    }

    // 🔧 NOVO: Invalidar paths específicos também
    const pathsToRevalidate = [
      '/annotations', // Página principal de anotações
    ];

    // Path específico da obra se fornecido
    if (workId) {
      pathsToRevalidate.push(`/works/${workId}`);
    }

    // Invalidar paths
    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path);
      } catch (error) {
        console.warn(`Erro ao invalidar path ${path}:`, error);
      }
    }

    console.log('✅ Cache invalidado com sucesso:', {
      tags: tagsToRevalidate.length,
      paths: pathsToRevalidate.length,
      userId,
      workId,
    });

    return NextResponse.json({
      success: true,
      message: 'Cache invalidado com sucesso',
      invalidated: {
        tags: tagsToRevalidate,
        paths: pathsToRevalidate,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao invalidar cache de anotações:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        success: false,
      },
      { status: 500 }
    );
  }
}
