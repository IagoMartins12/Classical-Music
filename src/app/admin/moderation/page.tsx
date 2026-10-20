import type { Metadata } from 'next';
import Denuncias from '@/app/components/Admin/telas/Denuncias';

export const metadata: Metadata = { title: 'Denúncias' };

export default function DenunciasPage() {
  return <Denuncias />;
}
