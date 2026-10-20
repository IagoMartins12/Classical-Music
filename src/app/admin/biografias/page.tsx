import type { Metadata } from 'next';
import Biografias from '@/app/components/Admin/telas/Biografias';

export const metadata: Metadata = { title: 'Biografias' };

export default function BiografiasPage() {
  return <Biografias />;
}
