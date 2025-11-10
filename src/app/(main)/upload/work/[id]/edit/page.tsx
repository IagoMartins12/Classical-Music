// app/uploads/work/[id]/edit/page.tsx - Editar obra específica
import EditWorkClient from '@/app/(main)/upload/work/[id]/edit/pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getFormData } from '@/app/requests/upload';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

interface EditWorkPageParams {
  id: string;
}

interface EditWorkPageProps {
  params: Promise<EditWorkPageParams>;
}

export async function generateMetadata({ params }: EditWorkPageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  const work = await prisma.work.findUnique({
    where: { id: resolvedParams.id },
    select: { title: true, composer: { select: { name: true } } },
  });

  const content = {
    pt: {
      title: `Editar "${work?.title || 'Obra'}" - Opus Atlas`,
      description: `Editar informações da obra "${work?.title || ''}" de ${
        work?.composer.name || ''
      }. Atualize detalhes, classificações e metadados.`,
    },
    en: {
      title: `Edit "${work?.title || 'Work'}" - Opus Atlas`,
      description: `Edit information for the work "${work?.title || ''}" by ${
        work?.composer.name || ''
      }. Update details, classifications and metadata.`,
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

export default async function EditWorkPage({ params }: EditWorkPageProps) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  const work = await prisma.work.findUnique({
    where: { id: resolvedParams.id },
    include: {
      composer: {
        select: { id: true, name: true, fullName: true, portraitUrl: true },
      },
      instrument: { select: { id: true, name: true, category: true } },
      epoch: { select: { id: true, name: true } },
    },
  });

  if (!work) {
    notFound();
  }

  const isAdmin = session.user.role === 2;
  const isOwner = work.createdBy === session.user.id;

  if (!isAdmin && !isOwner) {
    redirect('/access-denied');
  }

  const [formData, composers, instruments] = await Promise.all([
    getFormData(),
    prisma.composer.findMany({
      select: { id: true, name: true, fullName: true },
      orderBy: { name: 'asc' },
      take: 50,
    }),
    prisma.instrument.findMany({
      select: { id: true, name: true, category: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/uploads',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <EditWorkClient
        work={work}
        composers={composers}
        instruments={instruments}
        epochs={formData.epochs}
        isAdmin={isAdmin}
        userId={session.user.id}
      />
    </TranslationProvider>
  );
}
