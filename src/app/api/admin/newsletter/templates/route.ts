// app/api/admin/newsletter/templates/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { extractVariables } from '@/app/libs/newsletter/emailTemplates';

// GET - Listar todos os templates
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
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Construir filtros
    const where: any = {};

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { subject: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      } else if (status === 'default') {
        where.isDefault = true;
      }
    }

    // Buscar templates
    const templates = await prisma.newsletterTemplate.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' }, // Templates padrão primeiro
        { isActive: 'desc' }, // Templates ativos primeiro
        { createdAt: 'desc' }, // Mais recentes primeiro
      ],
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        editor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    // Formatar dados para resposta
    const formattedTemplates = templates.map((template) => ({
      ...template,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      lastEditedAt: template.lastEditedAt?.toISOString() || null,
    }));

    return NextResponse.json({
      success: true,
      templates: formattedTemplates,
      total: templates.length,
    });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo template
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
      type,
      subject,
      htmlContent,
      textContent,
      description,
      senderName = 'Opus Atlas',
      senderEmail = 'noreply@classicalhub.com',
      replyToEmail,
      isActive = true,
      isDefault = false,
      variables: providedVariables,
    } = body;

    // Validações básicas
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Tipo é obrigatório' },
        { status: 400 }
      );
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { success: false, error: 'Assunto é obrigatório' },
        { status: 400 }
      );
    }

    if (!htmlContent || !htmlContent.trim()) {
      return NextResponse.json(
        { success: false, error: 'Conteúdo HTML é obrigatório' },
        { status: 400 }
      );
    }

    // Validar email do remetente
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return NextResponse.json(
        { success: false, error: 'Email do remetente inválido' },
        { status: 400 }
      );
    }

    if (replyToEmail && !emailRegex.test(replyToEmail)) {
      return NextResponse.json(
        { success: false, error: 'Email de resposta inválido' },
        { status: 400 }
      );
    }

    // Verificar se nome já existe
    const existingTemplate = await prisma.newsletterTemplate.findFirst({
      where: {
        name: name.trim(),
        createdBy: session.user.id,
      },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Já existe um template com este nome' },
        { status: 409 }
      );
    }

    // Auto-extrair variáveis do conteúdo
    const allContent = `${htmlContent} ${textContent} ${subject}`;
    const extractedVariables = extractVariables(allContent);
    const finalVariables = providedVariables || extractedVariables;

    // Se isDefault for true, desmarcar outros templates padrão do mesmo tipo
    if (isDefault) {
      await prisma.newsletterTemplate.updateMany({
        where: {
          type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Criar template
    const template = await prisma.newsletterTemplate.create({
      data: {
        name: name.trim(),
        type,
        subject: subject.trim(),
        htmlContent: htmlContent.trim(),
        textContent:
          textContent.trim() || htmlContent.replace(/<[^>]*>/g, '').trim(),
        description: description?.trim() || null,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        replyToEmail: replyToEmail?.trim() || null,
        variables: finalVariables,
        isActive,
        isDefault,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Template criado com sucesso!',
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        lastEditedAt: null,
      },
    });
  } catch (error) {
    console.error('Erro ao criar template:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar múltiplos templates
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { templateIds } = body;

    if (
      !templateIds ||
      !Array.isArray(templateIds) ||
      templateIds.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'IDs dos templates são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se templates existem e se podem ser deletados
    const templatesToDelete = await prisma.newsletterTemplate.findMany({
      where: {
        id: { in: templateIds },
      },
      include: {
        campaigns: {
          select: { id: true, name: true },
        },
      },
    });

    if (templatesToDelete.length !== templateIds.length) {
      return NextResponse.json(
        { success: false, error: 'Alguns templates não foram encontrados' },
        { status: 404 }
      );
    }

    // Verificar se algum template está sendo usado em campanhas ativas
    const templatesInUse = templatesToDelete.filter(
      (template) => template.campaigns.length > 0
    );

    if (templatesInUse.length > 0) {
      const campaignNames = templatesInUse
        .flatMap((t) => t.campaigns.map((c) => c.name))
        .join(', ');

      return NextResponse.json(
        {
          success: false,
          error: `Não é possível deletar templates em uso pelas campanhas: ${campaignNames}`,
        },
        { status: 400 }
      );
    }

    // Deletar templates
    const result = await prisma.newsletterTemplate.deleteMany({
      where: {
        id: { in: templateIds },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} template(s) deletado(s) com sucesso!`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Erro ao deletar templates:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
