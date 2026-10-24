import type { Metadata } from 'next';
import Atendimento from '@/app/components/Admin/telas/Atendimento';

export const metadata: Metadata = { title: 'Atendimento' };

export default function AtendimentoPage() {
  return <Atendimento />;
}
