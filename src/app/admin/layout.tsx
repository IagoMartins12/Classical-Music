// app/admin/layout.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin Panel | Classical Music Platform',
  description: 'Painel administrativo da plataforma de música clássica',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Verificar se o usuário é admin
  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
