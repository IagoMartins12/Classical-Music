// app/uploads/moderation/page.tsx
import { Metadata } from 'next';
import ReportsDashboard from '@/app/components/Admin/Reports/ReportsDashboard';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Centro de Moderação | Admin Panel',
  description: 'Controle de qualidade e moderação de conteúdo',
  robots: 'noindex, nofollow',
};

export default function ModerationPage() {
  return <ReportsDashboard />;
}
