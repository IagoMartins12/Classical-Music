import type { Metadata } from 'next';
import PortalTarefas from '@/app/components/Admin/telas/PortalTarefas';

export const metadata: Metadata = { title: 'Tarefas' };

export default function Pagina() {
  return <PortalTarefas />;
}
