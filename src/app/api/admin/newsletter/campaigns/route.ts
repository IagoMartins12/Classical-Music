// app/api/admin/newsletter/campaigns/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { getEmailTemplateSync } from '@/app/libs/newsletter/emailTemplates';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

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
      templateType,
      targetSegments,
      scheduledAt,
      senderName,
      senderEmail,
      replyToEmail,
      customContent,
      customSubject,
      status = 'DRAFT',
    } = body;

    // Validação básica
    if (!name || !subject) {
      return NextResponse.json(
        { success: false, error: 'Nome e assunto são obrigatórios' },
        { status: 400 }
      );
    }

    const language = await getServerLanguageStatic();

    // Validação do template
    let finalTemplateId = templateId;
    let useBuiltInTemplate = false;

    if (!templateId && templateType) {
      // Usando template built-in
      const builtInTemplate = getEmailTemplateSync(templateType, language);
      if (!builtInTemplate) {
        return NextResponse.json(
          { success: false, error: 'Template built-in não encontrado' },
          { status: 400 }
        );
      }
      useBuiltInTemplate = true;

      // Criar um template temporário no banco para manter a relação
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
        },
      });
      finalTemplateId = tempTemplate.id;
    } else if (templateId) {
      // Verificar se template personalizado existe
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

    // 🆕 CRIAR CAMPANHA COM RELAÇÃO CORRETA
    const campaignData: any = {
      name,
      subject,
      targetSegments: targetSegments || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      senderName: senderName || 'Opus Atlas',
      senderEmail: senderEmail || 'noreply@opusatlas.com',
      replyToEmail: replyToEmail || null,
      status: status,
      // 🆕 CAMPOS ADICIONAIS
      templateType: useBuiltInTemplate ? templateType : null,
      useCustomTemplate: !!templateId,
      customSubject: customSubject || null,
    };

    // 🆕 USAR RELAÇÃO TEMPLATE EM VEZ DE templateId
    if (finalTemplateId) {
      campaignData.template = {
        connect: { id: finalTemplateId },
      };
    }

    // Adicionar conteúdo customizado se fornecido
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
        // Informação adicional
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
