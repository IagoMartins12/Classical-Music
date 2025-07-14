// app/admin/uploads/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import UploadsManagement from '@/app/components/Admin/Managements/UploadsManagement';

export const metadata: Metadata = {
  title: 'Gerenciar Uploads | Admin Panel',
  description: 'Administre uploads e moderação de conteúdo',
  robots: 'noindex, nofollow',
};

export default async function AdminUploadsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <UploadsManagement />;
}
