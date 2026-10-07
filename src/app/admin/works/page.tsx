import type { Metadata } from 'next';
import Obras from '@/app/components/Admin/telas/Obras';

export const metadata: Metadata = { title: 'Obras' };

export default function ObrasPage() {
  return <Obras />;
}
