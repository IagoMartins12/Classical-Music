// app/admin/uploads/page.tsx
import { Metadata } from 'next';
import UploadsManagement from '@/app/components/Admin/Managements/UploadsManagement';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gerenciar Uploads | Admin Panel',
  description: 'Administre uploads e moderação de conteúdo',
  robots: 'noindex, nofollow',
};

export default function AdminUploadsPage() {
  return <UploadsManagement />;
}
