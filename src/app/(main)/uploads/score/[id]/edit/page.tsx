// app/uploads/score/[id]/page.tsx
import EditScoreClient from '@/app/components/UploadsPage/EditScoreClient';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
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

  return {
    title: `Editar ${score?.title || 'Partitura'} | Classical Music App`,
    description: `Editar informações da partitura ${
      score?.title || ''
    } da obra ${score?.work.title || ''} de ${score?.work.composer.name || ''}`,
  };
}

export default async function EditScorePage({ params }: EditScorePageProps) {
  const resolvedParams = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
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
              id: true, // ✅ IMPORTANTE: Incluir o ID do composer
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

  if (!isAdmin && !isOwner) {
    redirect('/');
  }

  // ✅ CORRIGIDO: Buscar obras para o modal de edição incluindo o ID do composer
  const works = await prisma.work.findMany({
    select: {
      id: true,
      title: true,
      composer: {
        select: {
          id: true, // ✅ IMPORTANTE: Incluir o ID do composer
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

  return (
    <EditScoreClient
      score={score}
      works={works}
      isAdmin={isAdmin}
      userId={session.user.id}
    />
  );
}
