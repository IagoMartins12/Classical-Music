// app/api/admin/ads/route.ts - API principal corrigida com nova lógica
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { deleteAdMediaDirectory } from '@/app/libs/ads/serverMediaProcessor';

// GET - Buscar anúncios para admin (mantém igual)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const placement = searchParams.get('placement');
    const targetType = searchParams.get('targetType');
    const search = searchParams.get('search');
    const overview = searchParams.get('overview') === 'true';

    if (overview) {
      const stats = await getAdminStats();
      return NextResponse.json({ success: true, stats });
    }

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (placement) where.placement = placement;
    if (targetType) where.targetType = targetType;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { advertiserName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [ads, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        include: {
          instrument: {
            select: {
              id: true,
              name: true,
            },
          },
          stats: {
            select: {
              impressions: true,
              clicks: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.advertisement.count({ where }),
    ]);

    const adsWithStats = ads.map((ad) => {
      const totalImpressions = ad.stats.reduce(
        (sum, stat) => sum + stat.impressions,
        0
      );
      const totalClicks = ad.stats.reduce((sum, stat) => sum + stat.clicks, 0);
      const ctr =
        totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      return {
        ...ad,
        totalImpressions,
        totalClicks,
        ctr,
      };
    });

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      success: true,
      ads: adsWithStats,
      pagination,
    });
  } catch (error) {
    console.error('Erro ao buscar anúncios:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo anúncio (🔧 CORRIGIDO)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      content,
      ctaText,
      targetUrl,
      linkType = 'url',
      isExternal = true,
      type = 'BANNER', // 🆕 DEFAULT
      placement,
      status = 'DRAFT',
      targetType = 'GENERAL',
      targetUserLevel = 'ALL',
      instrumentId,
      advertiserName,
      advertiserEmail,
      advertiserPhone,
      advertiserWebsite,
      startDate,
      endDate,
      showOnMobile = true,
      showOnTablet = true,
      showOnDesktop = true,
    } = body;

    // Validações básicas
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    if (!advertiserName?.trim()) {
      return NextResponse.json(
        { error: 'Nome do anunciante é obrigatório' },
        { status: 400 }
      );
    }

    // 🔧 NOVA VERIFICAÇÃO: Incluir o TYPE na busca de conflitos
    const existingAd = await prisma.advertisement.findFirst({
      where: {
        type, // 🆕 INCLUIR O TYPE
        placement,
        targetType,
        instrumentId: instrumentId || null,
        // 🔧 REMOVER verificação de status - permitir múltiplos rascunhos
        // status: { in: ['ACTIVE', 'SCHEDULED'] },
      },
    });

    if (existingAd) {
      const instrumentText = instrumentId
        ? `instrumento específico`
        : `segmentação geral`;

      return NextResponse.json(
        {
          error: `Já existe um anúncio "${existingAd.type}" no posicionamento "${existingAd.placement}" com ${instrumentText}. Cada combinação [tipo + posicionamento + segmentação] só pode ter um anúncio. Anúncio existente: "${existingAd.title}"`,
        },
        { status: 400 }
      );
    }

    // Criar o anúncio
    const ad = await prisma.advertisement.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        content: content?.trim() || null,
        ctaText: ctaText?.trim() || null,
        targetUrl: targetUrl?.trim() || null,
        linkType,
        isExternal,
        type, // 🆕 INCLUIR O TYPE
        placement,
        status,
        targetType,
        targetUserLevel,
        instrumentId: instrumentId || null,
        advertiserName: advertiserName.trim(),
        advertiserEmail: advertiserEmail?.trim() || null,
        advertiserPhone: advertiserPhone?.trim() || null,
        advertiserWebsite: advertiserWebsite?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        showOnMobile,
        showOnTablet,
        showOnDesktop,
        createdBy: session.user.id,
      },
      include: {
        instrument: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidateTag('public-ads');

    return NextResponse.json({ success: true, ad });
  } catch (error) {
    console.error('Erro ao criar anúncio:', error);

    // 🔧 TRATAMENTO ESPECÍFICO PARA ERRO DE CONSTRAINT ÚNICA
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        {
          error:
            'Já existe um anúncio com essa combinação exata de tipo, posicionamento e segmentação. Cada combinação só pode ter um anúncio.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar anúncio (🔧 CORRIGIDO)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return NextResponse.json(
        { error: 'Anúncio não encontrado' },
        { status: 404 }
      );
    }

    // 🔧 VERIFICAR CONFLITOS CONSIDERANDO TODAS AS DIMENSÕES
    if (
      (updateData.type && updateData.type !== existingAd.type) ||
      (updateData.placement && updateData.placement !== existingAd.placement) ||
      (updateData.targetType &&
        updateData.targetType !== existingAd.targetType) ||
      (updateData.instrumentId !== undefined &&
        updateData.instrumentId !== existingAd.instrumentId)
    ) {
      const conflictAd = await prisma.advertisement.findFirst({
        where: {
          id: { not: id },
          type: updateData.type || existingAd.type, // 🆕 INCLUIR TYPE
          placement: updateData.placement || existingAd.placement,
          targetType: updateData.targetType || existingAd.targetType,
          instrumentId:
            updateData.instrumentId !== undefined
              ? updateData.instrumentId
              : existingAd.instrumentId,
          // 🔧 REMOVER verificação de status - permitir edição
        },
      });

      if (conflictAd) {
        const instrumentText = (
          updateData.instrumentId !== undefined
            ? updateData.instrumentId
            : existingAd.instrumentId
        )
          ? `instrumento específico`
          : `segmentação geral`;

        return NextResponse.json(
          {
            error: `Já existe outro anúncio "${conflictAd.type}" no posicionamento "${conflictAd.placement}" com ${instrumentText}. Anúncio conflitante: "${conflictAd.title}"`,
          },
          { status: 400 }
        );
      }
    }

    const updatedAd = await prisma.advertisement.update({
      where: { id },
      data: {
        ...updateData,
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
      },
      include: {
        instrument: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidateTag('public-ads');

    return NextResponse.json({ success: true, ad: updatedAd });
  } catch (error) {
    console.error('Erro ao atualizar anúncio:', error);

    // 🔧 TRATAMENTO ESPECÍFICO PARA ERRO DE CONSTRAINT ÚNICA
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        {
          error:
            'Já existe um anúncio com essa combinação exata de tipo, posicionamento e segmentação.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Mantém igual
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const ad = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Anúncio não encontrado' },
        { status: 404 }
      );
    }

    let mediaDirectoryDeleted = false;
    try {
      mediaDirectoryDeleted = await deleteAdMediaDirectory(ad.title, ad.id);
      console.log(`🗑️ Pasta de mídia deletada: ${mediaDirectoryDeleted}`);
    } catch (mediaError) {
      console.error('❌ Erro ao deletar pasta de mídia:', mediaError);
    }

    await prisma.advertisement.delete({
      where: { id },
    });

    revalidateTag('public-ads');

    return NextResponse.json({
      success: true,
      message: 'Anúncio deletado com sucesso',
      details: {
        adId: id,
        adTitle: ad.title,
        mediaDirectoryDeleted,
        adDirectory: `${ad.title}-${ad.id}`,
      },
    });
  } catch (error) {
    console.error('Erro ao deletar anúncio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar mantém igual
async function getAdminStats() {
  const [totalAds, activeAds, pausedAds, draftAds, recentStats] =
    await Promise.all([
      prisma.advertisement.count(),
      prisma.advertisement.count({ where: { status: 'ACTIVE' } }),
      prisma.advertisement.count({ where: { status: 'PAUSED' } }),
      prisma.advertisement.count({ where: { status: 'DRAFT' } }),
      prisma.adStats.aggregate({
        where: {
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          impressions: true,
          clicks: true,
        },
      }),
    ]);

  const impressions30d = recentStats._sum.impressions || 0;
  const clicks30d = recentStats._sum.clicks || 0;
  const avgCTR = impressions30d > 0 ? (clicks30d / impressions30d) * 100 : 0;

  return {
    totalAds,
    activeAds,
    pausedAds,
    draftAds,
    impressions30d,
    clicks30d,
    avgCTR,
  };
}
