// app/student/pageServer.tsx - Servidor do Dashboard do Aluno

import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/app/libs/auth';
import StudentPageClient from './pageClient';

// Interfaces para tipagem dos dados
export interface StudentDashboardData {
  dashboard: {
    stats: {
      totalLessons: number;
      completedLessons: number;
      upcomingLessons: number;
      missedLessons: number;
      totalStudyTime: number; // em minutos
      averageAttendance: number;
      currentStreak: number;
      longestStreak: number;
    };
    upcomingLessons: Array<{
      id: string;
      title: string;
      scheduledAt: Date;
      duration: number;
      teacher: {
        id: string;
        name: string;
        image?: string;
      };
      location?: string;
      objectives: string[];
      publicNotes?: string;
      homework?: string;
      isToday: boolean;
      isNext: boolean;
    }>;
    todayLessons: Array<{
      id: string;
      title: string;
      scheduledAt: Date;
      duration: number;
      teacher: {
        id: string;
        name: string;
        image?: string;
      };
      location?: string;
      objectives: string[];
      publicNotes?: string;
      homework?: string;
    }>;
    recentLessons: Array<{
      id: string;
      title: string;
      scheduledAt: Date;
      duration: number;
      status: string;
      teacher: {
        name: string;
        image?: string;
      };
      lessonSummary?: string;
      publicNotes?: string;
      homework?: string;
      nextLessonPrep?: string;
      skillsWorked: string[];
      improvements: string[];
      challenges: string[];
      studentProgress?: any;
    }>;
    studyProgress: {
      currentWorks: Array<{
        workId: string;
        title: string;
        composer: string;
        addedAt: Date;
        difficulty?: string | null;
        selectedScore?: {
          title: string;
          type: string;
        };
      }>;
      learnedWorks: Array<{
        workId: string;
        title: string;
        composer: string;
        learnedAt: Date;
        mastery: number;
        wouldRecommend: boolean;
      }>;
      recentAnnotations: Array<{
        id: string;
        workTitle: string;
        title: string;
        category: string;
        createdAt: Date;
      }>;
    };
    teachers: Array<{
      teacherId: string;
      teacherName: string;
      teacherImage?: string;
      relationshipStart: Date;
      nextLessonAt?: Date;
      totalLessonsWithTeacher: number;
      specialties: string[];
    }>;
  };
  timestamp: string;
}

// Função para buscar dados do dashboard do aluno
async function fetchStudentDashboard(): Promise<StudentDashboardData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/student/dashboard`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 300, // 5 minutos
          tags: ['student-dashboard'],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Dashboard API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Dashboard API returned error');
    }

    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar dashboard do aluno:', error);
    return null;
  }
}

// Função para verificar se aluno tem professores vinculados
async function checkStudentTeachers(): Promise<{
  hasTeachers: boolean;
  teachers: any[];
}> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/student/profile`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 180, // 3 minutos
          tags: ['student-profile'],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Profile API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      return { hasTeachers: false, teachers: [] };
    }

    const activeTeachers = data.profile.teachers.filter((t: any) => t.isActive);

    return {
      hasTeachers: activeTeachers.length > 0,
      teachers: activeTeachers,
    };
  } catch (error) {
    console.error('❌ Erro ao verificar professores do aluno:', error);
    return { hasTeachers: false, teachers: [] };
  }
}

export default async function StudentPageServer() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 0) {
    notFound();
  }

  try {
    // VERIFICAÇÃO CRÍTICA: Aluno deve ter pelo menos 1 professor ativo
    console.log('🔍 Verificando se aluno tem professores vinculados...');
    const teacherCheck = await checkStudentTeachers();

    if (!teacherCheck.hasTeachers) {
      // Aluno não tem professores - mostrar página especial
      return (
        <StudentPageClient
          initialDashboardData={null}
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

    // OTIMIZAÇÃO: Buscar dados do dashboard
    console.log('📊 Carregando dashboard do aluno...');
    const dashboardData = await fetchStudentDashboard();

    // Se não conseguir buscar dados críticos, mostrar erro
    if (!dashboardData) {
      throw new Error('Falha ao carregar dados do dashboard');
    }

    return (
      <StudentPageClient
        initialDashboardData={dashboardData}
        studentProfile={{
          id: session.user.id,
          name: `${session.user.firstName || ''} ${
            session.user.lastName || ''
          }`.trim(),
          email: session.user.email || '',
          image: session.user.image,
          role: session.user.role,
        }}
        teachersInfo={teacherCheck.teachers}
      />
    );
  } catch (error) {
    console.error('❌ Erro crítico no servidor do aluno:', error);

    // Fallback com dados vazios para não quebrar a UI
    return (
      <StudentPageClient
        initialDashboardData={null}
        studentProfile={{
          id: session.user.id,
          name: `${session.user.firstName || ''} ${
            session.user.lastName || ''
          }`.trim(),
          email: session.user.email || '',
          image: session.user.image,
          role: session.user.role,
        }}
        errorMessage="Erro ao carregar dados. Tente recarregar a página."
      />
    );
  }
}
