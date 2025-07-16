// app/uploads/moderation/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import ModerationClient from '@/app/components/UploadsPage/ModerationClient';

export const metadata: Metadata = {
  title: 'Moderação de Uploads | Classical Music App',
  description: 'Gerencie reports e moderações de uploads',
};

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const status = resolvedSearchParams.status || 'pending';

  return <ModerationClient page={page} status={status} isAdmin />;
}
