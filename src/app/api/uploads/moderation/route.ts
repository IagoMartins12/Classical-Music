// app/api/uploads/moderation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'pending';

    const offset = (page - 1) * limit;

    const [moderations, totalCount] = await Promise.all([
      prisma.uploadModeration.findMany({
        where: { status },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          moderator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.uploadModeration.count({
        where: { status },
      }),
    ]);

    // Buscar detalhes das entidades reportadas
    const enrichedModerations = await Promise.all(
      moderations.map(async (moderation) => {
        let entityDetails = null;

        try {
          switch (moderation.entityType) {
            case 'composer':
              entityDetails = await prisma.composer.findUnique({
                where: { id: moderation.entityId },
                select: {
                  id: true,
                  name: true,
                  fullName: true,
                  portraitUrl: true,
                  createdBy: true,
                  createdAt: true,
                },
              });
              break;
            case 'work':
              entityDetails = await prisma.work.findUnique({
                where: { id: moderation.entityId },
                select: {
                  id: true,
                  title: true,
                  composer: { select: { name: true } },
                  createdBy: true,
                  createdAt: true,
                },
              });
              break;
            case 'score':
              entityDetails = await prisma.workScore.findUnique({
                where: { id: moderation.entityId },
                select: {
                  id: true,
                  title: true,
                  work: {
                    select: {
                      title: true,
                      composer: { select: { name: true } },
                    },
                  },
                  uploadedBy: true,
                  createdAt: true,
                },
              });
              break;
          }
        } catch (error) {
          console.error(
            `Erro ao buscar entidade ${moderation.entityType}:${moderation.entityId}`,
            error
          );
        }

        return {
          ...moderation,
          entityDetails,
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      moderations: enrichedModerations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar moderações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { moderationId, action, notes } = await request.json();

    if (!moderationId || !action) {
      return NextResponse.json(
        {
          error: 'Parâmetros obrigatórios: moderationId, action',
        },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    // Buscar moderação
    const moderation = await prisma.uploadModeration.findUnique({
      where: { id: moderationId },
    });

    if (!moderation) {
      return NextResponse.json(
        { error: 'Moderação não encontrada' },
        { status: 404 }
      );
    }

    if (moderation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Moderação já foi processada' },
        { status: 400 }
      );
    }

    // Processar ação
    if (action === 'delete') {
      // Deletar a entidade reportada
      try {
        switch (moderation.entityType) {
          case 'composer':
            await prisma.composer.delete({
              where: { id: moderation.entityId },
            });
            break;
          case 'work':
            await prisma.work.delete({
              where: { id: moderation.entityId },
            });
            break;
          case 'score':
            await prisma.workScore.delete({
              where: { id: moderation.entityId },
            });
            break;
        }
      } catch (error) {
        console.error('Erro ao deletar entidade:', error);
        return NextResponse.json(
          { error: 'Erro ao deletar item' },
          { status: 500 }
        );
      }
    }

    // Atualizar moderação
    const updatedModeration = await prisma.uploadModeration.update({
      where: { id: moderationId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        moderatedBy: session.user.id,
        moderationNotes: notes,
        resolution: action === 'delete' ? 'deleted' : action,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      moderation: updatedModeration,
      message: 'Moderação processada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao processar moderação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
