// ================================
// app/newsletter/success/page.tsx - CORRIGIDO
// ================================
import React from 'react';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';
import NewsletterSuccessContent from './pageClient';

export async function generateMetadata() {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Confirmar inscrição - Opus Atlas | Newsletter',
      description: 'Confirmar inscrição da newsletter do Opus Atlas',
    },
    en: {
      title: 'Subscribe - Opus Atlas | Newsletter',
      description: 'Subscribe from the Opus Atlas newsletter',
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
  };
}

export default async function NewsletterSuccessPage() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/newsletter',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <NewsletterSuccessContent />
    </TranslationProvider>
  );
}
