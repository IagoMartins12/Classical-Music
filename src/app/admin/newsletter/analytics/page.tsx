// app/admin/newsletter/analytics/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import NewsletterAnalyticsClient from '@/app/components/Admin/Newsletter/NewsletterAnalyticsClient';

export const metadata: Metadata = {
  title: 'Analytics | Newsletter Admin',
  description: 'Analytics e relatórios da newsletter',
  robots: 'noindex, nofollow',
};

export default async function NewsletterAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <NewsletterAnalyticsClient />;
}
