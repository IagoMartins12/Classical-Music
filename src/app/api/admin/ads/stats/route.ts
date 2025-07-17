// app/api/admin/ads/stats/route.ts - SEGUINDO O SCHEMA ATUAL
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
      country: data.country,
    };

    // Buscar estatística do dia atual para este ad
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingStats = await prisma.adStats.findFirst({
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
      // Atualizar estatística existente - APENAS CAMPOS EXISTENTES
      const updateData: any = {};

      switch (event) {
        case 'impression':
          updateData.impressions = { increment: 1 };
          break;
        case 'click':
          updateData.clicks = { increment: 1 };
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
      // Criar nova estatística - APENAS CAMPOS EXISTENTES
      const initialStats: any = {
        ...statsData,
        impressions: 0,
        clicks: 0,
        hoverTime: 0,
      };

      switch (event) {
        case 'impression':
          initialStats.impressions = 1;
          break;
        case 'click':
          initialStats.clicks = 1;
          break;
        case 'hover':
          initialStats.hoverTime = data.duration || 0;
          break;
      }

      await prisma.adStats.create({
        data: initialStats,
      });
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

// GET - Obter estatísticas de uma publicidade - SEGUINDO O SCHEMA ATUAL
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role < 1) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('adId');
    const period = searchParams.get('period') || 'week';
    const groupBy = searchParams.get('groupBy') || 'day';

    if (!adId) {
      return NextResponse.json(
        { error: 'adId é obrigatório' },
        { status: 400 }
      );
    }

    // Calcular período
    const now = new Date();
    const startDate = new Date();

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
          hoverTime: 0,
          devices: { mobile: 0, tablet: 0, desktop: 0 },
        };
      }

      acc[key].impressions += stat.impressions || 0;
      acc[key].clicks += stat.clicks || 0;
      acc[key].hoverTime += stat.hoverTime || 0;

      if (stat.device) {
        acc[key].devices[stat.device as 'mobile' | 'tablet' | 'desktop'] +=
          stat.impressions || 0;
      }

      return acc;
    }, {});

    // Converter para array
    const chartData = Object.values(aggregatedStats);

    // Calcular totais - APENAS CAMPOS EXISTENTES
    const totals = stats.reduce(
      (acc, stat) => ({
        impressions: acc.impressions + (stat.impressions || 0),
        clicks: acc.clicks + (stat.clicks || 0),
        hoverTime: acc.hoverTime + (stat.hoverTime || 0),
      }),
      { impressions: 0, clicks: 0, hoverTime: 0 }
    );

    // Calcular CTR - APENAS COM CAMPOS EXISTENTES
    const ctr =
      totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
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
          avgHoverTime: Math.round(avgHoverTime),
        },
        topCountries: countriesData || [],
        topPages: pagesData || [],
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
