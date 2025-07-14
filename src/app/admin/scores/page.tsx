// app/admin/scores/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import ScoresManagement from '@/app/components/Admin/Managements/ScoresManagement';

export const metadata: Metadata = {
  title: 'Gerenciar Partituras | Admin Panel',
  description: 'Administre o catálogo de partituras da plataforma',
  robots: 'noindex, nofollow',
};

export default async function AdminScoresPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <ScoresManagement />;
}
