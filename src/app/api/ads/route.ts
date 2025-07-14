// app/api/ads/route.ts - API pública para buscar publicidades
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

// Cache de publicidades ativas para performance
const getCachedAds = unstable_cache(
  async (
    placement?: string,
    targetType?: string,
    instrumentIds?: string[],
    composerIds?: string[],
    epochIds?: string[]
  ) => {
    const where: any = {
      status: 'ACTIVE',
      isApproved: true,
      OR: [{ startDate: null }, { startDate: { lte: new Date() } }],
      AND: [
        {
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
      ],
    };

    if (placement) {
      where.placement = placement;
    }

    if (targetType) {
      where.targetType = targetType;
    }

    // Filtros de targeting específico
    if (
      targetType === 'INSTRUMENT' &&
      instrumentIds &&
      instrumentIds.length > 0
    ) {
      where.instrumentTargets = {
        some: {
          instrumentId: { in: instrumentIds },
        },
      };
    }

    if (targetType === 'COMPOSER' && composerIds && composerIds.length > 0) {
      where.composerTargets = {
        some: {
          composerId: { in: composerIds },
        },
      };
    }

    if (targetType === 'EPOCH' && epochIds && epochIds.length > 0) {
      where.epochTargets = {
        some: {
          epochId: { in: epochIds },
        },
      };
    }

    return await prisma.advertisement.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        tagline: true,
        content: true,
        imageUrl: true,
        videoUrl: true,
        ctaText: true,
        targetUrl: true,
        isExternal: true,
        type: true,
        placement: true,
        targetType: true,
        advertiserName: true,
        advertiserWebsite: true,
        priority: true,
        weight: true,
        showOnMobile: true,
        showOnTablet: true,
        showOnDesktop: true,
        customCSS: true,
        // NÃO incluir customJS por segurança
        mediaFiles: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            type: true,
            isMain: true,
            altText: true,
            caption: true,
          },
          where: { isMain: true },
          take: 1,
        },
        instrumentTargets: {
          select: {
            instrument: {
              select: { id: true, name: true },
            },
          },
        },
        composerTargets: {
          select: {
            composer: {
              select: { id: true, name: true },
            },
          },
        },
        epochTargets: {
          select: {
            epoch: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { weight: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  },
  ['public-ads'],
  { revalidate: 300 } // 5 minutos
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement');
    const targetType = searchParams.get('targetType');
    const instrumentIds = searchParams
      .get('instruments')
      ?.split(',')
      .filter(Boolean);
    const composerIds = searchParams
      .get('composers')
      ?.split(',')
      .filter(Boolean);
    const epochIds = searchParams.get('epochs')?.split(',').filter(Boolean);
    const userAgent = request.headers.get('user-agent') || '';

    // Detectar tipo de dispositivo
    const isMobile = /mobile|android|iphone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    // Buscar publicidades
    const ads = await getCachedAds(
      placement || undefined,
      targetType || undefined,
      instrumentIds,
      composerIds,
      epochIds
    );

    // Filtrar por dispositivo
    const filteredAds = ads.filter((ad) => {
      if (isMobile && !ad.showOnMobile) return false;
      if (isTablet && !ad.showOnTablet) return false;
      if (isDesktop && !ad.showOnDesktop) return false;
      return true;
    });

    // Implementar rotação baseada em peso
    const weightedAds = [];
    for (const ad of filteredAds) {
      for (let i = 0; i < ad.weight; i++) {
        weightedAds.push(ad);
      }
    }

    // Embaralhar mantendo prioridade
    const shuffled = weightedAds.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Prioridade maior primeiro
      }
      return Math.random() - 0.5; // Embaralhar ads com mesma prioridade
    });

    return NextResponse.json({
      success: true,
      ads: shuffled.slice(0, 10), // Limitar a 10 ads por request
      count: shuffled.length,
    });
  } catch (error) {
    console.error('Erro ao buscar publicidades:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Registrar evento de tracking
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
      country: data.country,
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
      message: 'Evento registrado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao registrar evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
