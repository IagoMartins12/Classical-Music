import type { Metadata } from 'next';
import TaxonomiaDoBlog from '@/app/components/Admin/telas/TaxonomiaDoBlog';

export const metadata: Metadata = { title: 'Início do blog' };

export default function Page() {
  return <TaxonomiaDoBlog inicial="inicio" />;
}
