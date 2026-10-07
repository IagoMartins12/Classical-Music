import type { Metadata } from 'next';
import Assinaturas from '@/app/components/Admin/telas/Assinaturas';

export const metadata: Metadata = { title: 'Assinaturas' };

export default function AssinaturasPage() {
  return <Assinaturas />;
}
