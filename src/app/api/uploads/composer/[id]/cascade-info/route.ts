// app/api/uploads/composer/[id]/cascade-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar compositor com obras e partituras para preview de cascata
    const composer = await prisma.composer.findUnique({
      where: { id },
      include: {
        works: {
          select: {
            id: true,
            title: true,
            cachedScores: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!composer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = composer.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Calcular totais
    const totalWorks = composer.works.length;
    const totalScores = composer.works.reduce(
      (sum, work) => sum + work.cachedScores.length,
      0
    );

    // Mapear obras com contagem de partituras
    const worksWithScores = composer.works.map((work) => ({
      id: work.id,
      title: work.title,
      scoresCount: work.cachedScores.length,
    }));

    return NextResponse.json({
      works: worksWithScores,
      totalWorks,
      totalScores,
    });
  } catch (error) {
    console.error(
      'Erro ao buscar informações de cascata do compositor:',
      error
    );
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
