// app/admin/reports/page.tsx
import { Metadata } from 'next';
import ReportsDashboard from '../../components/Admin/Reports/ReportsDashboard';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard de Reports | Classical Music App',
  description: 'Gerenciar reports e moderação da plataforma',
};

export default function ReportsPage() {
  return <ReportsDashboard />;
}
