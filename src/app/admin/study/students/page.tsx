import type { Metadata } from 'next';
import { PortalAlunos } from '@/app/components/Admin/telas/PortalPessoas';

export const metadata: Metadata = { title: 'Alunos' };

export default function Pagina() {
  return <PortalAlunos />;
}
