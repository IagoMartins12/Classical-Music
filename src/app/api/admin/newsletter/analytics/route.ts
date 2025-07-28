// app/api/admin/newsletter/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  getCampaignAnalytics,
  getChartData,
  getDateRange,
  getEngagementAnalytics,
  getRecentActivity,
  getSubscriberAnalytics,
  getTopCampaigns,
} from '@/app/utils/analyticsUtils';

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
