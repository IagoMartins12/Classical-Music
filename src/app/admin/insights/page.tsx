// app/admin/insights/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import InsightsAnalytics from '@/app/components/Admin/Analytics/InsightsAnalytics';

export const metadata: Metadata = {
  title: 'Insights & Analytics | Admin Panel',
  description: 'Análises avançadas e previsões inteligentes',
  robots: 'noindex, nofollow',
};

export default async function AdminInsightsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <InsightsAnalytics />;
}
