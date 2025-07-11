// app/uploads/moderation/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import ModerationDashboard from '@/app/components/Admin/Dashboards/ModerationDashboard';

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

  return <ModerationDashboard />;
}
