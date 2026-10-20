import type { Metadata } from 'next';
import { GuardaDeAutor } from '@/app/components/blog/escrita/AreaDoAutor';
import { TelaDeEscrita } from '@/app/components/blog/escrita/TelaDeEscrita';
import { PAGINA } from '@/app/components/blog/site/pecas';
import { cx } from '@/app/components/ui/cx';

export const metadata: Metadata = {
  title: 'Novo artigo',
  robots: { index: false, follow: false },
};

/** A escrita do professor, fora do painel (que é só do administrador). */
export default function NovoArtigoDoAutor() {
  return (
    <div className={cx(PAGINA, 'pt-8 lg:pt-10')}>
      <GuardaDeAutor>
        <TelaDeEscrita modo="autor" />
      </GuardaDeAutor>
    </div>
  );
}
