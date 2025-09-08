// app/composer/[composerId]/page.tsx - Compositor específico SUPER otimizado
import { notFound } from 'next/navigation';
import ComposerDetailsServer from './pageServer';
import { getComposerById } from '@/app/requests/composer-details';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';
import { translateEpochName } from '@/app/utils/translations/epochTranslations';

interface ComposerParams {
  composerId: string;
}

interface ComposerDetailsPageProps {
  params: Promise<ComposerParams>;
}

// Metadata ULTRA otimizada para compositores
export async function generateMetadata({ params }: ComposerDetailsPageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  try {
    const composer = await getComposerById(resolvedParams.composerId);

    if (!composer) {
      const notFoundContent = {
        pt: {
          title:
            'Compositor não encontrado - Opus Atlas | Compositores Clássicos',
          description:
            'O compositor solicitado não foi encontrado. Explore outros grandes mestres como Bach, Chopin, Beethoven, Mozart e suas partituras gratuitas.',
        },
        en: {
          title: 'Composer not found - Opus Atlas | Classical Composers',
          description:
            'The requested composer was not found. Explore other great masters like Bach, Chopin, Beethoven, Mozart and their free sheet music.',
        },
      };

      return notFoundContent[language];
    }

    // Bio resumida para description
    const bioSummary = composer.bio
      ? composer.bio.substring(0, 120) + '...'
      : '';

    const birthYear = composer.birthDate ? ` (${composer.birthDate}` : '';
    const deathYear = composer.deathDate
      ? `-${composer.deathDate})`
      : birthYear
        ? ')'
        : '';
    const years = birthYear + deathYear;

    const content = {
      pt: {
        title: `${composer.fullName} - Compositor ${composer.epochName} | Partituras Gratuitas`,
        description: `${composer.fullName}, grande compositor da época ${composer.epochName}${years}. ${bioSummary} Explore todas suas obras, partituras gratuitas para piano, violino e outros instrumentos. Análises musicais e recursos educacionais completos.`,
        keywords: [
          `${composer.name} compositor`,
          `${composer.fullName} partituras`,
          `${composer.name} obras completas`,
          `${composer.name} piano`,
          `${composer.name} violino`,
          `${composer.name} partituras gratuitas`,
          `biografia ${composer.name}`,
          `${composer.name} IMSLP`,
          `estudar ${composer.name}`,
          `análise ${composer.name}`,
          `${composer.epochName} compositor`,
          `música ${composer.epochName}`,
          'compositores clássicos',
          'partituras domínio público',
          'música clássica gratuita',
          'educação musical',
          'conservatório',
          'estudantes música',
          `${composer.name} PDF`,
          `obras ${composer.name} completas`,
        ].filter(Boolean),
        ogTitle: `${composer.fullName} - Partituras e Obras Completas`,
        ogDescription: `Conheça a vida e obra de ${composer.fullName}. Acesse partituras gratuitas e recursos educacionais completos.`,
      },
      en: {
        title: `${composer.fullName} - ${translateEpochName(
          composer.epochName,
          language
        )} Composer | Free Sheet Music`,
        description: `${composer.fullName}, great composer of the ${composer.epochName} era${years}. ${bioSummary} Explore all his works, free sheet music for piano, violin and other instruments. Musical analyses and complete educational resources.`,
        keywords: [
          `${composer.name} composer`,
          `${composer.fullName} sheet music`,
          `${composer.name} complete works`,
          `${composer.name} piano`,
          `${composer.name} violin`,
          `${composer.name} free scores`,
          `${composer.name} biography`,
          `${composer.name} IMSLP`,
          `study ${composer.name}`,
          `${composer.name} analysis`,
          `${composer.epochName} composer`,
          `${composer.epochName} music`,
          'classical composers',
          'public domain scores',
          'free classical music',
          'music education',
          'conservatory',
          'music students',
          `${composer.name} PDF`,
          `${composer.name} complete works`,
        ].filter(Boolean),
        ogTitle: `${composer.fullName} - Sheet Music and Complete Works`,
        ogDescription: `Discover the life and work of ${composer.fullName}. Access free sheet music and complete educational resources.`,
      },
    };

    const t = content[language];

    return {
      title: t.title,
      description: t.description,
      keywords: t.keywords,
      authors: [{ name: 'Opus Atlas' }],
      creator: 'Opus Atlas',
      openGraph: {
        title: t.ogTitle,
        description: t.ogDescription,
        type: 'profile',
        locale: language === 'pt' ? 'pt_BR' : 'en_US',
        url: `https://opusatlas.com.br/composer/${composer.id}`,
        siteName: 'Opus Atlas',
        images: composer.portraitUrl
          ? [
              {
                url: composer.portraitUrl,
                width: 400,
                height: 400,
                alt: `${composer.fullName} - Retrato`,
              },
            ]
          : [
              {
                url: '/https://opusatlas.com.br/logo-opus-atlas.jpeg',
                width: 1200,
                height: 630,
                alt: 'Opus Atlas - Classical Music Encyclopedia',
              },
            ],
      },
      twitter: {
        card: 'summary_large_image',
        title: t.ogTitle,
        description: t.description.substring(0, 200),
      },
      alternates: {
        canonical: `https://opusatlas.com.br/composer/${composer.id}`,
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
      // Schema.org para compositor
      other: {
        'application/ld+json': JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': `https://opusatlas.com.br/composer/${composer.id}`,
          name: composer.fullName,
          alternateName: composer.name,
          description: composer.bio || t.description,
          birthDate: composer.birthDate,
          deathDate: composer.deathDate,
          nationality: composer.nationality,
          jobTitle: 'Composer',
          genre: composer.epochName,
          url: `https://opusatlas.com.br/composer/${composer.id}`,
          image: composer.portraitUrl,
          sameAs: composer.wikipediaLink ? [composer.wikipediaLink] : undefined,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://opusatlas.com.br/composer/${composer.id}`,
          },
        }),
      },
    };
  } catch (error) {
    console.error('Error generating composer metadata:', error);

    const errorContent = {
      pt: {
        title: 'Erro - Opus Atlas | Compositores Clássicos',
        description:
          'Erro ao carregar compositor. Explore nossa coleção completa de compositores como Bach, Chopin, Beethoven e Mozart.',
      },
      en: {
        title: 'Error - Opus Atlas | Classical Composers',
        description:
          'Error loading composer. Explore our complete collection of composers like Bach, Chopin, Beethoven and Mozart.',
      },
    };

    return errorContent[language];
  }
}

export const revalidate = 3600;

export default async function ComposerDetailsPage({
  params,
}: ComposerDetailsPageProps) {
  const resolvedParams = await params;

  // Verificação básica de ID
  if (!resolvedParams.composerId || resolvedParams.composerId.length !== 24) {
    notFound();
  }

  return <ComposerDetailsServer composerId={resolvedParams.composerId} />;
}
