import type { ReactNode } from 'react';
import { CascaDoBlog } from '@/app/components/blog/site/CascaDoBlog';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

/**
 * A parte do blog que não vive em `[lang]`: salvos, curtidos, busca e
 * prévia. São por pessoa ou por pedido (dinâmicas), e o idioma vem da
 * preferência de quem pede. A casca é a mesma das páginas públicas.
 */
export default async function LayoutDoBlogPessoal({
  children,
}: {
  children: ReactNode;
}) {
  const idioma = await getServerLanguageStatic();
  return <CascaDoBlog idioma={idioma}>{children}</CascaDoBlog>;
}
