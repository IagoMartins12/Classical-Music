// app/admin/system/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import SystemPerformance from '@/app/components/Admin/System/SystemPerformance';

export const metadata: Metadata = {
  title: 'Sistema & Performance | Admin Panel',
  description: 'Monitoramento em tempo real da infraestrutura',
  robots: 'noindex, nofollow',
};

export default async function AdminSystemPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <SystemPerformance />;
}
