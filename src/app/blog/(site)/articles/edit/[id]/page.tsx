import type { Metadata } from 'next';
import { GuardaDeAutor } from '@/app/components/blog/escrita/AreaDoAutor';
import { TelaDeEscrita } from '@/app/components/blog/escrita/TelaDeEscrita';
import { PAGINA } from '@/app/components/blog/site/pecas';
import { cx } from '@/app/components/ui/cx';

export const metadata: Metadata = {
  title: 'Editar artigo',
  robots: { index: false, follow: false },
};

export default async function EditarArtigoDoAutor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className={cx(PAGINA, 'pt-8 lg:pt-10')}>
      <GuardaDeAutor>
        <TelaDeEscrita modo="autor" artigoId={id} />
      </GuardaDeAutor>
    </div>
  );
}
