// app/api/lessons/[id]/route.ts - ATUALIZADO COM NOTIFICAÇÕES EM TEMPO REAL

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { NotificationFactory } from '@/app/utils/notifications/createNotification';

// Função auxiliar para revalidar cache de lesson details (MANTIDA)
async function revalidateLessonDetailsData(
  teacherUserId: string,
  studentUserId?: string
) {
  console.log(`🔄 [CACHE] Revalidating lesson details data`);

  // Tags específicas de lessons
  revalidateTag('teacher-lessons-data');
  revalidateTag('teacher-lesson-details');
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

  musicalPieces?: any;
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
  worksIds?: string[] | null;
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

// GET - Buscar lesson específica (SEM MUDANÇAS)
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

    const lessonId = id;

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

    // Buscar dados completos das OBRAS (worksIds)
    let linkedWorks: any[] = [];
    if (lesson.worksIds && lesson.worksIds.length > 0) {
      console.log('🔍 [LESSON-API] Buscando obras:', lesson.worksIds);

      linkedWorks = await prisma.work.findMany({
        where: {
          id: { in: lesson.worksIds },
        },
        include: {
          composer: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
        },
      });

      console.log('✅ [LESSON-API] Obras encontradas:', linkedWorks.length);
    }

    // Buscar dados completos das PARTITURAS (workScoreIds)
    let linkedWorkScores: any[] = [];
    if (lesson.workScoreIds && lesson.workScoreIds.length > 0) {
      console.log('🔍 [LESSON-API] Buscando partituras:', lesson.workScoreIds);

      linkedWorkScores = await prisma.workScore.findMany({
        where: {
          id: { in: lesson.workScoreIds },
        },
        include: {
          work: {
            include: {
              composer: {
                select: {
                  id: true,
                  name: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });

      console.log(
        '✅ [LESSON-API] Partituras encontradas:',
        linkedWorkScores.length
      );
    }

    // Criar array de peças musicais no formato correto
    const musicalPieces: any[] = [];

    // Primeiro, adicionar partituras específicas (têm prioridade)
    for (const workScore of linkedWorkScores) {
      musicalPieces.push({
        workId: workScore.work.id,
        workTitle: workScore.work.title,
        composerName:
          workScore.work.composer.fullName || workScore.work.composer.name,
        composerId: workScore.work.composer.id,
        scoreId: workScore.id,
        scoreTitle: workScore.title,
        scoreUrl: workScore.downloadUrl,
        scoreType: workScore.type,
        scoreSource: workScore.source,
      });
    }

    // Depois, adicionar obras que não têm partituras específicas
    for (const work of linkedWorks) {
      // Verificar se essa obra já não foi incluída via workScore
      const alreadyIncluded = musicalPieces.some(
        (piece) => piece.workId === work.id
      );

      if (!alreadyIncluded) {
        musicalPieces.push({
          workId: work.id,
          workTitle: work.title,
          composerName: work.composer.fullName || work.composer.name,
          composerId: work.composer.id,
          // Sem partitura específica
        });
      }
    }

    console.log('🎵 [LESSON-API] Peças musicais processadas:', {
      totalPieces: musicalPieces.length,
      withScores: musicalPieces.filter((p) => p.scoreId).length,
      withoutScores: musicalPieces.filter((p) => !p.scoreId).length,
    });

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

      // PEÇAS MUSICAIS
      worksIds: lesson.worksIds || [],
      workScoreIds: lesson.workScoreIds || [],
      musicalPieces: musicalPieces,

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

      // WorkScores (mantido para compatibilidade)
      workScores: linkedWorkScores.map((ws) => ({
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
      `✅ [LESSON-API] Detalhes da aula carregados para ${
        isTeacher ? 'professor' : 'aluno'
      } com ${musicalPieces.length} peças musicais`
    );

    return NextResponse.json({
      success: true,
      lesson: lessonDetails,
      userRole: session.user.role,
      isTeacher,
      isStudent,
    });
  } catch (error) {
    console.error('❌ [LESSON-API] Erro ao buscar detalhes da aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🆕 PATCH - Atualizar aula (professor) ou adicionar feedback (aluno) COM NOTIFICAÇÕES
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
      `📝 [LESSON-DETAILS] Atualizando aula ${lessonId} - Role: ${session.user.role}`,
      { body }
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

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // 🆕 DETECTAR MUDANÇAS PARA NOTIFICAÇÕES (antes da atualização)
    const oldData = {
      scheduledAt: lesson.scheduledAt,
      status: lesson.status,
      studentFeedback: lesson.studentFeedback,
    };

    // Separar atualizações por role
    let updateData: any = {};
    let notificationActions: string[] = [];

    if (session.user.role === 1) {
      // Professor pode atualizar tudo
      updateData = { ...body };

      // 🆕 DETECTAR AÇÕES ESPECIAIS DO PROFESSOR
      if (
        body.scheduledAt &&
        new Date(body.scheduledAt).getTime() !== oldData.scheduledAt.getTime()
      ) {
        notificationActions.push('reschedule');
      }
      if (body.status === 'NO_SHOW' && oldData.status !== 'NO_SHOW') {
        notificationActions.push('no_show');
      }
      if (body.status === 'CANCELLED' && oldData.status !== 'CANCELLED') {
        notificationActions.push('cancel');
      }
    } else {
      // 🆕 ALUNO - LÓGICA CORRIGIDA PARA MENSAGEM OPCIONAL
      const { studentFeedback, specialMessage, messageType } = body;

      // 🔹 FEEDBACK EM AULAS CONCLUÍDAS
      if (studentFeedback && lesson.status === 'COMPLETED') {
        updateData.studentFeedback = studentFeedback;
        notificationActions.push('feedback');
      }

      // 🔹 MENSAGENS ESPECIAIS DO ALUNO (CORRIGIDO - MENSAGEM OPCIONAL)
      if (messageType) {
        if (messageType === 'absence') {
          notificationActions.push('inform_absence');
        } else if (messageType === 'reschedule') {
          notificationActions.push('request_reschedule');
        }
        // Não alterar a aula, apenas enviar notificação
        // ✅ specialMessage é opcional - pode ser undefined ou string vazia
      }
      // 🔹 VALIDAÇÃO CORRIGIDA - só dar erro se não tem nenhuma ação válida
      else if (!studentFeedback) {
        return NextResponse.json(
          {
            error:
              'Aluno só pode adicionar feedback em aulas concluídas ou enviar mensagens especiais',
          },
          { status: 403 }
        );
      }
    }

    // Atualizar aula (se há dados para atualizar)
    let updatedLesson = lesson;
    if (Object.keys(updateData).length > 0) {
      updatedLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: updateData,
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
    }

    // 🆕 CRIAR NOTIFICAÇÕES BASEADAS NAS AÇÕES
    const teacherUserId = lesson.teacher.userId;
    const studentUserId = lesson.student.userId;
    const teacherName =
      `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`.trim();
    const studentName =
      `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim();

    try {
      for (const action of notificationActions) {
        switch (action) {
          case 'reschedule':
            // Professor reagendou aula
            await NotificationFactory.lessonRescheduledByTeacher(
              studentUserId,
              lessonId,
              teacherName,
              lesson.title,
              new Date(body.scheduledAt),
              oldData.scheduledAt
            );
            console.log(
              `📬 [LESSON-DETAILS] Notificação LESSON_RESCHEDULED_BY_TEACHER criada`
            );
            break;

          case 'no_show':
            // Professor marcou falta
            await NotificationFactory.lessonMarkedNoShow(
              studentUserId,
              lessonId,
              teacherName,
              lesson.title
            );
            console.log(
              `📬 [LESSON-DETAILS] Notificação LESSON_MARKED_NO_SHOW criada`
            );
            break;

          case 'cancel':
            // Professor cancelou aula
            await NotificationFactory.lessonCancelledByTeacher(
              studentUserId,
              lessonId,
              teacherName,
              lesson.title,
              body.cancelReason
            );
            console.log(
              `📬 [LESSON-DETAILS] Notificação LESSON_CANCELLED_BY_TEACHER criada`
            );
            break;

          case 'feedback':
            // Aluno deu feedback
            await NotificationFactory.studentGaveLessonFeedback(
              teacherUserId,
              lessonId,
              studentName,
              lesson.title
            );
            console.log(
              `📬 [LESSON-DETAILS] Notificação STUDENT_GAVE_LESSON_FEEDBACK criada`
            );
            break;

          case 'inform_absence':
            // 🔹 ALUNO INFORMOU AUSÊNCIA (MENSAGEM OPCIONAL)
            await NotificationFactory.studentInformedAbsence(
              teacherUserId,
              lessonId,
              studentName,
              lesson.title,
              body.specialMessage || undefined // ✅ Pode ser undefined
            );
            console.log(
              `📬 [LESSON-DETAILS] Notificação STUDENT_INFORMED_ABSENCE criada`
            );
            break;

          case 'request_reschedule':
            // 🔹 ALUNO SOLICITOU REAGENDAMENTO (MENSAGEM OPCIONAL)
            await NotificationFactory.studentRequestedReschedule(
              teacherUserId,
              lessonId,
              studentName,
              lesson.title,
              body.specialMessage || undefined // ✅ Pode ser undefined
            );
            console.log(
              `📬 [LESSON-DETAILS] Notificação STUDENT_REQUESTED_RESCHEDULE criada`
            );
            break;
        }
      }
    } catch (notificationError) {
      console.error(
        '❌ [LESSON-DETAILS] Erro ao criar notificações:',
        notificationError
      );
      // Não falhar a atualização por causa das notificações
    }

    // Revalidar cache
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
          : notificationActions.includes('feedback')
          ? 'Feedback adicionado com sucesso'
          : 'Mensagem enviada com sucesso',
      notificationsSent: notificationActions.length,
    });
  } catch (error) {
    console.error('❌ [LESSON-DETAILS] Erro ao atualizar aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🆕 DELETE - ATUALIZADO COM NOTIFICAÇÕES
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

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada ou sem permissão' },
        { status: 404 }
      );
    }

    let deletedLessons = 0;
    const deletedDetails = [];

    // 🆕 CRIAR NOTIFICAÇÃO ANTES DE APAGAR
    const teacherUserId = lesson.teacher.userId;
    const studentUserId = lesson.student.userId;
    const teacherName =
      `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`.trim();

    try {
      // Só criar notificação se não foi uma aula no passado distante
      const now = new Date();
      const lessonTime = lesson.scheduledAt.getTime();
      const timeDiff = lessonTime - now.getTime();
      const isUpcoming = timeDiff > -7 * 24 * 60 * 60 * 1000; // Não mais que 7 dias no passado

      if (isUpcoming) {
        await NotificationFactory.lessonCancelledByTeacher(
          studentUserId,
          lessonId,
          teacherName,
          lesson.title,
          reason
        );
        console.log(
          `📬 [LESSON-DELETE] Notificação LESSON_CANCELLED_BY_TEACHER criada antes de apagar`
        );
      }
    } catch (notificationError) {
      console.error(
        '❌ [LESSON-DELETE] Erro ao criar notificação antes de apagar:',
        notificationError
      );
      // Continuar com a exclusão mesmo se a notificação falhar
    }

    if (deleteAll && (lesson.parentLessonId || lesson.isRecurring)) {
      // APAGAR SÉRIE DE AULAS RECORRENTES COM TRANSAÇÃO
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
      // APAGAR APENAS UMA AULA DE UMA SÉRIE - LÓGICA ESPECIAL
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
          // PROMOVER A PRÓXIMA AULA PARA SER A NOVA PAI
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
      });
    } else {
      // APAGAR AULA INDIVIDUAL (NÃO RECORRENTE)
      await prisma.lesson.delete({
        where: { id: lessonId },
      });

      deletedLessons = 1;
      deletedDetails.push({
        id: lesson.id,
        title: lesson.title,
        scheduledAt: lesson.scheduledAt,
      });

      console.log(`✅ [LESSON-DELETE] Aula individual apagada: ${lessonId}`);
    }

    // Revalidar cache
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
