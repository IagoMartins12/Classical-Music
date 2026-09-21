import type { Metadata } from 'next';
import {
  DEFAULT_ROUTE_LANGUAGE,
  localizeHref,
  type RouteLanguage,
} from './localizedRoutes';

/** O domínio, um só para os dois idiomas. */
export const SITE_URL = 'https://opusatlas.com.br';

/**
 * O `canonical` e o `hreflang` de uma página pública.
 *
 * **O problema que isto resolve.** O site declarava o inglês em
 * `opusatlas.com`, um domínio que não existe, e servia os dois idiomas na
 * mesma URL conforme o cookie. O robô do Google chega sem cookie: ele via
 * português em toda página e **o inglês não existia para busca nenhuma**.
 *
 * Agora cada idioma tem endereço próprio no mesmo domínio — `/works` e
 * `/en/works` —, cada um se declara canônico de si mesmo, e os dois apontam um
 * para o outro. `x-default` vai para o português, que é a versão sem prefixo.
 *
 * `caminho` é sempre o endereço **limpo**, sem prefixo de idioma: quem
 * acrescenta o `/en` é esta função.
 */
export function alternatesFor(
  caminho: string,
  language: RouteLanguage
): Metadata['alternates'] {
  const pt = `${SITE_URL}${caminho === '/' ? '' : caminho}`;
  const en = `${SITE_URL}${localizeHref(caminho, 'en')}`;

  return {
    canonical: language === DEFAULT_ROUTE_LANGUAGE ? pt : en,
    languages: {
      'pt-BR': pt,
      'en-US': en,
      'x-default': pt,
    },
  };
}
