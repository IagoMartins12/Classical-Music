// app/genres/page.tsx - Gêneros musicais ULTRA otimizado
import { getAllWorkGenres } from '@/app/requests/work-details';
import { Metadata } from 'next';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import GenresClient from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title:
        'Gêneros Musicais Clássicos - Opus Atlas | Sonatas, Concertos, Sinfonias',
      description:
        'Explore todos os gêneros de música clássica. Sonatas de Beethoven, concertos de Mozart, sinfonias de Brahms, estudos de Chopin, noturnos, valsas, mazurcas. Descubra características, compositores e obras representativas de cada forma musical.',
      keywords: [
        'gêneros música clássica',
        'sonatas Beethoven',
        'concertos Mozart',
        'sinfonias Brahms',
        'estudos Chopin',
        'noturnos piano',
        'valsas Strauss',
        'mazurcas Chopin',
        'prelúdios Bach',
        'improvisos Schubert',
        'baladas piano',
        'rondós clássicos',
        'fugas Bach',
        'variações Beethoven',
        'quartetos cordas',
        'quintetos piano',
        'trios câmara',
        'suítes barrocas',
        'partitas Bach',
        'caprichos Paganini',
        'rapsódias Liszt',
        'fantasias Schumann',
        'serenatas Mozart',
        'divertimentos',
        'formas musicais clássicas',
      ],
      ogTitle: 'Gêneros Musicais Clássicos - Guia Completo',
      ogDescription:
        'Descubra todos os gêneros de música clássica, desde sonatas até sinfonias, com exemplos dos grandes mestres.',
    },
    en: {
      title:
        'Classical Music Genres - Opus Atlas | Sonatas, Concertos, Symphonies',
      description:
        'Explore all classical music genres. Beethoven sonatas, Mozart concertos, Brahms symphonies, Chopin etudes, nocturnes, waltzes, mazurkas. Discover characteristics, composers and representative works of each musical form.',
      keywords: [
        'classical music genres',
        'Beethoven sonatas',
        'Mozart concertos',
        'Brahms symphonies',
        'Chopin etudes',
        'piano nocturnes',
        'Strauss waltzes',
        'Chopin mazurkas',
        'Bach preludes',
        'Schubert impromptus',
        'piano ballads',
        'classical rondos',
        'Bach fugues',
        'Beethoven variations',
        'string quartets',
        'piano quintets',
        'chamber trios',
        'baroque suites',
        'Bach partitas',
        'Paganini caprices',
        'Liszt rhapsodies',
        'Schumann fantasies',
        'Mozart serenades',
        'divertimentos',
        'classical musical forms',
      ],
      ogTitle: 'Classical Music Genres - Complete Guide',
      ogDescription:
        'Discover all classical music genres, from sonatas to symphonies, with examples from the great masters.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Music Theory Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br/genres'
          : 'https://opusatlas.com.br/genres',
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
          ? 'https://opusatlas.com.br/genres'
          : 'https://opusatlas.com.br/genres',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/genres',
        'en-US': 'https://opusatlas.com.br/genres',
      },
    },
  };
}

export default async function GenresPage() {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/genres',
  ]);

  try {
    const genres = await getAllWorkGenres();

    return (
      <TranslationProvider language={language} translations={translations}>
        <GenresClient genres={genres} />;
      </TranslationProvider>
    );
  } catch (error) {
    console.error('Erro ao carregar gêneros:', error);

    // Página de erro traduzida
    const errorContent = {
      pt: {
        title: 'Erro ao Carregar Gêneros',
        message: 'Ocorreu um erro inesperado ao carregar os gêneros musicais.',
        tryAgain: 'Tentar Novamente',
        goBack: 'Voltar',
      },
      en: {
        title: 'Error Loading Genres',
        message: 'An unexpected error occurred while loading musical genres.',
        tryAgain: 'Try Again',
        goBack: 'Go Back',
      },
    };

    const t = errorContent[language];

    return (
      <div className="bg-gradient-primary flex items-center justify-center p-4">
        <div className="classical-card p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-accent-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-accent-red"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-theme-primary mb-4 classical-title">
            {t.title}
          </h2>

          <p className="text-theme-secondary mb-6">{t.message}</p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="btn-classical-primary w-full"
            >
              {t.tryAgain}
            </button>

            <button
              onClick={() => window.history.back()}
              className="btn-classical-secondary w-full"
            >
              {t.goBack}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
