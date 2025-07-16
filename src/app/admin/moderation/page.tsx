// app/uploads/moderation/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import ReportsDashboard from '@/app/components/Admin/Reports/ReportsDashboard';

export const metadata: Metadata = {
  title: 'Centro de Moderação | Admin Panel',
  description: 'Controle de qualidade e moderação de conteúdo',
  robots: 'noindex, nofollow',
};

export default async function ModerationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <ReportsDashboard />;
}
