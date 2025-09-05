// app/access-denied/page.tsx - Acesso negado otimizado
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import AccessDenied from './pageClient';
import { TranslationProvider } from '../context/TranslationContext';

export async function generateMetadata() {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Acesso Negado - Opus Atlas | Permissão Necessária',
      description:
        'Você não tem permissão para acessar esta área da plataforma musical. Entre em contato com o administrador se precisar de acesso especial.',
    },
    en: {
      title: 'Access Denied - Opus Atlas | Permission Required',
      description:
        'You do not have permission to access this area of the musical platform. Contact the administrator if you need special access.',
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
      canonical:
        language === 'pt'
          ? 'https://opusatlas.com.br/access-denied'
          : 'https://opusatlas.com.br/access-denied',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/access-denied',
        'en-US': 'https://opusatlas.com.br/access-denied',
      },
    },
  };
}

export const revalidate = 3600;

export default async function AccessDeniedPage() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/access-denied',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <AccessDenied />
    </TranslationProvider>
  );
}
