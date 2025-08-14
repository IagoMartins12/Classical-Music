// app/api/lessons/check-conflicts/route.ts - API para verificar conflitos de horário

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface ConflictCheckRequest {
  studentUserId: string;
  scheduledAt: string;
  duration: number;
  maxLessonsPerWeek: number;
  excludeLessonId?: string; // Para edição de aulas
}

interface LessonConflict {
  id: string;
  title: string;
  scheduledAt: Date;
  duration: number;
  studentName: string;
  studentEmail: string;
}

interface WeeklyLimitWarning {
  currentLessons: number;
  maxLessonsPerWeek: number;
  studentName: string;
  weekStart: Date;
  weekEnd: Date;
  upcomingLessons: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
  }>;
}

interface ConflictCheckResult {
  hasTimeConflicts: boolean;
  hasWeeklyLimitExceeded: boolean;
  timeConflicts: LessonConflict[];
  weeklyLimitWarning: WeeklyLimitWarning | null;
  warnings: string[];
}

// Função para calcular início e fim da semana
function getWeekBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day; // Domingo como primeiro dia da semana

  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// Função para verificar conflitos de horário
async function checkTimeConflicts(
  teacherId: string,
  scheduledAt: Date,
  duration: number,
  excludeLessonId?: string
): Promise<LessonConflict[]> {
  const startTime = new Date(scheduledAt);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  console.log(
    `🔍 [CONFLICTS] Verificando conflitos de ${startTime.toISOString()} a ${endTime.toISOString()}`
  );

  const conflictingLessons = await prisma.lesson.findMany({
    where: {
      teacherId,
      status: 'SCHEDULED',
      id: excludeLessonId ? { not: excludeLessonId } : undefined,
      // Buscar aulas que se sobrepõem
      AND: [
        {
          scheduledAt: {
            lt: endTime, // Aula começa antes do fim da nova aula
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
  const realConflicts: LessonConflict[] = [];

  for (const lesson of conflictingLessons) {
    const lessonStart = new Date(lesson.scheduledAt);
    const lessonEnd = new Date(lessonStart.getTime() + lesson.duration * 60000);

    // Verificar se há sobreposição real
    const hasOverlap = startTime < lessonEnd && endTime > lessonStart;

    if (hasOverlap) {
      realConflicts.push({
        id: lesson.id,
        title: lesson.title,
        scheduledAt: lesson.scheduledAt,
        duration: lesson.duration,
        studentName: `${lesson.student.user.firstName || ''} ${
          lesson.student.user.lastName || ''
        }`.trim(),
        studentEmail: lesson.student.user.email || '',
      });
    }
  }

  console.log(
    `${realConflicts.length > 0 ? '⚠️' : '✅'} [CONFLICTS] Encontrados ${
      realConflicts.length
    } conflitos de horário`
  );

  return realConflicts;
}

// Função para verificar limite semanal
async function checkWeeklyLimit(
  teacherId: string,
  studentId: string,
  scheduledAt: Date,
  maxLessonsPerWeek: number,
  excludeLessonId?: string
): Promise<WeeklyLimitWarning | null> {
  const { start: weekStart, end: weekEnd } = getWeekBounds(scheduledAt);

  console.log(
    `📅 [WEEKLY-LIMIT] Verificando limite semanal de ${weekStart.toISOString()} a ${weekEnd.toISOString()}`
  );

  // Buscar aulas agendadas na mesma semana
  const weeklyLessons = await prisma.lesson.findMany({
    where: {
      teacherId,
      studentId,
      status: 'SCHEDULED',
      id: excludeLessonId ? { not: excludeLessonId } : undefined,
      scheduledAt: {
        gte: weekStart,
        lte: weekEnd,
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
    orderBy: {
      scheduledAt: 'asc',
    },
  });

  const currentLessons = weeklyLessons.length;
  const willExceedLimit = currentLessons >= maxLessonsPerWeek;

  console.log(
    `📊 [WEEKLY-LIMIT] Aluno tem ${currentLessons}/${maxLessonsPerWeek} aulas esta semana. Excede limite: ${willExceedLimit}`
  );

  if (willExceedLimit && weeklyLessons.length > 0) {
    const studentName = `${weeklyLessons[0].student.user.firstName || ''} ${
      weeklyLessons[0].student.user.lastName || ''
    }`.trim();

    return {
      currentLessons,
      maxLessonsPerWeek,
      studentName,
      weekStart,
      weekEnd,
      upcomingLessons: weeklyLessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        scheduledAt: lesson.scheduledAt,
      })),
    };
  }

  return null;
}

// Função para gerar warnings adicionais
function generateWarnings(scheduledAt: Date): string[] {
  const warnings: string[] = [];
  const hour = scheduledAt.getHours();
  const dayOfWeek = scheduledAt.getDay();

  // Verificar horário
  if (hour < 7) {
    warnings.push('Aula muito cedo (antes das 7h)');
  } else if (hour >= 22) {
    warnings.push('Aula muito tarde (depois das 22h)');
  }

  // Verificar final de semana
  if (dayOfWeek === 0) {
    warnings.push('Aula agendada para domingo');
  } else if (dayOfWeek === 6) {
    warnings.push('Aula agendada para sábado');
  }

  // Verificar horário de almoço
  if (hour >= 12 && hour < 14) {
    warnings.push('Aula durante horário de almoço');
  }

  return warnings;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const body: ConflictCheckRequest = await request.json();
    const {
      studentUserId,
      scheduledAt,
      duration,
      maxLessonsPerWeek,
      excludeLessonId,
    } = body;

    // Validação
    if (!studentUserId || !scheduledAt || !duration) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: studentUserId, scheduledAt, duration' },
        { status: 400 }
      );
    }

    const lessonDate = new Date(scheduledAt);
    if (isNaN(lessonDate.getTime())) {
      return NextResponse.json(
        { error: 'Data e hora inválidas' },
        { status: 400 }
      );
    }

    console.log(
      `🔍 [CONFLICT-CHECK] Verificando conflitos para aula em ${lessonDate.toISOString()}`
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

    // Verificar se aluno existe e tem relacionamento ativo
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
            id: true,
          },
        },
      },
    });

    if (!studentProfile || studentProfile.teachers.length === 0) {
      return NextResponse.json(
        { error: 'Aluno não encontrado ou não vinculado a este professor' },
        { status: 404 }
      );
    }

    // 1. Verificar conflitos de horário (do professor)
    const timeConflicts = await checkTimeConflicts(
      teacherProfile.id,
      lessonDate,
      duration,
      excludeLessonId
    );

    // 2. Verificar limite semanal (do aluno)
    const weeklyLimitWarning = await checkWeeklyLimit(
      teacherProfile.id,
      studentProfile.id,
      lessonDate,
      maxLessonsPerWeek,
      excludeLessonId
    );

    // 3. Gerar warnings adicionais
    const warnings = generateWarnings(lessonDate);

    // 4. Compilar resultado
    const result: ConflictCheckResult = {
      hasTimeConflicts: timeConflicts.length > 0,
      hasWeeklyLimitExceeded: weeklyLimitWarning !== null,
      timeConflicts,
      weeklyLimitWarning,
      warnings,
    };

    console.log(`📋 [CONFLICT-CHECK] Resultado:`, {
      hasTimeConflicts: result.hasTimeConflicts,
      timeConflictsCount: result.timeConflicts.length,
      hasWeeklyLimitExceeded: result.hasWeeklyLimitExceeded,
      warningsCount: result.warnings.length,
    });

    return NextResponse.json({
      success: true,
      conflicts: result,
    });
  } catch (error) {
    console.error('❌ [CONFLICT-CHECK] Erro ao verificar conflitos:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
