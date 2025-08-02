// app/admin/orphan-files/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import OrphanFilesManagementClient from '@/app/components/Admin/OrphanFiles/OrphanFilesManagementClient';

export const metadata: Metadata = {
  title: 'Limpeza de Arquivos Órfãos | Admin Panel',
  description: 'Encontrar e remover arquivos não utilizados',
  robots: 'noindex, nofollow',
};

export default async function OrphanFilesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <OrphanFilesManagementClient />;
}
