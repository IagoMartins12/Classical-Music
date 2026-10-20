import type { Metadata } from 'next';
import Qualidade from '@/app/components/Admin/telas/Qualidade';

export const metadata: Metadata = { title: 'Qualidade do acervo' };

export default function QualidadePage() {
  return <Qualidade />;
}
