import type { Metadata } from 'next';
import Artigos from '@/app/components/Admin/telas/Artigos';

export const metadata: Metadata = { title: 'Artigos' };

export default function ArtigosPage() {
  return <Artigos />;
}
