import type { Metadata } from 'next';
import Rotinas from '@/app/components/Admin/telas/Rotinas';

export const metadata: Metadata = { title: 'Rotinas do acervo' };

export default function RotinasPage() {
  return <Rotinas />;
}
