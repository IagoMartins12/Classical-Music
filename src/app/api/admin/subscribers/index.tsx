// app/api/admin/subscribers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { PlanType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin (role >= 1)
    if (!session?.user?.id || (session.user as any).role < 1) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const planType = searchParams.get('planType') as PlanType | null;
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      currentPlan: { not: PlanType.FREE }, // Apenas assinantes pagantes
    };

    if (planType) {
      where.currentPlan = planType;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Buscar usuários
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { planExpiresAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          image: true,
          currentPlan: true,
          planExpiresAt: true,
          isTrialActive: true,
          createdAt: true,
          subscriptions: {
            where: { status: { in: ['ACTIVE', 'TRIAL'] } },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              planType: true,
              billingPeriod: true,
              status: true,
              startDate: true,
              endDate: true,
              trialEndDate: true,
              price: true,
              autoRenew: true,
              stripeSubscriptionId: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Estatísticas gerais
    const stats = await prisma.user.groupBy({
      by: ['currentPlan'],
      where: { currentPlan: { not: PlanType.FREE } },
      _count: true,
    });

    const totalRevenue = await prisma.subscription.aggregate({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
      _sum: { price: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((u) => ({
          ...u,
          subscription: u.subscriptions[0] || null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          byPlan: stats.reduce(
            (acc, item) => {
              acc[item.currentPlan] = item._count;
              return acc;
            },
            {} as Record<string, number>
          ),
          totalSubscribers: total,
          estimatedMonthlyRevenue: totalRevenue._sum.price || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
