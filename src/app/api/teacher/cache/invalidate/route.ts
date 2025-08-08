// app/api/teacher/cache/invalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { revalidateTeacherCache } from '@/app/requests/teacher-request';

export async function POST(req: NextRequest) {
  try {
    console.log('🗑️ [CACHE-INVALIDATE-API] Starting cache invalidation...');

    // 1. Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Ler body se tiver tags específicas
    let body;
    try {
      body = await req.json();
    } catch {
      body = {}; // Se não tiver body, usar objeto vazio
    }

    const { tags } = body;

    console.log(
      `🗑️ [CACHE-INVALIDATE-API] Invalidating cache for user ${userId}`,
      {
        specificTags: tags,
      }
    );

    // 3. Invalidar cache
    await revalidateTeacherCache(userId);

    // 4. Se tiver tags específicas, invalidar também
    if (tags && Array.isArray(tags)) {
      const { revalidateTag } = await import('next/cache');
      tags.forEach((tag: string) => {
        revalidateTag(tag);
      });
    }

    console.log('✅ [CACHE-INVALIDATE-API] Cache invalidated successfully');

    return NextResponse.json({
      success: true,
      message: 'Cache invalidado com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [CACHE-INVALIDATE-API] Error invalidating cache:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
