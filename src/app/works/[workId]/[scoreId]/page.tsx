// app/study/[workId]/[[...scoreId]]/page.tsx
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import StudyModeServer from './pageServer';
import StudyModeLoading from './loading';

interface StudyParams {
  workId: string;
  scoreId?: string[];
}

interface StudyPageProps {
  params: Promise<StudyParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Metadata dinâmica para SEO
export async function generateMetadata({ params }: StudyPageProps) {
  const resolvedParams = await params;

  try {
    // Buscar dados da obra para metadata
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/works/${resolvedParams.workId}`
    );
    const work = await response.json();

    if (!work?.success) {
      return {
        title: 'Modo Estudo - Obra não encontrada',
        description: 'A obra solicitada não foi encontrada.',
      };
    }

    return {
      title: `Modo Estudo: ${work.data.title} - ${work.data.composer.name}`,
      description: `Estude ${work.data.title} de ${work.data.composer.fullName} com timer, metrônomo e anotações interativas.`,
      robots: 'noindex, nofollow', // Páginas de estudo são privadas
    };
  } catch (error) {
    return {
      title: 'Modo Estudo',
      description: 'Ambiente completo para estudo de partituras.',
    };
  }
}

// Cache desabilitado para páginas de estudo (sempre dados frescos)
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function StudyPage({
  params,
  searchParams,
}: StudyPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Verificar autenticação
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  // Validação básica de ID
  if (!resolvedParams.workId || resolvedParams.workId.length !== 24) {
    notFound();
  }

  const scoreId = resolvedParams.scoreId?.[0];

  console.log('SCOREID', scoreId);
  return (
    <div className="min-h-screen bg-theme-primary">
      {/* Layout fullscreen para modo estudo */}
      <Suspense fallback={<StudyModeLoading />}>
        <StudyModeServer
          workId={resolvedParams.workId}
          scoreId={scoreId}
          userId={session.user.id}
          searchParams={resolvedSearchParams}
        />
      </Suspense>
    </div>
  );
}
