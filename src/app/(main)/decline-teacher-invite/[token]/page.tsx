// app/decline-teacher-invite/[token]/page.tsx - Recusar convite de professor
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import DeclineTeacherInvitePageClient from './pageClient';
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
      title: 'Recusar Convite de Professor - Opus Atlas | Gerenciar Convites',
      description:
        'Recuse o convite para professor no Opus Atlas. Você pode continuar usando a plataforma como usuário regular e aceitar convites futuros de administradores.',
    },
    en: {
      title: 'Decline Teacher Invite - Opus Atlas | Manage Invites',
      description:
        'Decline the teacher invitation on Opus Atlas. You can continue using the platform as a regular user and accept future invitations from administrators.',
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
    'pagesToken',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <DeclineTeacherInvitePageClient />
    </TranslationProvider>
  );
}
