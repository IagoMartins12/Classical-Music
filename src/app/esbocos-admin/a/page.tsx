import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EsbocoA } from './EsbocoA';

export const metadata: Metadata = {
  title: 'Esboço A do painel',
  robots: 'noindex, nofollow',
};

/** Esboço de layout do painel: só em desenvolvimento, como o `/styleguide`. */
export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <EsbocoA />;
}
