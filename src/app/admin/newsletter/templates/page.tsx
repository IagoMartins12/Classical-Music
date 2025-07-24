// app/admin/newsletter/templates/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import NewsletterTemplatesClient from '@/app/components/Admin/Newsletter/NewsletterTemplatesClient';

export const metadata: Metadata = {
  title: 'Templates | Newsletter Admin',
  description: 'Gerenciar templates de email da newsletter',
  robots: 'noindex, nofollow',
};

export default async function NewsletterTemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <NewsletterTemplatesClient />;
}
