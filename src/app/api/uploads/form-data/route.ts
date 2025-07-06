// app/api/uploads/form-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar todos os dados necessários para os formulários
    const [epochs, instruments, roles, composers, works] = await Promise.all([
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
      prisma.composer.findMany({
        select: {
          id: true,
          name: true,
          fullName: true,
          epoch: { select: { name: true } },
        },
        orderBy: { name: 'asc' },
        take: 500, // Limitar para performance
      }),
      prisma.work.findMany({
        select: {
          id: true,
          title: true,
          composer: { select: { name: true, fullName: true } },
          instrument: { select: { name: true } },
        },
        orderBy: { title: 'asc' },
        take: 500, // Limitar para performance
      }),
    ]);

    return NextResponse.json({
      epochs,
      instruments,
      roles,
      composers,
      works,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do formulário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
