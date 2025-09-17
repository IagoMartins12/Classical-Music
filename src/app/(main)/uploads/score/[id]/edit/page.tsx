// app/uploads/score/[id]/page.tsx - Editar partitura específica
import EditScoreClient from '@/app/(main)/uploads/score/[id]/edit/pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

interface EditScorePageParams {
  id: string;
}

interface EditScorePageProps {
  params: Promise<EditScorePageParams>;
}

export async function generateMetadata({ params }: EditScorePageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  const score = await prisma.workScore.findUnique({
    where: { id: resolvedParams.id },
    select: {
      title: true,
      work: {
        select: {
          title: true,
          composer: { select: { name: true } },
        },
      },
    },
  });

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
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  const score = await prisma.workScore.findUnique({
    where: { id: resolvedParams.id },
    include: {
      work: {
        select: {
          id: true,
          title: true,
          composer: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
        },
      },
    },
  });

  if (!score) {
    notFound();
  }

  const isAdmin = session.user.role === 2;
  const isOwner = score.uploadedBy === session.user.id;

  console.log('isowner', {
    isOwner,
    uploader: score,
    sessuin: session.user.id,
  });
  if (!isAdmin && !isOwner) {
    redirect('/access-denied');
  }

  const works = await prisma.work.findMany({
    select: {
      id: true,
      title: true,
      composer: {
        select: {
          id: true,
          name: true,
          fullName: true,
        },
      },
    },
    where: {
      id: score.work.id,
    },
    orderBy: { title: 'asc' },
  });

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
