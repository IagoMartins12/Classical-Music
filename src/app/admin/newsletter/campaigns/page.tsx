import type { Metadata } from 'next';
import Campanhas from '@/app/components/Admin/telas/Campanhas';

export const metadata: Metadata = { title: 'Campanhas' };

export default function CampanhasPage() {
  return <Campanhas />;
}
