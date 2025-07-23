import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// app/api/admin/newsletter/templates/route.ts
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
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    // Construir filtros
    const where: any = {};
    if (type && type !== 'all') {
      where.type = type;
    }
    if (isActive !== null && isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    // Buscar templates
    const templates = await prisma.newsletterTemplate.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      include: {
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
      templates: templates.map((template) => ({
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        lastEditedAt: template.lastEditedAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);

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
      type,
      subject,
      htmlContent,
      textContent,
      description,
      isDefault,
      senderName,
      senderEmail,
      replyToEmail,
    } = body;

    // Validações básicas
    if (!name || !type || !subject || !htmlContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nome, tipo, assunto e conteúdo HTML são obrigatórios',
        },
        { status: 400 }
      );
    }

    // Se está marcando como padrão, desmarcar outros do mesmo tipo
    if (isDefault) {
      await prisma.newsletterTemplate.updateMany({
        where: {
          type: type as any,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Criar template
    const template = await prisma.newsletterTemplate.create({
      data: {
        name,
        type: type as any,
        subject,
        htmlContent,
        textContent: textContent || '',
        description,
        isDefault: isDefault || false,
        senderName: senderName || 'Opus Atlas',
        senderEmail: senderEmail || 'noreply@classicalhub.com',
        replyToEmail,
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
      },
    });

    return NextResponse.json({
      success: true,
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
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
