// app/api/admin/newsletter/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

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
    const range = searchParams.get('range') || '30d';

    // Calcular datas baseadas no range
    const { startDate, endDate, previousStartDate, previousEndDate } =
      getDateRange(range);

    // Buscar analytics de subscribers
    const subscriberAnalytics = await getSubscriberAnalytics(
      startDate,
      endDate,
      previousStartDate,
      previousEndDate
    );

    // Buscar analytics de campanhas
    const campaignAnalytics = await getCampaignAnalytics(
      startDate,
      endDate,
      previousStartDate,
      previousEndDate
    );

    // Buscar analytics de engajamento
    const engagementAnalytics = await getEngagementAnalytics(
      startDate,
      endDate,
      previousStartDate,
      previousEndDate
    );

    // Buscar top campanhas
    const topCampaigns = await getTopCampaigns(startDate, endDate);

    // Buscar atividade recente
    const recentActivity = await getRecentActivity(startDate, endDate);

    // Dados para gráficos
    const chartData = await getChartData();

    const analytics = {
      subscribers: subscriberAnalytics,
      campaigns: campaignAnalytics,
      engagement: engagementAnalytics,
      topCampaigns,
      recentActivity,
      chartData,
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export function getDateRange(range: string) {
  const now = new Date();
  const endDate = new Date(now);
  const startDate = new Date(now);

  switch (range) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  // Período anterior para comparação
  const periodLength = endDate.getTime() - startDate.getTime();
  const previousEndDate = new Date(startDate);
  const previousStartDate = new Date(startDate.getTime() - periodLength);

  return { startDate, endDate, previousStartDate, previousEndDate };
}

export async function getSubscriberAnalytics(
  startDate: Date,
  endDate: Date,
  previousStartDate: Date,
  previousEndDate: Date
) {
  // Total de subscribers
  const total = await prisma.newsletterSubscriber.count();

  // Subscribers por status
  const [active, pending, unsubscribed] = await Promise.all([
    prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
    prisma.newsletterSubscriber.count({ where: { status: 'PENDING' } }),
    prisma.newsletterSubscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
  ]);

  // Novos subscribers no período
  const newInPeriod = await prisma.newsletterSubscriber.count({
    where: {
      subscribedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Novos subscribers no período anterior
  const newInPreviousPeriod = await prisma.newsletterSubscriber.count({
    where: {
      subscribedAt: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
    },
  });

  // Crescimento
  const growth =
    newInPreviousPeriod > 0
      ? ((newInPeriod - newInPreviousPeriod) / newInPreviousPeriod) * 100
      : 0;

  // Novos últimos 7 e 30 dias
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [newLast7Days, newLast30Days] = await Promise.all([
    prisma.newsletterSubscriber.count({
      where: { subscribedAt: { gte: sevenDaysAgo } },
    }),
    prisma.newsletterSubscriber.count({
      where: { subscribedAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  // Engajamento por níveis (simplificado)
  const [highEngagement, mediumEngagement, lowEngagement] = await Promise.all([
    prisma.newsletterSubscriber.count({
      where: { avgEngagementScore: { gte: 75 } },
    }),
    prisma.newsletterSubscriber.count({
      where: { avgEngagementScore: { gte: 50, lt: 75 } },
    }),
    prisma.newsletterSubscriber.count({
      where: { avgEngagementScore: { lt: 50 } },
    }),
  ]);

  return {
    total,
    active,
    pending,
    unsubscribed,
    growth,
    newLast7Days,
    newLast30Days,
    highEngagement,
    mediumEngagement,
    lowEngagement,
  };
}

export async function getCampaignAnalytics(
  startDate: Date,
  endDate: Date,
  previousStartDate: Date,
  previousEndDate: Date
) {
  // Total de campanhas
  const total = await prisma.newsletterCampaign.count();

  // Campanhas por status
  const [sent, draft, scheduled] = await Promise.all([
    prisma.newsletterCampaign.count({ where: { status: 'SENT' } }),
    prisma.newsletterCampaign.count({ where: { status: 'DRAFT' } }),
    prisma.newsletterCampaign.count({ where: { status: 'SCHEDULED' } }),
  ]);

  // Total de emails enviados no período
  const sentCampaigns = await prisma.newsletterCampaign.findMany({
    where: {
      sentAt: {
        gte: startDate,
        lte: endDate,
      },
      status: 'SENT',
    },
    select: { emailsSent: true },
  });

  const totalSent = sentCampaigns.reduce(
    (sum, campaign) => sum + (campaign.emailsSent || 0),
    0
  );

  // Total de emails enviados no período anterior
  const previousSentCampaigns = await prisma.newsletterCampaign.findMany({
    where: {
      sentAt: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
      status: 'SENT',
    },
    select: { emailsSent: true },
  });

  const previousTotalSent = previousSentCampaigns.reduce(
    (sum, campaign) => sum + (campaign.emailsSent || 0),
    0
  );

  // Crescimento de envios
  const sentGrowth =
    previousTotalSent > 0
      ? ((totalSent - previousTotalSent) / previousTotalSent) * 100
      : 0;

  return {
    total,
    sent,
    draft,
    scheduled,
    totalSent,
    sentGrowth,
  };
}

export async function getEngagementAnalytics(
  startDate: Date,
  endDate: Date,
  previousStartDate: Date,
  previousEndDate: Date
) {
  // Campanhas do período atual
  const currentCampaigns = await prisma.newsletterCampaign.findMany({
    where: {
      sentAt: {
        gte: startDate,
        lte: endDate,
      },
      status: 'SENT',
    },
    select: {
      emailsSent: true,
      emailsDelivered: true,
      emailsOpened: true,
      emailsClicked: true,
      emailsBounced: true,
      emailsUnsubscribed: true,
    },
  });

  // Campanhas do período anterior
  const previousCampaigns = await prisma.newsletterCampaign.findMany({
    where: {
      sentAt: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
      status: 'SENT',
    },
    select: {
      emailsSent: true,
      emailsDelivered: true,
      emailsOpened: true,
      emailsClicked: true,
      emailsBounced: true,
      emailsUnsubscribed: true,
    },
  });

  // Calcular médias para período atual
  const currentTotals = currentCampaigns.reduce(
    (acc, campaign) => ({
      sent: acc.sent + (campaign.emailsSent || 0),
      delivered: acc.delivered + (campaign.emailsDelivered || 0),
      opened: acc.opened + (campaign.emailsOpened || 0),
      clicked: acc.clicked + (campaign.emailsClicked || 0),
      bounced: acc.bounced + (campaign.emailsBounced || 0),
      unsubscribed: acc.unsubscribed + (campaign.emailsUnsubscribed || 0),
    }),
    {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
    }
  );

  // Calcular médias para período anterior
  const previousTotals = previousCampaigns.reduce(
    (acc, campaign) => ({
      sent: acc.sent + (campaign.emailsSent || 0),
      delivered: acc.delivered + (campaign.emailsDelivered || 0),
      opened: acc.opened + (campaign.emailsOpened || 0),
      clicked: acc.clicked + (campaign.emailsClicked || 0),
      bounced: acc.bounced + (campaign.emailsBounced || 0),
      unsubscribed: acc.unsubscribed + (campaign.emailsUnsubscribed || 0),
    }),
    {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
    }
  );

  // Taxas atuais
  const avgDeliveryRate =
    currentTotals.sent > 0
      ? (currentTotals.delivered / currentTotals.sent) * 100
      : 0;
  const avgOpenRate =
    currentTotals.delivered > 0
      ? (currentTotals.opened / currentTotals.delivered) * 100
      : 0;
  const avgClickRate =
    currentTotals.opened > 0
      ? (currentTotals.clicked / currentTotals.opened) * 100
      : 0;
  const avgBounceRate =
    currentTotals.sent > 0
      ? (currentTotals.bounced / currentTotals.sent) * 100
      : 0;
  const avgUnsubscribeRate =
    currentTotals.delivered > 0
      ? (currentTotals.unsubscribed / currentTotals.delivered) * 100
      : 0;

  // Taxas anteriores
  const prevAvgOpenRate =
    previousTotals.delivered > 0
      ? (previousTotals.opened / previousTotals.delivered) * 100
      : 0;
  const prevAvgClickRate =
    previousTotals.opened > 0
      ? (previousTotals.clicked / previousTotals.opened) * 100
      : 0;

  // Mudanças
  const openRateChange =
    prevAvgOpenRate > 0 ? avgOpenRate - prevAvgOpenRate : 0;
  const clickRateChange =
    prevAvgClickRate > 0 ? avgClickRate - prevAvgClickRate : 0;

  return {
    avgOpenRate,
    avgClickRate,
    avgDeliveryRate,
    avgBounceRate,
    avgUnsubscribeRate,
    openRateChange,
    clickRateChange,
  };
}

async function getTopCampaigns(startDate: Date, endDate: Date) {
  const campaigns = await prisma.newsletterCampaign.findMany({
    where: {
      sentAt: {
        gte: startDate,
        lte: endDate,
      },
      status: 'SENT',
    },
    select: {
      id: true,
      name: true,
      subject: true,
      emailsSent: true,
      emailsOpened: true,
      emailsClicked: true,
      sentAt: true,
    },
    orderBy: {
      emailsOpened: 'desc',
    },
    take: 10,
  });

  return campaigns;
}

async function getRecentActivity(startDate: Date, endDate: Date) {
  const events = await prisma.newsletterEmailEvent.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: 20,
  });

  return events;
}

async function getChartData() {
  // Dados para gráficos seriam calculados aqui
  // Por simplicidade, retornando estrutura vazia
  return {
    subscriberGrowth: [],
    engagementTrends: [],
    campaignPerformance: [],
  };
}
