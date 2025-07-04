// app/uploads/work/[id]/edit/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/app/libs/prismadb';
import { getFormData } from '@/app/requests/upload';
import EditWorkClient from '@/app/components/UploadsPage/EditWorkClient/page';

interface EditWorkPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: EditWorkPageProps): Promise<Metadata> {
  const work = await prisma.work.findUnique({
    where: { id: params.id },
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
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Buscar obra
  const work = await prisma.work.findUnique({
    where: { id: params.id },
    include: {
      composer: { select: { id: true, name: true, fullName: true } },
      instrument: { select: { id: true, name: true, category: true } },
      epoch: { select: { id: true, name: true } },
    },
  });

  if (!work) {
    notFound();
  }

  // Verificar permissões
  const isAdmin = session.user.role === 2;
  const isOwner = work.createdBy === session.user.id;

  if (!isAdmin && !isOwner) {
    redirect('/uploads?error=unauthorized');
  }

  // Buscar dados para formulário
  const [formData, composers, instruments] = await Promise.all([
    getFormData(),
    prisma.composer.findMany({
      select: { id: true, name: true, fullName: true },
      orderBy: { name: 'asc' },
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
