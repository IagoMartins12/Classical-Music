// app/admin/ads/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import AdsManagementClient from '@/app/components/Admin/Ads/AdsManagementClient';

export const metadata: Metadata = {
  title: 'Gerenciamento de Publicidades | Admin Panel',
  description: 'Gerenciar publicidades e campanhas da plataforma',
  robots: 'noindex, nofollow',
};

export default async function AdsManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <AdsManagementClient />;
}
