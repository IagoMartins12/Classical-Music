// app/api/lessons/route.ts - API melhorada com sistema de recorrência e detecção de conflitos

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { Lesson } from '@prisma/client';

// Função auxiliar para revalidar cache do professor
async function revalidateTeacherData(userId: string) {
  console.log(`🔄 [CACHE] Revalidating teacher data for user ${userId}`);

  // Tags principais do professor
  revalidateTag('teacher-dashboard');
  revalidateTag('teacher-dashboard-data');
  revalidateTag('teacher-students');
  revalidateTag('teacher-students-data');
  revalidateTag('teacher-calendar');
  revalidateTag('teacher-calendar-data');
  revalidateTag('teacher-calendar-data-direct');
  revalidateTag('teacher-lessons-data');
  revalidateTag('teacher-lesson-details-data');

  // Tag específica do usuário
  revalidateTag(`teacher-${userId}`);

  console.log(`✅ [CACHE] Teacher cache revalidated for user ${userId}`);
}

// Função para calcular datas de recorrência com limite de 3 meses
function calculateRecurrenceDates(
  startDate: Date,
  recurrenceType: string,
  endDate: Date
): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  // NOVO: Verificar limite de 3 meses
  const maxDate = new Date(startDate);
  maxDate.setMonth(maxDate.getMonth() + 3);
  const actualEndDate = endDate > maxDate ? maxDate : endDate;

  // Limitar iterações para evitar loops infinitos
  const maxIterations = 100;
  let iterations = 0;

  console.log(
    `🔄 [RECURRENCE] Calculating dates from ${startDate.toISOString()} to ${actualEndDate.toISOString()}`
  );

  while (currentDate <= actualEndDate && iterations < maxIterations) {
    dates.push(new Date(currentDate));

    switch (recurrenceType) {
      case 'WEEKLY':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'BIWEEKLY':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case 'TWICE_WEEKLY':
        // Para 2x por semana, vamos alternar 3 e 4 dias
        const daysToAdd = iterations % 2 === 0 ? 3 : 4;
        currentDate.setDate(currentDate.getDate() + daysToAdd);
        break;
      case 'MONTHLY':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        return [startDate]; // Sem recorrência
    }

    iterations++;
  }

  console.log(`✅ [RECURRENCE] Generated ${dates.length} dates`);
  return dates;
}

// Função melhorada para verificar conflitos de horário
async function checkScheduleConflicts(
  teacherId: string,
  scheduledAt: Date,
  duration: number,
  excludeLessonId?: string
): Promise<{
  hasConflicts: boolean;
  conflicts: any[];
  warnings: string[];
}> {
  const startTime = new Date(scheduledAt);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  console.log(
    `🔍 [CONFLICTS] Checking conflicts for ${startTime.toISOString()} - ${endTime.toISOString()}`
  );

  const conflictingLessons = await prisma.lesson.findMany({
    where: {
      teacherId,
      status: 'SCHEDULED',
      id: excludeLessonId ? { not: excludeLessonId } : undefined,
      AND: [
        {
          scheduledAt: {
            lt: endTime,
          },
        },
        {
          // scheduledAt + duration > startTime
          scheduledAt: {
            gte: new Date(startTime.getTime() - 240 * 60000), // 4h buffer para busca
          },
        },
      ],
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
    },
  });

  // Filtrar conflitos reais (sobreposição de horários)
  const realConflicts = conflictingLessons.filter((lesson) => {
    const lessonStart = new Date(lesson.scheduledAt);
    const lessonEnd = new Date(lessonStart.getTime() + lesson.duration * 60000);

    // Verificar se há sobreposição
    return startTime < lessonEnd && endTime > lessonStart;
  });

  // Gerar avisos
  const warnings: string[] = [];
  if (realConflicts.length > 0) {
    warnings.push(`${realConflicts.length} aula(s) em conflito de horário`);
  }

  // Verificar se é muito tarde/cedo
  const hour = startTime.getHours();
  if (hour < 7 || hour > 22) {
    warnings.push('Horário fora do expediente normal (7h-22h)');
  }

  // Verificar final de semana
  const dayOfWeek = startTime.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    warnings.push('Aula agendada para final de semana');
  }

  console.log(
    `${realConflicts.length > 0 ? '⚠️' : '✅'} [CONFLICTS] Found ${
      realConflicts.length
    } conflicts, ${warnings.length} warnings`
  );

  return {
    hasConflicts: realConflicts.length > 0,
    conflicts: realConflicts.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      scheduledAt: lesson.scheduledAt,
      duration: lesson.duration,
      studentName:
        `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim(),
      studentEmail: lesson.student.user.email,
    })),
    warnings,
  };
}

// GET - Listar aulas (sem mudanças)
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
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(
      `📅 [LESSONS] Listando aulas - User: ${session.user.id}, Role: ${session.user.role}`
    );

    // Montar where clause baseado no role
    let whereClause: any = {};

    if (session.user.role === 1) {
      // Professor: buscar por teacherId
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

      whereClause.teacherId = teacherProfile.id;

      if (studentId) {
        whereClause.studentId = studentId;
      }
    } else if (session.user.role === 0) {
      // Aluno: buscar por studentId
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

      whereClause.studentId = studentProfile.id;

      if (teacherId) {
        whereClause.teacherId = teacherId;
      }
    }

    // Filtros adicionais
    if (status) {
      whereClause.status = status;
    }

    if (dateFrom || dateTo) {
      whereClause.scheduledAt = {};
      if (dateFrom) {
        whereClause.scheduledAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.scheduledAt.lte = new Date(dateTo);
      }
    }

    // Buscar aulas
    const [lessons, totalCount] = await Promise.all([
      prisma.lesson.findMany({
        where: whereClause,
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
        },
        orderBy: {
          scheduledAt: 'asc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.lesson.count({ where: whereClause }),
    ]);

    // Formatar aulas
    const lessonsFormatted = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      scheduledAt: lesson.scheduledAt,
      duration: lesson.duration,
      status: lesson.status,
      type: lesson.type,
      location: lesson.location,
      isRecurring: lesson.isRecurring,
      recurrenceType: lesson.recurrenceType,
      parentLessonId: lesson.parentLessonId,
      objectives: lesson.objectives,
      workScoreIds: lesson.workScoreIds,
      topics: lesson.topics,
      techniques: lesson.techniques,
      repertoire: lesson.repertoire,
      homework: lesson.homework,
      practiceGoals: lesson.practiceGoals,
      teacherNotes: lesson.teacherNotes,
      publicNotes: lesson.publicNotes,
      studentFeedback: lesson.studentFeedback,
      lessonSummary: lesson.lessonSummary,
      studentProgress: lesson.studentProgress,
      skillsWorked: lesson.skillsWorked,
      improvements: lesson.improvements,
      challenges: lesson.challenges,
      studentPresent: lesson.studentPresent,
      punctuality: lesson.punctuality,
      engagement: lesson.engagement,
      preparation: lesson.preparation,
      teacher: {
        id: lesson.teacher.user.id,
        name: `${lesson.teacher.user.firstName || ''} ${
          lesson.teacher.user.lastName || ''
        }`.trim(),
        email: lesson.teacher.user.email,
        image: lesson.teacher.user.image,
      },
      student: {
        id: lesson.student.user.id,
        name: `${lesson.student.user.firstName || ''} ${
          lesson.student.user.lastName || ''
        }`.trim(),
        email: lesson.student.user.email,
        image: lesson.student.user.image,
      },
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    }));

    console.log(`✅ [LESSONS] Retornando ${lessonsFormatted.length} aulas`);

    return NextResponse.json({
      success: true,
      lessons: lessonsFormatted,
      pagination: {
        offset,
        limit,
        total: totalCount,
        hasMore: offset + lessonsFormatted.length < totalCount,
      },
    });
  } catch (error) {
    console.error('❌ [LESSONS] Erro ao listar aulas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova aula (MELHORADO com sistema de recorrência e conflitos)
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
      studentUserId,
      title,
      description,
      scheduledAt,
      duration = 60,
      type = 'INDIVIDUAL',
      location,
      objectives = [],
      workScoreIds = [],
      topics = [],
      techniques = [],
      repertoire = [],
      homework,
      practiceGoals = [],
      teacherNotes,
      publicNotes,
      // Recorrência melhorada
      isRecurring = false,
      recurrenceType = 'NONE',
      recurrenceEnd,
      // NOVO: Flag para forçar criação mesmo com conflitos
      forceCreate = false,
    } = body;

    if (!studentUserId || !title || !scheduledAt) {
      return NextResponse.json(
        {
          error: 'studentUserId, title e scheduledAt são obrigatórios',
        },
        { status: 400 }
      );
    }

    // NOVO: Validação melhorada de recorrência
    if (isRecurring) {
      if (!recurrenceEnd || recurrenceType === 'NONE') {
        return NextResponse.json(
          {
            error:
              'Para aulas recorrentes, recurrenceEnd e recurrenceType são obrigatórios',
          },
          { status: 400 }
        );
      }

      // Verificar limite de 3 meses
      const startDate = new Date(scheduledAt);
      const endDate = new Date(recurrenceEnd);
      const maxDate = new Date(startDate);
      maxDate.setMonth(maxDate.getMonth() + 3);

      if (endDate > maxDate) {
        return NextResponse.json(
          {
            error:
              'Recorrência limitada a 3 meses. Use a renovação automática após esse período.',
            maxDate: maxDate.toISOString().split('T')[0],
          },
          { status: 400 }
        );
      }
    }

    console.log(
      `📅➕ [LESSONS] Criando aula: ${title} - ${scheduledAt} ${
        isRecurring ? '(Recorrente)' : ''
      }`
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

    // Verificar se aluno existe e está vinculado
    const studentProfile = await prisma.student.findUnique({
      where: { userId: studentUserId },
      select: {
        id: true,
        teachers: {
          where: {
            teacherId: teacherProfile.id,
            isActive: true,
          },
          select: {
            maxLessonsPerWeek: true,
            lessonDuration: true,
          },
        },
      },
    });

    if (!studentProfile || studentProfile.teachers.length === 0) {
      return NextResponse.json(
        {
          error: 'Aluno não encontrado ou não está vinculado a este professor',
        },
        { status: 404 }
      );
    }

    const relationship = studentProfile.teachers[0];
    const lessonStart = new Date(scheduledAt);

    // Calcular datas de recorrência
    let lessonDates = [lessonStart];
    if (isRecurring && recurrenceType !== 'NONE' && recurrenceEnd) {
      lessonDates = calculateRecurrenceDates(
        lessonStart,
        recurrenceType,
        new Date(recurrenceEnd)
      );
    }

    // NOVO: Verificar conflitos para todas as datas se não forçando criação
    const allConflicts: any[] = [];
    const allWarnings: string[] = [];

    if (!forceCreate) {
      console.log(
        `🔍 [CONFLICTS] Verificando conflitos para ${lessonDates.length} aulas...`
      );

      for (const date of lessonDates.slice(0, 10)) {
        // Verificar apenas as primeiras 10 para performance
        const conflictCheck = await checkScheduleConflicts(
          teacherProfile.id,
          date,
          duration
        );

        if (conflictCheck.hasConflicts) {
          allConflicts.push(
            ...conflictCheck.conflicts.map((c) => ({
              ...c,
              plannedDate: date,
            }))
          );
        }

        allWarnings.push(...conflictCheck.warnings);
      }

      // Se há conflitos e não está forçando, retornar erro com detalhes
      if (allConflicts.length > 0) {
        return NextResponse.json(
          {
            error: 'Conflitos de horário detectados',
            conflicts: allConflicts,
            warnings: Array.from(new Set(allWarnings)), // Remove duplicatas
            totalLessonsPlanned: lessonDates.length,
            message:
              'Algumas aulas entrarão em conflito com horários já agendados. Deseja criar mesmo assim?',
          },
          { status: 409 }
        );
      }
    }

    // Verificar limite de aulas por semana (apenas para primeira aula)
    const weekStart = new Date(lessonStart);
    weekStart.setDate(lessonStart.getDate() - lessonStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const lessonsThisWeek = await prisma.lesson.count({
      where: {
        teacherId: teacherProfile.id,
        studentId: studentProfile.id,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });

    if (lessonsThisWeek >= relationship.maxLessonsPerWeek) {
      return NextResponse.json(
        {
          error: `Limite de ${relationship.maxLessonsPerWeek} aula(s) por semana atingido`,
        },
        { status: 400 }
      );
    }

    // Criar aulas
    const createdLessons = [];
    const skippedLessons = [];
    let parentLessonId: string | null = null;

    console.log(`📝 [LESSONS] Criando ${lessonDates.length} aula(s)...`);

    for (let i = 0; i < lessonDates.length; i++) {
      const lessonDate = lessonDates[i];

      try {
        // CORREÇÃO: Remover a condição problemática que impedia criação das outras aulas
        const lesson: Lesson = await prisma.lesson.create({
          data: {
            teacherId: teacherProfile.id,
            studentId: studentProfile.id,
            title: lessonDates.length > 1 ? `${title} (${i + 1})` : title,
            description,
            scheduledAt: lessonDate,
            duration,
            type,
            location,
            objectives,
            workScoreIds,
            topics,
            techniques,
            repertoire,
            homework,
            practiceGoals,
            teacherNotes,
            publicNotes,
            status: 'SCHEDULED',
            isRecurring: lessonDates.length > 1,
            recurrenceType: lessonDates.length > 1 ? recurrenceType : 'NONE',
            parentLessonId: i === 0 ? null : parentLessonId,
            recurrenceEnd: isRecurring ? new Date(recurrenceEnd) : null,
          },
          include: {
            teacher: {
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
          },
        });

        // Definir o parentLessonId na primeira iteração
        if (i === 0) {
          parentLessonId = lesson.id;
        }

        createdLessons.push(lesson);
        console.log(
          `✅ [LESSONS] Aula ${i + 1} criada: ${lessonDate.toISOString()}`
        );
      } catch (error) {
        console.log(`⚠️ [LESSONS] Erro ao criar aula ${i + 1}: ${error}`);
        skippedLessons.push({
          date: lessonDate,
          reason: 'Erro na criação',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    // 🔥 REVALIDAR CACHE APÓS CRIAÇÃO
    await revalidateTeacherData(session.user.id);

    const response = {
      success: true,
      lessons: createdLessons,
      message: `${createdLessons.length} aula(s) criada(s) com sucesso`,
      isRecurring: lessonDates.length > 1,
      totalPlanned: lessonDates.length,
      created: createdLessons.length,
      skipped: skippedLessons.length,
      skippedDetails: skippedLessons,
      // NOVO: Info sobre renovação
      renewalInfo: isRecurring
        ? {
            canRenewAt: new Date(recurrenceEnd).toISOString(),
            renewalMessage:
              'Você receberá uma notificação próximo ao final do período para renovar facilmente!',
          }
        : null,
    };

    console.log(
      `✅ [LESSONS] Criação concluída: ${createdLessons.length}/${lessonDates.length} aulas criadas`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [LESSONS] Erro ao criar aula:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar aula (com revalidação do cache)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { lessonId, ...updateData } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`📅✏️ [LESSONS] Atualizando aula ${lessonId}`);

    // Verificar se professor é dono da aula
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        teacherId: teacherProfile?.id,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // Se mudou horário, verificar conflitos
    if (
      updateData.scheduledAt &&
      updateData.scheduledAt !== lesson.scheduledAt.toISOString()
    ) {
      const conflictCheck = await checkScheduleConflicts(
        teacherProfile!.id,
        new Date(updateData.scheduledAt),
        updateData.duration || lesson.duration,
        lessonId
      );

      if (conflictCheck.hasConflicts) {
        return NextResponse.json(
          {
            error: 'Conflito de horário detectado',
            conflicts: conflictCheck.conflicts,
            warnings: conflictCheck.warnings,
          },
          { status: 409 }
        );
      }
    }

    // Atualizar aula
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
      include: {
        teacher: {
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
      },
    });

    // 🔥 REVALIDAR CACHE APÓS ATUALIZAÇÃO
    await revalidateTeacherData(session.user.id);

    console.log(`✅ [LESSONS] Aula atualizada e cache revalidado: ${lessonId}`);

    return NextResponse.json({
      success: true,
      lesson: updatedLesson,
      message: 'Aula atualizada com sucesso',
    });
  } catch (error) {
    console.error('❌ [LESSONS] Erro ao atualizar aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar aula (MELHORADO com opções avançadas)
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
    const lessonId = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Cancelada pelo professor';
    const cancelRecurringSeries = searchParams.get('cancelSeries') === 'true';
    const cancelFutureOnly = searchParams.get('futureOnly') === 'true'; // NOVO: cancelar apenas futuras

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `📅❌ [LESSONS] Cancelando aula ${lessonId} ${
        cancelRecurringSeries ? '(série completa)' : ''
      }`
    );

    // Verificar se professor é dono da aula
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        teacherId: teacherProfile?.id,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    let cancelledLessons = 1;
    const cancelledDetails = [];

    if (
      cancelRecurringSeries &&
      (lesson.parentLessonId || lesson.isRecurring)
    ) {
      // Cancelar série de aulas
      const parentId = lesson.parentLessonId || lesson.id;

      // NOVO: Opção de cancelar apenas futuras
      const whereCondition: any = {
        OR: [{ id: parentId }, { parentLessonId: parentId }],
        status: 'SCHEDULED',
      };

      if (cancelFutureOnly) {
        whereCondition.scheduledAt = {
          gte: new Date(),
        };
      }

      // Buscar aulas para cancelar
      const lessonsToCancel = await prisma.lesson.findMany({
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
      });

      // Cancelar em lote
      const updateResult = await prisma.lesson.updateMany({
        where: whereCondition,
        data: {
          status: 'CANCELLED',
          cancelReason: reason,
          cancelledBy: 'teacher',
          cancelledAt: new Date(),
        },
      });

      cancelledLessons = updateResult.count;

      // Detalhes das aulas canceladas
      cancelledDetails.push(
        ...lessonsToCancel.map((l) => ({
          id: l.id,
          title: l.title,
          scheduledAt: l.scheduledAt,
          studentName:
            `${l.student.user.firstName} ${l.student.user.lastName}`.trim(),
        }))
      );

      console.log(`✅ [LESSONS] Série cancelada: ${cancelledLessons} aulas`);
    } else {
      // Cancelar apenas esta aula
      await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          status: 'CANCELLED',
          cancelReason: reason,
          cancelledBy: 'teacher',
          cancelledAt: new Date(),
        },
      });

      cancelledDetails.push({
        id: lesson.id,
        title: lesson.title,
        scheduledAt: lesson.scheduledAt,
      });

      console.log(`✅ [LESSONS] Aula individual cancelada: ${lessonId}`);
    }

    // 🔥 REVALIDAR CACHE APÓS CANCELAMENTO
    await revalidateTeacherData(session.user.id);

    console.log(`✅ [LESSONS] Cache revalidado após cancelamento`);

    return NextResponse.json({
      success: true,
      message: `${cancelledLessons} aula(s) cancelada(s) com sucesso`,
      cancelledCount: cancelledLessons,
      cancelledDetails,
      reason,
      // NOVO: Sugestão de reagendamento
      suggestion:
        cancelledLessons === 1
          ? 'Deseja reagendar esta aula para outro horário?'
          : 'Deseja reagendar alguma dessas aulas?',
    });
  } catch (error) {
    console.error('❌ [LESSONS] Erro ao cancelar aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
