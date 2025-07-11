// app/admin/logs/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import LogsAudit from '@/app/components/Admin/Logs/LogsAudit';

export const metadata: Metadata = {
  title: 'Logs & Auditoria | Admin Panel',
  description: 'Monitoramento e rastreamento de atividades',
  robots: 'noindex, nofollow',
};

export default async function AdminLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <LogsAudit />;
}
