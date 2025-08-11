// app/student/calendar/pageServer.tsx - Server Component para Calendário do Aluno

import {
  getStudentCalendarForPageServer,
  getStudentProfileForPageServer,
} from '@/app/requests/student-requests';
import StudentCalendarPageClient from './pageClient';

export interface StudentCalendarData {
  events: Array<{
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
    location?: string | null;
    description?: string | null;
    objectives?: string[] | null;
    homework?: string;
    publicNotes?: string;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    details?: {
      workScoreIds?: string[] | null;
      topics?: string[];
      techniques?: string[];
      lessonSummary?: string;
      skillsWorked?: string[];
      improvements?: string[];
      challenges?: string[];
      studentProgress?: any;
      nextLessonPrep?: string;
      canProvideFeedback: boolean;
      studentFeedback?: string;
    } | null;
  }>;
  period: {
    start: Date;
    end: Date;
    view: string;
  };
  metadata: {
    totalEvents: number;
    lessonCount: number;
    byStatus: {
      scheduled: number;
      completed: number;
      cancelled: number;
      noShow: number;
    };
  };
  stats?: {
    totalLessons: number;
    completedLessons: number;
    upcomingLessons: number;
    practiceHours: number;
    attendanceRate: number;
    averageRating?: number;
  };
  teachers: Array<{
    id: string;
    name: string;
    image?: string;
  }>;
}

interface StudentCalendarPageServerProps {
  userId: string;
}

// 🔧 CORRIGIDO: Função local que recebe userId como parâmetro
async function checkStudentHasTeachers(userId: string): Promise<{
  hasTeachers: boolean;
  teachers: any[];
}> {
  try {
    // ✅ CORRIGIDO: Passando userId para a função
    const profileData = await getStudentProfileForPageServer(userId);

    if (!profileData || !profileData.profile) {
      return { hasTeachers: false, teachers: [] };
    }

    const activeTeachers = profileData.profile.teachers.filter(
      (t) => t.isActive
    );

    return {
      hasTeachers: activeTeachers.length > 0,
      teachers: activeTeachers,
    };
  } catch (error) {
    console.error('❌ Erro ao verificar professores do aluno:', error);
    return { hasTeachers: false, teachers: [] };
  }
}

// 🔧 CORRIGIDO: Função agora recebe userId como parâmetro
async function fetchStudentCalendar(
  userId: string
): Promise<StudentCalendarData | null> {
  try {
    // Buscar calendário do mês atual
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // ✅ CORRIGIDO: Usando a função que recebe userId
    const calendarData = await getStudentCalendarForPageServer(
      userId,
      startDate,
      endDate,
      {
        view: 'month',
        includeStats: true,
      }
    );

    if (!calendarData) {
      throw new Error('Falha ao carregar dados do calendário');
    }

    // ✅ CORRIGIDO: Passando userId para checkStudentHasTeachers
    const teachersCheck = await checkStudentHasTeachers(userId);

    const teachers = teachersCheck.teachers.map((teacher) => ({
      id: teacher.teacherId,
      name: teacher.teacherName,
      image: teacher.teacherImage,
    }));

    return {
      events: calendarData.events,
      period: calendarData.period,
      metadata: calendarData.metadata,
      stats: calendarData.stats,
      teachers,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar calendário do aluno:', error);
    return null;
  }
}

export default async function StudentCalendarPageServer({
  userId,
}: StudentCalendarPageServerProps) {
  console.log(`📅 [STUDENT-CALENDAR-PAGE-SERVER] Loading for user ${userId}`);

  try {
    // VERIFICAÇÃO CRÍTICA: Aluno deve ter pelo menos 1 professor ativo
    console.log('🔍 Verificando se aluno tem professores vinculados...');
    // ✅ CORRIGIDO: Passando userId para checkStudentHasTeachers
    const teacherCheck = await checkStudentHasTeachers(userId);

    if (!teacherCheck.hasTeachers) {
      // Aluno não tem professores - mostrar página especial
      return (
        <StudentCalendarPageClient
          initialData={null}
          errorMessage="no_teachers"
        />
      );
    }

    // OTIMIZAÇÃO: Buscar dados do calendário
    console.log('📅 Carregando calendário do aluno...');
    // ✅ CORRIGIDO: Passando userId para fetchStudentCalendar
    const calendarData = await fetchStudentCalendar(userId);

    // Se não conseguir buscar dados críticos, mostrar erro
    if (!calendarData) {
      throw new Error('Falha ao carregar dados do calendário');
    }

    console.log(`✅ [STUDENT-CALENDAR-PAGE-SERVER] Data loaded successfully`);

    return <StudentCalendarPageClient initialData={calendarData} />;
  } catch (error) {
    console.error('❌ [STUDENT-CALENDAR-PAGE-SERVER] Critical error:', error);

    // Fallback com dados vazios para não quebrar a UI
    return (
      <StudentCalendarPageClient
        initialData={null}
        errorMessage="Erro ao carregar dados do calendário. Tente recarregar a página."
      />
    );
  }
}
