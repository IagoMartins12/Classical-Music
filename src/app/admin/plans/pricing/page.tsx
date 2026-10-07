import type { Metadata } from 'next';
import PlanosEPrecos from '@/app/components/Admin/telas/PlanosEPrecos';

export const metadata: Metadata = { title: 'Planos e preços' };

export default function PrecosPage() {
  return <PlanosEPrecos />;
}
