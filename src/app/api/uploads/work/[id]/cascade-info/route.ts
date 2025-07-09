// app/api/uploads/work/[id]/cascade-info/route.ts
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

    // Buscar obra com partituras e obras filhas para preview de cascata
    const work = await prisma.work.findUnique({
      where: { id },
      include: {
        cachedScores: {
          select: {
            id: true,
            title: true,
            source: true,
          },
        },
        childWorks: {
          select: {
            id: true,
            title: true,
            cachedScores: {
              select: {
                id: true,
                title: true,
                source: true,
              },
            },
          },
        },
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = work.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Calcular totais
    const directScores = work.cachedScores.length;
    const childWorksScores = work.childWorks.reduce(
      (sum, childWork) => sum + childWork.cachedScores.length,
      0
    );
    const totalScores = directScores + childWorksScores;
    const totalChildWorks = work.childWorks.length;

    // Mapear todas as partituras (diretas + das obras filhas)
    const allScores = [
      ...work.cachedScores.map((score) => ({
        id: score.id,
        title: score.title,
        source: 'main' as const,
      })),
      ...work.childWorks.flatMap((childWork) =>
        childWork.cachedScores.map((score) => ({
          id: score.id,
          title: `${score.title} (${childWork.title})`,
          source: 'child' as const,
        }))
      ),
    ];

    // Mapear obras filhas com contagem de partituras
    const childWorksWithScores = work.childWorks.map((childWork) => ({
      id: childWork.id,
      title: childWork.title,
      scoresCount: childWork.cachedScores.length,
    }));

    return NextResponse.json({
      scores: allScores,
      childWorks: childWorksWithScores,
      totalScores,
      totalChildWorks,
      directScores,
      childWorksScores,
    });
  } catch (error) {
    console.error('Erro ao buscar informações de cascata da obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
