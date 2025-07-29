// app/uploads/page.tsx - ATUALIZADO COM VERIFICAÇÃO DE EMAIL
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import UploadsPageServer from './pageServer';
import AuthCheck from '@/app/components/AuthCheck';
import EmailVerificationRequired from '@/app/components/EmailVerification/EmailVerificationRequired';
import { authOptions } from '@/app/libs/auth';
import { getUserById } from '@/app/actions/auth';

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

  // Verificar se usuário está logado
  if (!session?.user?.id) {
    return <AuthCheck title="Meus Uploads" />;
  }

  // 🆕 NOVO: Buscar dados completos do usuário para verificar email
  const userData = await getUserById(session.user.id);

  if (!userData) {
    return <AuthCheck title="Meus Uploads" />;
  }

  // 🆕 NOVO: Verificar se o email foi confirmado
  if (!userData.emailVerified && userData.email) {
    return (
      <EmailVerificationRequired
        userEmail={userData.email}
        userName={userData.firstName || undefined}
      />
    );
  }

  // Se chegou aqui, o email está verificado - continuar normalmente
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.search || '';
  const type = resolvedSearchParams.type || 'all';
  const epochId = resolvedSearchParams.epoch || '';
  const composerId = resolvedSearchParams.composer || '';
  const workId = resolvedSearchParams.work || '';

  return (
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
  );
}
