// app/teacher/profile/pageServer.tsx - Server Component para Perfil do Professor

import TeacherProfilePageClient from './pageClient';
import { getTeacherProfile } from '@/app/requests/teacher-request';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';
import { TranslationProvider } from '@/app/context/TranslationContext';

export interface TeacherProfileData {
  id: string;
  userId: string;
  bio?: string | null;
  specialties: string[];
  instruments: string[];
  experience?: string | null;
  education?: string | null;
  achievements?: string | null;
  isPublicProfile: boolean;
  profileImage?: string;
  website?: string | null;
  socialMedia?: any;
  publicBio?: string;
  highlightedWorks: string[];
  defaultLessonDuration: number;
  maxStudentsPerWeek: number;
  timezone: string;
  teachingMethod?: string;
  ageGroups: string[];
  skillLevels: string[];
  status: string;
  isVerified: boolean;
  verifiedAt?: Date;
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    image?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

export default async function TeacherProfilePageServer() {
  const session = await getRequiredServerSession();

  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'teacher/profile',
  ]);

  try {
    // Buscar dados do perfil do professor
    const response = await getTeacherProfile(session.user.id);

    return (
      <TranslationProvider language={language} translations={translations}>
        <TeacherProfilePageClient
          initialData={response}
          teacherProfile={{
            id: session.user.id,
            name: `${session.user.firstName || ''} ${
              session.user.lastName || ''
            }`.trim(),
            email: session.user.email || '',
            image: session.user.image,
            role: session.user.role,
          }}
        />
      </TranslationProvider>
    );
  } catch (error) {
    console.error('❌ Erro crítico na página de perfil:', error);

    return (
      <TranslationProvider language={language} translations={translations}>
        <TeacherProfilePageClient
          initialData={null}
          teacherProfile={{
            id: session.user.id,
            name: `${session.user.firstName || ''} ${
              session.user.lastName || ''
            }`.trim(),
            email: session.user.email || '',
            image: session.user.image,
            role: session.user.role,
          }}
          errorMessage="Erro ao carregar dados do perfil. Tente recarregar a página."
        />
      </TranslationProvider>
    );
  }
}
