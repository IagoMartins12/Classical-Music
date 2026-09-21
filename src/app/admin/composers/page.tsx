// app/admin/composers/page.tsx
import { Metadata } from 'next';
import ComposersManagement from '@/app/components/Admin/Managements/ComposersManagement';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gerenciar Compositores | Admin Panel',
  description: 'Administre o catálogo de compositores da plataforma',
  robots: 'noindex, nofollow',
};

export default function AdminComposersPage() {
  return <ComposersManagement />;
}
