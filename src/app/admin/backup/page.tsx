// app/admin/backup/page.tsx
import { Metadata } from 'next';
import BackupManagementClient from '@/app/components/Admin/Backup/BackupManagementClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gerenciamento de Backup | Admin Panel',
  description: 'Gerenciar backups do banco de dados',
  robots: 'noindex, nofollow',
};

export default function BackupManagementPage() {
  return <BackupManagementClient />;
}
