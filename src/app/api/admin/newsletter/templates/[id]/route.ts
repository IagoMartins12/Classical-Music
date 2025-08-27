// app/api/admin/newsletter/templates/[id]/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { extractVariables } from '@/app/libs/newsletter/emailTemplates';
interface Params {
  id: string;
}
// GET - Buscar template específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do template é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar template
    const template = await prisma.newsletterTemplate.findUnique({
      where: { id },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Últimas 10 campanhas que usaram este template
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        lastEditedAt: template.lastEditedAt?.toISOString() || null,
        campaigns: template.campaigns.map((campaign) => ({
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar template:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do template é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se template existe
    const existingTemplate = await prisma.newsletterTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados de atualização
    const updateData: any = {
      lastEditedAt: new Date(),
    };

    // Campos que podem ser atualizados
    const allowedFields = [
      'name',
      'type',
      'subject',
      'htmlContent',
      'textContent',
      'description',
      'senderName',
      'senderEmail',
      'replyToEmail',
      'isActive',
      'isDefault',
      'variables',
    ];

    // Validações específicas
    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json(
          { success: false, error: 'Nome é obrigatório' },
          { status: 400 }
        );
      }

      // Verificar se nome já existe (exceto para o próprio template)
      const nameExists = await prisma.newsletterTemplate.findFirst({
        where: {
          name: body.name.trim(),
          id: { not: id },
        },
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Já existe um template com este nome' },
          { status: 409 }
        );
      }

      updateData.name = body.name.trim();
    }

    if (body.subject !== undefined) {
      if (!body.subject.trim()) {
        return NextResponse.json(
          { success: false, error: 'Assunto é obrigatório' },
          { status: 400 }
        );
      }
      updateData.subject = body.subject.trim();
    }

    if (body.htmlContent !== undefined) {
      if (!body.htmlContent.trim()) {
        return NextResponse.json(
          { success: false, error: 'Conteúdo HTML é obrigatório' },
          { status: 400 }
        );
      }
      updateData.htmlContent = body.htmlContent.trim();
    }

    if (body.textContent !== undefined) {
      updateData.textContent =
        body.textContent.trim() ||
        updateData.htmlContent?.replace(/<[^>]*>/g, '').trim() ||
        existingTemplate.textContent;
    }

    // Validar emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (body.senderEmail !== undefined) {
      if (!emailRegex.test(body.senderEmail)) {
        return NextResponse.json(
          { success: false, error: 'Email do remetente inválido' },
          { status: 400 }
        );
      }
      updateData.senderEmail = body.senderEmail.trim();
    }

    if (body.replyToEmail !== undefined) {
      if (body.replyToEmail && !emailRegex.test(body.replyToEmail)) {
        return NextResponse.json(
          { success: false, error: 'Email de resposta inválido' },
          { status: 400 }
        );
      }
      updateData.replyToEmail = body.replyToEmail?.trim() || null;
    }

    // Outros campos simples
    allowedFields.forEach((field) => {
      if (
        body[field] !== undefined &&
        ![
          'name',
          'subject',
          'htmlContent',
          'textContent',
          'senderEmail',
          'replyToEmail',
        ].includes(field)
      ) {
        updateData[field] = body[field];
      }
    });

    // Auto-extrair variáveis se conteúdo foi alterado
    if (
      updateData.htmlContent ||
      updateData.textContent ||
      updateData.subject
    ) {
      const htmlContent =
        updateData.htmlContent || existingTemplate.htmlContent;
      const textContent =
        updateData.textContent || existingTemplate.textContent;
      const subject = updateData.subject || existingTemplate.subject;

      const allContent = `${htmlContent} ${textContent} ${subject}`;
      const extractedVariables = extractVariables(allContent);
      updateData.variables = body.variables || extractedVariables;
    }

    // Se isDefault for true, desmarcar outros templates padrão do mesmo tipo
    if (updateData.isDefault === true) {
      const templateType = updateData.type || existingTemplate.type;
      await prisma.newsletterTemplate.updateMany({
        where: {
          type: templateType,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Atualizar template
    const updatedTemplate = await prisma.newsletterTemplate.update({
      where: { id },
      data: updateData,
      include: {},
    });

    return NextResponse.json({
      success: true,
      message: 'Template atualizado com sucesso!',
      template: {
        ...updatedTemplate,
        createdAt: updatedTemplate.createdAt.toISOString(),
        updatedAt: updatedTemplate.updatedAt.toISOString(),
        lastEditedAt: updatedTemplate.lastEditedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar template:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar template específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do template é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se template existe e se está sendo usado
    const template = await prisma.newsletterTemplate.findUnique({
      where: { id },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se template está sendo usado em campanhas ativas
    const activeCampaigns = template.campaigns.filter(
      (campaign) =>
        campaign.status !== 'CANCELLED' && campaign.status !== 'FAILED'
    );

    if (activeCampaigns.length > 0) {
      const campaignNames = activeCampaigns.map((c) => c.name).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: `Não é possível deletar template em uso pelas campanhas: ${campaignNames}`,
          campaignsInUse: activeCampaigns,
        },
        { status: 400 }
      );
    }

    // Deletar template
    await prisma.newsletterTemplate.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Template deletado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao deletar template:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
