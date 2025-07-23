// app/admin/newsletter/test-lists/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import TestEmailListsManager from '@/app/components/Admin/Newsletter/TestEmailListsManager';

export const metadata: Metadata = {
  title: 'Listas de Teste | Newsletter Admin',
  description: 'Gerenciamento de listas de teste para campanhas de email',
  robots: 'noindex, nofollow',
};

export default async function TestListsAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <TestEmailListsManager />;
}
