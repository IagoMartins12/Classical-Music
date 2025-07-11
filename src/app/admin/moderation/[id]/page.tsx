// app/admin/moderation/[id]/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import ModerationDetail from '@/app/components/Admin/Moderation/ModerationDetail';

interface Props {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Revisar Item | Centro de Moderação',
  description: 'Análise detalhada de item para moderação',
  robots: 'noindex, nofollow',
};

export default async function ModerationDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  if (!params.id) {
    notFound();
  }

  return <ModerationDetail itemId={params.id} />;
}
