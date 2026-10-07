import type { Metadata } from 'next';
import { PortalProfessores } from '@/app/components/Admin/telas/PortalPessoas';

export const metadata: Metadata = { title: 'Professores' };

export default function Pagina() {
  return <PortalProfessores />;
}
