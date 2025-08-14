// app/api/assignments/route.ts - ATUALIZADO COM CRIAÇÃO DE NOTIFICAÇÕES EM TEMPO REAL

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { NotificationFactory } from '@/app/utils/notifications/createNotification';

// Função auxiliar para revalidar cache do professor e aluno (MANTIDA)
async function revalidateTeacherAndStudentData(
  teacherUserId: string,
  studentUserId?: string
) {
  console.log(`🔄 [CACHE] Revalidating teacher and student data`);

  // Tags do professor
  revalidateTag('teacher-dashboard');
  revalidateTag('teacher-dashboard-data');
  revalidateTag('teacher-students');
  revalidateTag('teacher-students-data');
  revalidateTag('teacher-assignments');
  revalidateTag('teacher-assignments-data');
  revalidateTag('teacher-assignment-details');
  revalidateTag('teacher-assignment-details-data');
  revalidateTag('teacher-assignment-edit');
  revalidateTag('teacher-assignment-edit-data');
  revalidateTag('teacher-student-detail-data');
  revalidateTag('teacher-lessons-data');
  revalidateTag('teacher-lesson-details-data');

  // Tag específica do professor
  revalidateTag(`teacher-${teacherUserId}`);

  // Se tiver studentUserId, revalidar tags do aluno também
  if (studentUserId) {
    revalidateTag('student-dashboard');
    revalidateTag('student-assignments');
    revalidateTag('student-assignment-details');
    revalidateTag('student-assignment-details-data');
    revalidateTag('student-lessons');
    revalidateTag(`student-${studentUserId}`);
  }

  console.log(
    `✅ [CACHE] Cache revalidated for teacher ${teacherUserId}${
      studentUserId ? ` and student ${studentUserId}` : ''
    }`
  );
}

// GET - Listar assignments (SEM MUDANÇAS)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 1 && session.user.role !== 0)
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentUserId = searchParams.get('studentUserId');
    const teacherUserId = searchParams.get('teacherUserId');
    const status = searchParams.get('status');
    const lessonId = searchParams.get('lessonId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeLessonData = searchParams.get('includeLesson') === 'true';

    console.log(
      `📋 [ASSIGNMENTS] Listando assignments - User: ${session.user.id}, Role: ${session.user.role}`
    );

    // Buscar perfis do usuário
    let userTeacherProfile = null;
    let userStudentProfile = null;

    if (session.user.role === 1) {
      userTeacherProfile = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!userTeacherProfile) {
        return NextResponse.json(
          { error: 'Perfil de professor não encontrado' },
          { status: 404 }
        );
      }
    } else {
      userStudentProfile = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!userStudentProfile) {
        return NextResponse.json(
          { error: 'Perfil de aluno não encontrado' },
          { status: 404 }
        );
      }
    }

    // Montar where clause
    const whereClause: any = {};

    if (session.user.role === 1) {
      // Professor: buscar assignments de suas aulas
      whereClause.lesson = {
        teacherId: userTeacherProfile!.id,
      };

      // Se especificou aluno, filtrar
      if (studentUserId) {
        const studentProfile = await prisma.student.findUnique({
          where: { userId: studentUserId },
          select: { id: true },
        });
        if (studentProfile) {
          whereClause.studentId = studentProfile.id;
        }
      }
    } else {
      // Aluno: buscar seus assignments
      whereClause.studentId = userStudentProfile!.id;

      // Se especificou professor, filtrar
      if (teacherUserId) {
        const teacherProfile = await prisma.teacher.findUnique({
          where: { userId: teacherUserId },
          select: { id: true },
        });
        if (teacherProfile) {
          whereClause.lesson = {
            teacherId: teacherProfile.id,
          };
        }
      }
    }

    // Filtros adicionais
    if (status) {
      if (status === 'OVERDUE') {
        // Assignments atrasados: status PENDING ou IN_PROGRESS com dueDate no passado
        whereClause.AND = [
          {
            OR: [{ status: 'PENDING' }, { status: 'IN_PROGRESS' }],
          },
          {
            dueDate: {
              lt: new Date(),
            },
          },
        ];
      } else {
        whereClause.status = status;
      }
    }

    if (lessonId) {
      whereClause.lessonId = lessonId;
    }

    // Buscar assignments
    const [assignments, totalCount] = await Promise.all([
      prisma.assignment.findMany({
        where: whereClause,
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
          lesson: includeLessonData
            ? {
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
              }
            : {
                select: {
                  id: true,
                  title: true,
                  scheduledAt: true,
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
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.assignment.count({ where: whereClause }),
    ]);

    // Formatar assignments
    const assignmentsFormatted = assignments.map((assignment) => {
      const now = new Date();
      const isOverdue =
        assignment.dueDate &&
        assignment.dueDate < now &&
        !assignment.isCompleted;

      const daysUntilDue = assignment.dueDate
        ? Math.ceil(
            (assignment.dueDate.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        priority: assignment.priority,

        // Recursos
        workScoreIds: assignment.workScoreIds,
        worksIds: assignment.worksIds,
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

        // Timestamps
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      };
    });

    // Calcular estatísticas
    const stats = {
      total: totalCount,
      pending: assignments.filter((a) => a.status === 'PENDING').length,
      inProgress: assignments.filter((a) => a.status === 'IN_PROGRESS').length,
      completed: assignments.filter((a) => a.isCompleted).length,
      overdue: assignmentsFormatted.filter((a) => a.isOverdue).length,
    };

    console.log(
      `✅ [ASSIGNMENTS] Retornando ${assignmentsFormatted.length} assignments`
    );

    return NextResponse.json({
      success: true,
      assignments: assignmentsFormatted,
      stats,
      pagination: {
        offset,
        limit,
        total: totalCount,
        hasMore: offset + assignmentsFormatted.length < totalCount,
      },
    });
  } catch (error) {
    console.error('❌ [ASSIGNMENTS] Erro ao listar assignments:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🆕 POST - Criar novo assignment (COM NOTIFICAÇÃO)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      lessonId,
      studentUserId,
      title,
      description,
      type = 'practice',
      priority = 'medium',
      dueDate,
      estimatedTime,
      workScoreIds = [],
      worksIds = [],
      exercises = [],
      practiceGoals = [],
      tempoTargets,
      technicalGoals = [],
      musicalGoals = [],
    } = body;

    if (!lessonId || !studentUserId || !title || !description) {
      return NextResponse.json(
        {
          error:
            'lessonId, studentUserId, title e description são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log(`📋➕ [ASSIGNMENTS] Criando assignment: ${title}`, {
      worksIds: worksIds.length,
      workScoreIds: workScoreIds.length,
    });

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

    // Verificar se aula existe e professor é dono
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        teacherId: teacherProfile.id,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se aluno existe
    const studentProfile = await prisma.student.findUnique({
      where: { userId: studentUserId },
      select: { id: true },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      );
    }

    // Criar assignment
    const assignment = await prisma.assignment.create({
      data: {
        lessonId,
        studentId: studentProfile.id,
        title,
        description,
        type,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedTime,
        workScoreIds,
        worksIds,
        exercises,
        practiceGoals,
        tempoTargets,
        technicalGoals,
        musicalGoals,
        status: 'PENDING',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
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

    // 🆕 CRIAR NOTIFICAÇÃO: NEW_ASSIGNMENT_CREATED
    const teacherName =
      `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim();

    try {
      await NotificationFactory.newAssignmentCreated(
        studentUserId,
        assignment.id,
        teacherName,
        assignment.title
      );
      console.log(
        `📬 [ASSIGNMENTS] Notificação NEW_ASSIGNMENT_CREATED criada para ${studentUserId}`
      );
    } catch (notificationError) {
      console.error(
        '❌ [ASSIGNMENTS] Erro ao criar notificação:',
        notificationError
      );
      // Não falhar a criação do assignment por causa da notificação
    }

    // Revalidar cache
    await revalidateTeacherAndStudentData(session.user.id, studentUserId);

    console.log(
      `✅ [ASSIGNMENTS] Assignment criado e cache revalidado: ${assignment.id}`
    );

    return NextResponse.json({
      success: true,
      assignment,
      message: 'Assignment criado com sucesso',
    });
  } catch (error) {
    console.error('❌ [ASSIGNMENTS] Erro ao criar assignment:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🆕 PATCH - Atualizar assignment (COM NOTIFICAÇÕES)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 1 && session.user.role !== 0)
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { assignmentId, ...updateData } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'assignmentId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `📋✏️ [ASSIGNMENTS] Atualizando assignment ${assignmentId} - Role: ${session.user.role}`,
      { updateFields: Object.keys(updateData) }
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

    // Verificar se assignment existe e usuário tem acesso
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
        lesson: {
          include: {
            teacher: {
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
          },
        },
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
      isCompleted: assignment.isCompleted,
      submissions: assignment.submissions,
    };

    // Filtrar atualizações baseadas no role
    let filteredUpdateData: any = {};

    if (session.user.role === 1) {
      // Professor pode atualizar quase tudo
      filteredUpdateData = { ...updateData };

      // Se marcar como completo, definir completedAt
      if (updateData.isCompleted && !assignment.isCompleted) {
        filteredUpdateData.completedAt = new Date();
        filteredUpdateData.status = 'COMPLETED';
      }
    } else {
      // Aluno pode atualizar campos específicos
      const allowedFields = [
        'status',
        'progress',
        'actualTime',
        'studentNotes',
        'studentRating',
        'submissions',
        'isCompleted',
        'progressMilestones',
      ];

      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
          filteredUpdateData[key] = updateData[key];
        }
      });

      // Se progressMilestones foi enviado, integrar com submissions
      if (updateData.progressMilestones) {
        const currentSubmissions = (assignment.submissions as any) || {};
        filteredUpdateData.submissions = {
          ...currentSubmissions,
          progressMilestones: updateData.progressMilestones,
        };
        delete filteredUpdateData.progressMilestones;
      }

      // Se aluno marcar como completo
      if (updateData.isCompleted && !assignment.isCompleted) {
        filteredUpdateData.completedAt = new Date();
        filteredUpdateData.status = 'COMPLETED';
        filteredUpdateData.submissionDate = new Date();
      }
    }

    console.log(`📋 [ASSIGNMENTS] Dados filtrados para atualização:`, {
      role: session.user.role,
      fields: Object.keys(filteredUpdateData),
      hasProgressMilestones: !!updateData.progressMilestones,
    });

    // Atualizar assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: filteredUpdateData,
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
    const teacherUserId = assignment.lesson.teacher.userId;
    const studentUserId = assignment.student.userId;
    const teacherName =
      `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim();
    const studentName =
      `${assignment.student.user.firstName} ${assignment.student.user.lastName}`.trim();

    try {
      if (session.user.role === 1) {
        // 📬 NOTIFICAÇÕES PARA ESTUDANTE (ações do professor)

        // 1. Professor deu feedback
        if (filteredUpdateData.teacherFeedback && !oldData.teacherFeedback) {
          await NotificationFactory.teacherGaveFeedback(
            studentUserId,
            assignmentId,
            teacherName,
            assignment.title
          );
          console.log(
            `📬 [ASSIGNMENTS] Notificação TEACHER_GAVE_FEEDBACK criada`
          );
        }

        // 2. Professor alterou assignment (verificar campos relevantes)
        const changedFields = [];
        if (
          JSON.stringify(filteredUpdateData.worksIds) !==
          JSON.stringify(oldData.worksIds)
        ) {
          changedFields.push('obras');
        }
        if (
          JSON.stringify(filteredUpdateData.workScoreIds) !==
          JSON.stringify(oldData.workScoreIds)
        ) {
          changedFields.push('partituras');
        }

        if (changedFields.length > 0) {
          await NotificationFactory.assignmentUpdatedByTeacher(
            studentUserId,
            assignmentId,
            teacherName,
            assignment.title,
            changedFields
          );
          console.log(
            `📬 [ASSIGNMENTS] Notificação ASSIGNMENT_UPDATED_BY_TEACHER criada`
          );
        }
      } else {
        // 📬 NOTIFICAÇÕES PARA PROFESSOR (ações do aluno)

        // 1. Aluno enviou submissão
        if (
          filteredUpdateData.submissions &&
          JSON.stringify(filteredUpdateData.submissions) !==
            JSON.stringify(oldData.submissions)
        ) {
          await NotificationFactory.studentSubmittedAssignment(
            teacherUserId,
            assignmentId,
            studentName,
            assignment.title
          );
          console.log(
            `📬 [ASSIGNMENTS] Notificação STUDENT_SUBMITTED_ASSIGNMENT criada`
          );
        }

        // 2. Aluno completou assignment
        if (filteredUpdateData.isCompleted && !oldData.isCompleted) {
          await NotificationFactory.studentCompletedAssignment(
            teacherUserId,
            assignmentId,
            studentName,
            assignment.title
          );
          console.log(
            `📬 [ASSIGNMENTS] Notificação STUDENT_COMPLETED_ASSIGNMENT criada`
          );
        }
      }
    } catch (notificationError) {
      console.error(
        '❌ [ASSIGNMENTS] Erro ao criar notificações:',
        notificationError
      );
      // Não falhar a atualização por causa das notificações
    }

    // Revalidar cache
    await revalidateTeacherAndStudentData(teacherUserId, studentUserId);

    console.log(
      `✅ [ASSIGNMENTS] Assignment ${assignmentId} atualizado e cache revalidado`
    );

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment,
      message: 'Assignment atualizado com sucesso',
    });
  } catch (error) {
    console.error('❌ [ASSIGNMENTS] Erro ao atualizar assignment:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar assignment (SEM MUDANÇAS)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('id');

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'assignmentId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`📋❌ [ASSIGNMENTS] Deletando assignment ${assignmentId}`);

    // Verificar se professor é dono
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        lesson: {
          teacherId: teacherProfile?.id,
        },
      },
      include: {
        student: {
          select: {
            userId: true,
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

    // Guardar studentUserId antes de deletar
    const studentUserId = assignment.student.userId;

    // Deletar assignment
    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    // Revalidar cache
    await revalidateTeacherAndStudentData(session.user.id, studentUserId);

    console.log(
      `✅ [ASSIGNMENTS] Assignment ${assignmentId} deletado e cache revalidado`
    );

    return NextResponse.json({
      success: true,
      message: 'Assignment deletado com sucesso',
    });
  } catch (error) {
    console.error('❌ [ASSIGNMENTS] Erro ao deletar assignment:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
