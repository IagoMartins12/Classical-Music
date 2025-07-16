// app/admin/reports/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import ReportsDashboard from '../../components/Admin/Reports/ReportsDashboard';

export const metadata: Metadata = {
  title: 'Dashboard de Reports | Classical Music App',
  description: 'Gerenciar reports e moderação da plataforma',
};

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <ReportsDashboard />;
}
