// app/admin/newsletter/subscribers/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import NewsletterSubscribersClient from '@/app/components/Admin/Newsletter/NewsletterSubscribersClient';

export const metadata: Metadata = {
  title: 'Subscribers | Newsletter Admin',
  description: 'Gerenciar subscribers da newsletter',
  robots: 'noindex, nofollow',
};

export default async function NewsletterSubscribersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <NewsletterSubscribersClient />;
}
