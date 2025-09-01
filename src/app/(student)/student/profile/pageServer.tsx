// app/student/profile/pageServer.tsx - Server Component com queries diretas

import { getStudentProfileForPageServer } from '@/app/requests/student-requests';
import StudentProfilePageClient from './pageClient';
import prisma from '@/app/libs/prismadb';
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

// 🔧 TIPOS ESPECÍFICOS PARA OS DADOS
interface WantToLearnItem {
  workId: string;
  title: string;
  composer: string;
  addedAt: Date;
  difficulty?: string | null;
  selectedScore?: {
    title: string;
    type: string;
  };
}

interface LearnedItem {
  workId: string;
  title: string;
  composer: string;
  learnedAt: Date;
  mastery: number;
  wouldRecommend: boolean;
}

interface AnnotationItem {
  id: string;
  workTitle: string;
  title: string;
  category: string;
  createdAt: Date;
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
  try {
    // Buscar perfil do aluno
    const profileData = await getStudentProfileForPageServer(userId);

    if (!profileData || !profileData.profile) {
      throw new Error('Falha ao carregar perfil do aluno');
    }

    // 📚 BUSCAR DADOS DE ESTUDO - QUERIES DIRETAS
    console.log('📚 Carregando dados de estudo...');

    // 1. Query direta: Obras que quer aprender
    let wantToLearnData: WantToLearnItem[] = [];
    try {
      const wantToLearnItems = await prisma.wantToLearn.findMany({
        where: { userId },
        include: {
          work: {
            include: {
              composer: {
                select: { name: true },
              },
            },
          },
          selectedWorkScore: {
            select: {
              title: true,
              type: true,
            },
          },
        },
        orderBy: { addedAt: 'desc' },
        take: 10,
      });

      wantToLearnData = wantToLearnItems.map((item) => ({
        workId: item.work.id,
        title: item.work.title,
        composer: item.work.composer.name,
        addedAt: item.addedAt,
        difficulty: item.difficulty,
        selectedScore: item.selectedWorkScore
          ? {
              title: item.selectedWorkScore.title,
              type: item.selectedWorkScore.type,
            }
          : undefined,
      }));

      console.log(`✅ Want-to-learn: ${wantToLearnData.length} items`);
    } catch (error) {
      console.warn('⚠️ Error loading want-to-learn data:', error);
    }

    // 2. Query direta: Obras já aprendidas
    let learnedData: LearnedItem[] = [];
    try {
      const learnedItems = await prisma.learned.findMany({
        where: { userId },
        include: {
          work: {
            include: {
              composer: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { learnedAt: 'desc' },
        take: 10,
      });

      learnedData = learnedItems.map((item) => ({
        workId: item.work.id,
        title: item.work.title,
        composer: item.work.composer.name,
        learnedAt: item.learnedAt,
        mastery: item.mastery,
        wouldRecommend: item.wouldRecommend,
      }));

      console.log(`✅ Learned: ${learnedData.length} items`);
    } catch (error) {
      console.warn('⚠️ Error loading learned data:', error);
    }

    // 3. Query direta: Anotações recentes
    let annotationsData: AnnotationItem[] = [];
    try {
      const recentAnnotations = await prisma.workAnnotation.findMany({
        where: {
          userId,
          isPublic: true,
        },
        include: {
          work: {
            select: { title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      annotationsData = recentAnnotations.map((annotation) => ({
        id: annotation.id,
        workTitle: annotation.work.title,
        title: annotation.title,
        category: annotation.category,
        createdAt: annotation.createdAt,
      }));

      console.log(`✅ Annotations: ${annotationsData.length} items`);
    } catch (error) {
      console.warn('⚠️ Error loading annotations data:', error);
    }

    // Montar dados finais
    const studentProfileData: StudentProfileData = {
      profile: profileData.profile,
      studyData: {
        wantToLearn: wantToLearnData,
        learned: learnedData,
        recentAnnotations: annotationsData,
      },
      isNew: profileData.isNew,
    };

    return (
      <TranslationProvider language={language} translations={translations}>
        <StudentProfilePageClient
          initialData={studentProfileData}
          userProfile={{
            id: userId,
            name: userName,
            email: userEmail,
            image: userImage,
            role: userRole,
          }}
        />
      </TranslationProvider>
    );
  } catch (error) {
    console.error('❌ [STUDENT-PROFILE-PAGE-SERVER] Critical error:', error);

    // Fallback com dados mínimos
    return (
      <TranslationProvider language={language} translations={translations}>
        <StudentProfilePageClient
          initialData={null}
          userProfile={{
            id: userId,
            name: userName,
            email: userEmail,
            image: userImage,
            role: userRole,
          }}
          errorMessage="Erro ao carregar perfil. Tente recarregar a página."
        />
      </TranslationProvider>
    );
  }
}
