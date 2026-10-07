import type { Metadata } from 'next';
import Relatorios from '@/app/components/Admin/telas/Relatorios';

export const metadata: Metadata = { title: 'Relatórios' };

export default function RelatoriosPage() {
  return <Relatorios />;
}
