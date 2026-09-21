// app/student/profile/pageServer.tsx - Server Component do perfil do aluno (API, Etapa 4)

import {
  getStudentProfileForPageServer,
  getStudentStudyDataForPageServer,
} from '@/app/requests/student-requests';
import StudentProfilePageClient from './pageClient';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

export interface StudentProfileData {
  profile: {
    id: string;
    userId: string;
    level: string;
    mainInstrument?: string;
    musicalGoals?: string;
    preferredGenres: string[];
    musicalBackground?: string;
    allowPublicProgress: boolean;
    allowProgressShare: boolean;
    profileVisibility: string;
    practiceTime?: number;
    practiceSchedule?: any;
    learningPace?: string;
    specialNeeds?: string;
    status: string;
    enrollmentDate: Date;
    lastLessonAt?: Date;
    lastActiveAt?: Date;
    preferredContact: string;
    reminderPreferences?: any;
    totalLessonsAttended: number;
    totalAssignments: number;
    completedAssignments: number;
    currentStreak: number;
    longestStreak: number;
    progressScore?: number;
    user: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      phone?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      image?: string | null;
      experienceLevel: string | null;
    };
    teachers: Array<{
      teacherId: string;
      teacherName: string;
      teacherImage?: string;
      isActive: boolean;
      startDate: Date;
      maxLessonsPerWeek: number;
      lessonDuration: number;
      nextLessonAt?: Date;
      totalLessons: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
  };
  studyData: {
    wantToLearn: Array<{
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
    learned: Array<{
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
  isNew: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

export default async function StudentProfilePageServer({
  userId,
  userEmail,
  userName,
  userImage,
  userRole,
}: {
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string | null;
  userRole: number;
}) {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'student/profile',
  ]);

  const userProfile = {
    id: userId,
    name: userName,
    email: userEmail,
    image: userImage,
    role: userRole,
  };

  // Perfil e dados de estudo (obras em estudo, aprendidas e anotações
  // recentes — as mesmas do painel) em paralelo.
  const [profileData, studyData] = await Promise.all([
    getStudentProfileForPageServer(userId),
    getStudentStudyDataForPageServer(userId),
  ]);

  if (!profileData?.profile) {
    return (
      <TranslationProvider language={language} translations={translations}>
        <StudentProfilePageClient
          initialData={null}
          userProfile={userProfile}
          errorMessage="Erro ao carregar perfil. Tente recarregar a página."
        />
      </TranslationProvider>
    );
  }

  const studentProfileData: StudentProfileData = {
    profile: profileData.profile,
    studyData: {
      wantToLearn: studyData?.currentWorks ?? [],
      learned: studyData?.learnedWorks ?? [],
      recentAnnotations: studyData?.recentAnnotations ?? [],
    },
    isNew: profileData.isNew,
  };

  return (
    <TranslationProvider language={language} translations={translations}>
      <StudentProfilePageClient
        initialData={studentProfileData}
        userProfile={userProfile}
      />
    </TranslationProvider>
  );
}
