// app/admin/works/page.tsx
import { Metadata } from 'next';
import WorksManagement from '@/app/components/Admin/Managements/WorksManagement';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gerenciar Obras | Admin Panel',
  description: 'Administre o catálogo de obras musicais',
  robots: 'noindex, nofollow',
};

export default function AdminWorksPage() {
  return <WorksManagement />;
}
