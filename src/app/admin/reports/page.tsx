// app/admin/reports/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import AdvancedReports from '@/app/components/Admin/Reports/AdvancedReports';

export const metadata: Metadata = {
  title: 'Relatórios Avançados | Admin Panel',
  description: 'Geração e agendamento de relatórios customizados',
  robots: 'noindex, nofollow',
};

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <AdvancedReports />;
}
