'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { forwardRef } from 'react';
import type { ComponentProps } from 'react';
import { languageOfPathname, localizeHref } from '@/app/utils/localizedRoutes';

type LinkProps = ComponentProps<typeof Link>;

/**
 * `next/link` que mantém o idioma da URL atual.
 *
 * Numa página em inglês (`/en/composers`), um `href="/works"` cru levaria ao
 * português: a pessoa perderia o idioma no meio da navegação, e — o que
 * importa mais — o buscador, lendo a página em inglês, só encontraria
 * endereços em português. O inglês existiria sem nada apontando para ele.
 *
 * Aqui o prefixo é acrescentado quando (e só quando) a rota de destino existe
 * nos dois idiomas. `/profile`, `/favorites` e as outras páginas por pessoa
 * passam intocadas, o que torna seguro usar este componente no lugar de
 * `next/link` em qualquer arquivo.
 */
const LocalizedLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function LocalizedLink({ href, ...props }, ref) {
    const pathname = usePathname();
    const language = languageOfPathname(pathname ?? '/');

    const destino =
      typeof href === 'string' ? localizeHref(href, language) : href;

    return <Link ref={ref} href={destino} {...props} />;
  }
);

export default LocalizedLink;
