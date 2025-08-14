// app/api/lessons/route.ts - ATUALIZADO COM NOTIFICAÇÕES EM TEMPO REAL

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { Lesson, LessonStatus } from '@prisma/client';
import { NotificationFactory } from '@/app/utils/notifications/createNotification';

// FUNÇÃO MELHORADA PARA REVALIDAR CACHE (MANTIDA)
async function revalidateTeacherData(userId: string, studentUserId?: string) {
  console.log(`🔄 [CACHE] Revalidating teacher data for user ${userId}`);

  try {
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
    revalidateTag('teacher-profile-data');
    revalidateTag('teacher-profile-extended-data');

    // Tag específica do usuário
    revalidateTag(`teacher-${userId}`);

    // Se tiver studentUserId, revalidar também
    if (studentUserId) {
      revalidateTag('student-lessons');
      revalidateTag('student-dashboard');
      revalidateTag(`student-${studentUserId}`);
    }

    // Revalidar tags gerais que podem estar sendo usadas
    revalidateTag('lessons');
    revalidateTag('teacher-data');

    console.log(`✅ [CACHE] Teacher cache revalidated for user ${userId}`);
  } catch (error) {
    console.error('❌ [CACHE] Error revalidating cache:', error);
  }
}

// FUNÇÃO PARA CALCULAR STATS EM TEMPO REAL (MANTIDA)
async function calculateLessonsStats(teacherId: string) {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [
    totalLessons,
    scheduledLessons,
    completedLessons,
    cancelledLessons,
    noShowLessons,
    todayLessons,
    weekLessons,
    monthLessons,
    avgDurationResult,
  ] = await Promise.all([
    prisma.lesson.count({ where: { teacherId } }),
    prisma.lesson.count({ where: { teacherId, status: 'SCHEDULED' } }),
    prisma.lesson.count({ where: { teacherId, status: 'COMPLETED' } }),
    prisma.lesson.count({ where: { teacherId, status: 'CANCELLED' } }),
    prisma.lesson.count({ where: { teacherId, status: 'NO_SHOW' } }),
    prisma.lesson.count({
      where: {
        teacherId,
        scheduledAt: { gte: today, lt: tomorrow },
      },
    }),
    prisma.lesson.count({
      where: {
        teacherId,
        scheduledAt: { gte: startOfWeek, lt: endOfWeek },
      },
    }),
    prisma.lesson.count({
      where: {
        teacherId,
        scheduledAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    prisma.lesson.aggregate({
      where: { teacherId },
      _avg: { duration: true },
    }),
  ]);

  const completionRate =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return {
    total: totalLessons,
    scheduled: scheduledLessons,
    completed: completedLessons,
    cancelled: cancelledLessons,
    noShow: noShowLessons,
    today: todayLessons,
    thisWeek: weekLessons,
    thisMonth: monthLessons,
    averageDuration: Math.round(avgDurationResult._avg.duration || 60),
    completionRate: Math.round(completionRate * 10) / 10,
  };
}

// Função para calcular datas de recorrência com limite de 3 meses (MANTIDA)
function calculateRecurrenceDates(
  startDate: Date,
  recurrenceType: string,
  endDate: Date
): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  // Verificar limite de 3 meses
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

// Função melhorada para verificar conflitos de horário (MANTIDA)
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

// GET - Listar aulas com ordenação cronológica melhorada (SEM MUDANÇAS)
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
    const includeStats = searchParams.get('includeStats') === 'true';

    console.log(
      `📅 [LESSONS] Listando aulas - User: ${session.user.id}, Role: ${session.user.role}`
    );

    // Montar where clause baseado no role
    const whereClause: any = {};
    let userTeacherId: string | null = null;

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

      userTeacherId = teacherProfile.id;
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

    // ORDENAÇÃO CRONOLÓGICA MELHORADA: Separar futuras das passadas
    const now = new Date();

    // Buscar aulas futuras e passadas separadamente
    const [futureLessons, pastLessons, totalCount] = await Promise.all([
      // Aulas futuras: ordenar por data crescente (mais próximas primeiro)
      prisma.lesson.findMany({
        where: {
          ...whereClause,
          scheduledAt: { gte: now },
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
        },
        orderBy: { scheduledAt: 'asc' },
        take: Math.floor(limit / 2), // Metade do limite para futuras
        skip: Math.floor(offset / 2),
      }),
      // Aulas passadas: ordenar por data decrescente (mais recentes primeiro)
      prisma.lesson.findMany({
        where: {
          ...whereClause,
          scheduledAt: { lt: now },
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
        },
        orderBy: { scheduledAt: 'desc' },
        take: Math.ceil(limit / 2), // Outra metade para passadas
        skip: Math.ceil(offset / 2),
      }),
      prisma.lesson.count({ where: whereClause }),
    ]);

    // Combinar as listas: futuras primeiro, depois passadas
    const lessons = [...futureLessons, ...pastLessons];

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
        level: lesson.student.level,
      },
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    }));

    // CALCULAR STATS EM TEMPO REAL SE SOLICITADO
    let stats = null;
    if (includeStats && userTeacherId) {
      stats = await calculateLessonsStats(userTeacherId);
      console.log('📊 Stats calculados em tempo real:', stats);
    }

    console.log(`✅ [LESSONS] Retornando ${lessonsFormatted.length} aulas`);

    return NextResponse.json({
      success: true,
      lessons: lessonsFormatted,
      stats,
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

// 🆕 POST - Criar nova aula (COM NOTIFICAÇÃO)
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
      // CAMPOS DE PEÇAS MUSICAIS
      worksIds = [],
      workScoreIds = [],
      topics = [],
      techniques = [],
      repertoire = [],
      homework,
      practiceGoals = [],
      teacherNotes,
      publicNotes,
      // Recorrência
      isRecurring = false,
      recurrenceType = 'NONE',
      recurrenceEnd,
      forceCreate = false,
    } = body;

    // Validação básica (mantida)
    const errors: string[] = [];

    if (!studentUserId) errors.push('Aluno é obrigatório');
    if (!title?.trim()) errors.push('Título é obrigatório');
    if (!scheduledAt) errors.push('Data e hora são obrigatórias');

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      errors.push('Data e hora inválidas');
    } else if (scheduledDate < new Date()) {
      errors.push('Data e hora devem ser no futuro');
    }

    if (duration < 15 || duration > 300) {
      errors.push('Duração deve estar entre 15 e 300 minutos');
    }

    // VALIDAÇÃO DE PEÇAS MUSICAIS
    if (worksIds && worksIds.length > 4) {
      errors.push('Máximo de 4 obras por aula');
    }

    if (workScoreIds && workScoreIds.length > 4) {
      errors.push('Máximo de 4 partituras por aula');
    }

    // LOG DOS DADOS DE PEÇAS MUSICAIS
    console.log('🎼 [LESSONS] Dados de peças musicais recebidos:', {
      worksIds: worksIds || [],
      workScoreIds: workScoreIds || [],
      totalWorks: worksIds?.length || 0,
      totalScores: workScoreIds?.length || 0,
    });

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Erros de validação encontrados',
          validationErrors: errors,
        },
        { status: 400 }
      );
    }

    console.log(`📅➕ [LESSONS] Criando aula: ${title} - ${scheduledAt}`);

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

    // Verificar se aluno existe
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

    // VALIDAR IDs DAS WORKS (se fornecidas)
    if (worksIds && worksIds.length > 0) {
      console.log('🔍 [LESSONS] Validando IDs das obras:', worksIds);

      try {
        const validWorks = await prisma.work.findMany({
          where: { id: { in: worksIds } },
          select: { id: true, title: true },
        });

        if (validWorks.length !== worksIds.length) {
          const foundIds = validWorks.map((w) => w.id);
          const invalidIds = worksIds.filter(
            (id: string) => !foundIds.includes(id)
          );
          console.warn('⚠️ [LESSONS] Obras inválidas encontradas:', invalidIds);

          return NextResponse.json(
            {
              error: `Obras inválidas: ${invalidIds.join(', ')}`,
              validWorks: foundIds,
              invalidWorks: invalidIds,
            },
            { status: 400 }
          );
        }

        console.log(
          '✅ [LESSONS] Todas as obras são válidas:',
          validWorks.map((w) => w.title)
        );
      } catch (error) {
        console.error('❌ [LESSONS] Erro ao validar obras:', error);
        return NextResponse.json(
          { error: 'Erro ao validar obras selecionadas' },
          { status: 400 }
        );
      }
    }

    // VALIDAR IDs DAS WORK SCORES (se fornecidas)
    if (workScoreIds && workScoreIds.length > 0) {
      console.log('🔍 [LESSONS] Validando IDs das partituras:', workScoreIds);

      try {
        const validScores = await prisma.workScore.findMany({
          where: { id: { in: workScoreIds } },
          select: { id: true, title: true },
        });

        if (validScores.length !== workScoreIds.length) {
          const foundIds = validScores.map((s) => s.id);
          const invalidIds = workScoreIds.filter(
            (id: string) => !foundIds.includes(id)
          );
          console.warn(
            '⚠️ [LESSONS] Partituras inválidas encontradas:',
            invalidIds
          );

          return NextResponse.json(
            {
              error: `Partituras inválidas: ${invalidIds.join(', ')}`,
              validScores: foundIds,
              invalidScores: invalidIds,
            },
            { status: 400 }
          );
        }

        console.log(
          '✅ [LESSONS] Todas as partituras são válidas:',
          validScores.map((s) => s.title)
        );
      } catch (error) {
        console.error('❌ [LESSONS] Erro ao validar partituras:', error);
        return NextResponse.json(
          { error: 'Erro ao validar partituras selecionadas' },
          { status: 400 }
        );
      }
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

    // Verificar conflitos se não forçando criação
    if (!forceCreate) {
      const conflictCheck = await checkScheduleConflicts(
        teacherProfile.id,
        lessonStart,
        duration
      );

      if (conflictCheck.hasConflicts) {
        return NextResponse.json(
          {
            error: 'Conflitos de horário detectados',
            conflicts: conflictCheck.conflicts,
            warnings: conflictCheck.warnings,
          },
          { status: 409 }
        );
      }
    }

    // Criar aulas
    const createdLessons = [];
    let parentLessonId: string | null = null;

    console.log(`📝 [LESSONS] Criando ${lessonDates.length} aula(s)...`);

    for (let i = 0; i < lessonDates.length; i++) {
      const lessonDate = lessonDates[i];

      try {
        // DADOS DA AULA COM PEÇAS MUSICAIS
        const lessonData = {
          teacherId: teacherProfile.id,
          studentId: studentProfile.id,
          title: lessonDates.length > 1 ? `${title} (${i + 1})` : title,
          description,
          scheduledAt: lessonDate,
          duration,
          type,
          location,
          objectives,
          // CAMPOS DE PEÇAS MUSICAIS CORRETOS
          worksIds: worksIds || [],
          workScoreIds: workScoreIds || [],
          topics,
          techniques,
          repertoire,
          homework,
          practiceGoals,
          teacherNotes,
          publicNotes,
          status: 'SCHEDULED' as LessonStatus,
          isRecurring: lessonDates.length > 1,
          recurrenceType: lessonDates.length > 1 ? recurrenceType : 'NONE',
          parentLessonId: i === 0 ? null : parentLessonId,
          recurrenceEnd: isRecurring ? new Date(recurrenceEnd) : null,
        };

        console.log(`🔥 [LESSONS] Criando aula ${i + 1} com dados:`, {
          worksIds: lessonData.worksIds,
          workScoreIds: lessonData.workScoreIds,
          title: lessonData.title,
        });

        const lesson: Lesson = await prisma.lesson.create({
          data: lessonData,
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

        console.log(`✅ [LESSONS] Aula ${i + 1} criada com sucesso:`, {
          id: lesson.id,
          worksIds: lesson.worksIds,
          workScoreIds: lesson.workScoreIds,
          scheduledAt: lesson.scheduledAt,
        });
      } catch (error) {
        console.error(`❌ [LESSONS] Erro ao criar aula ${i + 1}:`, error);

        return NextResponse.json(
          {
            error: 'Erro ao criar aula',
            details:
              error instanceof Error ? error.message : 'Erro desconhecido',
            partialSuccess: createdLessons.length > 0,
            createdLessons: createdLessons.map((l) => ({
              id: l.id,
              title: l.title,
            })),
          },
          { status: 500 }
        );
      }
    }

    // 🆕 CRIAR NOTIFICAÇÃO: NEW_LESSON_SCHEDULED (só PAI ou solo)
    try {
      // Só criar notificação para aula PAI (primeira) ou aula solo
      const firstLesson = createdLessons[0];

      if (firstLesson && (!firstLesson.parentLessonId || !isRecurring)) {
        const teacher = await prisma.teacher.findFirst({
          where: { id: firstLesson.teacherId },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });
        let teacherName = 'Não identificado ';
        if (teacher) {
          teacherName =
            `${teacher.user.firstName} ${teacher.user.lastName}`.trim();
        }

        await NotificationFactory.newLessonScheduled(
          studentUserId,
          firstLesson.id,
          teacherName,
          firstLesson.title,
          lessonDates.length > 1 // isRecurring
        );

        console.log(
          `📬 [LESSONS] Notificação NEW_LESSON_SCHEDULED criada para aula PAI/solo: ${firstLesson.id}`
        );
      }
    } catch (notificationError) {
      console.error(
        '❌ [LESSONS] Erro ao criar notificação:',
        notificationError
      );
      // Não falhar a criação da aula por causa da notificação
    }

    // Revalidar cache
    await revalidateTeacherData(session.user.id, studentUserId);

    const response = {
      success: true,
      lessons: createdLessons,
      message: `${createdLessons.length} aula(s) criada(s) com sucesso`,
      isRecurring: lessonDates.length > 1,
      totalPlanned: lessonDates.length,
      created: createdLessons.length,
      // INFORMAÇÕES SOBRE PEÇAS MUSICAIS
      musicalPieces: {
        worksCount: worksIds?.length || 0,
        scoresCount: workScoreIds?.length || 0,
        worksIds: worksIds || [],
        workScoreIds: workScoreIds || [],
      },
      renewalInfo: isRecurring
        ? {
            canRenewAt: new Date(recurrenceEnd).toISOString(),
            renewalMessage:
              'Você receberá uma notificação próximo ao final do período para renovar facilmente!',
          }
        : null,
    };

    console.log(
      `🎉 [LESSONS] Criação concluída com peças musicais e notificação:`,
      {
        totalLessons: createdLessons.length,
        worksPerLesson: worksIds?.length || 0,
        scoresPerLesson: workScoreIds?.length || 0,
        notificationCreated: !createdLessons[0]?.parentLessonId,
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [LESSONS] Erro geral ao criar aula:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar aula (SEM MUDANÇAS SIGNIFICATIVAS, apenas com revalidação do cache)
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
      include: {
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

    // Revalidar cache
    await revalidateTeacherData(session.user.id, lesson.student.userId);

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

// DELETE - Cancelar aula (SEM MUDANÇAS SIGNIFICATIVAS)
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
    const cancelFutureOnly = searchParams.get('futureOnly') === 'true';

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
      include: {
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

    let cancelledLessons = 1;
    const cancelledDetails = [];

    if (
      cancelRecurringSeries &&
      (lesson.parentLessonId || lesson.isRecurring)
    ) {
      // Cancelar série de aulas
      const parentId = lesson.parentLessonId || lesson.id;

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

    // Revalidar cache
    await revalidateTeacherData(session.user.id, lesson.student.userId);

    console.log(`✅ [LESSONS] Cache revalidado após cancelamento`);

    return NextResponse.json({
      success: true,
      message: `${cancelledLessons} aula(s) cancelada(s) com sucesso`,
      cancelledCount: cancelledLessons,
      cancelledDetails,
      reason,
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
