// app/admin/settings/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import SystemSettings from '@/app/components/Admin/Settings/SystemSettings';

export const metadata: Metadata = {
  title: 'Configurações do Sistema | Admin Panel',
  description: 'Gerencie parâmetros e regras da plataforma',
  robots: 'noindex, nofollow',
};

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <SystemSettings />;
}
