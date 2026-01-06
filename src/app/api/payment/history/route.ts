// app/api/payment/history/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

/**
 * GET /api/payment/history
 * Retorna o histórico de pagamentos do usuário logado
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar todos os pagamentos do usuário
    const payments = await prisma.payment.findMany({
      where: {
        subscription: {
          userId: user.id,
        },
      },
      include: {
        subscription: {
          select: {
            planType: true,
            billingPeriod: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            pdfUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Agrupar por status
    const grouped = {
      approved: payments.filter((p) => p.status === 'APPROVED'),
      pending: payments.filter((p) => p.status === 'PENDING'),
      rejected: payments.filter((p) => p.status === 'FAILED'),
      refunded: payments.filter((p) => p.status === 'REFUNDED'),
    };

    // Calcular estatísticas
    const stats = {
      totalPaid: grouped.approved.reduce((sum, p) => sum + p.finalAmount, 0),
      totalPayments: payments.length,
      approvedCount: grouped.approved.length,
      pendingCount: grouped.pending.length,
      rejectedCount: grouped.rejected.length,
      refundedCount: grouped.refunded.length,
    };

    return NextResponse.json({
      success: true,
      payments,
      grouped,
      stats,
    });
  } catch (error) {
    console.error('[GET /api/payment/history] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico de pagamentos' },
      { status: 500 }
    );
  }
}
