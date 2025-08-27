// app/api/lessons/check-conflicts/route.ts - ATUALIZADO com sugestões de horários alternativos

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface ConflictCheckRequest {
  studentUserId: string;
  scheduledAt: string;
  duration: number;
  maxLessonsPerWeek: number;
  excludeLessonId?: string;
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

// 🆕 INTERFACES PARA SUGESTÕES
interface TimeSlotSuggestion {
  suggestedAt: Date;
  dayOfWeek: string;
  formattedTime: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface WeekSuggestion {
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  reason: string;
  formattedWeek: string;
}

interface ConflictCheckResult {
  hasTimeConflicts: boolean;
  hasWeeklyLimitExceeded: boolean;
  timeConflicts: LessonConflict[];
  weeklyLimitWarning: WeeklyLimitWarning | null;
  warnings: string[];
  // 🆕 SUGESTÕES
  suggestedTimeSlots: TimeSlotSuggestion[];
  suggestedWeeks: WeekSuggestion[];
}

// Função para calcular início e fim da semana (domingo como início)
function getWeekBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay(); // 0 = domingo
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// 🆕 FUNÇÃO PARA ENCONTRAR PRÓXIMA SEMANA DISPONÍVEL PARA O ALUNO
async function findNextAvailableWeekForStudent(
  teacherId: string,
  studentId: string,
  requestedDate: Date,
  maxLessonsPerWeek: number
): Promise<WeekSuggestion[]> {
  console.log(
    '🔍 [WEEK-SUGGESTIONS] Procurando próxima semana disponível para aluno'
  );

  const suggestions: WeekSuggestion[] = [];
  const weekToCheck = new Date(requestedDate);
  const maxWeeksToCheck = 12; // Verificar até 12 semanas à frente

  for (let weekOffset = 1; weekOffset <= maxWeeksToCheck; weekOffset++) {
    // Avançar para a próxima semana
    weekToCheck.setDate(weekToCheck.getDate() + 7);
    const { start: weekStart, end: weekEnd } = getWeekBounds(weekToCheck);

    // Contar aulas já agendadas nesta semana
    const weeklyLessons = await prisma.lesson.count({
      where: {
        teacherId,
        studentId,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    console.log(
      `📅 [WEEK-SUGGESTIONS] Semana ${weekOffset}: ${weeklyLessons}/${maxLessonsPerWeek} aulas`
    );

    // Se esta semana tem espaço para mais aulas
    if (weeklyLessons < maxLessonsPerWeek) {
      const availableSlots = maxLessonsPerWeek - weeklyLessons;

      suggestions.push({
        weekNumber: weekOffset,
        weekStart,
        weekEnd,
        reason: `${availableSlots} ${
          availableSlots === 1 ? 'vaga disponível' : 'vagas disponíveis'
        } nesta semana`,
        formattedWeek: `${weekStart.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        })} a ${weekEnd.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        })}`,
      });

      // Se encontrou uma semana com espaço, para por aqui (primeira opção)
      if (suggestions.length >= 3) break; // Máximo 3 sugestões
    }
  }

  console.log(
    `✅ [WEEK-SUGGESTIONS] Encontradas ${suggestions.length} semanas disponíveis`
  );
  return suggestions;
}

// 🆕 FUNÇÃO PARA ENCONTRAR PRÓXIMOS HORÁRIOS DISPONÍVEIS PARA O PROFESSOR
async function findNextAvailableTimeSlots(
  teacherId: string,
  requestedDateTime: Date,
  duration: number,
  excludeLessonId?: string
): Promise<TimeSlotSuggestion[]> {
  console.log('🕒 [TIME-SUGGESTIONS] Procurando próximos horários disponíveis');

  const suggestions: TimeSlotSuggestion[] = [];
  const startingTime = new Date(requestedDateTime);
  const maxSlotsToCheck = 20; // Verificar 20 slots
  const slotIncrement = duration; // Usar duração da aula como incremento

  // Horários de funcionamento (7h às 22h)
  const workingHoursStart = 7;
  const workingHoursEnd = 22;

  let currentSlot = new Date(startingTime);

  for (let i = 0; i < maxSlotsToCheck; i++) {
    // Avançar para próximo slot
    if (i > 0) {
      currentSlot = new Date(currentSlot.getTime() + slotIncrement * 60000);
    }

    // Pular fins de semana se necessário (opcional)
    const dayOfWeek = currentSlot.getDay();
    if (dayOfWeek === 0) {
      // Domingo, pular para segunda
      currentSlot.setDate(currentSlot.getDate() + 1);
      currentSlot.setHours(workingHoursStart, 0, 0, 0);
      continue;
    }

    // Verificar se está dentro do horário de funcionamento
    const hour = currentSlot.getHours();
    if (hour < workingHoursStart || hour >= workingHoursEnd) {
      // Se passou do horário, ir para o próximo dia útil
      currentSlot.setDate(currentSlot.getDate() + 1);
      currentSlot.setHours(workingHoursStart, 0, 0, 0);
      continue;
    }

    // Verificar se há conflito neste horário
    const slotEndTime = new Date(currentSlot.getTime() + duration * 60000);

    const conflictingLessons = await prisma.lesson.findMany({
      where: {
        teacherId,
        status: 'SCHEDULED',
        id: excludeLessonId ? { not: excludeLessonId } : undefined,
        AND: [
          {
            scheduledAt: {
              lt: slotEndTime,
            },
          },
        ],
      },
    });

    // Filtrar conflitos reais
    const hasConflict = conflictingLessons.some((lesson) => {
      const lessonStart = new Date(lesson.scheduledAt);
      const lessonEnd = new Date(
        lessonStart.getTime() + lesson.duration * 60000
      );
      return currentSlot < lessonEnd && slotEndTime > lessonStart;
    });

    // Se não há conflito, é um slot disponível
    if (!hasConflict) {
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dayName = dayNames[currentSlot.getDay()];

      // Determinar prioridade
      let priority: 'high' | 'medium' | 'low' = 'medium';
      const timeDiff =
        (currentSlot.getTime() - startingTime.getTime()) / (1000 * 60 * 60); // horas

      if (timeDiff <= 2) {
        priority = 'high'; // Próximas 2 horas
      } else if (timeDiff <= 24) {
        priority = 'medium'; // Próximas 24 horas
      } else {
        priority = 'low'; // Mais de 24 horas
      }

      // Gerar motivo
      let reason = '';
      if (timeDiff < 1) {
        reason = 'Disponível em breve';
      } else if (timeDiff < 24) {
        const hours = Math.ceil(timeDiff);
        reason = `Disponível em ${hours}h`;
      } else {
        const days = Math.ceil(timeDiff / 24);
        reason = `Disponível em ${days} dia${days > 1 ? 's' : ''}`;
      }

      suggestions.push({
        suggestedAt: new Date(currentSlot),
        dayOfWeek: dayName,
        formattedTime: currentSlot.toLocaleString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        reason,
        priority,
      });

      // Se encontrou suficientes sugestões, parar
      if (suggestions.length >= 5) break; // Máximo 5 sugestões
    }
  }

  // Ordenar por prioridade e tempo
  suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.suggestedAt.getTime() - b.suggestedAt.getTime();
  });

  console.log(
    `✅ [TIME-SUGGESTIONS] Encontrados ${suggestions.length} horários disponíveis`
  );
  return suggestions;
}

// Função para verificar conflitos de horário (mantida)
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
      AND: [
        {
          scheduledAt: {
            lt: endTime,
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

  const realConflicts: LessonConflict[] = [];

  for (const lesson of conflictingLessons) {
    const lessonStart = new Date(lesson.scheduledAt);
    const lessonEnd = new Date(lessonStart.getTime() + lesson.duration * 60000);

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

// Função para verificar limite semanal (mantida)
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

// Função para gerar warnings (mantida)
function generateWarnings(scheduledAt: Date): string[] {
  const warnings: string[] = [];
  const hour = scheduledAt.getHours();
  const dayOfWeek = scheduledAt.getDay();

  if (hour < 7) {
    warnings.push('Aula muito cedo (antes das 7h)');
  } else if (hour >= 22) {
    warnings.push('Aula muito tarde (depois das 22h)');
  }

  if (dayOfWeek === 0) {
    warnings.push('Aula agendada para domingo');
  } else if (dayOfWeek === 6) {
    warnings.push('Aula agendada para sábado');
  }

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

    // 1. Verificar conflitos de horário
    const timeConflicts = await checkTimeConflicts(
      teacherProfile.id,
      lessonDate,
      duration,
      excludeLessonId
    );

    // 2. Verificar limite semanal
    const weeklyLimitWarning = await checkWeeklyLimit(
      teacherProfile.id,
      studentProfile.id,
      lessonDate,
      maxLessonsPerWeek,
      excludeLessonId
    );

    // 3. Gerar warnings
    const warnings = generateWarnings(lessonDate);

    // 🆕 4. GERAR SUGESTÕES DE HORÁRIOS ALTERNATIVOS
    let suggestedTimeSlots: TimeSlotSuggestion[] = [];
    if (timeConflicts.length > 0) {
      console.log(
        '🕒 [SUGGESTIONS] Gerando sugestões de horário devido a conflitos'
      );
      suggestedTimeSlots = await findNextAvailableTimeSlots(
        teacherProfile.id,
        lessonDate,
        duration,
        excludeLessonId
      );
    }

    // 🆕 5. GERAR SUGESTÕES DE SEMANAS ALTERNATIVAS
    let suggestedWeeks: WeekSuggestion[] = [];
    if (weeklyLimitWarning) {
      console.log(
        '📅 [SUGGESTIONS] Gerando sugestões de semana devido a limite semanal'
      );
      suggestedWeeks = await findNextAvailableWeekForStudent(
        teacherProfile.id,
        studentProfile.id,
        lessonDate,
        maxLessonsPerWeek
      );
    }

    // 6. Compilar resultado
    const result: ConflictCheckResult = {
      hasTimeConflicts: timeConflicts.length > 0,
      hasWeeklyLimitExceeded: weeklyLimitWarning !== null,
      timeConflicts,
      weeklyLimitWarning,
      warnings,
      // 🆕 SUGESTÕES
      suggestedTimeSlots,
      suggestedWeeks,
    };

    console.log(`📋 [CONFLICT-CHECK] Resultado com sugestões:`, {
      hasTimeConflicts: result.hasTimeConflicts,
      timeConflictsCount: result.timeConflicts.length,
      hasWeeklyLimitExceeded: result.hasWeeklyLimitExceeded,
      warningsCount: result.warnings.length,
      // 🆕 LOGS DAS SUGESTÕES
      suggestedTimeSlotsCount: result.suggestedTimeSlots.length,
      suggestedWeeksCount: result.suggestedWeeks.length,
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
