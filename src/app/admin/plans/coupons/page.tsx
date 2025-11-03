// app/admin/backup/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import AdminCouponsPageClient from './pageClient';

export const metadata: Metadata = {
  title: 'Gerenciamento de Cupons | Admin Panel',
  description: 'Gerenciar cupons do banco de dados',
  robots: 'noindex, nofollow',
};

export default async function CouponsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <AdminCouponsPageClient />;
}
