// app/admin/works/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import WorksManagement from '@/app/components/Admin/Managements/WorksManagement';

export const metadata: Metadata = {
  title: 'Gerenciar Obras | Admin Panel',
  description: 'Administre o catálogo de obras musicais',
  robots: 'noindex, nofollow',
};

export default async function AdminWorksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <WorksManagement />;
}
