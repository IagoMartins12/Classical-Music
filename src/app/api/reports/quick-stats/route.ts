// app/api/reports/quick-stats/route.ts
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

    // Data de uma semana atrás para calcular tendência
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Data de duas semanas atrás para comparação
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const [pendingReports, resolvedThisWeek, totalReports, resolvedLastWeek] =
      await Promise.all([
        // Reports pendentes
        prisma.uploadModeration.count({
          where: { status: 'pending' },
        }),

        // Reports resolvidos esta semana
        prisma.uploadModeration.count({
          where: {
            status: { in: ['approved', 'rejected'] },
            resolvedAt: { gte: oneWeekAgo },
          },
        }),

        // Total de reports
        prisma.uploadModeration.count(),

        // Reports resolvidos na semana passada (para calcular tendência)
        prisma.uploadModeration.count({
          where: {
            status: { in: ['approved', 'rejected'] },
            resolvedAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
          },
        }),
      ]);

    // Calcular tendência
    const trend =
      resolvedLastWeek > 0
        ? Math.round(
            ((resolvedThisWeek - resolvedLastWeek) / resolvedLastWeek) * 100
          )
        : 0;

    return NextResponse.json({
      pending: pendingReports,
      resolved: resolvedThisWeek,
      total: totalReports,
      trend,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas rápidas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
