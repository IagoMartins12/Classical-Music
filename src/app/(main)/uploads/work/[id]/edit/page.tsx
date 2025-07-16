import EditWorkClient from '@/app/components/UploadsPage/EditWorkClient';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getFormData } from '@/app/requests/upload';
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

  const work = await prisma.work.findUnique({
    where: { id: resolvedParams.id },
    select: { title: true, composer: { select: { name: true } } },
  });

  return {
    title: `Editar ${work?.title || 'Obra'} | Classical Music App`,
    description: `Editar informações da obra ${work?.title || ''} de ${
      work?.composer.name || ''
    }`,
  };
}

export default async function EditWorkPage({ params }: EditWorkPageProps) {
  const resolvedParams = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
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
    redirect('/');
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

  return (
    <EditWorkClient
      work={work}
      composers={composers}
      instruments={instruments}
      epochs={formData.epochs}
      isAdmin={isAdmin}
      userId={session.user.id}
    />
  );
}
