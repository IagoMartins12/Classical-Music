// app/work/[workId]/page.tsx - Página otimizada com cache inteligente
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import WorkDetailsLoading from './loading';
import WorkDetailsServer from './WorkDetailsServer';
import { getWorkById } from '@/app/requests/work-page-details';

interface WorkParams {
  workId: string;
}

interface WorkDetailsPageProps {
  params: Promise<WorkParams>;
}

// 🚀 Gerar metadata dinâmica otimizada para SEO
export async function generateMetadata({ params }: WorkDetailsPageProps) {
  const resolvedParams = await params;

  try {
    const work = await getWorkById(resolvedParams.workId);

    if (!work) {
      return {
        title: 'Obra não encontrada - Classical Hub',
        description:
          'A obra solicitada não foi encontrada em nossa enciclopédia.',
      };
    }

    const title = `${work.title} - ${work.composer.name} | Classical Hub`;
    const description = `${work.title} de ${work.composer.fullName}${
      work.opOrCatalog ? ` (${work.opOrCatalog})` : ''
    }. ${work.tone ? `Tom: ${work.tone}. ` : ''}${
      work.compositionYear ? `Composta em ${work.compositionYear}. ` : ''
    }${work.instrument ? `Para ${work.instrument.name}. ` : ''}${
      work.epoch ? `Período ${work.epoch.name}. ` : ''
    }Explore partituras, análises e recursos para estudo.`;

    // 🆕 Palavras-chave otimizadas para SEO
    const keywords = [
      work.title,
      work.composer.name,
      work.composer.fullName,
      work.instrument?.name,
      work.epoch?.name,
      'partitura',
      'música clássica',
      'IMSLP',
      'estudo musical',
      'Classical Hub',
      ...(work.categoryNames || []),
      ...(work.workGenresArr || []),
    ]
      .filter(Boolean)
      .join(', ');

    return {
      title,
      description:
        description.length > 160
          ? description.substring(0, 157) + '...'
          : description,
      keywords,
      authors: [{ name: 'Classical Hub' }],
      creator: 'Classical Hub',
      publisher: 'Classical Hub',
      openGraph: {
        title: `${work.title} - ${work.composer.name}`,
        description: `Obra de ${work.composer.fullName}${
          work.opOrCatalog ? ` - ${work.opOrCatalog}` : ''
        }. Explore partituras e recursos para estudo na Classical Hub.`,
        type: 'music.song',
        siteName: 'Classical Hub - Enciclopédia de Música Clássica',
        locale: 'pt_BR',
        images: [
          {
            url: '/images/classical-hub-og.png', // Imagem padrão
            width: 1200,
            height: 630,
            alt: `${work.title} - ${work.composer.name} | Classical Hub`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: description.substring(0, 200),
        site: '@ClassicalHub',
        creator: '@ClassicalHub',
      },
      alternates: {
        canonical: `/work/${work.id}`,
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
      // 🆕 Schema.org structured data para SEO avançado
      other: {
        'application/ld+json': JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MusicComposition',
          name: work.title,
          composer: {
            '@type': 'Person',
            name: work.composer.fullName,
            birthDate: work.composer.epochName, // Aproximação
          },
          dateCreated: work.compositionYear,
          genre: work.epoch?.name,
          instrument: work.instrument?.name,
          description: description,
          url: `https://classicalhub.com/work/${work.id}`,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://classicalhub.com/work/${work.id}`,
          },
          isPartOf: {
            '@type': 'WebSite',
            name: 'Classical Hub',
            url: 'https://classicalhub.com',
          },
          musicArrangement: work.opOrCatalog,
          workExample: {
            '@type': 'MusicRecording',
            name: work.title,
            url: work.videoUrl || work.imslpPermlink,
          },
          // 🆕 Informações sobre partituras disponíveis
          associatedMedia: {
            '@type': 'MediaObject',
            name: `Partituras de ${work.title}`,
            description: 'Partituras gratuitas disponíveis via IMSLP',
            url: work.imslpPermlink,
            encodingFormat: 'application/pdf',
          },
        }),
      },
    };
  } catch (error) {
    console.error('Erro ao gerar metadata:', error);
    return {
      title: 'Obra não encontrada - Classical Hub',
      description:
        'A obra solicitada não foi encontrada em nossa enciclopédia.',
    };
  }
}

// 🆕 Cache otimizado da página com estratégia inteligente
export const revalidate = 3600; // 1 hora para dados básicos
export const dynamic = 'force-static'; // Forçar geração estática quando possível

// 🆕 Gerar páginas estáticas para obras populares (opcional)
export async function generateStaticParams() {
  // Esta função pode ser implementada para pré-gerar páginas das obras mais populares
  // Por enquanto, deixar vazio para geração sob demanda
  return [];
}

export default async function WorkDetailsPage({
  params,
}: WorkDetailsPageProps) {
  const resolvedParams = await params;

  // Verificação otimizada de ID (ObjectId do MongoDB)
  if (
    !resolvedParams.workId ||
    resolvedParams.workId.length !== 24 ||
    !/^[0-9a-fA-F]{24}$/.test(resolvedParams.workId)
  ) {
    console.log(`❌ [WORK-PAGE] ID inválido: ${resolvedParams.workId}`);
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* 🆕 Preload crítico para melhor performance */}
      {/* <link rel="preload" href="/api/imslp-scores" as="fetch" /> */}

      <Suspense fallback={<WorkDetailsLoading />}>
        <WorkDetailsServer workId={resolvedParams.workId} />
      </Suspense>
    </div>
  );
}
