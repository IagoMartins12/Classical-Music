import type { Metadata } from 'next';
import PortalVisao from '@/app/components/Admin/telas/PortalVisao';

export const metadata: Metadata = { title: 'Portal de estudo' };

export default function Pagina() {
  return <PortalVisao />;
}
