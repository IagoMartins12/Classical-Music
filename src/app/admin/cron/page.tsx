import type { Metadata } from 'next';
import TarefasAgendadas from '@/app/components/Admin/telas/TarefasAgendadas';

export const metadata: Metadata = { title: 'Tarefas agendadas' };

export default function TarefasPage() {
  return <TarefasAgendadas />;
}
