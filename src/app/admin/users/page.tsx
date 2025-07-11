// app/admin/users/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import UsersAnalytics from '@/app/components/Admin/Users/UsersAnalytics';

export const metadata: Metadata = {
  title: 'Análise de Usuários | Admin Panel',
  description: 'Análise detalhada de usuários e comportamento na plataforma',
  robots: 'noindex, nofollow',
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <UsersAnalytics />;
}
