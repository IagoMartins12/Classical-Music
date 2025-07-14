// app/admin/composers/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import ComposersManagement from '@/app/components/Admin/Managements/ComposersManagement';

export const metadata: Metadata = {
  title: 'Gerenciar Compositores | Admin Panel',
  description: 'Administre o catálogo de compositores da plataforma',
  robots: 'noindex, nofollow',
};

export default async function AdminComposersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <ComposersManagement />;
}
