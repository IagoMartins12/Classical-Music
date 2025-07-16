// app/api/reports/stats/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar estatísticas de reports
    const [totalReports, pendingReports, approvedReports, rejectedReports] =
      await Promise.all([
        prisma.uploadModeration.count(),
        prisma.uploadModeration.count({ where: { status: 'pending' } }),
        prisma.uploadModeration.count({ where: { status: 'approved' } }),
        prisma.uploadModeration.count({ where: { status: 'rejected' } }),
      ]);

    // Buscar reports por tipo
    const reportsByType = await prisma.uploadModeration.groupBy({
      by: ['entityType'],
      _count: {
        id: true,
      },
      where: {
        status: 'pending',
      },
    });

    // Buscar reports por motivo
    const reportsByReason = await prisma.uploadModeration.groupBy({
      by: ['reason'],
      _count: {
        id: true,
      },
      where: {
        status: 'pending',
      },
    });

    return NextResponse.json({
      stats: {
        totalReports,
        pendingReports,
        approvedReports,
        rejectedReports,
      },
      reportsByType,
      reportsByReason,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
