// app/confirm-student-invite/[token]/page.tsx - Confirmação de convite de estudante
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import ConfirmStudentInvitePageClient from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface ConfirmStudentInviteParams {
  token: string;
}

interface ConfirmStudentInvitePageProps {
  params: Promise<ConfirmStudentInviteParams>;
}

export async function generateMetadata({
  params,
}: ConfirmStudentInvitePageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Aceitar Convite de Estudante - Opus Atlas | Começar Aulas',
      description:
        'Aceite o convite para se tornar estudante no Opus Atlas e começar sua jornada musical com aulas personalizadas de música clássica.',
    },
    en: {
      title: 'Accept Student Invite - Opus Atlas | Start Lessons',
      description:
        'Accept the invitation to become a student on Opus Atlas and begin your musical journey with personalized classical music lessons.',
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
      canonical: `https://opusatlas.com.br/confirm-student-invite/${resolvedParams.token}`,
    },
  };
}

export default async function ConfirmStudentInvitePage() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pagesToken',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <ConfirmStudentInvitePageClient />
    </TranslationProvider>
  );
}
