// app/admin/scores/page.tsx
import { Metadata } from 'next';
import ScoresManagement from '@/app/components/Admin/Managements/ScoresManagement';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gerenciar Partituras | Admin Panel',
  description: 'Administre o catálogo de partituras da plataforma',
  robots: 'noindex, nofollow',
};

export default function AdminScoresPage() {
  return <ScoresManagement />;
}
