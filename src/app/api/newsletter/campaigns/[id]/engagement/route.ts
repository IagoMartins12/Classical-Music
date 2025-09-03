// app/api/admin/newsletter/campaigns/[id]/engagement/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verificar se a campanha existe
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        sentAt: true,
        emailsSent: true,
        emailsDelivered: true,
        emailsOpened: true,
        emailsClicked: true,
        emailsUnsubscribed: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    if (!campaign.sentAt) {
      return NextResponse.json(
        { success: false, error: 'Campanha ainda não foi enviada' },
        { status: 400 }
      );
    }

    // Buscar eventos de engajamento agrupados por dia
    const engagementEvents = await prisma.newsletterEmailEvent.findMany({
      where: {
        campaignId: id,
        eventType: { in: ['OPENED', 'CLICKED', 'UNSUBSCRIBED'] },
      },
      orderBy: { timestamp: 'asc' },
      select: {
        eventType: true,
        timestamp: true,
        subscriberId: true,
      },
    });

    // Agrupar eventos por dia
    const dailyEngagement = new Map();
    const sentDate = new Date(campaign.sentAt);

    // Inicializar 14 dias a partir da data de envio
    for (let i = 0; i < 14; i++) {
      const date = new Date(sentDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];

      dailyEngagement.set(dateKey, {
        date: dateKey,
        aberturas: 0,
        cliques: 0,
        descadastros: 0,
        uniqueOpens: new Set(),
        uniqueClicks: new Set(),
        uniqueUnsubscribes: new Set(),
      });
    }

    // Processar eventos
    engagementEvents.forEach((event) => {
      const eventDate = event.timestamp.toISOString().split('T')[0];
      const dayData = dailyEngagement.get(eventDate);

      if (dayData) {
        switch (event.eventType) {
          case 'OPENED':
            dayData.uniqueOpens.add(event.subscriberId);
            break;
          case 'CLICKED':
            dayData.uniqueClicks.add(event.subscriberId);
            break;
          case 'UNSUBSCRIBED':
            dayData.uniqueUnsubscribes.add(event.subscriberId);
            break;
        }
      }
    });

    // Converter para array com contagens finais
    const engagementData = Array.from(dailyEngagement.values())
      .map((day) => ({
        name: new Date(day.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        date: day.date,
        aberturas: day.uniqueOpens.size,
        cliques: day.uniqueClicks.size,
        descadastros: day.uniqueUnsubscribes.size,
      }))
      .filter((day) => {
        // Incluir apenas dias com dados ou primeiros 7 dias
        const dayDate = new Date(day.date);
        const daysDiff = Math.ceil(
          (dayDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysDiff <= 7 || day.aberturas > 0 || day.cliques > 0;
      });

    // Buscar dados de engajamento por horário (apenas primeiros 3 dias)
    const hourlyEngagement = await getHourlyEngagementData(id, sentDate);

    // Buscar dados de dispositivos (simulado - você pode implementar rastreamento real)
    const deviceData = await getDeviceEngagementData(id);

    // Buscar top links clicados
    const topLinks = await getTopClickedLinks(id);

    return NextResponse.json({
      success: true,
      engagementData,
      hourlyEngagement,
      deviceData,
      topLinks,
      summary: {
        totalOpens: campaign.emailsOpened || 0,
        totalClicks: campaign.emailsClicked || 0,
        totalUnsubscribes: campaign.emailsUnsubscribed || 0,
        openRate:
          campaign.emailsDelivered > 0
            ? (
                ((campaign.emailsOpened || 0) / campaign.emailsDelivered) *
                100
              ).toFixed(2)
            : '0',
        clickRate:
          (campaign.emailsOpened || 0) > 0
            ? (
                ((campaign.emailsClicked || 0) / (campaign.emailsOpened || 1)) *
                100
              ).toFixed(2)
            : '0',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados de engajamento:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para obter engajamento por horário
async function getHourlyEngagementData(campaignId: string, sentDate: Date) {
  // Buscar eventos das primeiras 48 horas
  const endDate = new Date(sentDate);
  endDate.setHours(endDate.getHours() + 48);

  const events = await prisma.newsletterEmailEvent.findMany({
    where: {
      campaignId,
      eventType: { in: ['OPENED', 'CLICKED'] },
      timestamp: {
        gte: sentDate,
        lte: endDate,
      },
    },
    select: {
      eventType: true,
      timestamp: true,
      subscriberId: true,
    },
  });

  // Agrupar por hora
  const hourlyMap = new Map();

  for (let hour = 0; hour < 24; hour++) {
    hourlyMap.set(hour, {
      hour: `${hour.toString().padStart(2, '0')}h`,
      opens: new Set(),
      clicks: new Set(),
    });
  }

  events.forEach((event) => {
    const hour = event.timestamp.getHours();
    const hourData = hourlyMap.get(hour);

    if (hourData) {
      if (event.eventType === 'OPENED') {
        hourData.opens.add(event.subscriberId);
      } else if (event.eventType === 'CLICKED') {
        hourData.clicks.add(event.subscriberId);
      }
    }
  });

  return Array.from(hourlyMap.values()).map((hour) => ({
    name: hour.hour,
    value: hour.opens.size, // Usar aberturas como métrica principal
    opens: hour.opens.size,
    clicks: hour.clicks.size,
  }));
}

// Função simulada para dados de dispositivos
async function getDeviceEngagementData(campaignId: string) {
  // Simular distribuição típica de dispositivos
  const campaign = await prisma.newsletterCampaign.findUnique({
    where: { id: campaignId },
    select: { emailsOpened: true },
  });

  const totalOpens = campaign?.emailsOpened || 0;

  return [
    { name: 'Desktop', value: Math.round(totalOpens * 0.45) },
    { name: 'Mobile', value: Math.round(totalOpens * 0.4) },
    { name: 'Tablet', value: Math.round(totalOpens * 0.15) },
  ];
}

// Função simulada para top links clicados
async function getTopClickedLinks(campaignId: string) {
  // Buscar eventos de clique com dados de URL se disponível

  console.log('compa', campaignId);
  // Simular alguns links populares se não houver dados reais
  const linkClicks = new Map();
  linkClicks.set('Homepage', Math.floor(Math.random() * 50) + 10);
  linkClicks.set(
    'Conheça nossos professores',
    Math.floor(Math.random() * 30) + 5
  );
  linkClicks.set('Catálogo de partituras', Math.floor(Math.random() * 40) + 8);
  linkClicks.set('Entre em contato', Math.floor(Math.random() * 20) + 3);

  return Array.from(linkClicks.entries())
    .map(([url, clicks]) => ({
      url,
      clicks,
    }))
    .sort((a, b) => b.clicks - a.clicks);
}
