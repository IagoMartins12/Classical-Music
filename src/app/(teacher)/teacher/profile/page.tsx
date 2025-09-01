// app/teacher/profile/page.tsx - Página do Perfil do Professor
import { Metadata } from 'next';
import TeacherProfilePageServer from './pageServer';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Meu Perfil | Professor - Opus Atlas',
      description:
        'Gerencie seu perfil de professor, especialidades, experiência e configurações de ensino',
      keywords: [
        'perfil professor',
        'especialidades musicais',
        'experiência',
        'configurações ensino',
        'dados pessoais',
        'perfil profissional',
      ],
      ogTitle: 'Perfil do Professor - Opus Atlas',
      ogDescription:
        'Configure seu perfil profissional e destaque suas especialidades musicais',
    },
    en: {
      title: 'My Profile | Teacher - Opus Atlas',
      description:
        'Manage your teacher profile, specialties, experience and teaching settings',
      keywords: [
        'teacher profile',
        'musical specialties',
        'experience',
        'teaching settings',
        'personal data',
        'professional profile',
      ],
      ogTitle: 'Teacher Profile - Opus Atlas',
      ogDescription:
        'Configure your professional profile and highlight your musical specialties',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas' }],
    robots: { index: false, follow: false }, // Página privada
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      siteName: 'Opus Atlas',
    },
  };
}

export default async function TeacherProfilePage() {
  return <TeacherProfilePageServer />;
}
