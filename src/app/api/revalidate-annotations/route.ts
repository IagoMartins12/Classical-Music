// app/api/revalidate-annotations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
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
    const { userId } = body;

    // Invalidar todas as tags relacionadas a anotações
    revalidateTag('user-annotations');
    revalidateTag('user-annotations-stats');
    revalidateTag('user-top-annotations');
    revalidateTag('user-most-annotated-works');
    revalidateTag('annotation-stats');

    // Invalidar tags específicas do usuário se fornecido
    if (userId) {
      revalidateTag(`user-annotations-${userId}`);
      revalidateTag(`user-annotations-stats-${userId}`);
    }

    console.log('🔄 Cache de anotações invalidado:', {
      userId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Cache invalidado com sucesso',
      invalidatedTags: [
        'user-annotations',
        'user-annotations-stats',
        'user-top-annotations',
        'user-most-annotated-works',
        'annotation-stats',
        ...(userId
          ? [`user-annotations-${userId}`, `user-annotations-stats-${userId}`]
          : []),
      ],
    });
  } catch (error) {
    console.error('Erro ao invalidar cache de anotações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
