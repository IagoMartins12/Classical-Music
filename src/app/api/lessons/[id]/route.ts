// app/api/lessons/[id]/route.ts - ATUALIZADO COM DELETE

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// Função auxiliar para revalidar cache de lesson details
async function revalidateLessonDetailsData(
  teacherUserId: string,
  studentUserId?: string
) {
  console.log(`🔄 [CACHE] Revalidating lesson details data`);

  // Tags específicas de lessons
  revalidateTag('teacher-lessons-data');
  revalidateTag('teacher-lesson-details-data');
  revalidateTag('teacher-calendar');
  revalidateTag('teacher-calendar-data');
  revalidateTag('teacher-dashboard');
  revalidateTag('teacher-dashboard-data');

  // Tag específica do professor
  revalidateTag(`teacher-${teacherUserId}`);

  // Se tiver studentUserId, revalidar tags do aluno também
  if (studentUserId) {
    revalidateTag('student-lessons');
    revalidateTag('student-dashboard');
    revalidateTag(`student-${studentUserId}`);
  }

  console.log(
    `✅ [CACHE] Lesson details cache revalidated for teacher ${teacherUserId}${
      studentUserId ? ` and student ${studentUserId}` : ''
    }`
  );
}

interface LessonDetails {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: string;
  type: string;
  location?: string;

  // Recorrência
  isRecurring: boolean;
  recurrenceType?: string;
  parentLessonId?: string;
  recurrenceEnd?: Date;

  // Conteúdo da aula
  objectives: string[];
  workScoreIds: string[];
  topics: string[];
  techniques: string[];
  repertoire: string[];
  homework?: string;
  practiceGoals: string[];
  nextLessonPrep?: string;

  // Anotações (baseadas no role do usuário)
  teacherNotes?: string; // Só professor vê
  publicNotes?: string; // Ambos veem
  studentFeedback?: string; // Ambos veem
  lessonSummary?: string; // Ambos veem

  // Avaliação e progresso
  studentProgress?: any;
  skillsWorked: string[];
  improvements: string[];
  challenges: string[];

  // Presença e participação
  studentPresent?: boolean;
  punctuality?: string;
  engagement?: number;
  preparation?: number;

  // Dados do professor e aluno
  teacher: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  student: {
    id: string;
    name: string;
    email: string;
    image?: string;
    level: string;
  };

  // Informações contextuais
  relationship: {
    totalLessons: number;
    completedLessons: number;
    relationshipDuration: string;
  };

  // WorkScores relacionados (se houver)
  workScores?: Array<{
    id: string;
    title: string;
    composer: string;
    workTitle: string;
    type: string;
    downloadUrl?: string;
  }>;

  // Assignments relacionados
  assignments?: Array<{
    id: string;
    title: string;
    description: string;
    dueDate?: Date;
    status: string;
    isCompleted: boolean;
  }>;

  // Aulas relacionadas (série/recorrência)
  relatedLessons?: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    status: string;
  }>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Permissões baseadas no role
  permissions: {
    canEdit: boolean;
    canCancel: boolean;
    canReschedule: boolean;
    canViewTeacherNotes: boolean;
    canAddFeedback: boolean;
    canMarkAttendance: boolean;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 1 && session.user.role !== 0)
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const lessonId = params.id;

    if (!lessonId) {
      return NextResponse.json(
        { error: 'ID da aula é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `🔍 [LESSON-DETAILS] Buscando detalhes da aula ${lessonId} para usuário ${session.user.id}`
    );

    // Buscar perfis do usuário
    let userTeacherProfile = null;
    let userStudentProfile = null;

    if (session.user.role === 1) {
      userTeacherProfile = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
    } else {
      userStudentProfile = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
    }

    // Buscar aula com todos os detalhes
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        // Verificar se o usuário tem acesso à aula
        OR: [
          { teacherId: userTeacherProfile?.id },
          { studentId: userStudentProfile?.id },
        ],
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
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
                email: true,
                image: true,
              },
            },
          },
        },
        assignments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada ou sem permissão de acesso' },
        { status: 404 }
      );
    }

    // Buscar estatísticas do relacionamento
    const [totalLessons, completedLessons, teacherStudentRel] =
      await Promise.all([
        prisma.lesson.count({
          where: {
            teacherId: lesson.teacherId,
            studentId: lesson.studentId,
          },
        }),
        prisma.lesson.count({
          where: {
            teacherId: lesson.teacherId,
            studentId: lesson.studentId,
            status: 'COMPLETED',
          },
        }),
        prisma.teacherStudent.findFirst({
          where: {
            teacherId: lesson.teacherId,
            studentId: lesson.studentId,
          },
          select: { startDate: true },
        }),
      ]);

    // Calcular duração do relacionamento
    const relationshipStart = teacherStudentRel?.startDate || lesson.createdAt;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - relationshipStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let relationshipDuration = '';
    if (diffDays < 30) {
      relationshipDuration = `${diffDays} dias`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      relationshipDuration = `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      relationshipDuration = `${years} ${years === 1 ? 'ano' : 'anos'}`;
      if (remainingMonths > 0) {
        relationshipDuration += ` e ${remainingMonths} ${
          remainingMonths === 1 ? 'mês' : 'meses'
        }`;
      }
    }

    // Buscar WorkScores se houver IDs
    let workScores: any[] = [];
    if (lesson.workScoreIds.length > 0) {
      workScores = await prisma.workScore.findMany({
        where: {
          id: { in: lesson.workScoreIds },
        },
        include: {
          work: {
            include: {
              composer: {
                select: { name: true },
              },
            },
          },
        },
      });
    }

    // Buscar aulas relacionadas (se for série recorrente)
    let relatedLessons: any[] = [];
    if (lesson.isRecurring) {
      const parentId = lesson.parentLessonId || lesson.id;
      relatedLessons = await prisma.lesson.findMany({
        where: {
          OR: [{ id: parentId }, { parentLessonId: parentId }],
          id: { not: lesson.id }, // Excluir a aula atual
        },
        select: {
          id: true,
          title: true,
          scheduledAt: true,
          status: true,
        },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
      });
    }

    // Definir permissões baseadas no role
    const isTeacher =
      session.user.role === 1 && userTeacherProfile?.id === lesson.teacherId;
    const isStudent =
      session.user.role === 0 && userStudentProfile?.id === lesson.studentId;

    const permissions = {
      canEdit: isTeacher,
      canCancel: isTeacher,
      canReschedule: isTeacher,
      canViewTeacherNotes: isTeacher,
      canAddFeedback: isStudent && lesson.status === 'COMPLETED',
      canMarkAttendance: isTeacher,
    };

    // Montar resposta detalhada
    const lessonDetails: LessonDetails = {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || undefined,
      scheduledAt: lesson.scheduledAt,
      duration: lesson.duration,
      actualStartTime: lesson.actualStartTime || undefined,
      actualEndTime: lesson.actualEndTime || undefined,
      status: lesson.status,
      type: lesson.type,
      location: lesson.location || undefined,

      // Recorrência
      isRecurring: lesson.isRecurring,
      recurrenceType: lesson.recurrenceType || undefined,
      parentLessonId: lesson.parentLessonId || undefined,
      recurrenceEnd: lesson.recurrenceEnd || undefined,

      // Conteúdo
      objectives: lesson.objectives,
      workScoreIds: lesson.workScoreIds,
      topics: lesson.topics,
      techniques: lesson.techniques,
      repertoire: lesson.repertoire,
      homework: lesson.homework || undefined,
      practiceGoals: lesson.practiceGoals,
      nextLessonPrep: lesson.nextLessonPrep || undefined,

      // Anotações (filtradas por permissão)
      teacherNotes: permissions.canViewTeacherNotes
        ? lesson.teacherNotes || undefined
        : undefined,
      publicNotes: lesson.publicNotes || undefined,
      studentFeedback: lesson.studentFeedback || undefined,
      lessonSummary: lesson.lessonSummary || undefined,

      // Avaliação
      studentProgress: lesson.studentProgress,
      skillsWorked: lesson.skillsWorked,
      improvements: lesson.improvements,
      challenges: lesson.challenges,

      // Presença
      studentPresent: lesson.studentPresent || undefined,
      punctuality: lesson.punctuality || undefined,
      engagement: lesson.engagement || undefined,
      preparation: lesson.preparation || undefined,

      // Pessoas
      teacher: {
        id: lesson.teacher.user.id,
        name: `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`.trim(),
        email: lesson.teacher.user.email || '',
        image: lesson.teacher.user.image || undefined,
      },
      student: {
        id: lesson.student.user.id,
        name: `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim(),
        email: lesson.student.user.email || '',
        image: lesson.student.user.image || undefined,
        level: lesson.student.level,
      },

      // Contexto
      relationship: {
        totalLessons,
        completedLessons,
        relationshipDuration,
      },

      // WorkScores
      workScores: workScores.map((ws) => ({
        id: ws.id,
        title: ws.title,
        composer: ws.work.composer.name,
        workTitle: ws.work.title,
        type: ws.type,
        downloadUrl: ws.downloadUrl || undefined,
      })),

      // Assignments
      assignments: lesson.assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate || undefined,
        status: assignment.status,
        isCompleted: assignment.isCompleted,
      })),

      // Aulas relacionadas
      relatedLessons: relatedLessons.map((rl) => ({
        id: rl.id,
        title: rl.title,
        scheduledAt: rl.scheduledAt,
        status: rl.status,
      })),

      // Timestamps
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,

      // Permissões
      permissions,
    };

    console.log(
      `✅ [LESSON-DETAILS] Detalhes da aula carregados para ${
        isTeacher ? 'professor' : 'aluno'
      }`
    );

    return NextResponse.json({
      success: true,
      lesson: lessonDetails,
      userRole: session.user.role,
      isTeacher,
      isStudent,
    });
  } catch (error) {
    console.error(
      '❌ [LESSON-DETAILS] Erro ao buscar detalhes da aula:',
      error
    );
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar aula (professor) ou adicionar feedback (aluno) COM REVALIDAÇÃO
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 1 && session.user.role !== 0)
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = await params;
    const lessonId = id;
    const body = await request.json();

    console.log(
      `📝 [LESSON-DETAILS] Atualizando aula ${lessonId} - Role: ${session.user.role}`
    );

    // Buscar perfis
    let userTeacherProfile = null;
    let userStudentProfile = null;

    if (session.user.role === 1) {
      userTeacherProfile = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
    } else {
      userStudentProfile = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
    }

    // Verificar acesso à aula
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        OR: [
          { teacherId: userTeacherProfile?.id },
          { studentId: userStudentProfile?.id },
        ],
      },
      include: {
        teacher: {
          select: { userId: true },
        },
        student: {
          select: { userId: true },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // Separar atualizações por role
    let updateData: any = {};

    if (session.user.role === 1) {
      // Professor pode atualizar tudo
      updateData = { ...body };
    } else {
      // Aluno só pode adicionar feedback
      const { studentFeedback } = body;
      if (studentFeedback && lesson.status === 'COMPLETED') {
        updateData.studentFeedback = studentFeedback;
      } else {
        return NextResponse.json(
          {
            error: 'Aluno só pode adicionar feedback em aulas concluídas',
          },
          { status: 403 }
        );
      }
    }

    // Atualizar aula
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
    });

    // 🔥 REVALIDAR CACHE APÓS ATUALIZAÇÃO
    const teacherUserId = lesson.teacher.userId;
    const studentUserId = lesson.student.userId;
    await revalidateLessonDetailsData(teacherUserId, studentUserId);

    console.log(
      `✅ [LESSON-DETAILS] Aula ${lessonId} atualizada e cache revalidado`
    );

    return NextResponse.json({
      success: true,
      lesson: updatedLesson,
      message:
        session.user.role === 1
          ? 'Aula atualizada com sucesso'
          : 'Feedback adicionado com sucesso',
    });
  } catch (error) {
    console.error('❌ [LESSON-DETAILS] Erro ao atualizar aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE - NOVA FUNCIONALIDADE para cancelar/deletar aula específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const lessonId = id;

    // Parâmetros da query
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Apagada pelo professor';
    const deleteAll = searchParams.get('deleteAll') === 'true';
    const futureOnly = searchParams.get('futureOnly') === 'true';

    console.log(
      `🗑️ [LESSON-DELETE] Apagando aula ${lessonId} - User: ${session.user.id} - DeleteAll: ${deleteAll}`
    );

    // Verificar se professor é dono da aula
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: 'Perfil de professor não encontrado' },
        { status: 404 }
      );
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        teacherId: teacherProfile.id,
      },
      include: {
        teacher: { select: { userId: true } },
        student: { select: { userId: true } },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada ou sem permissão' },
        { status: 404 }
      );
    }

    let deletedLessons = 0;
    const deletedDetails = [];

    if (deleteAll && (lesson.parentLessonId || lesson.isRecurring)) {
      // 🔄 APAGAR SÉRIE DE AULAS RECORRENTES COM TRANSAÇÃO
      const parentId = lesson.parentLessonId || lesson.id;

      const whereCondition: any = {
        OR: [{ id: parentId }, { parentLessonId: parentId }],
      };

      if (futureOnly) {
        whereCondition.scheduledAt = {
          gte: new Date(),
        };
      }

      // Usar transação para apagar de forma segura
      const deleteResult = await prisma.$transaction(async (tx) => {
        // 1. Buscar todas as aulas que serão apagadas (para retornar detalhes)
        const lessonsToDelete = await tx.lesson.findMany({
          where: whereCondition,
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { scheduledAt: 'asc' },
        });

        // 2. Primeiro, quebrar todas as relações de parentLessonId
        await tx.lesson.updateMany({
          where: {
            parentLessonId: { in: lessonsToDelete.map((l) => l.id) },
          },
          data: {
            parentLessonId: null,
          },
        });

        // 3. Depois, apagar todas as aulas
        const deleteResult = await tx.lesson.deleteMany({
          where: {
            id: { in: lessonsToDelete.map((l) => l.id) },
          },
        });

        return {
          deletedCount: deleteResult.count,
          lessonsDetails: lessonsToDelete,
        };
      });

      deletedLessons = deleteResult.deletedCount;

      // Detalhes das aulas apagadas
      deletedDetails.push(
        ...deleteResult.lessonsDetails.map((l) => ({
          id: l.id,
          title: l.title,
          scheduledAt: l.scheduledAt,
          studentName:
            `${l.student.user.firstName} ${l.student.user.lastName}`.trim(),
        }))
      );

      console.log(`✅ [LESSON-DELETE] Série apagada: ${deletedLessons} aulas`);
    } else if (lesson.isRecurring && !deleteAll) {
      // 🔄 APAGAR APENAS UMA AULA DE UMA SÉRIE - LÓGICA ESPECIAL
      const parentId = lesson.parentLessonId || lesson.id;

      // Se esta é a aula pai, precisamos promover a próxima
      if (!lesson.parentLessonId) {
        console.log(
          '📝 [LESSON-DELETE] Apagando aula pai - promovendo próxima...'
        );

        // Buscar a próxima aula da série
        const nextLesson = await prisma.lesson.findFirst({
          where: {
            parentLessonId: parentId,
            id: { not: lessonId },
            scheduledAt: { gte: new Date() },
          },
          orderBy: { scheduledAt: 'asc' },
        });

        if (nextLesson) {
          // 🔄 PROMOVER A PRÓXIMA AULA PARA SER A NOVA PAI
          await prisma.$transaction(async (tx) => {
            // 1. Tornar a próxima aula a nova pai
            await tx.lesson.update({
              where: { id: nextLesson.id },
              data: {
                parentLessonId: null, // Remove parent, torna-se pai
                isRecurring: true,
              },
            });

            // 2. Atualizar todas as outras aulas para apontar para a nova pai
            await tx.lesson.updateMany({
              where: {
                parentLessonId: parentId,
                id: { not: nextLesson.id },
              },
              data: {
                parentLessonId: nextLesson.id,
              },
            });

            // 3. Apagar a aula original
            await tx.lesson.delete({
              where: { id: lessonId },
            });
          });

          console.log(
            `✅ [LESSON-DELETE] Aula pai apagada e ${nextLesson.id} promovida para nova pai`
          );
        } else {
          // Não há próxima aula, apenas apagar esta
          await prisma.lesson.delete({
            where: { id: lessonId },
          });

          console.log(
            `✅ [LESSON-DELETE] Última aula da série apagada: ${lessonId}`
          );
        }
      } else {
        // Esta é uma aula filha, apenas apagar
        await prisma.lesson.delete({
          where: { id: lessonId },
        });

        console.log(`✅ [LESSON-DELETE] Aula filha apagada: ${lessonId}`);
      }

      deletedLessons = 1;
      deletedDetails.push({
        id: lesson.id,
        title: lesson.title,
        scheduledAt: lesson.scheduledAt,
        // studentName:
        //   `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim(),
      });
    } else {
      // 🔄 APAGAR AULA INDIVIDUAL (NÃO RECORRENTE)
      await prisma.lesson.delete({
        where: { id: lessonId },
      });

      deletedLessons = 1;
      deletedDetails.push({
        id: lesson.id,
        title: lesson.title,
        scheduledAt: lesson.scheduledAt,
        // studentName:
        //   `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim(),
      });

      console.log(`✅ [LESSON-DELETE] Aula individual apagada: ${lessonId}`);
    }

    // 🔥 REVALIDAR CACHE APÓS APAGAR
    const teacherUserId = lesson.teacher.userId;
    const studentUserId = lesson.student.userId;
    await revalidateLessonDetailsData(teacherUserId, studentUserId);

    console.log(`✅ [LESSON-DELETE] Cache revalidado após apagar`);

    return NextResponse.json({
      success: true,
      message: `${deletedLessons} aula(s) apagada(s) permanentemente`,
      deletedCount: deletedLessons,
      deletedDetails,
      reason,
      operation: deleteAll
        ? futureOnly
          ? 'delete_future_series'
          : 'delete_entire_series'
        : lesson.isRecurring
        ? 'delete_single_from_series'
        : 'delete_individual',
    });
  } catch (error) {
    console.error('❌ [LESSON-DELETE] Erro ao apagar aula:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
