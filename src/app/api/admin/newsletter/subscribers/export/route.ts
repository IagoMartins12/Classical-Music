import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// app/api/admin/newsletter/subscribers/export/route.ts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const format = searchParams.get('format') || 'csv';

    // Construir filtros
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    // Buscar subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { subscribedAt: 'desc' },
    });

    if (format === 'csv') {
      // Gerar CSV
      const csvHeaders = [
        'Email',
        'Nome',
        'Sobrenome',
        'Status',
        'Data Inscrição',
        'Data Confirmação',
        'Frequência',
        'Interesses',
        'Engajamento',
        'Emails Abertos',
        'Emails Clicados',
      ].join(',');

      const csvRows = subscribers.map((sub) =>
        [
          sub.email,
          sub.firstName || '',
          sub.lastName || '',
          sub.status,
          sub.subscribedAt.toISOString(),
          sub.confirmedAt?.toISOString() || '',
          sub.frequency,
          sub.interests.join(';'),
          sub.avgEngagementScore || 0,
          sub.emailOpenCount,
          sub.emailClickCount,
        ].join(',')
      );

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="subscribers-${
            new Date().toISOString().split('T')[0]
          }.csv"`,
        },
      });
    }

    // Formato JSON
    return NextResponse.json({
      success: true,
      subscribers,
      exportedAt: new Date().toISOString(),
      count: subscribers.length,
    });
  } catch (error) {
    console.error('Erro no export:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
