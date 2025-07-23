// app/admin/newsletter/settings/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import NewsletterSettingsClient from '@/app/components/Admin/Newsletter/NewsletterSettingsClient';

export const metadata: Metadata = {
  title: 'Configurações | Newsletter Admin',
  description: 'Configurações da newsletter e sistema de email',
  robots: 'noindex, nofollow',
};

export default async function NewsletterSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <NewsletterSettingsClient />;
}
