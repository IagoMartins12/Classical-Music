// app/api/annotations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      workId,
      title,
      content,
      category = 'GENERAL',
      scope = 'ENTIRE_WORK',
      measureStart,
      measureEnd,
      movement,
      section,
      pageNumber,
      hand,
      voice,
      instrument,
      difficulty = 'ALL_LEVELS',
      tags = [],
      isPublic = true,
    } = body;

    // Validações
    if (!workId || !title || !content) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: workId, title, content' },
        { status: 400 }
      );
    }

    if (title.length < 3 || title.length > 100) {
      return NextResponse.json(
        { error: 'Título deve ter entre 3 e 100 caracteres' },
        { status: 400 }
      );
    }

    if (content.length < 10 || content.length > 2000) {
      return NextResponse.json(
        { error: 'Conteúdo deve ter entre 10 e 2000 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se a obra existe
    const workExists = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true, title: true },
    });

    if (!workExists) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Criar anotação
    const annotation = await prisma.workAnnotation.create({
      data: {
        userId: session.user.id,
        workId,
        title: title.trim(),
        content: content.trim(),
        category,
        scope,
        measureStart,
        measureEnd,
        movement: movement?.trim(),
        section: section?.trim(),
        pageNumber,
        hand,
        voice,
        instrument: instrument?.trim(),
        difficulty,
        tags: tags.filter((tag: string) => tag.trim().length > 0),
        isPublic,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            image: true,
            userType: true,
            experienceLevel: true,
          },
        },
        work: {
          select: {
            id: true,
            title: true,
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
        _count: {
          select: {
            helpfulVotes: true,
            replies: true,
          },
        },
      },
    });

    // Atualizar contador de anotações da obra e do usuário
    await Promise.all([
      prisma.work.update({
        where: { id: workId },
        data: {
          annotationsCount: { increment: 1 },
          lastAnnotationAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalAnnotationsCount: { increment: 1 },
        },
      }),
    ]);

    // Invalidar caches
    revalidateTag(`work-annotations-${workId}`);
    revalidateTag(`user-annotations-${session.user.id}`);
    revalidateTag('annotations-popular');
    revalidateTag('annotation-stats');

    return NextResponse.json({
      success: true,
      annotation: {
        id: annotation.id,
        userId: annotation.userId,
        workId: annotation.workId,
        title: annotation.title,
        content: annotation.content,
        category: annotation.category,
        scope: annotation.scope,
        measureStart: annotation.measureStart,
        measureEnd: annotation.measureEnd,
        movement: annotation.movement,
        section: annotation.section,
        pageNumber: annotation.pageNumber,
        hand: annotation.hand,
        voice: annotation.voice,
        instrument: annotation.instrument,
        difficulty: annotation.difficulty,
        tags: annotation.tags,
        isPublic: annotation.isPublic,
        isVerified: annotation.isVerified,
        helpfulCount: annotation.helpfulCount,
        viewCount: annotation.viewCount,
        createdAt: annotation.createdAt.toISOString(),
        updatedAt: annotation.updatedAt.toISOString(),
        user: annotation.user,
        work: annotation.work,
        _count: annotation._count,
      },
    });
  } catch (error) {
    console.error('Erro ao criar anotação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const scope = searchParams.get('scope');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const sortBy = searchParams.get('sortBy') || 'helpful'; // helpful, recent, oldest
    const search = searchParams.get('search');

    // Construir filtros
    const where: any = {
      isPublic: true,
    };

    if (workId) where.workId = workId;
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (scope) where.scope = scope;
    if (userId) where.userId = userId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // Construir ordenação
    let orderBy: any = {};
    switch (sortBy) {
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'helpful':
      default:
        orderBy = [{ helpfulCount: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    // Buscar anotações com paginação
    const [annotations, totalCount] = await Promise.all([
      prisma.workAnnotation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              image: true,
              userType: true,
              experienceLevel: true,
            },
          },
          work: {
            select: {
              id: true,
              title: true,
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
            },
          },
          _count: {
            select: {
              helpfulVotes: true,
              replies: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.workAnnotation.count({ where }),
    ]);

    // Incrementar view count para as anotações visualizadas
    if (annotations.length > 0) {
      await prisma.workAnnotation.updateMany({
        where: {
          id: { in: annotations.map((a) => a.id) },
        },
        data: {
          viewCount: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      annotations: annotations.map((annotation) => ({
        id: annotation.id,
        userId: annotation.userId,
        workId: annotation.workId,
        title: annotation.title,
        content: annotation.content,
        category: annotation.category,
        scope: annotation.scope,
        measureStart: annotation.measureStart,
        measureEnd: annotation.measureEnd,
        movement: annotation.movement,
        section: annotation.section,
        pageNumber: annotation.pageNumber,
        hand: annotation.hand,
        voice: annotation.voice,
        instrument: annotation.instrument,
        difficulty: annotation.difficulty,
        tags: annotation.tags,
        isPublic: annotation.isPublic,
        isVerified: annotation.isVerified,
        helpfulCount: annotation.helpfulCount,
        viewCount: annotation.viewCount + 1, // Incluir o incremento
        createdAt: annotation.createdAt.toISOString(),
        updatedAt: annotation.updatedAt.toISOString(),
        user: annotation.user,
        work: annotation.work,
        _count: annotation._count,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar anotações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// app/api/annotations/[annotationId]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { annotationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { annotationId } = params;
    const body = await request.json();

    // Verificar se a anotação existe e pertence ao usuário
    const existingAnnotation = await prisma.workAnnotation.findFirst({
      where: {
        id: annotationId,
        userId: session.user.id,
      },
    });

    if (!existingAnnotation) {
      return NextResponse.json(
        { error: 'Anotação não encontrada ou sem permissão' },
        { status: 404 }
      );
    }

    // Atualizar apenas campos permitidos
    const allowedFields = [
      'title',
      'content',
      'category',
      'scope',
      'measureStart',
      'measureEnd',
      'movement',
      'section',
      'pageNumber',
      'hand',
      'voice',
      'instrument',
      'difficulty',
      'tags',
      'isPublic',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedAnnotation = await prisma.workAnnotation.update({
      where: { id: annotationId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            image: true,
            userType: true,
            experienceLevel: true,
          },
        },
        work: {
          select: {
            id: true,
            title: true,
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
        _count: {
          select: {
            helpfulVotes: true,
            replies: true,
          },
        },
      },
    });

    // Invalidar caches
    revalidateTag(`work-annotations-${updatedAnnotation.workId}`);
    revalidateTag(`user-annotations-${session.user.id}`);

    return NextResponse.json({
      success: true,
      annotation: {
        id: updatedAnnotation.id,
        userId: updatedAnnotation.userId,
        workId: updatedAnnotation.workId,
        title: updatedAnnotation.title,
        content: updatedAnnotation.content,
        category: updatedAnnotation.category,
        scope: updatedAnnotation.scope,
        measureStart: updatedAnnotation.measureStart,
        measureEnd: updatedAnnotation.measureEnd,
        movement: updatedAnnotation.movement,
        section: updatedAnnotation.section,
        pageNumber: updatedAnnotation.pageNumber,
        hand: updatedAnnotation.hand,
        voice: updatedAnnotation.voice,
        instrument: updatedAnnotation.instrument,
        difficulty: updatedAnnotation.difficulty,
        tags: updatedAnnotation.tags,
        isPublic: updatedAnnotation.isPublic,
        isVerified: updatedAnnotation.isVerified,
        helpfulCount: updatedAnnotation.helpfulCount,
        viewCount: updatedAnnotation.viewCount,
        createdAt: updatedAnnotation.createdAt.toISOString(),
        updatedAt: updatedAnnotation.updatedAt.toISOString(),
        user: updatedAnnotation.user,
        work: updatedAnnotation.work,
        _count: updatedAnnotation._count,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar anotação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { annotationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { annotationId } = params;

    // Verificar se a anotação existe e pertence ao usuário
    const existingAnnotation = await prisma.workAnnotation.findFirst({
      where: {
        id: annotationId,
        userId: session.user.id,
      },
    });

    if (!existingAnnotation) {
      return NextResponse.json(
        { error: 'Anotação não encontrada ou sem permissão' },
        { status: 404 }
      );
    }

    // Deletar anotação (cascade deletará votos e respostas)
    await prisma.workAnnotation.delete({
      where: { id: annotationId },
    });

    // Atualizar contadores
    await Promise.all([
      prisma.work.update({
        where: { id: existingAnnotation.workId },
        data: {
          annotationsCount: { decrement: 1 },
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalAnnotationsCount: { decrement: 1 },
        },
      }),
    ]);

    // Invalidar caches
    revalidateTag(`work-annotations-${existingAnnotation.workId}`);
    revalidateTag(`user-annotations-${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar anotação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
