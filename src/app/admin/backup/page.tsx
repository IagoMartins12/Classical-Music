import type { Metadata } from 'next';
import Backup from '@/app/components/Admin/telas/Backup';

export const metadata: Metadata = { title: 'Backup' };

export default function BackupPage() {
  return <Backup />;
}
