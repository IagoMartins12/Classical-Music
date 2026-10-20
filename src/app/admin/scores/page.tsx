import type { Metadata } from 'next';
import Partituras from '@/app/components/Admin/telas/Partituras';

export const metadata: Metadata = { title: 'Partituras' };

export default function PartiturasPage() {
  return <Partituras />;
}
