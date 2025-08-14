// app/api/assignments/[id]/route.ts - ATUALIZADO COM NOTIFICAÇÕES EM TEMPO REAL

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { NotificationFactory } from '@/app/utils/notifications/createNotification';

// Função auxiliar para revalidar cache de assignment details (MANTIDA)
async function revalidateAssignmentDetailsData(
  teacherUserId: string,
  studentUserId: string
) {
  console.log(`🔄 [CACHE] Revalidating assignment details data`);

  // Tags específicas de assignments
  revalidateTag('teacher-assignments');
  revalidateTag('teacher-assignments-data');
  revalidateTag('teacher-assignment-details');
  revalidateTag('teacher-assignment-details-data');
  revalidateTag('teacher-assignment-edit');
  revalidateTag('teacher-assignment-edit-data');
  revalidateTag('teacher-student-detail-data');
  revalidateTag('teacher-lessons-data');
  revalidateTag('teacher-lesson-details-data');
  revalidateTag('teacher-dashboard');
  revalidateTag('teacher-dashboard-data');

  // Tags específicas dos usuários
  revalidateTag(`teacher-${teacherUserId}`);
  revalidateTag('student-assignments');
  revalidateTag('student-dashboard');
  revalidateTag(`student-${studentUserId}`);

  console.log(
    `✅ [CACHE] Assignment details cache revalidated for teacher ${teacherUserId} and student ${studentUserId}`
  );
}

// GET - Buscar assignment específico (SEM MUDANÇAS)
export async function GET(
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

    const assignmentId = id;

    console.log(
      `📋🔍 [ASSIGNMENT-DETAIL] Buscando assignment ${assignmentId} - User: ${session.user.id}`
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

    // Buscar assignment com verificação de acesso
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        OR: [
          // Professor: deve ser dono da aula
          {
            lesson: {
              teacherId: userTeacherProfile?.id,
            },
          },
          // Aluno: deve ser dono do assignment
          {
            studentId: userStudentProfile?.id,
          },
        ],
      },
      include: {
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
        lesson: {
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
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment não encontrado' },
        { status: 404 }
      );
    }

    // Buscar WorkScores se houver IDs
    let workScores: any[] = [];
    if (assignment.workScoreIds.length > 0) {
      workScores = await prisma.workScore.findMany({
        where: {
          id: { in: assignment.workScoreIds },
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

    // Formatar assignment
    const now = new Date();
    const isOverdue =
      assignment.dueDate && assignment.dueDate < now && !assignment.isCompleted;

    const daysUntilDue = assignment.dueDate
      ? Math.ceil(
          (assignment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    const assignmentDetail = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      priority: assignment.priority,

      // Recursos
      workScoreIds: assignment.workScoreIds,
      exercises: assignment.exercises,

      // Metas
      practiceGoals: assignment.practiceGoals,
      tempoTargets: assignment.tempoTargets,
      technicalGoals: assignment.technicalGoals,
      musicalGoals: assignment.musicalGoals,

      // Status e prazos
      status: isOverdue ? 'OVERDUE' : assignment.status,
      dueDate: assignment.dueDate,
      estimatedTime: assignment.estimatedTime,
      actualTime: assignment.actualTime,
      isOverdue,
      daysUntilDue,

      // Progresso
      isCompleted: assignment.isCompleted,
      completedAt: assignment.completedAt,
      progress: assignment.progress,

      // Feedback
      teacherFeedback: assignment.teacherFeedback,
      teacherRating: assignment.teacherRating,
      studentNotes: assignment.studentNotes,
      studentRating: assignment.studentRating,

      // Submissões
      submissions: assignment.submissions,
      submissionDate: assignment.submissionDate,

      // Relacionamentos
      student: {
        id: assignment.student.user.id,
        name: `${assignment.student.user.firstName} ${assignment.student.user.lastName}`.trim(),
        image: assignment.student.user.image,
      },
      lesson: {
        id: assignment.lesson.id,
        title: assignment.lesson.title,
        scheduledAt: assignment.lesson.scheduledAt,
        teacher: {
          name: `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim(),
          image: assignment.lesson.teacher.user.image,
        },
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

      // Permissões
      permissions: {
        canEdit: session.user.role === 1,
        canDelete: session.user.role === 1,
        canComplete: session.user.role === 0 && !assignment.isCompleted,
        canAddFeedback: session.user.role === 0,
        canAddSubmission: session.user.role === 0 && !assignment.isCompleted,
      },

      // Timestamps
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    };

    console.log(`✅ [ASSIGNMENT-DETAIL] Assignment encontrado`);

    return NextResponse.json({
      success: true,
      assignment: assignmentDetail,
    });
  } catch (error) {
    console.error('❌ [ASSIGNMENT-DETAIL] Erro ao buscar assignment:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🆕 PUT - Atualizar assignment (Professor) COM NOTIFICAÇÕES
export async function PUT(
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
    const assignmentId = id;
    const body = await request.json();

    console.log(
      `📋✏️ [ASSIGNMENT-DETAIL] Atualizando assignment ${assignmentId}`
    );

    // Verificar se professor existe
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

    // Verificar se assignment existe e professor é dono
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        lesson: {
          teacherId: teacherProfile.id,
        },
      },
      include: {
        student: {
          select: {
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        lesson: {
          include: {
            teacher: {
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
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment não encontrado' },
        { status: 404 }
      );
    }

    // 🆕 DETECTAR MUDANÇAS PARA NOTIFICAÇÕES (antes da atualização)
    const oldData = {
      worksIds: assignment.worksIds,
      workScoreIds: assignment.workScoreIds,
      teacherFeedback: assignment.teacherFeedback,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
    };

    // Preparar dados de atualização
    const updateData: any = { ...body };

    // Remover campos que não devem ser atualizados
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.lessonId;
    delete updateData.studentId;

    // Converter dueDate se fornecido
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    // Filtrar arrays vazios
    if (updateData.practiceGoals) {
      updateData.practiceGoals = updateData.practiceGoals.filter(
        (goal: string) => goal.trim()
      );
    }
    if (updateData.technicalGoals) {
      updateData.technicalGoals = updateData.technicalGoals.filter(
        (goal: string) => goal.trim()
      );
    }
    if (updateData.musicalGoals) {
      updateData.musicalGoals = updateData.musicalGoals.filter((goal: string) =>
        goal.trim()
      );
    }
    if (updateData.exercises) {
      updateData.exercises = updateData.exercises.filter((ex: string) =>
        ex.trim()
      );
    }

    // Atualizar assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
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
        lesson: {
          include: {
            teacher: {
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
        },
      },
    });

    // 🆕 CRIAR NOTIFICAÇÕES BASEADAS NAS MUDANÇAS
    const studentUserId = assignment.student.userId;
    const teacherName =
      `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim();

    try {
      // 1. Professor deu feedback (novo ou atualizou)
      if (
        updateData.teacherFeedback &&
        updateData.teacherFeedback !== oldData.teacherFeedback
      ) {
        await NotificationFactory.teacherGaveFeedback(
          studentUserId,
          assignmentId,
          teacherName,
          assignment.title
        );
        console.log(
          `📬 [ASSIGNMENT-DETAIL] Notificação TEACHER_GAVE_FEEDBACK criada`
        );
      }

      // 2. Professor alterou assignment (verificar campos relevantes)
      const changedFields = [];

      if (
        JSON.stringify(updateData.worksIds) !== JSON.stringify(oldData.worksIds)
      ) {
        changedFields.push('obras');
      }
      if (
        JSON.stringify(updateData.workScoreIds) !==
        JSON.stringify(oldData.workScoreIds)
      ) {
        changedFields.push('partituras');
      }
      if (updateData.title && updateData.title !== oldData.title) {
        changedFields.push('título');
      }
      if (
        updateData.description &&
        updateData.description !== oldData.description
      ) {
        changedFields.push('descrição');
      }
      if (
        updateData.dueDate &&
        updateData.dueDate.getTime() !== oldData.dueDate?.getTime()
      ) {
        changedFields.push('prazo');
      }

      // Só criar notificação se houve mudanças relevantes
      if (changedFields.length > 0) {
        await NotificationFactory.assignmentUpdatedByTeacher(
          studentUserId,
          assignmentId,
          teacherName,
          assignment.title,
          changedFields
        );
        console.log(
          `📬 [ASSIGNMENT-DETAIL] Notificação ASSIGNMENT_UPDATED_BY_TEACHER criada para mudanças: ${changedFields.join(
            ', '
          )}`
        );
      }
    } catch (notificationError) {
      console.error(
        '❌ [ASSIGNMENT-DETAIL] Erro ao criar notificações:',
        notificationError
      );
      // Não falhar a atualização por causa das notificações
    }

    // Revalidar cache
    await revalidateAssignmentDetailsData(session.user.id, studentUserId);

    console.log(
      `✅ [ASSIGNMENT-DETAIL] Assignment ${assignmentId} atualizado e cache revalidado`
    );

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment,
      message: 'Assignment atualizado com sucesso',
    });
  } catch (error) {
    console.error(
      '❌ [ASSIGNMENT-DETAIL] Erro ao atualizar assignment:',
      error
    );
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
