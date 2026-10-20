import type { Metadata } from 'next';
import Auditoria from '@/app/components/Admin/telas/Auditoria';

export const metadata: Metadata = { title: 'Auditoria' };

export default function AuditoriaPage() {
  return <Auditoria />;
}
