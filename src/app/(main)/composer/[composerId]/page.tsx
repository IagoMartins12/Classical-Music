// app/composer/[composerId]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ComposerDetailsServer from './ComposerDetailsServer';
import { getComposerById } from '@/app/requests/composer-details';
import ComposerDetailsLoading from './loading';

interface ComposerParams {
  composerId: string;
}

interface ComposerDetailsPageProps {
  params: Promise<ComposerParams>;
}

// Gerar metadata dinâmica para SEO
export async function generateMetadata({ params }: ComposerDetailsPageProps) {
  const resolvedParams = await params;

  try {
    const composer = await getComposerById(resolvedParams.composerId);

    if (!composer) {
      return {
        title: 'Compositor não encontrado',
        description: 'O compositor solicitado não foi encontrado.',
      };
    }

    return {
      title: `${composer.fullName} - Compositor ${composer.epochName}`,
      description: `Conheça ${composer.fullName}, compositor da época ${
        composer.epochName
      }. ${composer.bio ? composer.bio.substring(0, 160) + '...' : ''}`,
      openGraph: {
        title: `${composer.name} - Compositor Clássico`,
        description: `Biografia e obras de ${composer.fullName}`,
        images: composer.portraitUrl ? [composer.portraitUrl] : [],
      },
    };
  } catch (error) {
    console.log('Error', error);
    return {
      title: 'Compositor não encontrado',
      description: 'O compositor solicitado não foi encontrado.',
    };
  }
}

// Cache da página por 1 hora
export const revalidate = 3600;

export default async function ComposerDetailsPage({
  params,
}: ComposerDetailsPageProps) {
  const resolvedParams = await params;

  // Verificação básica de ID
  if (!resolvedParams.composerId || resolvedParams.composerId.length !== 24) {
    notFound();
  }

  return (
    <div className="">
      <Suspense fallback={<ComposerDetailsLoading />}>
        <ComposerDetailsServer composerId={resolvedParams.composerId} />
      </Suspense>
    </div>
  );
}
