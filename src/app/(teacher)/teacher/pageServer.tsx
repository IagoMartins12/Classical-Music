import {
  getTeacherCalendarData,
  getTeacherDashboardData,
  getTeacherProfile,
  getTeacherStudentsData,
} from '@/app/requests/teacher-request';
import TeacherPageClient from './pageClient';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

export default async function TeacherPageServer({
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
    'teacher/home',
  ]);

  try {
    // Buscar dados iniciais em paralelo - DIRETO DO BANCO
    const [dashboardData, studentsData, calendarData, teacherProfile] =
      await Promise.all([
        getTeacherDashboardData(userId),
        getTeacherStudentsData(userId, 'active', 20, 0),
        getTeacherCalendarData(userId),
        getTeacherProfile(userId),
      ]);

    // Se não encontrou perfil de professor, criar um básico
    if (!teacherProfile) {
      console.log(
        `⚠️ [TEACHER-PAGE-SERVER] No teacher profile found, creating basic profile`
      );
    }

    // Se não conseguir buscar dados críticos, mostrar erro
    if (!dashboardData) {
      throw new Error('Falha ao carregar dados do dashboard');
    }

    console.log(`✅ [TEACHER-PAGE-SERVER] Data loaded successfully`);

    return (
      <TranslationProvider language={language} translations={translations}>
        <TeacherPageClient
          initialDashboardData={dashboardData}
          initialStudentsData={studentsData}
          initialCalendarData={calendarData}
          teacherProfile={{
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
    console.error('❌ [TEACHER-PAGE-SERVER] Critical error:', error);

    // Fallback com dados vazios para não quebrar a UI
    return (
      <TranslationProvider language={language} translations={translations}>
        <TeacherPageClient
          initialDashboardData={null}
          initialStudentsData={null}
          initialCalendarData={null}
          teacherProfile={{
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
