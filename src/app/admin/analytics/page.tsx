// app/admin/analytics/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import AdminAnalytics from '@/app/components/Admin/Analytics/AdminAnalytics';

export const metadata: Metadata = {
  title: 'Analytics | Admin Panel',
  description: 'Visão completa de analytics e performance da plataforma',
  robots: 'noindex, nofollow',
};

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <AdminAnalytics />;
}
