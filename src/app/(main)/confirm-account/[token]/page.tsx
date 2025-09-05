// app/confirm-account/[token]/page.tsx - Confirmação de conta
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import ConfirmAccountPageClient from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface ConfirmAccountParams {
  token: string;
}

interface ConfirmAccountPageProps {
  params: Promise<ConfirmAccountParams>;
}

export async function generateMetadata({ params }: ConfirmAccountPageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Confirmar Conta - Opus Atlas | Ativação de Conta Musical',
      description:
        'Confirme sua conta no Opus Atlas para acessar sua biblioteca pessoal de música clássica, favoritos e recursos educacionais completos.',
    },
    en: {
      title: 'Confirm Account - Opus Atlas | Musical Account Activation',
      description:
        'Confirm your Opus Atlas account to access your personal classical music library, favorites and complete educational resources.',
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
      canonical: `https://opusatlas.com.br/confirm-account/${resolvedParams.token}`,
    },
  };
}

export default async function ConfirmAccountPage() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pagesToken',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <ConfirmAccountPageClient />
    </TranslationProvider>
  );
}
