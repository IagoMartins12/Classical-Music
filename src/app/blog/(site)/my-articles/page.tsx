import type { Metadata } from 'next';
import {
  GuardaDeAutor,
  MeusArtigos,
} from '@/app/components/blog/escrita/AreaDoAutor';
import { PAGINA } from '@/app/components/blog/site/pecas';
import { cx } from '@/app/components/ui/cx';

export const metadata: Metadata = {
  title: 'Meus artigos',
  robots: { index: false, follow: false },
};

export default function PaginaMeusArtigos() {
  return (
    <div className={cx(PAGINA, 'pt-10 lg:pt-14')}>
      <header className="mb-10 flex flex-col gap-3">
        <h1 className="font-display text-[2.5rem] leading-[1.03] tracking-[-0.015em] sm:text-[3.25rem]">
          Meus artigos
        </h1>
        <p className="max-w-[52ch] text-[1.1875rem] leading-[1.5] text-texto-suave">
          O que você escreveu, publicado ou não.
        </p>
      </header>
      <GuardaDeAutor>
        <MeusArtigos />
      </GuardaDeAutor>
    </div>
  );
}
