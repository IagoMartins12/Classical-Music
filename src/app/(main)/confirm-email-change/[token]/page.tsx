// app/confirm-email-change/[token]/page.tsx - Confirmação de mudança de email
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import ConfirmEmailChangePageClient from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface ConfirmEmailChangeParams {
  token: string;
}

interface ConfirmEmailChangePageProps {
  params: Promise<ConfirmEmailChangeParams>;
}

export async function generateMetadata({
  params,
}: ConfirmEmailChangePageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Confirmar Mudança de Email - Opus Atlas | Atualizar Conta',
      description:
        'Confirme a mudança do seu email no Opus Atlas para manter acesso seguro à sua conta musical e biblioteca de partituras.',
    },
    en: {
      title: 'Confirm Email Change - Opus Atlas | Update Account',
      description:
        'Confirm your email change on Opus Atlas to maintain secure access to your musical account and sheet music library.',
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
      canonical: `https://opusatlas.com/confirm-email-change/${resolvedParams.token}`,
    },
  };
}

export default async function ConfirmEmailChangePage() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pagesToken',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <ConfirmEmailChangePageClient />
    </TranslationProvider>
  );
}
