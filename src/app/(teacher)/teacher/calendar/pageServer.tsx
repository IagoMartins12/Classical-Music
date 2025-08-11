import {
  getTeacherCalendarDataDirect,
  getTeacherStudentsData,
} from '@/app/requests/teacher-request';
import TeacherCalendarPageClient from './pageClient';

export interface CalendarEvent {
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

export interface CalendarStats {
  totalLessons: number;
  completedLessons: number;
  scheduledLessons: number;
  cancelledLessons: number;
  busyHours: number;
  freeHours: number;
  averageLessonsPerDay: number;
}

export interface CalendarConflict {
  date: Date;
  conflicts: Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    studentName: string;
  }>;
}

export interface TeacherCalendarData {
  events: CalendarEvent[];
  stats?: CalendarStats;
  conflicts?: CalendarConflict[];
  hasConflicts?: boolean;
  period: {
    start: Date;
    end: Date;
    view: string;
  };
  metadata: {
    totalEvents: number;
    lessonCount: number;
  };
  students: Array<{
    id: string;
    name: string;
    image?: string | null;
    level: string;
    isActive: boolean;
  }>;
}

export default async function TeacherCalendarPageServer({
  userId,
}: {
  userId: string;
}) {
  console.log(`📅 [TEACHER-CALENDAR-PAGE-SERVER] Loading for user ${userId}`);

  try {
    // Calcular período do calendário (próximos 2 meses)
    const startDate = new Date();
    startDate.setDate(1); // Primeiro dia do mês atual

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 2);
    endDate.setDate(0); // Último dia do próximo mês

    // 🚀 Buscar dados iniciais direto do banco
    const [calendarData, studentsData] = await Promise.all([
      getTeacherCalendarDataDirect(userId, startDate, endDate, true, true),
      getTeacherStudentsData(userId, 'active', 100, 0),
    ]);

    if (!calendarData) {
      throw new Error('Falha ao carregar dados do calendário');
    }

    // Preparar lista de alunos ativos
    const activeStudents =
      studentsData?.students?.map((studentRel) => ({
        id: studentRel.student.id,
        name: studentRel.student.name,
        image: studentRel.student.image,
        level: studentRel.student.level,
        isActive: studentRel.relationship.isActive,
      })) || [];

    const teacherCalendarData: TeacherCalendarData = {
      events: calendarData.events,
      stats: calendarData.stats,
      conflicts: calendarData.conflicts,
      hasConflicts: calendarData.hasConflicts,
      period: {
        start: startDate,
        end: endDate,
        view: 'month',
      },
      metadata: {
        totalEvents: calendarData.events.length,
        lessonCount: calendarData.events.filter((e) => e.type === 'lesson')
          .length,
      },
      students: activeStudents,
    };

    console.log(`✅ [TEACHER-CALENDAR-PAGE-SERVER] Data loaded successfully`);

    return <TeacherCalendarPageClient initialData={teacherCalendarData} />;
  } catch (error) {
    console.error('❌ [TEACHER-CALENDAR-PAGE-SERVER] Critical error:', error);

    // Fallback com dados vazios
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return (
      <TeacherCalendarPageClient
        initialData={{
          events: [],
          period: { start: startDate, end: endDate, view: 'month' },
          metadata: { totalEvents: 0, lessonCount: 0 },
          students: [],
        }}
        errorMessage="Erro ao carregar dados do calendário. Tente recarregar a página."
      />
    );
  }
}
