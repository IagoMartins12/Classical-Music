// app/api/reports/history/route.ts - API para histórico de reports
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: entityType, entityId' },
        { status: 400 }
      );
    }

    const reports = await prisma.uploadModeration.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        reporter: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        moderator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      reports,
      count: reports.length,
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de reports:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
