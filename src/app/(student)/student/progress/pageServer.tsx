// app/student/progress/pageServer.tsx - Server Component para Progresso do Aluno

import { getStudentProgressData } from '@/app/requests/student-progress-requests';
import StudentProgressPageClient from './pageClient';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface StudentProgressPageServerProps {
  userId: string;
}

export default async function StudentProgressPageServer({
  userId,
}: StudentProgressPageServerProps) {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'student/progress',
  ]);
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
      <TranslationProvider language={language} translations={translations}>
        <StudentProgressPageClient initialData={progressData} />
      </TranslationProvider>
    );
  } catch (error) {
    console.error('❌ [STUDENT-PROGRESS-PAGE-SERVER] Critical error:', error);

    // Fallback para erro crítico
    return (
      <TranslationProvider language={language} translations={translations}>
        <StudentProgressPageClient
          initialData={null}
          errorMessage="Erro ao carregar dados de progresso. Tente recarregar a página."
        />
      </TranslationProvider>
    );
  }
}
