// app/api/teacher/calendar/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'lesson' | 'break' | 'blocked';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  student?: {
    id: string;
    name: string;
    image?: string;
    level: string;
  };
  location?: string;
  description?: string;
  objectives?: string[];
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  // Dados extras para modal
  details?: {
    workScoreIds: string[];
    topics: string[];
    techniques: string[];
    homework?: string;
    teacherNotes?: string;
    publicNotes?: string;
    isRecurring: boolean;
    recurrenceType?: string;
  };
}

interface CalendarConflict {
  date: Date;
  conflicts: Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    studentName: string;
  }>;
}

interface CalendarStats {
  totalLessons: number;
  completedLessons: number;
  scheduledLessons: number;
  cancelledLessons: number;
  busyHours: number;
  freeHours: number;
  averageLessonsPerDay: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('SESSION', session);
    if (!session?.user?.id || session.user.role !== 1) {
      console.log(
        `❌ [TEACHER-CALENDAR] Acesso negado. UserID: ${session?.user?.id}, Role: ${session?.user?.role}`
      );
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const view = searchParams.get('view') || 'month';
    const includeStats = searchParams.get('stats') === 'true';
    const detectConflicts = searchParams.get('conflicts') === 'true';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Parâmetros start e end são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(
      `📅 [TEACHER-CALENDAR] Carregando calendário: ${startDate} a ${endDate} para professor ${session.user.id}`
    );

    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      console.log(
        `❌ [TEACHER-CALENDAR] Perfil de professor não encontrado para user ${session.user.id}`
      );
      return NextResponse.json(
        { error: 'Perfil de professor não encontrado' },
        { status: 404 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const teacherId = teacherProfile.id;

    console.log(`🎯 [TEACHER-CALENDAR] Teacher ID: ${teacherId}`);

    // Buscar aulas do período + atrasadas do passado em paralelo
    const [lessons, overdueFromPast] = await Promise.all([
      prisma.lesson.findMany({
        where: {
          teacherId,
          scheduledAt: {
            gte: start,
            lte: end,
          },
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
        },
        orderBy: { scheduledAt: 'asc' },
      }),

      // 🆕 Buscar TODAS as atrasadas antes do período (SCHEDULED + já passou)
      prisma.lesson.findMany({
        where: {
          teacherId,
          status: 'SCHEDULED',
          scheduledAt: {
            lt: start,
          },
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
        },
        orderBy: { scheduledAt: 'asc' },
      }),
    ]);

    console.log(
      `📊 [TEACHER-CALENDAR] Encontradas ${lessons.length} aulas no período, ${overdueFromPast.length} atrasadas do passado`
    );

    // Converter aulas do período
    const events: CalendarEvent[] = lessons.map((lesson) => {
      const startTime = new Date(lesson.scheduledAt);
      const endTime = new Date(startTime.getTime() + lesson.duration * 60000);
      const needsAttention = lesson.status === 'SCHEDULED' && endTime < now;

      let backgroundColor = '#3B82F6';
      let borderColor = '#1D4ED8';
      let textColor = '#FFFFFF';

      switch (lesson.status) {
        case 'COMPLETED':
          backgroundColor = '#10B981';
          borderColor = '#059669';
          break;
        case 'CANCELLED':
          backgroundColor = '#EF4444';
          borderColor = '#DC2626';
          break;
        case 'NO_SHOW':
          backgroundColor = '#F59E0B';
          borderColor = '#D97706';
          textColor = '#000000';
          break;
        case 'RESCHEDULED':
          backgroundColor = '#8B5CF6';
          borderColor = '#7C3AED';
          break;
      }

      return {
        id: lesson.id,
        title: lesson.title,
        start: startTime,
        end: endTime,
        type: 'lesson',
        status: lesson.status as any,
        needsAttention,
        student: {
          id: lesson.student.user.id,
          name: `${lesson.student.user.firstName || ''} ${
            lesson.student.user.lastName || ''
          }`.trim(),
          image: lesson.student.user.image || undefined,
          level: lesson.student.level,
        },
        location: lesson.location || undefined,
        description: lesson.description || undefined,
        objectives: lesson.objectives,
        backgroundColor,
        borderColor,
        textColor,
        details: {
          workScoreIds: lesson.workScoreIds,
          topics: lesson.topics,
          techniques: lesson.techniques,
          homework: lesson.homework || undefined,
          teacherNotes: lesson.teacherNotes || undefined,
          publicNotes: lesson.publicNotes || undefined,
          isRecurring: lesson.isRecurring,
          recurrenceType: lesson.recurrenceType || undefined,
        },
      };
    });

    // 🆕 Converter atrasadas do passado (sempre needsAttention: true)
    const overdueEvents: CalendarEvent[] = overdueFromPast.map((lesson) => {
      const startTime = new Date(lesson.scheduledAt);
      const endTime = new Date(startTime.getTime() + lesson.duration * 60000);

      return {
        id: lesson.id,
        title: lesson.title,
        start: startTime,
        end: endTime,
        type: 'lesson',
        status: lesson.status as any,
        needsAttention: true,
        student: {
          id: lesson.student.user.id,
          name: `${lesson.student.user.firstName || ''} ${
            lesson.student.user.lastName || ''
          }`.trim(),
          image: lesson.student.user.image || undefined,
          level: lesson.student.level,
        },
        location: lesson.location || undefined,
        description: lesson.description || undefined,
        objectives: lesson.objectives,
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        textColor: '#FFFFFF',
        details: {
          workScoreIds: lesson.workScoreIds,
          topics: lesson.topics,
          techniques: lesson.techniques,
          homework: lesson.homework || undefined,
          teacherNotes: lesson.teacherNotes || undefined,
          publicNotes: lesson.publicNotes || undefined,
          isRecurring: lesson.isRecurring,
          recurrenceType: lesson.recurrenceType || undefined,
        },
      };
    });

    // 🆕 Mesclar: atrasadas primeiro + período normal
    const allEvents = [...overdueEvents, ...events];

    // Resposta base
    const response: any = {
      success: true,
      events: allEvents,
      period: {
        start,
        end,
        view,
      },
      metadata: {
        totalEvents: allEvents.length,
        lessonCount: allEvents.filter((e) => e.type === 'lesson').length,
      },
    };

    // Adicionar estatísticas se solicitado (baseado em allEvents)
    if (includeStats) {
      console.log('📈 Calculando estatísticas do período...');

      const totalLessons = allEvents.length;
      const completedLessons = allEvents.filter(
        (e) => e.status === 'COMPLETED'
      ).length;
      const scheduledLessons = allEvents.filter(
        (e) => e.status === 'SCHEDULED'
      ).length;
      const cancelledLessons = allEvents.filter(
        (e) => e.status === 'CANCELLED'
      ).length;

      const busyHours = allEvents.reduce((total, event) => {
        const duration =
          (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
        return total + duration;
      }, 0);

      const periodDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const workingDays = Math.max(1, (periodDays * 5) / 7);
      const totalAvailableHours = workingDays * 8;
      const freeHours = Math.max(0, totalAvailableHours - busyHours);
      const averageLessonsPerDay = totalLessons / Math.max(1, periodDays);

      const stats: CalendarStats = {
        totalLessons,
        completedLessons,
        scheduledLessons,
        cancelledLessons,
        busyHours: Math.round(busyHours * 10) / 10,
        freeHours: Math.round(freeHours * 10) / 10,
        averageLessonsPerDay: Math.round(averageLessonsPerDay * 10) / 10,
      };

      response.stats = stats;
    }

    // Detectar conflitos se solicitado (apenas no período visual, sem os antigos)
    if (detectConflicts) {
      console.log('🔍 Detectando conflitos de horário...');

      const conflicts: CalendarConflict[] = [];
      const conflictMap = new Map<string, CalendarEvent[]>();

      events.forEach((event) => {
        const dateKey = event.start.toDateString();
        if (!conflictMap.has(dateKey)) {
          conflictMap.set(dateKey, []);
        }
        conflictMap.get(dateKey)!.push(event);
      });

      conflictMap.forEach((dayEvents, dateStr) => {
        const dayConflicts: CalendarConflict['conflicts'] = [];

        for (let i = 0; i < dayEvents.length; i++) {
          for (let j = i + 1; j < dayEvents.length; j++) {
            const event1 = dayEvents[i];
            const event2 = dayEvents[j];

            const hasOverlap =
              event1.start < event2.end && event1.end > event2.start;

            if (
              hasOverlap &&
              event1.status === 'SCHEDULED' &&
              event2.status === 'SCHEDULED'
            ) {
              dayConflicts.push({
                id: event1.id,
                title: event1.title,
                start: event1.start,
                end: event1.end,
                studentName: event1.student?.name || 'Desconhecido',
              });

              dayConflicts.push({
                id: event2.id,
                title: event2.title,
                start: event2.start,
                end: event2.end,
                studentName: event2.student?.name || 'Desconhecido',
              });
            }
          }
        }

        if (dayConflicts.length > 0) {
          conflicts.push({
            date: new Date(dateStr),
            conflicts: dayConflicts,
          });
        }
      });

      response.conflicts = conflicts;
      response.hasConflicts = conflicts.length > 0;
    }

    console.log(
      `✅ [TEACHER-CALENDAR] Calendário carregado: ${events.length} no período + ${overdueEvents.length} atrasadas`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [TEACHER-CALENDAR] Erro ao carregar calendário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar evento rápido no calendário (aula simples)
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
      start,
      duration = 60,
      location,
      objectives = [],
    } = body;

    if (!studentUserId || !title || !start) {
      return NextResponse.json(
        {
          error: 'studentUserId, title e start são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log(`📅➕ [TEACHER-CALENDAR] Criação rápida de aula: ${title}`);

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

    // Verificar se aluno está vinculado
    const studentProfile = await prisma.student.findUnique({
      where: { userId: studentUserId },
      select: {
        id: true,
        teachers: {
          where: {
            teacherId: teacherProfile.id,
            isActive: true,
          },
          select: { id: true },
        },
      },
    });

    if (!studentProfile || studentProfile.teachers.length === 0) {
      return NextResponse.json(
        {
          error: 'Aluno não encontrado ou não está vinculado',
        },
        { status: 404 }
      );
    }

    // Verificar conflitos
    const startTime = new Date(start);
    const conflicts = await prisma.lesson.findMany({
      where: {
        teacherId: teacherProfile.id,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(startTime.getTime() - 30 * 60000), // 30 min antes
          lte: new Date(startTime.getTime() + (duration + 30) * 60000), // duração + 30 min depois
        },
      },
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

    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          error: 'Conflito de horário detectado',
          conflicts: conflicts.map((c) => ({
            id: c.id,
            title: c.title,
            scheduledAt: c.scheduledAt,
            studentName:
              `${c.student.user.firstName} ${c.student.user.lastName}`.trim(),
          })),
        },
        { status: 409 }
      );
    }

    // Criar aula
    const lesson = await prisma.lesson.create({
      data: {
        teacherId: teacherProfile.id,
        studentId: studentProfile.id,
        title,
        scheduledAt: startTime,
        duration,
        location,
        objectives,
        status: 'SCHEDULED',
        type: 'INDIVIDUAL',
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
      },
    });

    // Converter para evento do calendário
    const event: CalendarEvent = {
      id: lesson.id,
      title: lesson.title,
      start: lesson.scheduledAt,
      end: new Date(lesson.scheduledAt.getTime() + lesson.duration * 60000),
      type: 'lesson',
      status: 'SCHEDULED',
      student: {
        id: lesson.student.user.id,
        name: `${lesson.student.user.firstName} ${lesson.student.user.lastName}`.trim(),
        image: lesson.student.user.image || undefined,
        level: lesson.student.level,
      },
      location: lesson.location || undefined,
      objectives: lesson.objectives,
      backgroundColor: '#3B82F6',
      borderColor: '#1D4ED8',
      textColor: '#FFFFFF',
    };

    console.log(`✅ [TEACHER-CALENDAR] Aula criada: ${lesson.id}`);

    return NextResponse.json({
      success: true,
      event,
      lesson,
      message: 'Aula criada com sucesso',
    });
  } catch (error) {
    console.error('❌ [TEACHER-CALENDAR] Erro ao criar aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Mover aula no calendário (drag & drop)
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
    const { lessonId, newStart, newDuration } = body;

    if (!lessonId || !newStart) {
      return NextResponse.json(
        {
          error: 'lessonId e newStart são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log(
      `📅📝 [TEACHER-CALENDAR] Movendo aula ${lessonId} para ${newStart}`
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

    const newStartTime = new Date(newStart);
    const duration = newDuration || lesson.duration;

    // Verificar conflitos no novo horário
    const conflicts = await prisma.lesson.findMany({
      where: {
        teacherId: teacherProfile!.id,
        status: 'SCHEDULED',
        id: { not: lessonId },
        scheduledAt: {
          gte: new Date(newStartTime.getTime() - 30 * 60000),
          lte: new Date(newStartTime.getTime() + (duration + 30) * 60000),
        },
      },
    });

    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          error: 'Conflito de horário no novo horário',
          conflicts: conflicts.map((c) => ({
            id: c.id,
            title: c.title,
            scheduledAt: c.scheduledAt,
          })),
        },
        { status: 409 }
      );
    }

    // Atualizar aula
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        scheduledAt: newStartTime,
        duration: duration,
        rescheduledFrom: lesson.scheduledAt,
      },
    });

    console.log(`✅ [TEACHER-CALENDAR] Aula movida: ${lessonId}`);

    return NextResponse.json({
      success: true,
      lesson: updatedLesson,
      message: 'Aula reagendada com sucesso',
    });
  } catch (error) {
    console.error('❌ [TEACHER-CALENDAR] Erro ao mover aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
