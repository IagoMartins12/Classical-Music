// app/api/admin/ads/route.ts - API principal corrigida para schema atual
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// GET - Buscar anúncios para admin
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
      // Retornar estatísticas gerais
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
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
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
              // Removido conversions pois não existe no schema
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.advertisement.count({ where }),
    ]);

    // Calcular estatísticas de cada ad - APENAS CAMPOS EXISTENTES
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

// POST - Criar novo anúncio
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
      type,
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

    // Validações
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

    // Verificar se já existe um ad para esta combinação (APENAS UM POR TIPO)
    const existingAd = await prisma.advertisement.findFirst({
      where: {
        placement,
        targetType,
        instrumentId: instrumentId || null,
        status: { in: ['ACTIVE', 'SCHEDULED'] },
      },
    });

    if (existingAd) {
      return NextResponse.json(
        {
          error: `Já existe um anúncio ativo para esta combinação. ${
            instrumentId
              ? `Instrumento selecionado já tem anúncio.`
              : `Posição ${placement} com tipo ${targetType} já ocupada.`
          }`,
        },
        { status: 400 }
      );
    }

    const ad = await prisma.advertisement.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        content: content?.trim() || null,
        ctaText: ctaText?.trim() || null,
        targetUrl: targetUrl?.trim() || null,
        linkType,
        isExternal,
        type,
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
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        instrument: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Invalidar cache
    revalidateTag('public-ads');

    return NextResponse.json({ success: true, ad });
  } catch (error) {
    console.error('Erro ao criar anúncio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar anúncio
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

    // Verificar se o anúncio existe
    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return NextResponse.json(
        { error: 'Anúncio não encontrado' },
        { status: 404 }
      );
    }

    // Se mudou placement, targetType ou instrumentId, verificar conflitos
    if (
      (updateData.placement && updateData.placement !== existingAd.placement) ||
      (updateData.targetType &&
        updateData.targetType !== existingAd.targetType) ||
      (updateData.instrumentId !== undefined &&
        updateData.instrumentId !== existingAd.instrumentId)
    ) {
      const conflictAd = await prisma.advertisement.findFirst({
        where: {
          id: { not: id },
          placement: updateData.placement || existingAd.placement,
          targetType: updateData.targetType || existingAd.targetType,
          instrumentId:
            updateData.instrumentId !== undefined
              ? updateData.instrumentId
              : existingAd.instrumentId,
          status: { in: ['ACTIVE', 'SCHEDULED'] },
        },
      });

      if (conflictAd) {
        return NextResponse.json(
          { error: 'Já existe outro anúncio ativo para esta combinação' },
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
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        instrument: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Invalidar cache
    revalidateTag('public-ads');

    return NextResponse.json({ success: true, ad: updatedAd });
  } catch (error) {
    console.error('Erro ao atualizar anúncio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar anúncio
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

    // Deletar o anúncio do banco de dados
    await prisma.advertisement.delete({
      where: { id },
    });

    // Invalidar cache
    revalidateTag('public-ads');

    return NextResponse.json({
      success: true,
      message: 'Anúncio deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar anúncio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para obter estatísticas administrativas - SEGUINDO SCHEMA ATUAL
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
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias
          },
        },
        _sum: {
          impressions: true,
          clicks: true,
          // Removido conversions pois não existe no schema
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
