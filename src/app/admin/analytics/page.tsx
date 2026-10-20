import type { Metadata } from 'next';
import UsoDaPlataforma from '@/app/components/Admin/telas/UsoDaPlataforma';

export const metadata: Metadata = { title: 'Uso da plataforma' };

export default function UsoPage() {
  return <UsoDaPlataforma />;
}
