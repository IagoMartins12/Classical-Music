import type { Metadata } from 'next';
import Compositores from '@/app/components/Admin/telas/Compositores';

export const metadata: Metadata = { title: 'Compositores' };

export default function CompositoresPage() {
  return <Compositores />;
}
