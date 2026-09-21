// app/uploads/score/[id]/page.tsx - Editar partitura específica
import EditScoreClient from '@/app/(main)/upload/score/[id]/edit/pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';
import { getUploadForEdit } from '@/app/requests/my-uploads';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from '@/app/libs/api/server-session';

/**
 * Nunca cacheada: o conteúdo é de quem está logado.
 */
export const dynamic = 'force-dynamic';

interface EditScorePageParams {
  id: string;
}

interface EditScorePageProps {
  params: Promise<EditScorePageParams>;
}

type ScoreForEdit = {
  title?: string;
  work: {
    id: string;
    title: string;
    composer: { id: string; name: string; fullName: string | null };
  };
};

export async function generateMetadata({ params }: EditScorePageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  const lookup = await getUploadForEdit('score', resolvedParams.id).catch(
    () => null
  );
  const score =
    lookup?.status === 'ok' ? (lookup.data as ScoreForEdit) : undefined;

  const content = {
    pt: {
      title: `Editar Partitura "${score?.title || 'Partitura'}" - Opus Atlas`,
      description: `Editar informações da partitura "${
        score?.title || ''
      }" da obra "${score?.work.title || ''}" de ${
        score?.work.composer.name || ''
      }.`,
    },
    en: {
      title: `Edit Score "${score?.title || 'Score'}" - Opus Atlas`,
      description: `Edit information for score "${
        score?.title || ''
      }" from work "${score?.work.title || ''}" by ${
        score?.work.composer.name || ''
      }.`,
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: t.title,
      description: t.description,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      siteName: 'Opus Atlas',
    },
  };
}

export default async function EditScorePage({ params }: EditScorePageProps) {
  const resolvedParams = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  // A API confere se a partitura existe (404) e se foi a pessoa que a enviou
  // ou ela é administradora (403).
  const lookup = await getUploadForEdit('score', resolvedParams.id);

  if (lookup.status === 'not-found') {
    notFound();
  }

  if (lookup.status === 'forbidden') {
    redirect('/access-denied');
  }

  const score = lookup.data as ScoreForEdit;
  const isAdmin = session.user.role === 2;

  // O seletor mostra só a obra da própria partitura, como no legado.
  const works = [
    {
      id: score.work.id,
      title: score.work.title,
      composer: score.work.composer,
    },
  ];

  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/uploads',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <EditScoreClient
        score={score}
        works={works}
        isAdmin={isAdmin}
        userId={session.user.id}
      />
    </TranslationProvider>
  );
}
