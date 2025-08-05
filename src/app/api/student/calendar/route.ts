// app/api/student/calendar/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface StudentCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'lesson' | 'assignment_due' | 'practice_reminder';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  teacher: {
    id: string;
    name: string;
    image?: string;
  };
  location?: string;
  description?: string;
  objectives?: string[];
  homework?: string;
  publicNotes?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  // Dados extras para modal do aluno
  details?: {
    workScoreIds: string[];
    topics: string[];
    techniques: string[];
    lessonSummary?: string;
    skillsWorked: string[];
    improvements: string[];
    challenges: string[];
    studentProgress?: any;
    nextLessonPrep?: string;
    canProvideFeedback: boolean;
    studentFeedback?: string;
  };
}

interface StudentCalendarStats {
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  practiceHours: number;
  attendanceRate: number;
  averageRating?: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 0) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas alunos' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const view = searchParams.get('view') || 'month'; // month, week, day
    const includeStats = searchParams.get('stats') === 'true';
    const teacherId = searchParams.get('teacherId'); // Filtrar por professor específico

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          error: 'Parâmetros start e end são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log(
      `📅 [STUDENT-CALENDAR] Carregando calendário do aluno: ${startDate} a ${endDate}`
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

    const start = new Date(startDate);
    const end = new Date(endDate);
    const studentId = studentProfile.id;

    // Montar where clause
    const whereClause: any = {
      studentId,
      scheduledAt: {
        gte: start,
        lte: end,
      },
    };

    // Filtrar por professor se especificado
    if (teacherId) {
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId: teacherId },
        select: { id: true },
      });

      if (teacherProfile) {
        whereClause.teacherId = teacherProfile.id;
      }
    }

    // Buscar aulas no período
    const lessons = await prisma.lesson.findMany({
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
      },
      orderBy: { scheduledAt: 'asc' },
    });

    console.log(
      `📊 [STUDENT-CALENDAR] Encontradas ${lessons.length} aulas no período`
    );

    // Converter aulas para eventos do calendário
    const events: StudentCalendarEvent[] = lessons.map((lesson) => {
      const startTime = new Date(lesson.scheduledAt);
      const endTime = new Date(startTime.getTime() + lesson.duration * 60000);

      // Cores baseadas no status (perspectiva do aluno)
      let backgroundColor = '#3B82F6'; // Azul padrão
      let borderColor = '#1D4ED8';
      let textColor = '#FFFFFF';

      switch (lesson.status) {
        case 'COMPLETED':
          backgroundColor = '#10B981'; // Verde
          borderColor = '#059669';
          break;
        case 'CANCELLED':
          backgroundColor = '#6B7280'; // Cinza
          borderColor = '#4B5563';
          break;
        case 'NO_SHOW':
          backgroundColor = '#EF4444'; // Vermelho (faltou)
          borderColor = '#DC2626';
          break;
        case 'RESCHEDULED':
          backgroundColor = '#F59E0B'; // Amarelo
          borderColor = '#D97706';
          textColor = '#000000';
          break;
      }

      // Se a aula é hoje e ainda não começou, destacar
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (
        lesson.status === 'SCHEDULED' &&
        startTime >= today &&
        startTime <= new Date(today.getTime() + 24 * 60 * 60 * 1000)
      ) {
        backgroundColor = '#8B5CF6'; // Roxo para aulas de hoje
        borderColor = '#7C3AED';
      }

      return {
        id: lesson.id,
        title: lesson.title,
        start: startTime,
        end: endTime,
        type: 'lesson',
        status: lesson.status as any,
        teacher: {
          id: lesson.teacher.user.id,
          name: `${lesson.teacher.user.firstName || ''} ${
            lesson.teacher.user.lastName || ''
          }`.trim(),
          image: lesson.teacher.user.image || undefined,
        },
        location: lesson.location || undefined,
        description: lesson.description || undefined,
        objectives: lesson.objectives,
        homework: lesson.homework || undefined,
        publicNotes: lesson.publicNotes || undefined,
        backgroundColor,
        borderColor,
        textColor,
        details: {
          workScoreIds: lesson.workScoreIds,
          topics: lesson.topics,
          techniques: lesson.techniques,
          lessonSummary: lesson.lessonSummary || undefined,
          skillsWorked: lesson.skillsWorked,
          improvements: lesson.improvements,
          challenges: lesson.challenges,
          studentProgress: lesson.studentProgress,
          nextLessonPrep: lesson.nextLessonPrep || undefined,
          canProvideFeedback:
            lesson.status === 'COMPLETED' && !lesson.studentFeedback,
          studentFeedback: lesson.studentFeedback || undefined,
        },
      };
    });

    // TODO: Adicionar eventos de assignments/tarefas se necessário
    // const assignments = await prisma.assignment.findMany({...});

    // Resposta base
    const response: any = {
      success: true,
      events,
      period: {
        start,
        end,
        view,
      },
      metadata: {
        totalEvents: events.length,
        lessonCount: events.filter((e) => e.type === 'lesson').length,
        byStatus: {
          scheduled: events.filter((e) => e.status === 'SCHEDULED').length,
          completed: events.filter((e) => e.status === 'COMPLETED').length,
          cancelled: events.filter((e) => e.status === 'CANCELLED').length,
          noShow: events.filter((e) => e.status === 'NO_SHOW').length,
        },
      },
    };

    // Adicionar estatísticas se solicitado
    if (includeStats) {
      console.log('📈 Calculando estatísticas do período...');

      const totalLessons = events.length;
      const completedLessons = events.filter(
        (e) => e.status === 'COMPLETED'
      ).length;
      const upcomingLessons = events.filter(
        (e) => e.status === 'SCHEDULED'
      ).length;
      const noShowLessons = events.filter((e) => e.status === 'NO_SHOW').length;

      const practiceHours = events
        .filter((e) => e.status === 'COMPLETED')
        .reduce((total, event) => {
          const duration =
            (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
          return total + duration;
        }, 0);

      const attendanceRate =
        totalLessons > 0
          ? ((totalLessons - noShowLessons) / totalLessons) * 100
          : 100;

      const stats: StudentCalendarStats = {
        totalLessons,
        completedLessons,
        upcomingLessons,
        practiceHours: Math.round(practiceHours * 10) / 10,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
      };

      response.stats = stats;
    }

    console.log(
      `✅ [STUDENT-CALENDAR] Calendário do aluno carregado com sucesso`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [STUDENT-CALENDAR] Erro ao carregar calendário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Adicionar feedback à aula (aluno)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 0) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas alunos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { lessonId, feedback, rating } = body; // rating: 1-5

    if (!lessonId || !feedback) {
      return NextResponse.json(
        {
          error: 'lessonId e feedback são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log(
      `📝 [STUDENT-CALENDAR] Adicionando feedback à aula ${lessonId}`
    );

    // Verificar se aluno é dono da aula
    const studentProfile = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        studentId: studentProfile?.id,
        status: 'COMPLETED', // Só pode dar feedback em aulas concluídas
      },
    });

    if (!lesson) {
      return NextResponse.json(
        {
          error: 'Aula não encontrada ou não está concluída',
        },
        { status: 404 }
      );
    }

    // Atualizar aula com feedback
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        studentFeedback: feedback,
        // Se tiver campo de rating no futuro, adicionar aqui
        // studentRating: rating
      },
    });

    console.log(`✅ [STUDENT-CALENDAR] Feedback adicionado à aula ${lessonId}`);

    return NextResponse.json({
      success: true,
      lesson: updatedLesson,
      message: 'Feedback adicionado com sucesso',
    });
  } catch (error) {
    console.error('❌ [STUDENT-CALENDAR] Erro ao adicionar feedback:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
