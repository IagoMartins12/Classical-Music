// app/work/[workId]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getWorkById } from '@/app/requests/work-details';
import WorkDetailsLoading from './loading';
import WorkDetailsServer from './WorkDetailsServer';

interface WorkParams {
  workId: string;
}

interface WorkDetailsPageProps {
  params: Promise<WorkParams>;
}

// Gerar metadata dinâmica para SEO
export async function generateMetadata({ params }: WorkDetailsPageProps) {
  const resolvedParams = await params;

  try {
    const work = await getWorkById(resolvedParams.workId);

    if (!work) {
      return {
        title: 'Obra não encontrada',
        description: 'A obra solicitada não foi encontrada.',
      };
    }

    const title = `${work.title} - ${work.composer.name}`;
    const description = `${work.title} de ${work.composer.fullName}${
      work.opOrCatalog ? ` (${work.opOrCatalog})` : ''
    }. ${work.tone ? `Tom: ${work.tone}. ` : ''}${
      work.compositionYear ? `Composta em ${work.compositionYear}. ` : ''
    }${work.instrument ? `Para ${work.instrument.name}. ` : ''}${
      work.epoch ? `Período ${work.epoch.name}.` : ''
    }`;

    return {
      title,
      description:
        description.length > 160
          ? description.substring(0, 157) + '...'
          : description,
      openGraph: {
        title: `${work.title} - ${work.composer.name}`,
        description: `Obra de ${work.composer.fullName}${
          work.opOrCatalog ? ` - ${work.opOrCatalog}` : ''
        }`,
        type: 'music.song',
        siteName: 'Enciclopédia de Música Clássica',
      },
      twitter: {
        card: 'summary',
        title,
        description: description.substring(0, 200),
      },
      alternates: {
        canonical: `/work/${work.id}`,
      },
    };
  } catch (error) {
    console.error('Erro ao gerar metadata:', error);
    return {
      title: 'Obra não encontrada',
      description: 'A obra solicitada não foi encontrada.',
    };
  }
}

// Cache da página por 1 hora
export const revalidate = 3600;

export default async function WorkDetailsPage({
  params,
}: WorkDetailsPageProps) {
  const resolvedParams = await params;

  // Verificação básica de ID (ObjectId do MongoDB tem 24 caracteres)
  if (!resolvedParams.workId || resolvedParams.workId.length !== 24) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<WorkDetailsLoading />}>
        <WorkDetailsServer workId={resolvedParams.workId} />
      </Suspense>
    </div>
  );
}
