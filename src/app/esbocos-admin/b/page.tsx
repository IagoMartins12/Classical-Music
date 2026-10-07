import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EsbocoB } from './EsbocoB';

export const metadata: Metadata = {
  title: 'Esboço B do painel',
  robots: 'noindex, nofollow',
};

/** Esboço de layout do painel: só em desenvolvimento, como o `/styleguide`. */
export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <EsbocoB />;
}
