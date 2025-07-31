import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');

    console.log('workid', workId);

    if (!workId) {
      return NextResponse.json({ error: 'Id é obrigatorio.' }, { status: 500 });
    }
    // Verificar se um compositor específico está favoritado
    const work = await prisma.work.findFirst({
      where: {
        id: workId,
      },
      select: {
        imslpPermlink: true,
      },
    });

    return NextResponse.json({
      success: true,
      work: work,
    });
    // Buscar todos os compositores favoritos do usuário
  } catch (error) {
    console.error('Erro ao buscar favoritos de compositores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
