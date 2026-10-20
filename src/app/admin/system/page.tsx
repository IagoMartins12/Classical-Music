import type { Metadata } from 'next';
import Saude from '@/app/components/Admin/telas/Saude';

export const metadata: Metadata = { title: 'Saúde' };

export default function SaudePage() {
  return <Saude />;
}
