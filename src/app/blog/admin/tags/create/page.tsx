import type { Metadata } from 'next';
import { FormularioDeTag } from '@/app/components/blog/escrita/FormularioDeTaxonomia';

export const metadata: Metadata = { title: 'Nova tag' };

export default function NovaTag() {
  return <FormularioDeTag />;
}
