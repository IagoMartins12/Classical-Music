// app/api/lessons/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { Lesson } from '@prisma/client';

// Função para calcular datas de recorrência
function calculateRecurrenceDates(
  startDate: Date,
  recurrenceType: string,
  endDate: Date
): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  // Limitar a 52 semanas (1 ano) para evitar loops infinitos
  const maxIterations = 52;
  let iterations = 0;

  while (currentDate <= endDate && iterations < maxIterations) {
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

  return dates;
}

// Função para verificar conflitos de horário
async function checkScheduleConflicts(
  teacherId: string,
  scheduledAt: Date,
  duration: number,
  excludeLessonId?: string
): Promise<any[]> {
  const startTime = new Date(scheduledAt);
  const endTime = new Date(startTime.getTime() + duration * 60000);

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
            gte: new Date(startTime.getTime() - 120 * 60000), // 2h buffer para busca
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
  return conflictingLessons.filter((lesson) => {
    const lessonStart = new Date(lesson.scheduledAt);
    const lessonEnd = new Date(lessonStart.getTime() + lesson.duration * 60000);

    // Verificar se há sobreposição
    return startTime < lessonEnd && endTime > lessonStart;
  });
}

// GET - Listar aulas
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
    const status = searchParams.get('status'); // SCHEDULED, COMPLETED, CANCELLED, etc.
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

      // Se especificou studentId, filtrar também
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

      // Se especificou teacherId, filtrar também
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

      // Recorrência
      isRecurring: lesson.isRecurring,
      recurrenceType: lesson.recurrenceType,
      parentLessonId: lesson.parentLessonId,

      // Conteúdo
      objectives: lesson.objectives,
      workScoreIds: lesson.workScoreIds,
      topics: lesson.topics,
      techniques: lesson.techniques,
      repertoire: lesson.repertoire,
      homework: lesson.homework,
      practiceGoals: lesson.practiceGoals,

      // Notas
      teacherNotes: lesson.teacherNotes,
      publicNotes: lesson.publicNotes,
      studentFeedback: lesson.studentFeedback,
      lessonSummary: lesson.lessonSummary,

      // Avaliação
      studentProgress: lesson.studentProgress,
      skillsWorked: lesson.skillsWorked,
      improvements: lesson.improvements,
      challenges: lesson.challenges,

      // Presença
      studentPresent: lesson.studentPresent,
      punctuality: lesson.punctuality,
      engagement: lesson.engagement,
      preparation: lesson.preparation,

      // Dados do professor e aluno
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

      // Timestamps
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

// POST - Criar nova aula (com recorrência)
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
      // Recorrência
      isRecurring = false,
      recurrenceType = 'NONE',
      recurrenceEnd,
    } = body;

    if (!studentUserId || !title || !scheduledAt) {
      return NextResponse.json(
        {
          error: 'studentUserId, title e scheduledAt são obrigatórios',
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

    // Verificar limite de aulas por semana
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

    // Verificar conflitos de horário
    const conflicts = await checkScheduleConflicts(
      teacherProfile.id,
      lessonStart,
      duration
    );

    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          error: 'Conflito de horário detectado',
          conflicts: conflicts.map((c) => ({
            id: c.id,
            title: c.title,
            scheduledAt: c.scheduledAt,
            duration: c.duration,
            studentName:
              `${c.student.user.firstName} ${c.student.user.lastName}`.trim(),
          })),
        },
        { status: 409 }
      );
    }

    // Calcular datas de recorrência se necessário
    let lessonDates = [lessonStart];
    if (isRecurring && recurrenceType !== 'NONE' && recurrenceEnd) {
      lessonDates = calculateRecurrenceDates(
        lessonStart,
        recurrenceType,
        new Date(recurrenceEnd)
      );
    }

    // Criar aulas
    const createdLessons = [];
    let parentLessonId: string | null = null;

    for (let i = 0; i < lessonDates.length; i++) {
      const lessonDate = lessonDates[i];

      // Para aulas recorrentes, verificar conflitos individualmente
      if (i > 0) {
        const conflicts = await checkScheduleConflicts(
          teacherProfile.id,
          lessonDate,
          duration
        );

        if (conflicts.length > 0) {
          console.log(`⚠️ [LESSONS] Pulando aula ${lessonDate} por conflito`);
          continue;
        }
      }

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
          // Recorrência
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

      if (i === 0) {
        parentLessonId = lesson.id;
      }

      createdLessons.push(lesson);
    }

    console.log(`✅ [LESSONS] ${createdLessons.length} aula(s) criada(s)`);

    return NextResponse.json({
      success: true,
      lessons: createdLessons,
      message: `${createdLessons.length} aula(s) criada(s) com sucesso`,
      isRecurring: lessonDates.length > 1,
      skippedDates: lessonDates.length - createdLessons.length,
    });
  } catch (error) {
    console.error('❌ [LESSONS] Erro ao criar aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar aula
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
      const conflicts = await checkScheduleConflicts(
        teacherProfile!.id,
        new Date(updateData.scheduledAt),
        updateData.duration || lesson.duration,
        lessonId
      );

      if (conflicts.length > 0) {
        return NextResponse.json(
          {
            error: 'Conflito de horário detectado',
            conflicts: conflicts.map((c) => ({
              id: c.id,
              title: c.title,
              scheduledAt: c.scheduledAt,
              duration: c.duration,
              studentName:
                `${c.student.user.firstName} ${c.student.user.lastName}`.trim(),
            })),
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

    console.log(`✅ [LESSONS] Aula atualizada: ${lessonId}`);

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

// DELETE - Cancelar aula
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

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`📅❌ [LESSONS] Cancelando aula ${lessonId}`);

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

    if (cancelRecurringSeries && lesson.parentLessonId) {
      // Cancelar toda a série
      const updateResult = await prisma.lesson.updateMany({
        where: {
          OR: [
            { id: lesson.parentLessonId },
            { parentLessonId: lesson.parentLessonId },
          ],
          status: 'SCHEDULED',
          scheduledAt: {
            gte: new Date(),
          },
        },
        data: {
          status: 'CANCELLED',
          cancelReason: reason,
          cancelledBy: 'teacher',
          cancelledAt: new Date(),
        },
      });

      cancelledLessons = updateResult.count;
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
    }

    console.log(`✅ [LESSONS] ${cancelledLessons} aula(s) cancelada(s)`);

    return NextResponse.json({
      success: true,
      message: `${cancelledLessons} aula(s) cancelada(s) com sucesso`,
      cancelledCount: cancelledLessons,
    });
  } catch (error) {
    console.error('❌ [LESSONS] Erro ao cancelar aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
