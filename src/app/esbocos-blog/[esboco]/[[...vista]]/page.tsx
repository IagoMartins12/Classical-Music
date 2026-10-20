import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EsbocoA } from '../../EsbocoA';
import { EsbocoB } from '../../EsbocoB';
import { EsbocoC } from '../../EsbocoC';
import { ESBOCOS, VISTAS, type EsbocoId, type Vista } from '../../dados';
import '../../esboco.css';

export const metadata: Metadata = {
  title: 'Esboço do blog',
  robots: 'noindex, nofollow',
};

const ESBOCO = { a: EsbocoA, b: EsbocoB, c: EsbocoC };

interface PageProps {
  params: Promise<{ esboco: string; vista?: string[] }>;
  searchParams: Promise<{ categoria?: string }>;
}

/**
 * Os três esboços do blog: só em desenvolvimento, como o `/styleguide`.
 *
 * `/esbocos-blog/a` é o início, `/esbocos-blog/a/artigo` o artigo e
 * `/esbocos-blog/a/lista` a lista (`?categoria=historia` filtra).
 */
export default async function Page({ params, searchParams }: PageProps) {
  if (process.env.NODE_ENV === 'production') notFound();

  const { esboco, vista: caminho = [] } = await params;
  const { categoria } = await searchParams;
  const vista = (caminho[0] ?? 'inicio') as Vista;

  if (
    !ESBOCOS.includes(esboco as EsbocoId) ||
    caminho.length > 1 ||
    !VISTAS.some((v) => v.id === vista)
  ) {
    notFound();
  }

  const Esboco = ESBOCO[esboco as EsbocoId];
  return <Esboco vista={vista} categoria={categoria} />;
}
