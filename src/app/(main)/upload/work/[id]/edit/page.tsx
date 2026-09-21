// app/uploads/work/[id]/edit/page.tsx - Editar obra específica
import EditWorkClient from '@/app/(main)/upload/work/[id]/edit/pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';
import {
  getComposerOptions,
  getUploadForEdit,
  getUploadFormData,
} from '@/app/requests/my-uploads';
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

interface EditWorkPageParams {
  id: string;
}

interface EditWorkPageProps {
  params: Promise<EditWorkPageParams>;
}

type WorkForEdit = { title?: string; composer?: { name?: string } };

export async function generateMetadata({ params }: EditWorkPageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  const lookup = await getUploadForEdit('work', resolvedParams.id).catch(
    () => null
  );
  const work =
    lookup?.status === 'ok' ? (lookup.data as WorkForEdit) : undefined;

  const content = {
    pt: {
      title: `Editar "${work?.title || 'Obra'}" - Opus Atlas`,
      description: `Editar informações da obra "${work?.title || ''}" de ${
        work?.composer?.name || ''
      }. Atualize detalhes, classificações e metadados.`,
    },
    en: {
      title: `Edit "${work?.title || 'Work'}" - Opus Atlas`,
      description: `Edit information for the work "${work?.title || ''}" by ${
        work?.composer?.name || ''
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
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  // A API confere se a obra existe (404) e se é da pessoa ou ela é
  // administradora (403).
  const work = await getUploadForEdit('work', resolvedParams.id);

  if (work.status === 'not-found') {
    notFound();
  }

  if (work.status === 'forbidden') {
    redirect('/access-denied');
  }

  const isAdmin = session.user.role === 2;
  const [formData, composers] = await Promise.all([
    getUploadFormData(),
    getComposerOptions(),
  ]);

  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/uploads',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <EditWorkClient
        work={work.data}
        composers={composers}
        instruments={formData.instruments}
        epochs={formData.epochs}
        isAdmin={isAdmin}
        userId={session.user.id}
      />
    </TranslationProvider>
  );
}
