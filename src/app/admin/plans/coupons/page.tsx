import type { Metadata } from 'next';
import Cupons from '@/app/components/Admin/telas/Cupons';

export const metadata: Metadata = { title: 'Cupons' };

export default function CuponsPage() {
  return <Cupons />;
}
