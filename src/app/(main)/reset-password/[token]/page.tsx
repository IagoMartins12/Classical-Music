// app/decline-teacher-invite/[token]/page.tsx - Recusar convite de professor
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import ResetPasswordPageClient from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface DeclineTeacherInviteParams {
  token: string;
}

interface DeclineTeacherInvitePageProps {
  params: Promise<DeclineTeacherInviteParams>;
}

export async function generateMetadata({
  params,
}: DeclineTeacherInvitePageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Esqueci minha senha - Opus Atlas | Registrar nova senha',
      description:
        'Registre uma nova senha e volte a ter acesso a sua conta em nossa plataforma.',
    },
    en: {
      title: 'Forgot password - Opus Atlas | Register new password',
      description:
        'Register a new password and regain access to your account on our platform.',
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
      title: t.title,
      description: t.description,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      siteName: 'Opus Atlas',
    },
    twitter: {
      card: 'summary',
      title: t.title,
      description: t.description,
    },
    alternates: {
      canonical: `https://opusatlas.com/decline-teacher-invite/${resolvedParams.token}`,
    },
  };
}

export default async function DeclineTeacherInvitePage() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/reset-password',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <ResetPasswordPageClient />
    </TranslationProvider>
  );
}
