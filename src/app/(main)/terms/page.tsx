// app/terms/page.tsx - Otimizado para SEO Musical
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { Metadata } from 'next';
import TermsPage from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Termos de Uso - Opus Atlas | Regras da Comunidade Musical',
      description:
        'Termos de uso do Opus Atlas para comunidade de música clássica. Regras para compartilhamento de partituras de Bach, Chopin, Beethoven, Mozart. Políticas para estudantes, professores e uploads de conteúdo musical educacional.',
      keywords: [
        'termos uso música clássica',
        'regras comunidade musical',
        'política partituras',
        'upload partituras Bach',
        'compartilhar Chopin',
        'regras Beethoven',
        'termos Mozart',
        'comunidade estudantes música',
        'política educacional música',
        'regras conservatório online',
        'moderação conteúdo musical',
        'diretrizes música erudita',
        'uso responsável partituras',
        'comunidade pianistas',
        'termos violinistas',
      ],
      ogTitle: 'Termos de Uso - Regras da Comunidade Musical',
      ogDescription:
        'Conheça as regras que regem nossa comunidade de estudantes e amantes da música clássica.',
    },
    en: {
      title: 'Terms of Use - Opus Atlas | Musical Community Rules',
      description:
        'Opus Atlas terms of use for classical music community. Rules for sharing sheet music from Bach, Chopin, Beethoven, Mozart. Policies for students, teachers and educational musical content uploads.',
      keywords: [
        'classical music terms of use',
        'musical community rules',
        'sheet music policy',
        'Bach scores upload',
        'Chopin sharing',
        'Beethoven rules',
        'Mozart terms',
        'music students community',
        'music educational policy',
        'online conservatory rules',
        'musical content moderation',
        'classical music guidelines',
        'responsible sheet music use',
        'pianists community',
        'violinists terms',
      ],
      ogTitle: 'Terms of Use - Musical Community Rules',
      ogDescription:
        'Learn the rules that govern our community of students and classical music lovers.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Legal Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br/terms'
          : 'https://opusatlas.com/en/terms',
      siteName: 'Opus Atlas',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.ogTitle,
      description: t.ogDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical:
        language === 'pt'
          ? 'https://opusatlas.com.br/terms'
          : 'https://opusatlas.com/en/terms',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/terms',
        'en-US': 'https://opusatlas.com/en/terms',
      },
    },
  };
}

export const revalidate = 3600;

export default async function TermsPageRoute() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/terms',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <TermsPage />;
    </TranslationProvider>
  );
}
