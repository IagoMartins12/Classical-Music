// app/not-authenticated/page.tsx - Não autenticado otimizado
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import NotAuthenticatedContent from './pageClient';
import { TranslationProvider } from '../context/TranslationContext';

export async function generateMetadata() {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Login Necessário - Opus Atlas | Faça seu Login',
      description:
        'Faça login para acessar sua conta na plataforma de música clássica. Acesse seus favoritos, uploads e continue sua jornada musical.',
    },
    en: {
      title: 'Login Required - Opus Atlas | Please Login',
      description:
        'Please login to access your account on the classical music platform. Access your favorites, uploads and continue your musical journey.',
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
          ? 'https://opusatlas.com.br/not-authenticated'
          : 'https://opusatlas.com.br/not-authenticated',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/not-authenticated',
        'en-US': 'https://opusatlas.com.br/not-authenticated',
      },
    },
  };
}

export const revalidate = 3600;

export default async function NotAuthenticatedPage() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/not-authenticated',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <NotAuthenticatedContent />
    </TranslationProvider>
  );
}
