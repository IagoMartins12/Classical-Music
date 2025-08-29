// app/help/page.tsx - Otimizado para SEO Musical
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { Metadata } from 'next';
import HelpPage from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Central de Ajuda - Opus Atlas | Tutoriais de Música Clássica',
      description:
        'Aprenda música clássica com tutoriais completos. Guias para estudar partituras de Bach, Chopin, Beethoven, Mozart. Como tocar piano clássico, violino, técnicas de estudo musical, análise de obras e prática diária.',
      keywords: [
        'tutoriais música clássica',
        'como estudar piano',
        'guia violino clássico',
        'técnicas estudo musical',
        'como tocar Bach',
        'estudar Chopin piano',
        'guia Beethoven',
        'tutoriais Mozart',
        'análise musical',
        'prática piano diária',
        'método estudo música',
        'conservatório online',
        'aulas piano clássico',
        'técnicas interpretação',
        'como ler partituras',
        'estudo sonatas',
        'guia música romântica',
        'educação musical completa',
      ],
      ogTitle: 'Tutoriais Completos de Música Clássica e Piano',
      ogDescription:
        'Domine música clássica com guias detalhados para estudar Bach, Chopin, Beethoven e grandes mestros.',
    },
    en: {
      title: 'Help Center - Opus Atlas | Classical Music Tutorials',
      description:
        'Learn classical music with complete tutorials. Guides to study sheet music from Bach, Chopin, Beethoven, Mozart. How to play classical piano, violin, musical study techniques, work analysis and daily practice.',
      keywords: [
        'classical music tutorials',
        'how to study piano',
        'classical violin guide',
        'musical study techniques',
        'how to play Bach',
        'study Chopin piano',
        'Beethoven guide',
        'Mozart tutorials',
        'musical analysis',
        'daily piano practice',
        'music study method',
        'online conservatory',
        'classical piano lessons',
        'interpretation techniques',
        'how to read sheet music',
        'sonatas study',
        'romantic music guide',
        'complete musical education',
      ],
      ogTitle: 'Complete Classical Music and Piano Tutorials',
      ogDescription:
        'Master classical music with detailed guides to study Bach, Chopin, Beethoven and great masters.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Education Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br/help'
          : 'https://opusatlas.com/en/help',
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
          ? 'https://opusatlas.com.br/help'
          : 'https://opusatlas.com/en/help',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/help',
        'en-US': 'https://opusatlas.com/en/help',
      },
    },
  };
}

export const revalidate = 3600;

export default async function HelpPageRoute() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/help',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <HelpPage />;
    </TranslationProvider>
  );
}
