import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ESBOCOS, TELAS, type EsbocoId, type Tela } from '../../dados';
import { Esboco } from '../../Esboco';
import '../../esboco.css';

export const metadata: Metadata = {
  title: 'Esboço da main',
  robots: 'noindex, nofollow',
};

interface PageProps {
  params: Promise<{ esboco: string; vista?: string[] }>;
}

/**
 * Os três esboços da main: só em desenvolvimento, como os do blog e do portal.
 * `/esbocos-main/a` é o início; `/esbocos-main/b/obra` a página de uma obra.
 */
export default async function Page({ params }: PageProps) {
  if (process.env.NODE_ENV === 'production') notFound();

  const { esboco, vista = [] } = await params;
  const tela = (vista[0] ?? 'inicio') as Tela;

  if (
    !ESBOCOS.includes(esboco as EsbocoId) ||
    vista.length > 1 ||
    !TELAS.some((t) => t.id === tela)
  ) {
    notFound();
  }

  return <Esboco esboco={esboco as EsbocoId} tela={tela} />;
}
