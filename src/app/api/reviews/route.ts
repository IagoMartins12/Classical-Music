// app/api/reviews/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface ReviewData {
  id: string;
  rating: number;
  comment?: string;
  isPublic: boolean;

  // Avaliações específicas
  teachingQuality?: number;
  communication?: number;
  punctuality?: number;
  preparation?: number;
  patience?: number;
  motivation?: number;

  // Contexto
  relationshipDuration?: string;
  lessonsCount?: number;
  wouldRecommend: boolean;

  // Dados do avaliado e avaliador
  teacher: {
    id: string;
    name: string;
    image?: string;
  };
  student: {
    id: string;
    name: string;
    image?: string;
  };

  // Moderação
  isModerated: boolean;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationNote?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// GET - Listar reviews
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const teacherUserId = searchParams.get('teacherUserId'); // Para buscar reviews de um professor
    const studentUserId = searchParams.get('studentUserId'); // Para buscar reviews de um aluno
    const isPublic = searchParams.get('public') === 'true'; // Apenas reviews públicos
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeModerated = searchParams.get('includeModerated') === 'true';

    // Se não logado, só pode ver reviews públicos
    if (!session?.user?.id && !isPublic) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    console.log(
      `⭐ [REVIEWS] Buscando reviews - Teacher: ${teacherUserId}, Student: ${studentUserId}, Public: ${isPublic}`
    );

    // Montar where clause
    let whereClause: any = {};

    // Filtro por professor
    if (teacherUserId) {
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId: teacherUserId },
        select: { id: true },
      });

      if (teacherProfile) {
        whereClause.teacherId = teacherProfile.id;
      } else {
        return NextResponse.json(
          {
            error: 'Professor não encontrado',
          },
          { status: 404 }
        );
      }
    }

    // Filtro por aluno
    if (studentUserId) {
      const studentProfile = await prisma.student.findUnique({
        where: { userId: studentUserId },
        select: { id: true },
      });

      if (studentProfile) {
        whereClause.studentId = studentProfile.id;
      } else {
        return NextResponse.json(
          {
            error: 'Aluno não encontrado',
          },
          { status: 404 }
        );
      }
    }

    // Filtros de visibilidade
    if (isPublic || !session?.user?.id) {
      whereClause.isPublic = true;

      if (!includeModerated) {
        whereClause.isModerated = false;
      }
    } else if (session.user.role === 0) {
      // Aluno: só pode ver suas próprias reviews ou reviews públicos
      const studentProfile = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      whereClause.OR = [{ isPublic: true }, { studentId: studentProfile?.id }];
    } else if (session.user.role === 1) {
      // Professor: pode ver reviews sobre si ou reviews públicos
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      whereClause.OR = [{ isPublic: true }, { teacherId: teacherProfile?.id }];
    } else if (session.user.role === 2) {
      // Admin: pode ver todos
      // whereClause já está correto
    } else {
      // Outros roles: apenas públicos
      whereClause.isPublic = true;
    }

    // Buscar reviews
    const [reviews, totalCount] = await Promise.all([
      prisma.teacherReview.findMany({
        where: whereClause,
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  image: true,
                },
              },
            },
          },
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.teacherReview.count({ where: whereClause }),
    ]);

    // Formatar reviews
    const reviewsFormatted: ReviewData[] = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment || undefined,
      isPublic: review.isPublic,
      teachingQuality: review.teachingQuality || undefined,
      communication: review.communication || undefined,
      punctuality: review.punctuality || undefined,
      preparation: review.preparation || undefined,
      patience: review.patience || undefined,
      motivation: review.motivation || undefined,
      relationshipDuration: review.relationshipDuration || undefined,
      lessonsCount: review.lessonsCount || undefined,
      wouldRecommend: review.wouldRecommend,
      teacher: {
        id: review.teacher.user.id,
        name: `${review.teacher.user.firstName} ${review.teacher.user.lastName}`.trim(),
        image: review.teacher.user.image || undefined,
      },
      student: {
        id: review.student.user.id,
        name: isPublic
          ? `${review.student.user.firstName?.charAt(0)}${'*'.repeat(
              Math.max(2, review.student.user?.firstName?.length ?? 0 - 1)
            )}` // Anonimizar em reviews públicos
          : `${review.student.user.firstName} ${review.student.user.lastName}`.trim(),
        image: isPublic ? undefined : review.student.user.image || undefined,
      },
      isModerated: review.isModerated,
      moderatedBy: review.moderatedBy || undefined,
      moderatedAt: review.moderatedAt || undefined,
      moderationNote: review.moderationNote || undefined,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    console.log(`✅ [REVIEWS] Retornando ${reviewsFormatted.length} reviews`);

    return NextResponse.json({
      success: true,
      reviews: reviewsFormatted,
      pagination: {
        offset,
        limit,
        total: totalCount,
        hasMore: offset + reviewsFormatted.length < totalCount,
      },
    });
  } catch (error) {
    console.error('❌ [REVIEWS] Erro ao buscar reviews:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova review (apenas aluno)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 0) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas alunos podem criar reviews' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      teacherUserId,
      rating,
      comment,
      isPublic = true,
      teachingQuality,
      communication,
      punctuality,
      preparation,
      patience,
      motivation,
      relationshipDuration,
      wouldRecommend = true,
    } = body;

    if (!teacherUserId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          error: 'teacherUserId e rating (1-5) são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log(
      `⭐➕ [REVIEWS] Criando review do professor ${teacherUserId} pelo aluno ${session.user.id}`
    );

    // Verificar se aluno existe
    const studentProfile = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Perfil de aluno não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se professor existe e está vinculado ao aluno
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: teacherUserId },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: 'Professor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se há relacionamento ativo ou passado
    const relationship = await prisma.teacherStudent.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: teacherProfile.id,
          studentId: studentProfile.id,
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        {
          error: 'Você não tem/teve aulas com este professor',
        },
        { status: 403 }
      );
    }

    // Verificar se já existe review
    const existingReview = await prisma.teacherReview.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: teacherProfile.id,
          studentId: studentProfile.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          error: 'Você já avaliou este professor. Use PATCH para atualizar.',
        },
        { status: 409 }
      );
    }

    // Contar total de aulas com este professor
    const lessonsCount = await prisma.lesson.count({
      where: {
        teacherId: teacherProfile.id,
        studentId: studentProfile.id,
      },
    });

    // Criar review
    const review = await prisma.teacherReview.create({
      data: {
        teacherId: teacherProfile.id,
        studentId: studentProfile.id,
        rating,
        comment,
        isPublic,
        teachingQuality,
        communication,
        punctuality,
        preparation,
        patience,
        motivation,
        relationshipDuration,
        lessonsCount,
        wouldRecommend,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Atualizar estatísticas do professor
    const teacherStats = await prisma.teacherReview.aggregate({
      where: { teacherId: teacherProfile.id },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.teacher.update({
      where: { id: teacherProfile.id },
      data: {
        averageRating: teacherStats._avg.rating || 0,
        totalReviews: teacherStats._count.id,
      },
    });

    console.log(`✅ [REVIEWS] Review criada: ${review.id}`);

    return NextResponse.json({
      success: true,
      review,
      message: 'Avaliação criada com sucesso',
    });
  } catch (error) {
    console.error('❌ [REVIEWS] Erro ao criar review:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar review (aluno) ou moderar (admin)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 0 && session.user.role !== 2)
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { reviewId, moderationAction, ...updateData } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `⭐✏️ [REVIEWS] Atualizando review ${reviewId} - Role: ${session.user.role}`
    );

    // Buscar review
    const review = await prisma.teacherReview.findUnique({
      where: { id: reviewId },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review não encontrada' },
        { status: 404 }
      );
    }

    let finalUpdateData: any = {};

    if (session.user.role === 0) {
      // Aluno: só pode atualizar própria review
      if (review.student.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Você só pode atualizar suas próprias avaliações' },
          { status: 403 }
        );
      }

      // Campos que aluno pode atualizar
      const allowedFields = [
        'rating',
        'comment',
        'isPublic',
        'teachingQuality',
        'communication',
        'punctuality',
        'preparation',
        'patience',
        'motivation',
        'wouldRecommend',
      ];

      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
          finalUpdateData[key] = updateData[key];
        }
      });
    } else if (session.user.role === 2) {
      // Admin: pode moderar
      if (moderationAction) {
        switch (moderationAction) {
          case 'approve':
            finalUpdateData.isModerated = false;
            finalUpdateData.moderatedBy = session.user.id;
            finalUpdateData.moderatedAt = new Date();
            finalUpdateData.moderationNote =
              updateData.moderationNote || 'Aprovado pela moderação';
            break;
          case 'hide':
            finalUpdateData.isPublic = false;
            finalUpdateData.isModerated = true;
            finalUpdateData.moderatedBy = session.user.id;
            finalUpdateData.moderatedAt = new Date();
            finalUpdateData.moderationNote =
              updateData.moderationNote || 'Ocultado pela moderação';
            break;
          case 'flag':
            finalUpdateData.isModerated = true;
            finalUpdateData.moderatedBy = session.user.id;
            finalUpdateData.moderatedAt = new Date();
            finalUpdateData.moderationNote =
              updateData.moderationNote || 'Sinalizado para revisão';
            break;
        }
      } else {
        // Admin pode atualizar qualquer campo
        finalUpdateData = { ...updateData };
      }
    }

    if (Object.keys(finalUpdateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo válido para atualizar' },
        { status: 400 }
      );
    }

    // Atualizar review
    const updatedReview = await prisma.teacherReview.update({
      where: { id: reviewId },
      data: finalUpdateData,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Se rating mudou, atualizar estatísticas do professor
    if (finalUpdateData.rating) {
      const teacherStats = await prisma.teacherReview.aggregate({
        where: { teacherId: review.teacherId },
        _avg: { rating: true },
        _count: { id: true },
      });

      await prisma.teacher.update({
        where: { id: review.teacherId },
        data: {
          averageRating: teacherStats._avg.rating || 0,
          totalReviews: teacherStats._count.id,
        },
      });
    }

    console.log(`✅ [REVIEWS] Review ${reviewId} atualizada`);

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message:
        session.user.role === 2
          ? 'Review moderada com sucesso'
          : 'Avaliação atualizada com sucesso',
    });
  } catch (error) {
    console.error('❌ [REVIEWS] Erro ao atualizar review:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar review (aluno próprio ou admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 0 && session.user.role !== 2)
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`⭐❌ [REVIEWS] Deletando review ${reviewId}`);

    // Buscar review
    const review = await prisma.teacherReview.findUnique({
      where: { id: reviewId },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if (session.user.role === 0 && review.student.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: 'Você só pode deletar suas próprias avaliações',
        },
        { status: 403 }
      );
    }

    // Deletar review
    await prisma.teacherReview.delete({
      where: { id: reviewId },
    });

    // Atualizar estatísticas do professor
    const teacherStats = await prisma.teacherReview.aggregate({
      where: { teacherId: review.teacherId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.teacher.update({
      where: { id: review.teacherId },
      data: {
        averageRating: teacherStats._avg.rating || 0,
        totalReviews: teacherStats._count.id,
      },
    });

    console.log(`✅ [REVIEWS] Review ${reviewId} deletada`);

    return NextResponse.json({
      success: true,
      message: 'Avaliação deletada com sucesso',
    });
  } catch (error) {
    console.error('❌ [REVIEWS] Erro ao deletar review:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
