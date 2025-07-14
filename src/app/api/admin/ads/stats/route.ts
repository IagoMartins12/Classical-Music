// app/api/admin/ads/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

// POST - Registrar evento de estatística (impressão, clique, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId, event, data = {} } = body;

    if (!adId || !event) {
      return NextResponse.json(
        { error: 'adId e event são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a publicidade existe e está ativa
    const ad = await prisma.advertisement.findFirst({
      where: {
        id: adId,
        status: 'ACTIVE',
        isApproved: true,
      },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Publicidade não encontrada ou inativa' },
        { status: 404 }
      );
    }

    // Obter dados do usuário se logado
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Obter dados da requisição
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Determinar tipo de dispositivo
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    // Criar registro de estatística
    const statsData: any = {
      advertisementId: adId,
      userAgent,
      referrer,
      device,
      userId,
      pageUrl: data.pageUrl,
      pageTitle: data.pageTitle,
      placement: data.placement,
      country: data.country, // Obtido do frontend via geolocalização
    };

    // Buscar estatística do dia atual para este ad
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let existingStats = await prisma.adStats.findFirst({
      where: {
        advertisementId: adId,
        date: {
          gte: today,
          lt: tomorrow,
        },
        userId: userId || null,
        device,
      },
    });

    if (existingStats) {
      // Atualizar estatística existente
      const updateData: any = {};

      switch (event) {
        case 'impression':
          updateData.impressions = { increment: 1 };
          break;
        case 'click':
          updateData.clicks = { increment: 1 };
          break;
        case 'conversion':
          updateData.conversions = { increment: 1 };
          break;
        case 'hover':
          updateData.hoverTime = { increment: data.duration || 0 };
          break;
      }

      await prisma.adStats.update({
        where: { id: existingStats.id },
        data: updateData,
      });
    } else {
      // Criar nova estatística
      const initialStats: any = {
        ...statsData,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        hoverTime: 0,
      };

      switch (event) {
        case 'impression':
          initialStats.impressions = 1;
          break;
        case 'click':
          initialStats.clicks = 1;
          break;
        case 'conversion':
          initialStats.conversions = 1;
          break;
        case 'hover':
          initialStats.hoverTime = data.duration || 0;
          break;
      }

      await prisma.adStats.create({
        data: initialStats,
      });
    }

    // Verificar se atingiu limites máximos
    if (ad.maxViews || ad.maxClicks) {
      const totalStats = await prisma.adStats.aggregate({
        where: { advertisementId: adId },
        _sum: {
          impressions: true,
          clicks: true,
        },
      });

      const shouldPause =
        (ad.maxViews &&
          totalStats._sum.impressions &&
          totalStats._sum.impressions >= ad.maxViews) ||
        (ad.maxClicks &&
          totalStats._sum.clicks &&
          totalStats._sum.clicks >= ad.maxClicks);

      if (shouldPause) {
        await prisma.advertisement.update({
          where: { id: adId },
          data: { status: 'PAUSED' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Estatística registrada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao registrar estatística:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Obter estatísticas de uma publicidade
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('adId');
    const period = searchParams.get('period') || 'week'; // week, month, year
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

    if (!adId) {
      return NextResponse.json(
        { error: 'adId é obrigatório' },
        { status: 400 }
      );
    }

    // Calcular período
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Buscar estatísticas agregadas
    const stats = await prisma.adStats.findMany({
      where: {
        advertisementId: adId,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Agregar dados por período
    const aggregatedStats = stats.reduce((acc: any, stat) => {
      let key: string;
      const date = new Date(stat.date);

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            '0'
          )}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          hoverTime: 0,
          devices: { mobile: 0, tablet: 0, desktop: 0 },
        };
      }

      acc[key].impressions += stat.impressions;
      acc[key].clicks += stat.clicks;
      acc[key].conversions += stat.conversions;
      acc[key].hoverTime += stat.hoverTime;

      if (stat.device) {
        acc[key].devices[stat.device as 'mobile' | 'tablet' | 'desktop'] +=
          stat.impressions;
      }

      return acc;
    }, {});

    // Converter para array
    const chartData = Object.values(aggregatedStats);

    // Calcular totais
    const totals = stats.reduce(
      (acc, stat) => ({
        impressions: acc.impressions + stat.impressions,
        clicks: acc.clicks + stat.clicks,
        conversions: acc.conversions + stat.conversions,
        hoverTime: acc.hoverTime + stat.hoverTime,
      }),
      { impressions: 0, clicks: 0, conversions: 0, hoverTime: 0 }
    );

    // Calcular CTR e outras métricas
    const ctr =
      totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const conversionRate =
      totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
    const avgHoverTime = stats.length > 0 ? totals.hoverTime / stats.length : 0;

    // Top países
    const countriesData = await prisma.adStats.groupBy({
      by: ['country'],
      where: {
        advertisementId: adId,
        date: { gte: startDate, lte: now },
        country: { not: null },
      },
      _sum: {
        impressions: true,
        clicks: true,
      },
      orderBy: {
        _sum: {
          impressions: 'desc',
        },
      },
      take: 10,
    });

    // Top páginas
    const pagesData = await prisma.adStats.groupBy({
      by: ['pageUrl'],
      where: {
        advertisementId: adId,
        date: { gte: startDate, lte: now },
        pageUrl: { not: null },
      },
      _sum: {
        impressions: true,
        clicks: true,
      },
      orderBy: {
        _sum: {
          impressions: 'desc',
        },
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        chartData,
        totals: {
          ...totals,
          ctr: Math.round(ctr * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100,
          avgHoverTime: Math.round(avgHoverTime),
        },
        topCountries: countriesData,
        topPages: pagesData,
        period,
        groupBy,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
