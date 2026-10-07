import type { Metadata } from 'next';
import { TelaDeEscrita } from '@/app/components/blog/escrita/TelaDeEscrita';

export const metadata: Metadata = { title: 'Novo artigo' };

export default function NovoArtigo() {
  return <TelaDeEscrita />;
}
