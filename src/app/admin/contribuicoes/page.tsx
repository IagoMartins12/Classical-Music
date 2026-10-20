import type { Metadata } from 'next';
import Contribuicoes from '@/app/components/Admin/telas/Contribuicoes';

export const metadata: Metadata = { title: 'Contribuições' };

export default function ContribuicoesPage() {
  return <Contribuicoes />;
}
