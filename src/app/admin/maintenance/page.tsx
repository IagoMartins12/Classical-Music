// app/admin/maintenance/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import BackupMaintenance from '@/app/components/Admin/System/BackupMaintenance';

export const metadata: Metadata = {
  title: 'Backup & Manutenção | Admin Panel',
  description: 'Proteção de dados e otimização do sistema',
  robots: 'noindex, nofollow',
};

export default async function AdminMaintenancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <BackupMaintenance />;
}
