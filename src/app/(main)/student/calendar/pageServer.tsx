// app/student/calendar/pageServer.tsx - Server Component para Calendário do Aluno

import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/app/libs/auth';
import {
  getStudentCalendar,
  getStudentProfile,
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

// Função para verificar se aluno tem professores vinculados
async function checkStudentHasTeachers(): Promise<{
  hasTeachers: boolean;
  teachers: any[];
}> {
  try {
    const profileData = await getStudentProfile();

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

// Função para buscar dados do calendário do aluno
async function fetchStudentCalendar(): Promise<StudentCalendarData | null> {
  try {
    // Buscar calendário do mês atual
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const calendarData = await getStudentCalendar(startDate, endDate, {
      view: 'month',
      includeStats: true,
    });

    if (!calendarData) {
      throw new Error('Falha ao carregar dados do calendário');
    }

    // Buscar lista de professores para filtros
    const teachersCheck = await checkStudentHasTeachers();

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

export default async function StudentCalendarPageServer() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 0) {
    notFound();
  }

  try {
    // VERIFICAÇÃO CRÍTICA: Aluno deve ter pelo menos 1 professor ativo
    console.log('🔍 Verificando se aluno tem professores vinculados...');
    const teacherCheck = await checkStudentHasTeachers();

    if (!teacherCheck.hasTeachers) {
      // Aluno não tem professores - redirecionar para dashboard
      return (
        <StudentCalendarPageClient
          initialData={null}
          studentProfile={{
            id: session.user.id,
            name: `${session.user.firstName || ''} ${
              session.user.lastName || ''
            }`.trim(),
            email: session.user.email || '',
            image: session.user.image,
            role: session.user.role,
          }}
          errorMessage="no_teachers"
        />
      );
    }

    // OTIMIZAÇÃO: Buscar dados do calendário em paralelo
    console.log('📅 Carregando calendário do aluno...');
    const calendarData = await fetchStudentCalendar();

    // Se não conseguir buscar dados críticos, mostrar erro
    if (!calendarData) {
      throw new Error('Falha ao carregar dados do calendário');
    }

    return (
      <StudentCalendarPageClient
        initialData={calendarData}
        studentProfile={{
          id: session.user.id,
          name: `${session.user.firstName || ''} ${
            session.user.lastName || ''
          }`.trim(),
          email: session.user.email || '',
          image: session.user.image,
          role: session.user.role,
        }}
      />
    );
  } catch (error) {
    console.error('❌ Erro crítico no calendário do aluno:', error);

    // Fallback com dados vazios para não quebrar a UI
    return (
      <StudentCalendarPageClient
        initialData={null}
        studentProfile={{
          id: session.user.id,
          name: `${session.user.firstName || ''} ${
            session.user.lastName || ''
          }`.trim(),
          email: session.user.email || '',
          image: session.user.image,
          role: session.user.role,
        }}
        errorMessage="Erro ao carregar dados do calendário. Tente recarregar a página."
      />
    );
  }
}
