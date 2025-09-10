// app/page.tsx - Homepage com metadata SEO DEFINITIVO
import { Metadata } from 'next';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';
import PageServer from './pageServer';

// 🏆 METADATA HOMEPAGE ULTRA OTIMIZADO
export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title:
        'Opus Atlas - Enciclopédia de Música Clássica | Partituras Gratuitas de Bach, Chopin, Beethoven',
      description:
        'A maior enciclopédia de música clássica online. Milhares de partituras gratuitas de Bach, Chopin, Beethoven, Mozart. Sonata ao Luar, Valsa das Flores, estudos de piano, obras para violino. Plataforma educacional completa para estudantes e professores de conservatório.',
      keywords: [
        // Termos principais de marca
        'Opus Atlas',
        'enciclopédia música clássica',
        'partituras gratuitas',
        'música clássica online',

        // Compositores principais (os que mais geram tráfego)
        'Bach partituras',
        'Chopin partituras piano',
        'Beethoven sonatas',
        'Mozart sinfonias',
        'Liszt estudos',
        'Debussy partituras',
        'Brahms obras completas',
        'Schubert lieder',
        'Rachmaninoff piano',
        'Tchaikovsky balé',

        // Obras famosas específicas
        'Sonata ao Luar',
        'Valsa das Flores',
        'Ave Maria Schubert',
        'Für Elise',
        'Canon Pachelbel',
        'Gymnopédie Satie',
        'Prelúdio Chopin',
        'Tocata e Fuga Bach',
        'Primavera Vivaldi',
        'Marcha Nupcial Mendelssohn',

        // Instrumentos principais
        'partituras piano clássico',
        'partituras violino',
        'partituras violoncelo',
        'partituras flauta',
        'partituras guitarra clássica',
        'partituras órgão',
        'partituras orquestra',
        'música câmara',

        // Gêneros e formas musicais
        'sonatas clássicas',
        'concertos piano',
        'sinfonias',
        'quartetos cordas',
        'estudos técnicos',
        'noturnos',
        'valsas',
        'mazurcas',
        'improvisos',
        'baladas piano',

        // Épocas musicais
        'música barroca',
        'música clássica período',
        'música romântica',
        'impressionismo musical',
        'música contemporânea',

        // Termos educacionais
        'educação musical',
        'estudar piano',
        'conservatório online',
        'técnica pianística',
        'interpretação musical',
        'análise musical',
        'teoria musical',
        'história música clássica',
        'biografias compositores',

        // Termos técnicos/busca
        'IMSLP partituras',
        'partituras PDF',
        'download partituras',
        'partituras domínio público',
        'música clássica gratuita',
        'partituras legais',
        'biblioteca musical',

        // Long tail keywords
        'como tocar Chopin',
        'aprender piano clássico',
        'partituras para iniciantes',
        'repertório conservatório',
        'concursos piano clássico',
        'masterclass online',
        'curso música clássica',
      ],
      ogTitle: 'Opus Atlas - Sua Enciclopédia de Música Clássica',
      ogDescription:
        'Descubra milhares de partituras gratuitas dos grandes mestres. Bach, Chopin, Beethoven, Mozart e muito mais. A plataforma educacional completa para amantes da música clássica.',
      twitterDescription:
        'Enciclopédia musical com partituras gratuitas de Bach, Chopin, Beethoven. Sonata ao Luar, Valsa das Flores e milhares de obras clássicas.',
    },
    en: {
      title:
        'Opus Atlas - Classical Music Encyclopedia | Free Sheet Music from Bach, Chopin, Beethoven',
      description:
        'The largest online classical music encyclopedia. Thousands of free sheet music from Bach, Chopin, Beethoven, Mozart. Moonlight Sonata, Waltz of the Flowers, piano studies, violin works. Complete educational platform for students and conservatory teachers.',
      keywords: [
        // Main brand terms
        'Opus Atlas',
        'classical music encyclopedia',
        'free sheet music',
        'classical music online',

        // Main composers (highest traffic generators)
        'Bach sheet music',
        'Chopin piano scores',
        'Beethoven sonatas',
        'Mozart symphonies',
        'Liszt etudes',
        'Debussy sheet music',
        'Brahms complete works',
        'Schubert lieder',
        'Rachmaninoff piano',
        'Tchaikovsky ballet',

        // Famous specific works
        'Moonlight Sonata',
        'Waltz of the Flowers',
        'Ave Maria Schubert',
        'Für Elise',
        'Canon Pachelbel',
        'Gymnopédie Satie',
        'Chopin Prelude',
        'Bach Toccata and Fugue',
        'Vivaldi Spring',
        'Mendelssohn Wedding March',

        // Main instruments
        'classical piano sheet music',
        'violin sheet music',
        'cello sheet music',
        'flute sheet music',
        'classical guitar sheet music',
        'organ sheet music',
        'orchestra sheet music',
        'chamber music',

        // Genres and musical forms
        'classical sonatas',
        'piano concertos',
        'symphonies',
        'string quartets',
        'technical studies',
        'nocturnes',
        'waltzes',
        'mazurkas',
        'impromptus',
        'piano ballads',

        // Musical periods
        'baroque music',
        'classical period music',
        'romantic music',
        'musical impressionism',
        'contemporary music',

        // Educational terms
        'music education',
        'learn piano',
        'online conservatory',
        'piano technique',
        'musical interpretation',
        'musical analysis',
        'music theory',
        'classical music history',
        'composer biographies',

        // Technical/search terms
        'IMSLP sheet music',
        'PDF sheet music',
        'sheet music download',
        'public domain scores',
        'free classical music',
        'legal sheet music',
        'music library',

        // Long tail keywords
        'how to play Chopin',
        'learn classical piano',
        'sheet music for beginners',
        'conservatory repertoire',
        'classical piano competitions',
        'online masterclass',
        'classical music course',
      ],
      ogTitle: 'Opus Atlas - Your Classical Music Encyclopedia',
      ogDescription:
        'Discover thousands of free sheet music from the great masters. Bach, Chopin, Beethoven, Mozart and much more. The complete educational platform for classical music lovers.',
      twitterDescription:
        'Musical encyclopedia with free sheet music from Bach, Chopin, Beethoven. Moonlight Sonata, Waltz of the Flowers and thousands of classical works.',
    },
  };

  const t = content[language];
  const baseUrl =
    language === 'pt' ? 'https://opusatlas.com.br' : 'https://opusatlas.com';

  return {
    title: {
      default: t.title,
      template: '%s | Opus Atlas',
    },
    description: t.description,
    keywords: t.keywords,
    authors: [
      { name: 'Opus Atlas Team' },
      { name: 'Classical Music Educators' },
    ],
    creator: 'Opus Atlas',
    publisher: 'Opus Atlas Education',
    applicationName: 'Opus Atlas',
    referrer: 'origin-when-cross-origin',
    classification: 'Education',
    category: 'Music Education',

    // OpenGraph otimizado
    openGraph: {
      type: 'website',
      siteName: 'Opus Atlas',
      title: t.ogTitle,
      description: t.ogDescription,
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url: baseUrl,
      images: [
        {
          url: 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
          width: 1200,
          height: 630,
          alt:
            language === 'pt'
              ? 'Opus Atlas - Enciclopédia de Música Clássica'
              : 'Opus Atlas - Classical Music Encyclopedia',
          type: 'image/jpeg',
        },
      ],
    },

    // Twitter Cards otimizado
    twitter: {
      card: 'summary_large_image',
      site: '@OpusAtlas',
      creator: '@OpusAtlas',
      title: t.ogTitle,
      description: t.twitterDescription,
      images: [
        {
          url: 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
          alt:
            language === 'pt'
              ? 'Opus Atlas - Partituras Gratuitas de Música Clássica'
              : 'Opus Atlas - Free Classical Music Sheet Music',
        },
      ],
    },

    // Robots ultra otimizado
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // URLs alternativas e canônicas
    alternates: {
      canonical: baseUrl,
      languages: {
        'pt-BR': 'https://opusatlas.com.br',
        'en-US': 'https://opusatlas.com',
        'x-default': 'https://opusatlas.com.br',
      },
    },

    // Schema.org estruturado COMPLETO
    other: {
      'application/ld+json': JSON.stringify([
        // Website principal
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          name: 'Opus Atlas',
          alternateName:
            language === 'pt'
              ? 'Enciclopédia de Música Clássica'
              : 'Classical Music Encyclopedia',
          description: t.description,
          url: baseUrl,
          inLanguage: language === 'pt' ? 'pt-BR' : 'en-US',
          isAccessibleForFree: true,
          creator: {
            '@type': 'Organization',
            name: 'Opus Atlas',
            url: baseUrl,
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          mainEntity: {
            '@type': 'ItemList',
            name:
              language === 'pt'
                ? 'Compositores Clássicos'
                : 'Classical Composers',
            description:
              language === 'pt'
                ? 'Lista completa de compositores de música clássica'
                : 'Complete list of classical music composers',
            numberOfItems: 500,
          },
        },
        // Organização
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          '@id': `${baseUrl}/#organization`,
          name: 'Opus Atlas',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/images/logo/opus-atlas-logo.png`,

            width: 180,
            height: 60,
          },
          description: t.description,
          foundingDate: '2023',
          sameAs: [
            'https://twitter.com/OpusAtlas',
            'https://facebook.com/OpusAtlas',
            'https://instagram.com/OpusAtlas',
            'https://youtube.com/@OpusAtlas',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'contato@opusatlas.com.br',
            availableLanguage: ['Portuguese', 'English'],
          },
        },
        // Biblioteca Musical
        {
          '@context': 'https://schema.org',
          '@type': 'Library',
          '@id': `${baseUrl}/#library`,
          name:
            language === 'pt'
              ? 'Biblioteca Digital Opus Atlas'
              : 'Opus Atlas Digital Library',
          description:
            language === 'pt'
              ? 'Biblioteca digital com milhares de partituras gratuitas de música clássica'
              : 'Digital library with thousands of free classical music sheet music',
          url: baseUrl,
          isAccessibleForFree: true,
          hasDigitalDocumentPermission: {
            '@type': 'DigitalDocumentPermission',
            permissionType: 'http://schema.org/ReadPermission',
            grantee: {
              '@type': 'Audience',
              audienceType: 'public',
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/#webpage`,
          },
        },
        // Curso/Plataforma Educacional
        {
          '@context': 'https://schema.org',
          '@type': 'Course',
          '@id': `${baseUrl}/#course`,
          name:
            language === 'pt'
              ? 'Educação Musical Clássica - Opus Atlas'
              : 'Classical Music Education - Opus Atlas',
          description:
            language === 'pt'
              ? 'Plataforma educacional completa para aprender e estudar música clássica'
              : 'Complete educational platform to learn and study classical music',
          provider: {
            '@type': 'Organization',
            name: 'Opus Atlas',
            url: baseUrl,
          },
          educationalLevel: 'All Levels',
          courseMode: 'online',
          isAccessibleForFree: true,
          teaches:
            language === 'pt'
              ? [
                  'Música Clássica',
                  'Piano',
                  'Violino',
                  'Teoria Musical',
                  'História da Música',
                ]
              : [
                  'Classical Music',
                  'Piano',
                  'Violin',
                  'Music Theory',
                  'Music History',
                ],
          availableLanguage: language === 'pt' ? 'pt-BR' : 'en-US',
        },
      ]),
    },
  };
}

// Cache otimizado para homepage
export const revalidate = 1800; // 30 minutos (homepage muda com frequência)

export default async function HomePage() {
  return (
    <div className="mx-auto py-6">
      <PageServer />
    </div>
  );
}
