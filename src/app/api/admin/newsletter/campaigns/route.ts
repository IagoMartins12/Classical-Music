import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// app/api/admin/newsletter/campaigns/route.ts
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const status = searchParams.get('status');

    // Construir filtros
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    // Buscar campanhas
    const [campaigns, total] = await Promise.all([
      prisma.newsletterCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              type: true,
            },
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
      }),
      prisma.newsletterCampaign.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        campaigns: campaigns.map((campaign) => ({
          ...campaign,
          scheduledAt: campaign.scheduledAt?.toISOString() || null,
          sentAt: campaign.sentAt?.toISOString() || null,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
          lastEditedAt: campaign.lastEditedAt?.toISOString() || null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      subject,
      templateId,
      targetSegments,
      scheduledAt,
      senderName,
      senderEmail,
      replyToEmail,
    } = body;

    // Validações básicas
    if (!name || !subject || !templateId) {
      return NextResponse.json(
        { success: false, error: 'Nome, assunto e template são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se template existe
    const template = await prisma.newsletterTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    // Criar campanha
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        name,
        subject,
        templateId,
        targetSegments: targetSegments || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        senderName: senderName || 'Classical Hub',
        senderEmail: senderEmail || 'noreply@classicalhub.com',
        replyToEmail: replyToEmail || null,
        createdBy: session.user.id,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        scheduledAt: campaign.scheduledAt?.toISOString() || null,
        sentAt: campaign.sentAt?.toISOString() || null,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao criar campanha:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
