// app/uploads/composer/[id]/edit/page.tsx - Editar compositor específico
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/app/libs/prismadb';
import { getComposerFormData } from '@/app/requests/upload';
import EditComposerClient from '@/app/(main)/uploads/composer/[id]/edit/pageClient';
import { getComposerById } from '@/app/requests/composer-details';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

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
          : 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
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
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  const composer = await prisma.composer.findUnique({
    where: { id: resolvedParams.id },
    include: {
      epoch: { select: { id: true, name: true } },
      primaryRole: { select: { id: true, name: true } },
    },
  });

  if (!composer) {
    notFound();
  }

  const isAdmin = session.user.role === 2;
  const isOwner = composer.createdBy === session.user.id;

  if (!isAdmin && !isOwner) {
    redirect('/uploads?error=unauthorized');
  }

  const formData = await getComposerFormData();

  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/uploads',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <EditComposerClient
        composer={composer}
        epochs={formData.epochs}
        roles={formData.roles}
        isAdmin={isAdmin}
        userId={session.user.id}
      />
    </TranslationProvider>
  );
}
