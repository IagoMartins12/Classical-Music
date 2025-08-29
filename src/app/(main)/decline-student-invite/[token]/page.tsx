// app/decline-student-invite/[token]/page.tsx - Recusar convite de estudante
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import DeclineStudentInvitePageClient from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface DeclineStudentInviteParams {
  token: string;
}

interface DeclineStudentInvitePageProps {
  params: Promise<DeclineStudentInviteParams>;
}

export async function generateMetadata({
  params,
}: DeclineStudentInvitePageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Recusar Convite de Estudante - Opus Atlas | Gerenciar Convites',
      description:
        'Recuse o convite para estudante no Opus Atlas. Você pode continuar usando a plataforma como usuário regular e aceitar convites futuros.',
    },
    en: {
      title: 'Decline Student Invite - Opus Atlas | Manage Invites',
      description:
        'Decline the student invitation on Opus Atlas. You can continue using the platform as a regular user and accept future invitations.',
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
      canonical: `https://opusatlas.com/decline-student-invite/${resolvedParams.token}`,
    },
  };
}

export default async function DeclineStudentInvitePage() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pagesToken',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <DeclineStudentInvitePageClient />
    </TranslationProvider>
  );
}
