// app/student/profile/pageServer.tsx - Server Component para Perfil do Aluno

import { getStudentProfileForPageServer } from '@/app/requests/student-requests';
import StudentProfilePageClient from './pageClient';

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
  console.log(`👨‍🎓 [STUDENT-PROFILE-PAGE-SERVER] Loading for user ${userId}`);

  try {
    // Buscar perfil do aluno
    console.log('🔍 Carregando perfil do aluno...');
    const profileData = await getStudentProfileForPageServer(userId);

    if (!profileData || !profileData.profile) {
      throw new Error('Falha ao carregar perfil do aluno');
    }

    // Buscar dados de estudo (Quero Aprender/Já Aprendi)
    console.log('📚 Carregando dados de estudo...');

    // Fetch das obras que quer aprender
    const wantToLearnResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/want-to-learn?userId=${userId}&limit=10`,
      { next: { revalidate: 300 } }
    );

    // Fetch das obras já aprendidas
    const learnedResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/learned?userId=${userId}&limit=10`,
      { next: { revalidate: 300 } }
    );

    // Fetch das anotações recentes
    const annotationsResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/annotations?userId=${userId}&limit=5&public=true`,
      { next: { revalidate: 300 } }
    );

    // Processar respostas (fallback para arrays vazios se falhar)
    let wantToLearnData = [];
    let learnedData = [];
    let annotationsData = [];

    try {
      if (wantToLearnResponse.ok) {
        const wantToLearnJson = await wantToLearnResponse.json();
        wantToLearnData = wantToLearnJson.works || [];
      }
    } catch (error) {
      console.warn('⚠️ Error loading want-to-learn data:', error);
    }

    try {
      if (learnedResponse.ok) {
        const learnedJson = await learnedResponse.json();
        learnedData = learnedJson.works || [];
      }
    } catch (error) {
      console.warn('⚠️ Error loading learned data:', error);
    }

    try {
      if (annotationsResponse.ok) {
        const annotationsJson = await annotationsResponse.json();
        annotationsData = annotationsJson.annotations || [];
      }
    } catch (error) {
      console.warn('⚠️ Error loading annotations data:', error);
    }

    const studentProfileData: StudentProfileData = {
      profile: profileData.profile,
      studyData: {
        wantToLearn: wantToLearnData,
        learned: learnedData,
        recentAnnotations: annotationsData,
      },
      isNew: profileData.isNew,
    };

    console.log(
      `✅ [STUDENT-PROFILE-PAGE-SERVER] Data loaded successfully - ${profileData.profile.teachers.length} teachers, ${wantToLearnData.length} want-to-learn, ${learnedData.length} learned`
    );

    return (
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
    );
  } catch (error) {
    console.error('❌ [STUDENT-PROFILE-PAGE-SERVER] Critical error:', error);

    // Fallback com dados mínimos
    return (
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
    );
  }
}
