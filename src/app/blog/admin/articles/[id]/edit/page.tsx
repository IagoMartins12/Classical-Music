import type { Metadata } from 'next';
import { TelaDeEscrita } from '@/app/components/blog/escrita/TelaDeEscrita';

export const metadata: Metadata = { title: 'Editar artigo' };

export default async function EditarArtigo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TelaDeEscrita artigoId={id} />;
}
