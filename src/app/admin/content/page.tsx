// app/admin/content/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import ContentAnalytics from '@/app/components/Admin/Analytics/ContentAnalytics';

export const metadata: Metadata = {
  title: 'Análise de Conteúdo | Admin Panel',
  description: 'Análise detalhada de compositores, obras e partituras',
  robots: 'noindex, nofollow',
};

export default async function AdminContentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <ContentAnalytics />;
}
