// ================================
// app/newsletter/success/page.tsx - CORRIGIDO
// ================================
import React from 'react';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';
import UnsubscribePageClient from './pageClient';

export async function generateMetadata() {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Cancelar inscrição - Opus Atlas | Newsletter',
      description: 'Cancelar inscrição da newsletter do Opus Atlas',
    },
    en: {
      title: 'Unsubscribe - Opus Atlas | Newsletter',
      description: 'Unsubscribe from the Opus Atlas newsletter',
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

export default async function NewsletterUnsubscribePage() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/newsletter',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <UnsubscribePageClient />
    </TranslationProvider>
  );
}
