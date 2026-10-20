import type { Metadata } from 'next';
import Anuncios from '@/app/components/Admin/telas/Anuncios';

export const metadata: Metadata = { title: 'Anúncios' };

export default function AnunciosPage() {
  return <Anuncios />;
}
