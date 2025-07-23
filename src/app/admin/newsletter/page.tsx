// app/admin/newsletter/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import NewsletterDashboardClient from '@/app/components/Admin/Newsletter/NewsletterDashboardClient';

export const metadata: Metadata = {
  title: 'Newsletter Dashboard | Admin',
  description: 'Gerenciamento de newsletter e campanhas de email',
  robots: 'noindex, nofollow',
};

export default async function NewsletterDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <NewsletterDashboardClient />;
}
