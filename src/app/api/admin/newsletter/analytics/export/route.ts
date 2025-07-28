import { authOptions } from '@/app/libs/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import {
  getCampaignAnalytics,
  getDateRange,
  getEngagementAnalytics,
  getSubscriberAnalytics,
} from '@/app/utils/analyticsUtils';

// app/api/admin/newsletter/analytics/export/route.ts
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

    // Buscar analytics
    const { startDate, endDate } = getDateRange(range);
    const subscriberAnalytics = await getSubscriberAnalytics(
      startDate,
      endDate,
      startDate,
      endDate
    );
    const campaignAnalytics = await getCampaignAnalytics(
      startDate,
      endDate,
      startDate,
      endDate
    );
    const engagementAnalytics = await getEngagementAnalytics(
      startDate,
      endDate,
      startDate,
      endDate
    );

    // Gerar relatório em CSV
    const csvData = generateCSVReport({
      subscribers: subscriberAnalytics,
      campaigns: campaignAnalytics,
      engagement: engagementAnalytics,
      period: range,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-analytics-${range}-${
          new Date().toISOString().split('T')[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function generateCSVReport(data: any): string {
  const lines = [
    'Newsletter Analytics Report',
    `Period: ${data.period}`,
    `Start Date: ${new Date(data.startDate).toLocaleDateString('pt-BR')}`,
    `End Date: ${new Date(data.endDate).toLocaleDateString('pt-BR')}`,
    '',
    'SUBSCRIBER METRICS',
    'Metric,Value',
    `Total Subscribers,${data.subscribers.total}`,
    `Active Subscribers,${data.subscribers.active}`,
    `Pending Subscribers,${data.subscribers.pending}`,
    `Unsubscribed,${data.subscribers.unsubscribed}`,
    `Growth Rate,${data.subscribers.growth.toFixed(2)}%`,
    `New Last 7 Days,${data.subscribers.newLast7Days}`,
    `New Last 30 Days,${data.subscribers.newLast30Days}`,
    '',
    'CAMPAIGN METRICS',
    'Metric,Value',
    `Total Campaigns,${data.campaigns.total}`,
    `Sent Campaigns,${data.campaigns.sent}`,
    `Draft Campaigns,${data.campaigns.draft}`,
    `Scheduled Campaigns,${data.campaigns.scheduled}`,
    `Total Emails Sent,${data.campaigns.totalSent}`,
    `Sent Growth,${data.campaigns.sentGrowth.toFixed(2)}%`,
    '',
    'ENGAGEMENT METRICS',
    'Metric,Value',
    `Average Open Rate,${data.engagement.avgOpenRate.toFixed(2)}%`,
    `Average Click Rate,${data.engagement.avgClickRate.toFixed(2)}%`,
    `Average Delivery Rate,${data.engagement.avgDeliveryRate.toFixed(2)}%`,
    `Average Bounce Rate,${data.engagement.avgBounceRate.toFixed(2)}%`,
    `Average Unsubscribe Rate,${data.engagement.avgUnsubscribeRate.toFixed(
      2
    )}%`,
    `Open Rate Change,${data.engagement.openRateChange.toFixed(2)}%`,
    `Click Rate Change,${data.engagement.clickRateChange.toFixed(2)}%`,
  ];

  return lines.join('\n');
}
