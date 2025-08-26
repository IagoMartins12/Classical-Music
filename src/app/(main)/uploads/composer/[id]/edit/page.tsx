// app/uploads/composer/[id]/edit/page.tsx - CORRIGIDO
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/app/libs/prismadb';
import { getComposerFormData } from '@/app/requests/upload';
import EditComposerClient from '@/app/(main)/uploads/composer/[id]/edit/pageClient';
import { Metadata } from 'next';
import { getComposerById } from '@/app/requests/composer-details';

interface EditComposerPageProps {
  params: Promise<{ id: string }>; // Mudança para Promise
}

export async function generateMetadata({
  params,
}: EditComposerPageProps): Promise<Metadata> {
  // Await params antes de usar
  const resolvedParams = await params;

  try {
    const composer = await getComposerById(resolvedParams.id);

    if (!composer) {
      return {
        title: 'Compositor não encontrado',
        description: 'O compositor solicitado não foi encontrado.',
      };
    }

    return {
      title: `Editar ${
        composer?.fullName || composer?.name || 'Compositor'
      } | Classical Music App`,
      description: `Editar informações do compositor ${
        composer?.fullName || composer?.name || ''
      }`,
      openGraph: {
        title: `${composer.name} - Compositor Clássico`,
        description: `Editar informações do compositor ${composer.fullName}`,
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

export default async function EditComposerPage({
  params,
}: EditComposerPageProps) {
  // Await params antes de usar
  const resolvedParams = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  // Buscar compositor
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

  // Verificar permissões
  const isAdmin = session.user.role === 2;
  console.log('SESSION', session.user);
  const isOwner = composer.createdBy === session.user.id;

  if (!isAdmin && !isOwner) {
    redirect('/uploads?error=unauthorized');
  }

  // Buscar dados para formulário
  const formData = await getComposerFormData();

  return (
    <EditComposerClient
      composer={composer}
      epochs={formData.epochs}
      roles={formData.roles}
      isAdmin={isAdmin}
      userId={session.user.id}
    />
  );
}
