// app/uploads/history/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import HistoryClient from './pageClient';
import { Suspense } from 'react';
import HistoryLoading from './loading';

export const metadata: Metadata = {
  title: 'Histórico de Uploads | Classical Music App',
  description: 'Visualize o histórico de alterações nos seus uploads',
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    type?: string;
    action?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const type = resolvedSearchParams.type || 'all';
  const action = resolvedSearchParams.action || 'all';

  return (
    <Suspense fallback={<HistoryLoading />}>
      <HistoryClient
        page={page}
        type={type}
        action={action}
        userId={session.user.id}
        isAdmin={session.user.role === 2}
      />
    </Suspense>
  );
}
