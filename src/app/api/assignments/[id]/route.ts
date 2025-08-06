// app/api/assignments/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

// GET - Buscar assignment específico
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

    const assignmentId = params.id;

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
      audioFiles: assignment.audioFiles,
      videoFiles: assignment.videoFiles,
      documents: assignment.documents,

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

// PUT - Atualizar assignment (Professor)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const assignmentId = params.id;
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
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment não encontrado' },
        { status: 404 }
      );
    }

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

    console.log(`✅ [ASSIGNMENT-DETAIL] Assignment ${assignmentId} atualizado`);

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
