// app/profile/page.tsx - Perfil pessoal otimizado
import ProfilePageClient from './pageClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../libs/auth';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { redirect } from 'next/navigation';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata() {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Meu Perfil - Opus Atlas | Configurações da Conta',
      description:
        'Gerencie suas informações pessoais, preferências musicais, configurações da conta e privacidade. Personalize sua experiência na plataforma musical.',
      ogTitle: 'Meu Perfil Musical - Opus Atlas',
      ogDescription: 'Minhas configurações e preferências musicais pessoais',
    },
    en: {
      title: 'My Profile - Opus Atlas | Account Settings',
      description:
        'Manage your personal information, musical preferences, account settings and privacy. Customize your experience on the musical platform.',
      ogTitle: 'My Musical Profile - Opus Atlas',
      ogDescription: 'My personal musical settings and preferences',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'profile',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      siteName: 'Opus Atlas',
    },
    twitter: {
      card: 'summary',
      title: t.ogTitle,
      description: t.ogDescription,
    },
  };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/not-authenticated');
  }

  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/profile',
  ]);

  return (
    <div className="section-wrap">
      <TranslationProvider language={language} translations={translations}>
        <ProfilePageClient />
      </TranslationProvider>
    </div>
  );
}
