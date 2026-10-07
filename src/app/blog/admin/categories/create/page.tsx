import type { Metadata } from 'next';
import { FormularioDeCategoria } from '@/app/components/blog/escrita/FormularioDeTaxonomia';

export const metadata: Metadata = { title: 'Nova categoria' };

export default function NovaCategoria() {
  return <FormularioDeCategoria />;
}
