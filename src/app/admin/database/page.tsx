import type { Metadata } from 'next';
import EstudioDoBanco from '@/app/components/Admin/telas/EstudioDoBanco';

export const metadata: Metadata = { title: 'Database Studio' };

export default function EstudioPage() {
  return <EstudioDoBanco />;
}
