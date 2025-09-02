// app/support/page.tsx - Otimizado para SEO Musical
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { Metadata } from 'next';
import SupportPage from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Suporte Técnico - Opus Atlas | Problemas com Partituras',
      description:
        'Suporte técnico especializado para músicos. Resolvemos problemas com partituras de piano, violino, download de obras de Bach, Chopin, Beethoven. Status do sistema, bugs e soluções rápidas para estudantes de música clássica.',
      keywords: [
        'suporte técnico música',
        'problemas partituras',
        'erro download Bach',
        'problema Chopin partituras',
        'suporte Beethoven',
        'bugs sistema musical',
        'status partituras online',
        'resolver erro piano',
        'problema violino partituras',
        'suporte música clássica',
        'troubleshooting partituras',
        'sistema fora do ar',
        'erro conservatório online',
        'problema estudar música',
        'suporte educação musical',
      ],
      ogTitle: 'Suporte Técnico - Resolução de Problemas Musicais',
      ogDescription:
        'Suporte especializado para resolver problemas técnicos com partituras e sistema musical.',
    },
    en: {
      title: 'Technical Support - Opus Atlas | Sheet Music Issues',
      description:
        'Specialized technical support for musicians. We solve problems with piano and violin sheet music, downloading works from Bach, Chopin, Beethoven. System status, bugs and quick solutions for classical music students.',
      keywords: [
        'music technical support',
        'sheet music problems',
        'Bach download error',
        'Chopin scores problem',
        'Beethoven support',
        'musical system bugs',
        'online scores status',
        'piano error resolution',
        'violin sheet music problem',
        'classical music support',
        'sheet music troubleshooting',
        'system down',
        'online conservatory error',
        'music study problem',
        'musical education support',
      ],
      ogTitle: 'Technical Support - Musical Problems Resolution',
      ogDescription:
        'Specialized support to resolve technical issues with sheet music and musical system.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Technical Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br/support'
          : 'https://opusatlas.com/en/support',
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
          ? 'https://opusatlas.com.br/support'
          : 'https://opusatlas.com/en/support',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/support',
        'en-US': 'https://opusatlas.com/en/support',
      },
    },
  };
}

export const revalidate = 3600;

export default async function SupportPageRoute() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/support',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <SupportPage />
    </TranslationProvider>
  );
}
