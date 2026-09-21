// app/admin/system/page.tsx
import { Metadata } from 'next';
import SystemPerformance from '@/app/components/Admin/System/SystemPerformance';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sistema & Performance | Admin Panel',
  description: 'Monitoramento em tempo real da infraestrutura',
  robots: 'noindex, nofollow',
};

export default function AdminSystemPage() {
  return <SystemPerformance />;
}
