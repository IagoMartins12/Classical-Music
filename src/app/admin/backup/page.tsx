// app/admin/backup/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import BackupManagementClient from '@/app/components/Admin/Backup/BackupManagementClient';

export const metadata: Metadata = {
  title: 'Gerenciamento de Backup | Admin Panel',
  description: 'Gerenciar backups do banco de dados',
  robots: 'noindex, nofollow',
};

export default async function BackupManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <BackupManagementClient />;
}
