// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'Path é obrigatório' },
        { status: 400 }
      );
    }

    // Revalidar o path específico
    revalidatePath(path);

    console.log(`✅ Cache revalidado para: ${path}`);

    return NextResponse.json({
      success: true,
      revalidated: true,
      path,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro ao revalidar cache:', error);
    return NextResponse.json(
      { error: 'Erro ao revalidar cache' },
      { status: 500 }
    );
  }
}
