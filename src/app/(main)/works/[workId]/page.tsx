// app/work/[workId]/page.tsx - Obra específica com SEO ULTRA otimizado
import { notFound } from 'next/navigation';
import WorkDetailsServer from './pageServer';
import { getWorkById } from '@/app/requests/work-page-details';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

interface WorkParams {
  workId: string;
}

interface WorkDetailsPageProps {
  params: Promise<WorkParams>;
}

// 🚀 Metadata SUPER otimizada para obras específicas
export async function generateMetadata({ params }: WorkDetailsPageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  try {
    const work = await getWorkById(resolvedParams.workId);

    if (!work) {
      const notFoundContent = {
        pt: {
          title: 'Obra não encontrada - Opus Atlas | Partituras Clássicas',
          description:
            'A obra solicitada não foi encontrada em nossa enciclopédia de música clássica. Explore outras partituras gratuitas de Bach, Chopin, Beethoven e Mozart.',
        },
        en: {
          title: 'Work not found - Opus Atlas | Classical Scores',
          description:
            'The requested work was not found in our classical music encyclopedia. Explore other free sheet music from Bach, Chopin, Beethoven and Mozart.',
        },
      };

      return notFoundContent[language];
    }

    const content = {
      pt: {
        titleTemplate: `${work.title} - ${work.composer.name} | Partitura Gratuita`,
        description: `${work.title} de ${work.composer.fullName}${
          work.opOrCatalog ? ` (${work.opOrCatalog})` : ''
        }. ${work.tone ? `Tom: ${work.tone}. ` : ''}${
          work.compositionYear ? `Composta em ${work.compositionYear}. ` : ''
        }${work.instrument ? `Para ${work.instrument.name}. ` : ''}${
          work.epoch ? `Período ${work.epoch.name}. ` : ''
        }Partitura gratuita, análise musical e guia de estudo completo.`,
        keywords: [
          `${work.title} partitura`,
          `${work.composer.name} ${work.title}`,
          `${work.composer.fullName} partituras`,
          `${work.title} ${work.instrument?.name || 'piano'}`,
          `${work.composer.name} partituras gratuitas`,
          `${work.title} PDF`,
          `estudar ${work.title}`,
          `como tocar ${work.title}`,
          `análise ${work.title}`,
          `${work.epoch?.name || 'música clássica'}`,
          `${work.instrument?.name || 'piano'} clássico`,
          'partitura IMSLP',
          'música clássica gratuita',
          'download partitura',
          'estudo musical',
          'conservatório',
          'educação musical',
          ...(work.categoryNames || []),
          ...(work.workGenresArr || []),
        ].filter(Boolean),
        ogTitle: `${work.title} - ${work.composer.name} | Partitura Gratuita`,
        ogDescription: `Estude ${work.title} de ${work.composer.fullName}. Partitura gratuita, análise musical e recursos educacionais completos.`,
      },
      en: {
        titleTemplate: `${work.title} - ${work.composer.name} | Free Sheet Music`,
        description: `${work.title} by ${work.composer.fullName}${
          work.opOrCatalog ? ` (${work.opOrCatalog})` : ''
        }. ${work.tone ? `Key: ${work.tone}. ` : ''}${
          work.compositionYear ? `Composed in ${work.compositionYear}. ` : ''
        }${work.instrument ? `For ${work.instrument.name}. ` : ''}${
          work.epoch ? `${work.epoch.name} period. ` : ''
        }Free sheet music, musical analysis and complete study guide.`,
        keywords: [
          `${work.title} sheet music`,
          `${work.composer.name} ${work.title}`,
          `${work.composer.fullName} scores`,
          `${work.title} ${work.instrument?.name || 'piano'}`,
          `${work.composer.name} free sheet music`,
          `${work.title} PDF`,
          `study ${work.title}`,
          `how to play ${work.title}`,
          `${work.title} analysis`,
          `${work.epoch?.name || 'classical music'}`,
          `${work.instrument?.name || 'piano'} classical`,
          'IMSLP sheet music',
          'free classical music',
          'sheet music download',
          'musical study',
          'conservatory',
          'music education',
          ...(work.categoryNames || []),
          ...(work.workGenresArr || []),
        ].filter(Boolean),
        ogTitle: `${work.title} - ${work.composer.name} | Free Sheet Music`,
        ogDescription: `Study ${work.title} by ${work.composer.fullName}. Free sheet music, musical analysis and complete educational resources.`,
      },
    };

    const t = content[language];

    // Limitar description para SEO
    const description =
      t.description.length > 160
        ? t.description.substring(0, 157) + '...'
        : t.description;

    return {
      title: t.titleTemplate,
      description,
      keywords: t.keywords,
      authors: [{ name: 'Opus Atlas' }],
      creator: 'Opus Atlas',
      publisher: 'Opus Atlas',
      openGraph: {
        title: t.ogTitle,
        description: t.ogDescription,
        type: 'music.song',
        siteName: 'Opus Atlas',
        locale: language === 'pt' ? 'pt_BR' : 'en_US',
        url: `https://opusatlas.com.br/work/${work.id}`,
        images: work.composer.portraitUrl
          ? [
              {
                url: work.composer.portraitUrl,
                width: 1200,
                height: 630,
                alt: `${work.title} - ${work.composer.name}`,
              },
            ]
          : [
              {
                url: '/https://opusatlas.com.br/logo-opus-atlas.jpeg',
                width: 1200,
                height: 630,
                alt: 'Opus Atlas - Logo',
              },
            ],
      },
      twitter: {
        card: 'summary_large_image',
        title: t.titleTemplate,
        description: description.substring(0, 200),
        images: [
          work.composer.portraitUrl ||
            '/https://opusatlas.com.br/logo-opus-atlas.jpeg',
        ],
      },
      alternates: {
        canonical: `https://opusatlas.com.br/work/${work.id}`,
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
      // Schema.org estruturado
      other: {
        'application/ld+json': JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MusicComposition',
          name: work.title,
          composer: {
            '@type': 'Person',
            name: work.composer.fullName,
          },
          dateCreated: work.compositionYear,
          genre: work.epoch?.name,
          instrument: work.instrument?.name,
          description: description,
          url: `https://opusatlas.com.br/work/${work.id}`,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://opusatlas.com.br/work/${work.id}`,
          },
          isPartOf: {
            '@type': 'WebSite',
            name: 'Opus Atlas',
            url: 'https://opusatlas.com',
          },
          musicArrangement: work.opOrCatalog,
          associatedMedia: {
            '@type': 'MediaObject',
            name: `${work.title} - Partitura Gratuita`,
            description: 'Partitura gratuita disponível via IMSLP',
            url: work.imslpPermlink,
            encodingFormat: 'application/pdf',
          },
        }),
      },
    };
  } catch (error) {
    console.error('Erro ao gerar metadata:', error);

    const errorContent = {
      pt: {
        title: 'Erro - Opus Atlas | Enciclopédia Musical',
        description:
          'Erro ao carregar obra. Explore nossa coleção de partituras de Bach, Chopin, Beethoven e Mozart.',
      },
      en: {
        title: 'Error - Opus Atlas | Musical Encyclopedia',
        description:
          'Error loading work. Explore our collection of sheet music from Bach, Chopin, Beethoven and Mozart.',
      },
    };

    return errorContent[language];
  }
}

export const revalidate = 3600;

export default async function WorkDetailsPage({
  params,
}: WorkDetailsPageProps) {
  const resolvedParams = await params;

  // Verificação otimizada de ID
  if (
    !resolvedParams.workId ||
    resolvedParams.workId.length !== 24 ||
    !/^[0-9a-fA-F]{24}$/.test(resolvedParams.workId)
  ) {
    console.log(`❌ [WORK-PAGE] ID inválido: ${resolvedParams.workId}`);
    notFound();
  }

  return <WorkDetailsServer workId={resolvedParams.workId} />;
}
