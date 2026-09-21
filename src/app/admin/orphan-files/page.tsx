// app/admin/orphan-files/page.tsx
import { Metadata } from 'next';
import OrphanFilesManagementClient from '@/app/components/Admin/OrphanFiles/OrphanFilesManagementClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Limpeza de Arquivos Órfãos | Admin Panel',
  description: 'Encontrar e remover arquivos não utilizados',
  robots: 'noindex, nofollow',
};

export default function OrphanFilesPage() {
  return <OrphanFilesManagementClient />;
}
