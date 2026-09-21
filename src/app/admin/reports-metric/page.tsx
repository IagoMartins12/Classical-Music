// app/admin/reports/page.tsx
import { Metadata } from 'next';
import AdvancedReports from '@/app/components/Admin/Reports/AdvancedReports';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Relatórios Avançados | Admin Panel',
  description: 'Geração e agendamento de relatórios customizados',
  robots: 'noindex, nofollow',
};

export default function AdminReportsPage() {
  return <AdvancedReports />;
}
