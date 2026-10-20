import type { Metadata } from 'next';
import { ListaPessoal } from '@/app/components/blog/site/ListaPessoal';
import { PAGINA } from '@/app/components/blog/site/pecas';
import { cx } from '@/app/components/ui/cx';
import { BLOG } from '@/app/conteudo/blog';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

/** Por pessoa: nunca entra no buscador nem no cache. */
export const metadata: Metadata = {
  title: BLOG.pt.pessoal.curtidos,
  robots: { index: false, follow: false },
};

export default async function Pagina() {
  const idioma = await getServerLanguageStatic();
  const t = BLOG[idioma].pessoal;
  return (
    <div className={cx(PAGINA, 'pt-10 lg:pt-14')}>
      <header className="mb-10 flex flex-col gap-3">
        <h1 className="font-display text-[2.5rem] leading-[1.03] tracking-[-0.015em] sm:text-[3.25rem]">
          {t.curtidos}
        </h1>
        <p className="max-w-[52ch] text-[1.1875rem] leading-[1.5] text-texto-suave">
          {t.curtidosDescricao}
        </p>
      </header>
      <ListaPessoal idioma={idioma} tipo="curtidos" />
    </div>
  );
}
