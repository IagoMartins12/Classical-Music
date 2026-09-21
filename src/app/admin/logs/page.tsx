// app/admin/logs/page.tsx
import { Metadata } from 'next';
import LogsAudit from '@/app/components/Admin/Logs/LogsAudit';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Logs & Auditoria | Admin Panel',
  description: 'Monitoramento e rastreamento de atividades',
  robots: 'noindex, nofollow',
};

export default function AdminLogsPage() {
  return <LogsAudit />;
}
