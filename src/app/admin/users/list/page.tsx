// app/admin/users/list/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import UsersList from '@/app/components/Admin/Users/UsersList';

export const metadata: Metadata = {
  title: 'Lista de Usuários | Admin Panel',
  description: 'Gerencie e visualize todos os usuários da plataforma',
  robots: 'noindex, nofollow',
};

export default async function AdminUsersListPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <UsersList />;
}
