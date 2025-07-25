// app/api/admin/newsletter/stats/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Buscar estatísticas dos subscribers
    const [
      totalSubscribers,
      activeSubscribers,
      pendingSubscribers,
      unsubscribedSubscribers,
      bouncedSubscribers,
      totalCampaigns,
      recentSubscribers,
      topCampaigns,
    ] = await Promise.all([
      // Total de subscribers
      prisma.newsletterSubscriber.count(),

      // Subscribers ativos
      prisma.newsletterSubscriber.count({
        where: { status: 'ACTIVE' },
      }),

      // Subscribers pendentes
      prisma.newsletterSubscriber.count({
        where: { status: 'PENDING' },
      }),

      // Subscribers cancelados
      prisma.newsletterSubscriber.count({
        where: { status: 'UNSUBSCRIBED' },
      }),

      // Subscribers com bounce
      prisma.newsletterSubscriber.count({
        where: { status: 'BOUNCED' },
      }),

      // Total de campanhas
      prisma.newsletterCampaign.count(),

      // Subscribers recentes
      prisma.newsletterSubscriber.findMany({
        take: 10,
        orderBy: { subscribedAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          status: true,
          subscribedAt: true,
          avgEngagementScore: true,
        },
      }),

      // Top campanhas por performance
      prisma.newsletterCampaign.findMany({
        take: 5,
        where: {
          status: 'SENT',
          emailsSent: { gt: 0 },
        },
        orderBy: [{ openRate: 'desc' }, { clickRate: 'desc' }],
        select: {
          id: true,
          name: true,
          subject: true,
          openRate: true,
          clickRate: true,
          sentAt: true,
          emailsSent: true,
          emailsOpened: true,
          emailsClicked: true,
        },
      }),
    ]);

    // Calcular taxas médias
    const campaignsWithStats = await prisma.newsletterCampaign.findMany({
      where: {
        status: 'SENT',
        emailsSent: { gt: 0 },
      },
      select: {
        openRate: true,
        clickRate: true,
      },
    });

    const avgOpenRate =
      campaignsWithStats.length > 0
        ? campaignsWithStats.reduce((sum, c) => sum + (c.openRate || 0), 0) /
          campaignsWithStats.length
        : 0;

    const avgClickRate =
      campaignsWithStats.length > 0
        ? campaignsWithStats.reduce((sum, c) => sum + (c.clickRate || 0), 0) /
          campaignsWithStats.length
        : 0;

    // Crescimento nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newSubscribersLast30Days = await prisma.newsletterSubscriber.count({
      where: {
        subscribedAt: {
          gte: thirtyDaysAgo,
        },
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    const stats = {
      totalSubscribers,
      activeSubscribers,
      pendingSubscribers,
      unsubscribedSubscribers,
      bouncedSubscribers,
      totalCampaigns,
      avgOpenRate: avgOpenRate / 100, // Converter para decimal
      avgClickRate: avgClickRate / 100, // Converter para decimal
      newSubscribersLast30Days,
      growthRate:
        totalSubscribers > 0
          ? (newSubscribersLast30Days / totalSubscribers) * 100
          : 0,
      recentSubscribers: recentSubscribers.map((sub) => ({
        ...sub,
        subscribedAt: sub.subscribedAt.toISOString(),
      })),
      topPerformingCampaigns: topCampaigns.map((campaign) => ({
        ...campaign,
        sentAt: campaign.sentAt?.toISOString() || null,
      })),
    };

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas da newsletter:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
