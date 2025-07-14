// app/api/admin/ads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { z } from 'zod';

// Schema de validação para criação/edição de ads
const adSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  tagline: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  ctaText: z.string().optional(),
  targetUrl: z.string().url().optional(),
  isExternal: z.boolean().default(true),
  type: z.enum(['BANNER', 'VIDEO', 'CARD', 'SIDEBAR', 'NATIVE', 'POPUP']),
  placement: z.enum([
    'HEADER',
    'SIDEBAR_LEFT',
    'SIDEBAR_RIGHT',
    'CONTENT_TOP',
    'CONTENT_BOTTOM',
    'BETWEEN_CONTENT',
    'FOOTER',
    'MODAL',
  ]),
  status: z.enum([
    'DRAFT',
    'ACTIVE',
    'PAUSED',
    'SCHEDULED',
    'EXPIRED',
    'REJECTED',
  ]),
  targetType: z.enum([
    'GENERAL',
    'INSTRUMENT',
    'COMPOSER',
    'EPOCH',
    'USER_LEVEL',
    'GEOGRAPHIC',
  ]),
  advertiserName: z.string().min(1, 'Nome do anunciante é obrigatório'),
  advertiserEmail: z.string().email().optional(),
  advertiserPhone: z.string().optional(),
  advertiserWebsite: z.string().url().optional(),
  priority: z.number().min(0).max(10).default(0),
  weight: z.number().min(1).default(1),
  maxViews: z.number().positive().optional(),
  maxClicks: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  showOnMobile: z.boolean().default(true),
  showOnTablet: z.boolean().default(true),
  showOnDesktop: z.boolean().default(true),
  customCSS: z.string().optional(),
  customJS: z.string().optional(),

  // Targeting arrays
  instrumentTargets: z.array(z.string()).optional(),
  composerTargets: z.array(z.string()).optional(),
  epochTargets: z.array(z.string()).optional(),
  userLevelTargets: z
    .array(z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']))
    .optional(),
  geoTargets: z
    .array(
      z.object({
        country: z.string(),
        state: z.string().optional(),
        city: z.string().optional(),
      })
    )
    .optional(),
});

// Cache de publicidades ativas
const getCachedActiveAds = unstable_cache(
  async (placement?: string, targetType?: string) => {
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

    return await prisma.advertisement.findMany({
      where,
      include: {
        instrumentTargets: {
          include: { instrument: true },
        },
        composerTargets: {
          include: { composer: true },
        },
        epochTargets: {
          include: { epoch: true },
        },
        userLevelTargets: true,
        geoTargets: true,
        mediaFiles: {
          where: { isMain: true },
          take: 1,
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
  ['active-ads'],
  { revalidate: 300 } // 5 minutos
);

// GET - Listar publicidades (com filtros)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const placement = searchParams.get('placement');
    const targetType = searchParams.get('targetType');
    const search = searchParams.get('search');
    const isApproved = searchParams.get('isApproved');

    // Para busca pública de ads ativas (usado no frontend)
    if (searchParams.get('public') === 'true') {
      const ads = await getCachedActiveAds(
        placement || undefined,
        targetType || undefined
      );
      return NextResponse.json({
        success: true,
        ads: ads.map((ad) => ({
          ...ad,
          // Remove dados sensíveis para API pública
          creator: undefined,
          advertiserEmail: undefined,
          advertiserPhone: undefined,
          customJS: undefined, // Por segurança
        })),
      });
    }

    // Construir filtros
    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (placement) where.placement = placement;
    if (targetType) where.targetType = targetType;
    if (isApproved !== null && isApproved !== undefined) {
      where.isApproved = isApproved === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { advertiserName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Paginação
    const skip = (page - 1) * limit;

    const [ads, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        include: {
          instrumentTargets: {
            include: { instrument: true },
          },
          composerTargets: {
            include: { composer: true },
          },
          epochTargets: {
            include: { epoch: true },
          },
          userLevelTargets: true,
          geoTargets: true,
          mediaFiles: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          stats: {
            select: {
              impressions: true,
              clicks: true,
              date: true,
            },
            orderBy: { date: 'desc' },
            take: 30, // Últimos 30 registros
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.advertisement.count({ where }),
    ]);

    // Calcular estatísticas básicas para cada ad
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
        ctr: Math.round(ctr * 100) / 100,
      };
    });

    return NextResponse.json({
      success: true,
      ads: adsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar publicidades:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova publicidade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validar dados
    const validatedData = adSchema.parse(body);

    // Verificar se já existe uma publicidade com mesmo título e anunciante
    const existingAd = await prisma.advertisement.findFirst({
      where: {
        title: validatedData.title,
        advertiserName: validatedData.advertiserName,
      },
    });

    if (existingAd) {
      return NextResponse.json(
        {
          error:
            'Já existe uma publicidade com este título para este anunciante',
        },
        { status: 400 }
      );
    }

    // Criar publicidade
    const ad = await prisma.advertisement.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        tagline: validatedData.tagline,
        content: validatedData.content,
        imageUrl: validatedData.imageUrl,
        videoUrl: validatedData.videoUrl,
        ctaText: validatedData.ctaText,
        targetUrl: validatedData.targetUrl,
        isExternal: validatedData.isExternal,
        type: validatedData.type,
        placement: validatedData.placement,
        status: validatedData.status,
        targetType: validatedData.targetType,
        advertiserName: validatedData.advertiserName,
        advertiserEmail: validatedData.advertiserEmail,
        advertiserPhone: validatedData.advertiserPhone,
        advertiserWebsite: validatedData.advertiserWebsite,
        priority: validatedData.priority,
        weight: validatedData.weight,
        maxViews: validatedData.maxViews,
        maxClicks: validatedData.maxClicks,

        showOnMobile: validatedData.showOnMobile,
        showOnTablet: validatedData.showOnTablet,
        showOnDesktop: validatedData.showOnDesktop,
        customCSS: validatedData.customCSS,
        customJS: validatedData.customJS,
        createdBy: session.user.id,

        // Criar relacionamentos de targeting
        instrumentTargets: validatedData.instrumentTargets
          ? {
              create: validatedData.instrumentTargets.map((instrumentId) => ({
                instrumentId,
              })),
            }
          : undefined,

        composerTargets: validatedData.composerTargets
          ? {
              create: validatedData.composerTargets.map((composerId) => ({
                composerId,
              })),
            }
          : undefined,

        epochTargets: validatedData.epochTargets
          ? {
              create: validatedData.epochTargets.map((epochId) => ({
                epochId,
              })),
            }
          : undefined,

        userLevelTargets: validatedData.userLevelTargets
          ? {
              create: validatedData.userLevelTargets.map((userLevel) => ({
                userLevel,
              })),
            }
          : undefined,

        geoTargets: validatedData.geoTargets
          ? {
              create: validatedData.geoTargets,
            }
          : undefined,
      },
      include: {
        instrumentTargets: {
          include: { instrument: true },
        },
        composerTargets: {
          include: { composer: true },
        },
        epochTargets: {
          include: { epoch: true },
        },
        userLevelTargets: true,
        geoTargets: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      ad,
      message: 'Publicidade criada com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Erro ao criar publicidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar publicidade
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID da publicidade é obrigatório' },
        { status: 400 }
      );
    }

    // Validar dados
    const validatedData = adSchema.partial().parse(updateData);

    // Verificar se a publicidade existe
    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return NextResponse.json(
        { error: 'Publicidade não encontrada' },
        { status: 404 }
      );
    }

    // Converter datas se fornecidas
    const startDate = validatedData.startDate
      ? new Date(validatedData.startDate)
      : undefined;
    const endDate = validatedData.endDate
      ? new Date(validatedData.endDate)
      : undefined;

    // Validar datas
    if (startDate && endDate && startDate >= endDate) {
      return NextResponse.json(
        { error: 'Data de início deve ser anterior à data de fim' },
        { status: 400 }
      );
    }

    // Atualizar publicidade
    const updatedAd = await prisma.$transaction(async (tx) => {
      // Limpar targeting existente se estiver atualizando
      if (validatedData.instrumentTargets !== undefined) {
        await tx.adInstrumentTarget.deleteMany({
          where: { advertisementId: id },
        });
      }

      if (validatedData.composerTargets !== undefined) {
        await tx.adComposerTarget.deleteMany({
          where: { advertisementId: id },
        });
      }

      if (validatedData.epochTargets !== undefined) {
        await tx.adEpochTarget.deleteMany({
          where: { advertisementId: id },
        });
      }

      if (validatedData.userLevelTargets !== undefined) {
        await tx.adUserLevelTarget.deleteMany({
          where: { advertisementId: id },
        });
      }

      if (validatedData.geoTargets !== undefined) {
        await tx.adGeoTarget.deleteMany({
          where: { advertisementId: id },
        });
      }

      // Atualizar dados básicos
      return await tx.advertisement.update({
        where: { id },
        data: {
          ...validatedData,
          startDate,
          endDate,
          lastEditedBy: session.user.id,
          lastEditedAt: new Date(),

          // Recriar targeting
          instrumentTargets: validatedData.instrumentTargets
            ? {
                create: validatedData.instrumentTargets.map((instrumentId) => ({
                  instrumentId,
                })),
              }
            : undefined,

          composerTargets: validatedData.composerTargets
            ? {
                create: validatedData.composerTargets.map((composerId) => ({
                  composerId,
                })),
              }
            : undefined,

          epochTargets: validatedData.epochTargets
            ? {
                create: validatedData.epochTargets.map((epochId) => ({
                  epochId,
                })),
              }
            : undefined,

          userLevelTargets: validatedData.userLevelTargets
            ? {
                create: validatedData.userLevelTargets.map((userLevel) => ({
                  userLevel,
                })),
              }
            : undefined,

          geoTargets: validatedData.geoTargets
            ? {
                create: validatedData.geoTargets,
              }
            : undefined,
        },
        include: {
          instrumentTargets: {
            include: { instrument: true },
          },
          composerTargets: {
            include: { composer: true },
          },
          epochTargets: {
            include: { epoch: true },
          },
          userLevelTargets: true,
          geoTargets: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      ad: updatedAd,
      message: 'Publicidade atualizada com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar publicidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar publicidade
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID da publicidade é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a publicidade existe
    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return NextResponse.json(
        { error: 'Publicidade não encontrada' },
        { status: 404 }
      );
    }

    // Deletar publicidade (cascade deletará relacionamentos)
    await prisma.advertisement.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Publicidade deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar publicidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
