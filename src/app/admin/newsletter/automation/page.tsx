// app/admin/newsletter/automation/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import NewsletterAutomationClient from '@/app/components/Admin/Newsletter/NewsletterAutomationClient';

export const metadata: Metadata = {
  title: 'Automação | Newsletter Admin',
  description: 'Configurar automações da newsletter',
  robots: 'noindex, nofollow',
};

export default async function NewsletterAutomationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <NewsletterAutomationClient />;
}
