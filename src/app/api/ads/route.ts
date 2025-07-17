// app/api/ads/route.ts - API atualizada para anúncios
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

// Cache de anúncios ativos para performance
const getCachedAds = unstable_cache(
  async (
    placement?: string,
    targetType?: string,
    instrumentId?: string,
    userLevel?: string
  ) => {
    const where: any = {
      status: 'ACTIVE',
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

    if (userLevel && userLevel !== 'ALL') {
      where.targetUserLevel = {
        in: ['ALL', userLevel],
      };
    }

    // Filtro para targeting específico por instrumento
    if (targetType === 'INSTRUMENT' && instrumentId) {
      where.instrumentId = instrumentId;
    }

    return await prisma.advertisement.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        imageUrl: true,
        thumbnailUrl: true,
        videoUrl: true,
        ctaText: true,
        targetUrl: true,
        linkType: true,
        isExternal: true,
        type: true,
        placement: true,
        targetType: true,
        targetUserLevel: true,
        advertiserName: true,
        advertiserWebsite: true,
        showOnMobile: true,
        showOnTablet: true,
        showOnDesktop: true,
        instrumentId: true,
        instrument: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 1, // APENAS UM AD POR COMBINAÇÃO
    });
  },
  ['public-ads'],
  { revalidate: 300 } // 5 minutos
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement');
    const targetType = searchParams.get('targetType') || 'GENERAL';
    const instrumentId = searchParams.get('instrumentId');
    const userLevel = searchParams.get('userLevel') || 'ALL';
    const userAgent = request.headers.get('user-agent') || '';

    // Detectar tipo de dispositivo
    const isMobile = /mobile|android|iphone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    // Buscar anúncios
    const ads = await getCachedAds(
      placement || undefined,
      targetType,
      instrumentId || undefined,
      userLevel
    );

    // Filtrar por dispositivo
    const filteredAds = ads.filter((ad) => {
      if (isMobile && !ad.showOnMobile) return false;
      if (isTablet && !ad.showOnTablet) return false;
      if (isDesktop && !ad.showOnDesktop) return false;
      return true;
    });

    return NextResponse.json({
      success: true,
      ads: filteredAds,
      count: filteredAds.length,
    });
  } catch (error) {
    console.error('Erro ao buscar anúncios:', error);
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

    // Verificar se o anúncio existe e está ativo
    const ad = await prisma.advertisement.findFirst({
      where: {
        id: adId,
        status: 'ACTIVE',
      },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Anúncio não encontrado ou inativo' },
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
    const isMobile = /mobile|android|iphone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    // Determinar nível do usuário
    let userLevel = 'ALL';
    if (session?.user?.role === 1) {
      userLevel = 'TEACHER';
    } else if (session?.user?.role === 0) {
      userLevel = 'STUDENT';
    }

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
        advertisementId: adId,
        date: today,
        userAgent,
        referrer,
        device,
        userId,
        userLevel,
        pageUrl: data.pageUrl,
        pageTitle: data.pageTitle,
        country: data.country,
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
