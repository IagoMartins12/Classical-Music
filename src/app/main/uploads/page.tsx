// ================================
// app/uploads/page.tsx - CORRIGIDO
// ================================
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import UploadsPageServer from './pageServer';
import EmailVerificationRequired from '@/app/components/VerificationsProviders/EmailVerificationRequired';
import { authOptions } from '@/app/libs/auth';
import { getUserById } from '@/app/actions/auth';
import { FormPageLoading } from '@/app/wrappers/SuspenseWrapper';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Meus Uploads | Classical Music App',
  description: 'Gerencie seus compositores, peças e partituras adicionadas',
};

export default async function UploadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
    epoch?: string;
    composer?: string;
    work?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/not-authenticated');
  }

  const userData = await getUserById(session.user.id);

  if (!userData) {
    return redirect('/not-authenticated');
  }

  if (!userData.emailVerified && userData.email) {
    return (
      <EmailVerificationRequired
        userEmail={userData.email}
        userName={userData.firstName || undefined}
      />
    );
  }

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.search || '';
  const type = resolvedSearchParams.type || 'all';
  const epochId = resolvedSearchParams.epoch || '';
  const composerId = resolvedSearchParams.composer || '';
  const workId = resolvedSearchParams.work || '';

  return (
    <Suspense fallback={<FormPageLoading />}>
      <UploadsPageServer
        page={page}
        search={search}
        type={type}
        epochId={epochId}
        composerId={composerId}
        workId={workId}
        userId={session.user.id}
        userRole={session.user.role || 0}
      />
    </Suspense>
  );
}
