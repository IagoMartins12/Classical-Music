// app/api/uploads/history/route.ts
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'all';
    const action = searchParams.get('action') || 'all';
    const userId = searchParams.get('userId');
    const isAdmin = session.user.role === 2;

    // Verificar permissões
    if (userId && userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const targetUserId = userId || session.user.id;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (!isAdmin) {
      where.userId = targetUserId;
    } else if (userId) {
      where.userId = userId;
    }

    if (type !== 'all') {
      where.entityType = type;
    }

    if (action !== 'all') {
      where.action = action;
    }

    const [history, totalCount] = await Promise.all([
      prisma.uploadHistory.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.uploadHistory.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      history,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
