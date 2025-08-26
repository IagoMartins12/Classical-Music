// app/api/uploads/form-data/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { composersByEpoch } from '@/app/requests/music-history-translated';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const allComposerNames = Object.values(composersByEpoch).flat();

    // Buscar epochs, instruments e roles (sem mudança)
    const [epochs, instruments, roles, composers] = await Promise.all([
      prisma.epoch.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.instrument.findMany({
        select: { id: true, name: true, category: true },
        orderBy: { name: 'asc' },
      }),
      prisma.role.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),

      // Buscar compositores da lista
      prisma.composer.findMany({
        where: {
          AND: [
            {
              OR: allComposerNames.map((composerName) => ({
                OR: [
                  {
                    fullName: {
                      equals: composerName,
                      mode: 'insensitive',
                    },
                  },
                  {
                    name: {
                      equals: composerName,
                      mode: 'insensitive',
                    },
                  },
                  {
                    fullName: {
                      contains: composerName,
                      mode: 'insensitive',
                    },
                  },
                  {
                    name: {
                      contains: composerName,
                      mode: 'insensitive',
                    },
                  },
                ],
              })),
            },
          ],
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          epoch: { select: { name: true } },
        },
        take: 50,
        orderBy: [{ birthDate: 'asc' }, { name: 'asc' }],
      }),
    ]);

    // Buscar works aleatórios de forma mais eficiente
    // Pegar todos os works dos compositores da lista em ordem aleatória
    const composerIds = composers.map((c) => c.id);

    const allWorks = await prisma.work.findMany({
      where: {
        composerId: { in: composerIds },
      },
      select: {
        id: true,
        title: true,
        composerId: true,
        composer: { select: { name: true, fullName: true } },
        instrument: { select: { name: true } },
      },
      orderBy: [
        { title: 'asc' }, // Usar uma ordem consistente, vamos embaralhar depois
      ],
    });

    // Agrupar works por compositor e pegar 4 aleatórios de cada
    const worksByComposer = new Map();
    allWorks.forEach((work) => {
      if (!worksByComposer.has(work.composerId)) {
        worksByComposer.set(work.composerId, []);
      }
      worksByComposer.get(work.composerId).push(work);
    });

    // Pegar 4 aleatórios de cada compositor
    const works = [];
    for (const [composerId, composerWorks] of worksByComposer) {
      // Embaralhar array
      const shuffled = [...composerWorks].sort(() => Math.random() - 0.5);
      // Pegar até 4
      const selected = shuffled.slice(0, 4);
      works.push(...selected);

      // Parar se chegou no limite de 50
      if (works.length >= 50) break;
    }

    // Garantir que não passe de 50
    const finalWorks = works.slice(0, 50);

    return NextResponse.json({
      epochs,
      instruments,
      roles,
      composers,
      works: finalWorks,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do formulário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
