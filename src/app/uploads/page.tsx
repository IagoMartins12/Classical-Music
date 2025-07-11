// app/uploads/page.tsx - ATUALIZADO COM NOVOS FILTROS
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../libs/auth';
import AuthCheck from '../components/AuthCheck';
import UploadsPageServer from './pageServer';

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
    composer?: string; // 🆕 Novo parâmetro
    work?: string; // 🆕 Novo parâmetro
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <AuthCheck title="Meus Uploads" />;
  }

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.search || '';
  const type = resolvedSearchParams.type || 'all';
  const epochId = resolvedSearchParams.epoch || '';
  const composerId = resolvedSearchParams.composer || ''; // 🆕
  const workId = resolvedSearchParams.work || ''; // 🆕

  return (
    <UploadsPageServer
      page={page}
      search={search}
      type={type}
      epochId={epochId}
      composerId={composerId} // 🆕 Passar novo parâmetro
      workId={workId} // 🆕 Passar novo parâmetro
      userId={session.user.id}
      userRole={session.user.role || 0}
    />
  );
}
