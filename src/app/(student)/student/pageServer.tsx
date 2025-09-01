// app/student/pageServer.tsx - Server Component para Dashboard do Aluno

import {
  getStudentDashboardForPageServer,
  getStudentProfileForPageServer,
} from '@/app/requests/student-requests';
import StudentPageClient from './pageClient';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

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

interface StudentPageServerProps {
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string | null;
  userRole: number;
}

// 🔧 CORRIGIDO: Função agora recebe userId como parâmetro
export async function checkStudentHasTeachers(userId: string): Promise<{
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

export default async function StudentPageServer({
  userId,
  userEmail,
  userName,
  userImage,
  userRole,
}: StudentPageServerProps) {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'student/home',
  ]);
  try {
    // ✅ CORRIGIDO: Passando userId para checkStudentHasTeachers
    const teacherCheck = await checkStudentHasTeachers(userId);

    if (!teacherCheck.hasTeachers) {
      return (
        <TranslationProvider language={language} translations={translations}>
          <StudentPageClient
            initialDashboardData={null}
            studentProfile={{
              id: userId,
              name: userName,
              email: userEmail,
              image: userImage,
              role: userRole,
            }}
            errorMessage="no_teachers"
          />
        </TranslationProvider>
      );
    }

    // ✅ CORRIGIDO: Usando a função que recebe userId
    const dashboardData = await getStudentDashboardForPageServer(userId);

    // Se não conseguir buscar dados críticos, mostrar erro
    if (!dashboardData) {
      throw new Error('Falha ao carregar dados do dashboard');
    }

    const studentDashboardData: StudentDashboardData = {
      dashboard: dashboardData,
      timestamp: new Date().toISOString(),
    };

    return (
      <TranslationProvider language={language} translations={translations}>
        <StudentPageClient
          initialDashboardData={studentDashboardData}
          studentProfile={{
            id: userId,
            name: userName,
            email: userEmail,
            image: userImage,
            role: userRole,
          }}
          teachersInfo={teacherCheck.teachers}
        />
      </TranslationProvider>
    );
  } catch (error) {
    console.error('❌ [STUDENT-PAGE-SERVER] Critical error:', error);

    return (
      <TranslationProvider language={language} translations={translations}>
        <StudentPageClient
          initialDashboardData={null}
          studentProfile={{
            id: userId,
            name: userName,
            email: userEmail,
            image: userImage,
            role: userRole,
          }}
          errorMessage="Erro ao carregar dados. Tente recarregar a página."
        />
      </TranslationProvider>
    );
  }
}
