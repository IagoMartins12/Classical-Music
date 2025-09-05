// app/confirm-teacher-invite/[token]/page.tsx - Confirmação de convite de professor
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import ConfirmTeacherInvitePageClient from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface ConfirmTeacherInviteParams {
  token: string;
}

interface ConfirmTeacherInvitePageProps {
  params: Promise<ConfirmTeacherInviteParams>;
}

export async function generateMetadata({
  params,
}: ConfirmTeacherInvitePageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Aceitar Convite de Professor - Opus Atlas | Começar a Ensinar',
      description:
        'Aceite o convite para se tornar professor verificado no Opus Atlas e começar a ensinar música clássica para estudantes dedicados.',
    },
    en: {
      title: 'Accept Teacher Invite - Opus Atlas | Start Teaching',
      description:
        'Accept the invitation to become a verified teacher on Opus Atlas and start teaching classical music to dedicated students.',
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
      canonical: `https://opusatlas.com.br/confirm-teacher-invite/${resolvedParams.token}`,
    },
  };
}

export default async function ConfirmTeacherInvitePage() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pagesToken',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <ConfirmTeacherInvitePageClient />
    </TranslationProvider>
  );
}
