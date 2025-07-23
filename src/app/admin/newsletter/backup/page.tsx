// app/admin/newsletter/backup/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import NewsletterBackupClient from '@/app/components/Admin/Newsletter/NewsletterBackupClient';

export const metadata: Metadata = {
  title: 'Backup Newsletter | Admin',
  description: 'Sistema de backup e restore da newsletter',
  robots: 'noindex, nofollow',
};

export default async function NewsletterBackupPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <NewsletterBackupClient />;
}
