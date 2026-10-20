import type { ReactNode } from 'react';
import { CascaDoBlog } from '@/app/components/blog/site/CascaDoBlog';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

/**
 * O blog público nos dois idiomas (`/blog` e `/en/blog`). O middleware
 * reescreve `/blog/...` para `/pt/blog/...` ou `/en/blog/...`; cada idioma é
 * gerado e guardado uma vez. As páginas por pessoa ficam em `app/blog/`.
 */
export default async function LayoutDoBlog({
  children,
  params,
}: {
  children: ReactNode;
  params: LangParams;
}) {
  const idioma = await routeLanguage(params);
  return <CascaDoBlog idioma={idioma}>{children}</CascaDoBlog>;
}
