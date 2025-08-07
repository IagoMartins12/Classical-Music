// app/student/progress/pageServer.tsx - Server Component para Progresso do Aluno

import { getStudentProgressData } from '@/app/requests/student-progress-requests';
import StudentProgressPageClient from './pageClient';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface StudentProgressPageServerProps {
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string | null;
  userRole: number;
}

export default async function StudentProgressPageServer({
  userId,
  userEmail,
  userName,
  userImage,
  userRole,
}: StudentProgressPageServerProps) {
  console.log(`📊 [STUDENT-PROGRESS-PAGE-SERVER] Loading for user ${userId}`);

  try {
    // Buscar dados de progresso (período padrão: 6 meses)
    console.log('📈 Loading student progress data...');
    const progressData = await getStudentProgressData(userId, '6months');

    if (!progressData) {
      throw new Error('Failed to load progress data');
    }

    console.log(
      `✅ [STUDENT-PROGRESS-PAGE-SERVER] Data loaded successfully - ${progressData.stats.completedLessons} lessons, ${progressData.stats.learnedWorks} works`
    );

    return (
      <StudentProgressPageClient
        initialData={progressData}
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
    console.error('❌ [STUDENT-PROGRESS-PAGE-SERVER] Critical error:', error);

    // Fallback para erro crítico
    return (
      <StudentProgressPageClient
        initialData={null}
        userProfile={{
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
        }}
        errorMessage="Erro ao carregar dados de progresso. Tente recarregar a página."
      />
    );
  }
}
