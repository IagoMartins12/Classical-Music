/**
 * As rotas que existem em dois idiomas, e como um endereço vira o endereço em
 * inglês.
 *
 * Este módulo é a única fonte da lista: ele é lido pelo `middleware.ts` (que
 * decide o que reescrever e o que redirecionar) e pelo `LocalizedLink` (que
 * decide o `href` de cada link). Duas listas separadas divergiriam, e a
 * divergência apareceria como link para página que não existe.
 *
 * Nada aqui importa nada: o middleware roda no edge.
 */

export const SUPPORTED_LANGUAGES = ['pt', 'en'] as const;
export type RouteLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Português é o caminho limpo; só o inglês tem prefixo. */
export const DEFAULT_ROUTE_LANGUAGE: RouteLanguage = 'pt';

export const LANGUAGE_COOKIE = 'opus-atlas-language';

/**
 * As rotas que vivem sob `app/[lang]/(main)/` — as públicas, que não dependem
 * de quem está pedindo.
 *
 * A lista é explícita de propósito: o que **não** está aqui (favoritos,
 * aprendizado, perfil, envios, moderação, páginas de token) segue em
 * `app/(main)/`, dinâmico, e nunca pode ser servido de cache. Errar para o
 * lado de deixar de fora custa uma página não cacheada; errar para o outro
 * mostraria dado de uma pessoa para outra.
 */
export const LOCALIZED_ROUTES = [
  '/about-us',
  '/composer',
  '/composers',
  '/contact',
  '/copyright',
  '/difficulty',
  '/faq',
  '/genres',
  '/help',
  '/instruments',
  '/music-history',
  '/pricing',
  '/privacy',
  '/support',
  '/teachers',
  '/terms',
  '/works',
];

/**
 * Rotas partidas em duas: uma variante sem `searchParams`, que o Next gera e
 * guarda, e uma `/filtered` que lê os parâmetros e renderiza sob demanda.
 *
 * **O porquê.** No Next 15, ler `searchParams` em qualquer ponto de uma rota a
 * torna dinâmica — ela renderiza do zero a cada visita, e o `revalidate` que
 * declara não vale nada. Mas a visita que importa nestas páginas, a que vem do
 * buscador e do menu, chega sem parâmetro nenhum.
 */
export const SPLIT_ROUTES = ['/composers', '/works', '/teachers'];

/** O sufixo interno; ver `SPLIT_ROUTES`. */
export const FILTERED_SEGMENT = '/filtered';

export function isLocalizedRoute(pathname: string): boolean {
  return (
    pathname === '/' ||
    LOCALIZED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
  );
}

/**
 * O endereço de `href` no idioma pedido.
 *
 * Rota que não é traduzida volta intocada — é o que torna seguro trocar
 * `next/link` por `LocalizedLink` em qualquer arquivo: `/profile` continua
 * `/profile`, e não vira `/en/profile`, que não existe.
 *
 * Endereço externo, âncora, `mailto:` e afins também voltam intocados.
 */
export function localizeHref(href: string, language: RouteLanguage): string {
  if (!href.startsWith('/')) return href;

  const [caminho, ...resto] = href.split(/(?=[?#])/);
  const cauda = resto.join('');

  if (!isLocalizedRoute(caminho)) return href;

  if (language === DEFAULT_ROUTE_LANGUAGE) {
    return href;
  }

  return `/${language}${caminho === '/' ? '' : caminho}${cauda}`;
}

/** O idioma que a URL atual declara. Sem prefixo, é o padrão. */
export function languageOfPathname(pathname: string): RouteLanguage {
  for (const language of SUPPORTED_LANGUAGES) {
    if (language === DEFAULT_ROUTE_LANGUAGE) continue;
    if (pathname === `/${language}` || pathname.startsWith(`/${language}/`)) {
      return language;
    }
  }

  return DEFAULT_ROUTE_LANGUAGE;
}
