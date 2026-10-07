import type { Metadata } from 'next';
import Envios from '@/app/components/Admin/telas/Envios';

export const metadata: Metadata = { title: 'Envios' };

export default function EnviosPage() {
  return <Envios />;
}
