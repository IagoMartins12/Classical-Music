// app/admin/newsletter/campaigns/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import NewsletterCampaignsClient from '@/app/components/Admin/Newsletter/NewsletterCampaignsClient';

export const metadata: Metadata = {
  title: 'Campanhas | Newsletter Admin',
  description: 'Gerenciar campanhas de email da newsletter',
  robots: 'noindex, nofollow',
};

export default async function NewsletterCampaignsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <NewsletterCampaignsClient />;
}
