// app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { entityType, entityId, reason, description } = await request.json();

    // Validar parâmetros
    if (!entityType || !entityId || !reason) {
      return NextResponse.json(
        {
          error: 'Parâmetros obrigatórios: entityType, entityId, reason',
        },
        { status: 400 }
      );
    }

    // Verificar se a entidade existe
    let entity = null;
    switch (entityType) {
      case 'composer':
        entity = await prisma.composer.findUnique({ where: { id: entityId } });
        break;
      case 'work':
        entity = await prisma.work.findUnique({ where: { id: entityId } });
        break;
      case 'score':
        entity = await prisma.workScore.findUnique({ where: { id: entityId } });
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de entidade inválido' },
          { status: 400 }
        );
    }

    if (!entity) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário já reportou este item
    const existingReport = await prisma.uploadModeration.findFirst({
      where: {
        entityType,
        entityId,
        reportedBy: session.user.id,
        status: 'pending',
      },
    });

    if (existingReport) {
      return NextResponse.json(
        {
          error: 'Você já reportou este item. Aguarde a análise.',
        },
        { status: 409 }
      );
    }

    // Criar o report
    const report = await prisma.uploadModeration.create({
      data: {
        entityType,
        entityId,
        reportedBy: session.user.id,
        reason,
        description,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      report,
      message: 'Item reportado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao reportar item:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
