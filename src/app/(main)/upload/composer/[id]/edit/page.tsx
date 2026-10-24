// app/uploads/composer/[id]/edit/page.tsx - Editar compositor específico
import { notFound, redirect } from 'next/navigation';
import { ComposerEditForm } from '@/app/components/site/edit/ComposerEditForm';
import type { ApiSchema } from '@/app/libs/api/types';
import { getComposerById } from '@/app/requests/composer-details';
import { getUploadForEdit, getUploadFormData } from '@/app/requests/my-uploads';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';
import { getServerSession } from '@/app/libs/api/server-session';

/**
 * Nunca cacheada: o conteúdo é de quem está logado.
 */
export const dynamic = 'force-dynamic';

interface EditComposerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditComposerPageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguageStatic();

  try {
    const composer = await getComposerById(resolvedParams.id);

    if (!composer) {
      const notFound = {
        pt: {
          title: 'Compositor não encontrado - Opus Atlas',
          description: 'O compositor solicitado não foi encontrado.',
        },
        en: {
          title: 'Composer not found - Opus Atlas',
          description: 'The requested composer was not found.',
        },
      };
      return notFound[language];
    }

    const content = {
      pt: {
        title: `Editar ${
          composer?.fullName || composer?.name || 'Compositor'
        } - Opus Atlas`,
        description: `Editar informações do compositor ${
          composer?.fullName || composer?.name || ''
        }. Atualize biografia, época, obras e outros detalhes.`,
      },
      en: {
        title: `Edit ${
          composer?.fullName || composer?.name || 'Composer'
        } - Opus Atlas`,
        description: `Edit information for composer ${
          composer?.fullName || composer?.name || ''
        }. Update biography, era, works and other details.`,
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
        images: composer.portraitUrl
          ? [composer.portraitUrl]
          : 'https://opusatlas.com.br/brand/opus-atlas-og.jpg',
      },
    };
  } catch (error) {
    console.log('Error', error);
    const errorContent = {
      pt: {
        title: 'Compositor não encontrado - Opus Atlas',
        description: 'O compositor solicitado não foi encontrado.',
      },
      en: {
        title: 'Composer not found - Opus Atlas',
        description: 'The requested composer was not found.',
      },
    };
    return errorContent[language];
  }
}

export default async function EditComposerPage({
  params,
}: EditComposerPageProps) {
  const resolvedParams = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  // A API confere se o compositor existe (404) e se é da pessoa ou ela é
  // administradora (403).
  const composer = await getUploadForEdit('composer', resolvedParams.id);

  if (composer.status === 'not-found') {
    notFound();
  }

  if (composer.status === 'forbidden') {
    // O legado mandava para `/uploads`, que não existe.
    redirect('/upload?error=unauthorized');
  }

  const formData = await getUploadFormData();

  return (
    <ComposerEditForm
      composer={composer.data as ApiSchema<'ComposerUploadResponseDto'>}
      epochs={formData.epochs}
      roles={formData.roles}
    />
  );
}
