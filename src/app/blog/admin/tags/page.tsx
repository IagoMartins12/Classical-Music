import type { Metadata } from 'next';
import TaxonomiaDoBlog from '@/app/components/Admin/telas/TaxonomiaDoBlog';

export const metadata: Metadata = { title: 'Categorias e tags' };

export default function Page() {
  return <TaxonomiaDoBlog inicial="tags" />;
}
