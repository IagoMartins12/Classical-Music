// app/api/admin/newsletter/campaigns/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { getEmailTemplate } from '@/app/libs/newsletter/emailTemplates';

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
      templateType, // 🆕 NOVO: Tipo do template built-in
      targetSegments,
      scheduledAt,
      senderName,
      senderEmail,
      replyToEmail,
      customContent, // 🆕 NOVO: Conteúdo customizado
      status = 'DRAFT',
    } = body;

    // 🆕 VALIDAÇÃO MELHORADA: Aceitar templateType OU templateId
    if (!name || !subject) {
      return NextResponse.json(
        { success: false, error: 'Nome e assunto são obrigatórios' },
        { status: 400 }
      );
    }

    // 🆕 VALIDAÇÃO DO TEMPLATE
    let finalTemplateId = templateId;
    let useBuiltInTemplate = false;

    if (!templateId && templateType) {
      // Usando template built-in
      const builtInTemplate = getEmailTemplate(templateType);
      if (!builtInTemplate) {
        return NextResponse.json(
          { success: false, error: 'Template built-in não encontrado' },
          { status: 400 }
        );
      }
      useBuiltInTemplate = true;

      // 🆕 CRIAR UM TEMPLATE TEMPORÁRIO NO BANCO PARA MANTER A RELAÇÃO
      const tempTemplate = await prisma.newsletterTemplate.create({
        data: {
          name: `Built-in: ${builtInTemplate.description}`,
          type: templateType as any,
          subject: builtInTemplate.subject,
          htmlContent: builtInTemplate.htmlContent,
          textContent: builtInTemplate.textContent,
          variables: builtInTemplate.variables,
          description: `Template built-in: ${builtInTemplate.description}`,
          isActive: true,
          isDefault: false,
          createdBy: session.user.id,
        },
      });
      finalTemplateId = tempTemplate.id;
    } else if (templateId) {
      // Usando template personalizado - verificar se existe
      const template = await prisma.newsletterTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template personalizado não encontrado' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Template ou tipo de template é obrigatório' },
        { status: 400 }
      );
    }

    // 🆕 CRIAR CAMPANHA COM DADOS CORRETOS
    const campaignData: any = {
      name,
      subject,
      templateId: finalTemplateId,
      targetSegments: targetSegments || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      senderName: senderName || 'Opus Atlas',
      senderEmail: senderEmail || 'noreply@classicalhub.com',
      replyToEmail: replyToEmail || null,
      createdBy: session.user.id,
      status: status,
    };

    // 🆕 ADICIONAR CONTEÚDO CUSTOMIZADO SE FORNECIDO
    if (customContent && templateType === 'CAMPAIGN_CUSTOM') {
      campaignData.customHtmlContent = customContent;
    }

    const campaign = await prisma.newsletterCampaign.create({
      data: campaignData,
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
        // 🆕 ADICIONAR INFORMAÇÃO SE É TEMPLATE BUILT-IN
        isBuiltInTemplate: useBuiltInTemplate,
        templateType: useBuiltInTemplate ? templateType : null,
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
