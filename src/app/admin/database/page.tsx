// app/admin/database/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import DatabaseStudioClient from '@/app/components/Admin/Database/DatabaseStudioClient';

export const metadata: Metadata = {
  title: 'Database Studio | Admin Panel',
  description:
    'Gerenciar banco de dados - Visualizar, editar e deletar registros',
  robots: 'noindex, nofollow',
};

export default async function DatabaseStudioPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <DatabaseStudioClient />;
}
