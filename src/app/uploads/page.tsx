// app/uploads/page.tsx
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

  return (
    <UploadsPageServer
      page={page}
      search={search}
      type={type}
      epochId={epochId}
      userId={session.user.id}
      userRole={session.user.role || 0}
    />
  );
}
