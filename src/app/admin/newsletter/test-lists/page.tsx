import type { Metadata } from 'next';
import ListasDeTeste from '@/app/components/Admin/telas/ListasDeTeste';

export const metadata: Metadata = { title: 'Listas de teste' };

export default function ListasPage() {
  return <ListasDeTeste />;
}
