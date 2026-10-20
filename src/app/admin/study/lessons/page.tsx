import type { Metadata } from 'next';
import PortalAulas from '@/app/components/Admin/telas/PortalAulas';

export const metadata: Metadata = { title: 'Aulas' };

export default function Pagina() {
  return <PortalAulas />;
}
