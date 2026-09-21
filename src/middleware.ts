import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_ROUTE_LANGUAGE as DEFAULT_LANGUAGE,
  FILTERED_SEGMENT,
  LANGUAGE_COOKIE,
  SPLIT_ROUTES,
  SUPPORTED_LANGUAGES,
  isLocalizedRoute,
  type RouteLanguage as Language,
} from '@/app/utils/localizedRoutes';

/**
 * Middleware do front — escolhe o idioma da página e renova a sessão da API.
 *
 * **É este o arquivo que o Next executa:** `src/middleware.ts`, ao lado de
 * `app/`. O `src/app/middleware.ts` do legado (cookie de idioma e contexto de
 * log) nunca rodou — o Next não procura middleware dentro de `app/` — e fica
 * como está até sair com o legado.
 *
 * Quem tem sessão (o espelho do NextAuth) mas chegou sem token de acesso
 * válido passa pela renovação antes da página: o servidor do Next não recebe o
 * cookie de renovação (`path=/api/auth`), a rota `/api/auth/session-refresh`
 * recebe. Só em navegação de documento — a do roteador do cliente renova pelo
 * próprio cliente, que já renova sozinho a cada 10 minutos.
 */

const ACCESS_TOKEN_COOKIE = 'opus_access_token';

/**
 * O marcador que a API grava no login (`SESSION_HINT_COOKIE`): diz que existe
 * refresh token a tentar, e vive o mesmo que ele.
 *
 * **Por que não basta o token de acesso.** Ele vive 15 minutos e o navegador o
 * descarta ao vencer; o de refresh tem `path=/api/auth` e nunca chega aqui.
 * Sem este marcador, o middleware não distingue visitante de sessão vencida e
 * deixa de renovar — a pessoa abriria a página como deslogada. Antes quem dava
 * esse sinal era o cookie do NextAuth, que saiu na Etapa 7.
 */
const SESSION_HINT_COOKIE = 'opus_session';

/** Sessões abertas antes da Etapa 7 ainda carregam o cookie do NextAuth. */
const LEGACY_SESSION_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

/**
 * Token de acesso válido por pelo menos mais 30 s? Só lê a validade: quem
 * confere a assinatura é a API, em toda chamada.
 */
function isFreshAccessToken(token: string | undefined): boolean {
  if (!token) return false;

  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return (
      typeof payload.exp === 'number' &&
      payload.exp * 1000 > Date.now() + 30_000
    );
  } catch {
    return false;
  }
}

/**
 * Pedido de documento, não do roteador do cliente. As marcas do roteador
 * (cabeçalho `RSC`, `?_rsc`, prefetch) não servem: o Next as tira do pedido
 * antes do middleware. Sobra o que o navegador manda: documento pede
 * `text/html` e, quando informa o destino, é `document`; o `fetch` do
 * roteador pede `*\/*` com destino `empty`.
 */
function isDocumentNavigation(request: NextRequest): boolean {
  const destination = request.headers.get('sec-fetch-dest');

  return (
    request.method === 'GET' &&
    Boolean(request.headers.get('accept')?.includes('text/html')) &&
    (destination === null || destination === 'document')
  );
}

/** `/composers/filtered` → `/composers`. */
function semFiltered(pathname: string): string {
  return pathname.endsWith(FILTERED_SEGMENT)
    ? pathname.slice(0, -FILTERED_SEGMENT.length) || '/'
    : pathname;
}

/**
 * A preferência de idioma de quem está pedindo.
 *
 * `explicita` distingue "esta pessoa escolheu inglês no site" de "o navegador
 * dela está em inglês". A diferença decide redirecionamento: a escolha da
 * pessoa vale sobre a URL; o palpite do navegador, não.
 */
interface PreferenciaIdioma {
  language: Language;
  explicita: boolean;
}

function preferredLanguage(request: NextRequest): PreferenciaIdioma {
  const cookie = request.cookies.get(LANGUAGE_COOKIE)?.value;

  if (cookie) {
    try {
      const stored = JSON.parse(decodeURIComponent(cookie)) as {
        state?: { language?: string; hasUserPreference?: boolean };
      };
      const language = stored.state?.language;

      if (language === 'pt' || language === 'en') {
        return {
          language,
          explicita: stored.state?.hasUserPreference === true,
        };
      }
    } catch {
      // Cookie malformado: segue para o cabeçalho.
    }
  }

  const accepted = request.headers
    .get('accept-language')
    ?.split(',')[0]
    .split('-')[0]
    .toLowerCase();

  return {
    language:
      accepted === 'pt' || accepted === 'en' ? accepted : DEFAULT_LANGUAGE,
    explicita: false,
  };
}

/** `/en/composers` → `/composers`; `/composers` → `/composers`. */
function semPrefixo(pathname: string): {
  limpo: string;
  prefixo: Language | null;
} {
  for (const language of SUPPORTED_LANGUAGES) {
    if (pathname === `/${language}`) return { limpo: '/', prefixo: language };
    if (pathname.startsWith(`/${language}/`)) {
      return { limpo: pathname.slice(language.length + 1), prefixo: language };
    }
  }

  return { limpo: pathname, prefixo: null };
}

/** A rota interna que atende um caminho público, com o `/filtered` quando cabe. */
function rotaInterna(
  language: Language,
  limpo: string,
  search: string
): string {
  const comFiltro = search.length > 0 && SPLIT_ROUTES.includes(limpo);

  return (
    `/${language}` +
    (limpo === '/' ? '' : limpo) +
    (comFiltro ? FILTERED_SEGMENT : '')
  );
}

function redirecionar(
  request: NextRequest,
  destino: string,
  status: 307 | 308
): NextResponse {
  const response = NextResponse.redirect(new URL(destino, request.url), status);

  // O 307 depende do cookie de quem pediu: um cache compartilhado que o
  // guardasse mandaria todo mundo para o mesmo idioma.
  if (status === 307) {
    response.headers.set('Cache-Control', 'private, no-store');
  }

  return response;
}

/**
 * Onde cada idioma mora — e por que não é um endereço só.
 *
 * **Duas URLs públicas por página:** `/composers` é o português e
 * `/en/composers` é o inglês. Enquanto o idioma era decidido só por cookie na
 * mesma URL, o robô do Google — que chega sem cookie — recebia português e
 * **o inglês não existia para busca nenhuma**. Agora cada idioma tem endereço
 * próprio, declarado por `hreflang`, no mesmo domínio: é uma pasta, não um
 * segundo site, e um terceiro idioma seria mais uma pasta.
 *
 * `/pt/...` nunca é público: redireciona para o caminho limpo, senão a mesma
 * página em português teria dois endereços.
 *
 * **A troca de idioma não mexe na URL.** Quem está em `/composers` e vira para
 * inglês continua em `/composers`, com o conteúdo em inglês (a página é
 * reescrita por baixo). A URL só acerta o prefixo na próxima visita direta ou
 * recarga — que é quando o redirecionamento abaixo acontece. Foi pedido assim,
 * e tem uma vantagem: trocar de idioma não recarrega nada.
 */
function localize(
  request: NextRequest,
  documento: boolean
): NextResponse | null {
  const { pathname, search } = request.nextUrl;
  const { limpo, prefixo } = semPrefixo(pathname);

  // O sufixo `/filtered` é detalhe interno: quem chega por ele vai para o
  // endereço público, que é o único indexável.
  if (limpo.endsWith(FILTERED_SEGMENT)) {
    const destino = (prefixo === 'en' ? '/en' : '') + semFiltered(limpo);
    return redirecionar(request, `${destino}${search}`, 308);
  }

  if (!isLocalizedRoute(limpo)) {
    // `/en/profile` não existe: a área por pessoa não é traduzida por rota.
    return prefixo ? redirecionar(request, `${limpo}${search}`, 308) : null;
  }

  // O português é o caminho limpo. `/pt/...` é sempre duplicata.
  if (prefixo === 'pt') {
    return redirecionar(request, `${limpo}${search}`, 308);
  }

  const { language, explicita } = preferredLanguage(request);

  if (prefixo === 'en') {
    // Quem escolheu português no site e abre um endereço em inglês vai para o
    // português — mas só numa visita de documento. No pedido do roteador (a
    // recarga suave que a troca de idioma dispara), a página é reescrita sem
    // mexer na URL.
    if (explicita && language === 'pt') {
      return documento
        ? redirecionar(request, `${limpo}${search}`, 307)
        : reescrever(request, rotaInterna('pt', limpo, search));
    }

    const interna = rotaInterna('en', limpo, search);

    return interna === pathname ? null : reescrever(request, interna, false);
  }

  // Caminho limpo: numa visita de documento, quem prefere inglês vai para o
  // endereço em inglês. O robô, que não manda cookie nem `Accept-Language`,
  // nunca é redirecionado: ele indexa o português aqui e o inglês em `/en`.
  if (documento && language === 'en') {
    return redirecionar(
      request,
      `/en${limpo === '/' ? '' : limpo}${search}`,
      307
    );
  }

  return reescrever(request, rotaInterna(language, limpo, search));
}

function reescrever(
  request: NextRequest,
  destino: string,
  varia = true
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = destino;

  const response = NextResponse.rewrite(url);

  /**
   * A mesma URL devolve português ou inglês conforme o cookie e o cabeçalho —
   * e o Next marca as páginas do ISR com `s-maxage`. Sem `Vary`, um cache
   * compartilhado (CDN, proxy) guardaria a primeira variante que passasse e a
   * serviria para todo mundo: quem prefere inglês receberia português.
   *
   * Com `Vary`, o cache do Next continua valendo (a chave dele é o caminho
   * reescrito, que já tem o idioma) e o cache compartilhado passa a distinguir
   * as duas variantes — ou, se não souber, a não guardar. Perder cache de CDN
   * é aceitável; servir o idioma errado não é.
   *
   * `/en/...` servido como ele mesmo não varia por nada: o idioma está na URL.
   */
  if (varia) {
    response.headers.set('Vary', 'Accept-Language, Cookie');
  }

  return response;
}

export function middleware(request: NextRequest) {
  // A reescrita de idioma vale também para os pedidos do roteador do cliente
  // (RSC): sem ela, um `<Link href="/composers">` buscaria uma rota que não
  // existe mais fora de `[lang]`.
  if (!isDocumentNavigation(request)) {
    return localize(request, false) ?? NextResponse.next();
  }

  // Painel: aqui só se confere que **existe** sessão; quem vale é a API, na
  // primeira chamada da página (403 leva a "acesso negado"). Checar papel aqui
  // exigiria ler o token no edge, e ele muda antes do cookie.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const signedIn =
      request.cookies.has(ACCESS_TOKEN_COOKIE) ||
      request.cookies.has(SESSION_HINT_COOKIE) ||
      LEGACY_SESSION_COOKIES.some((name) => request.cookies.has(name));

    if (!signedIn) {
      const login = new URL('/login', request.url);
      login.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(login);
    }
  }

  const hasSession =
    request.cookies.has(SESSION_HINT_COOKIE) ||
    LEGACY_SESSION_COOKIES.some((name) => request.cookies.has(name));

  if (
    !hasSession ||
    isFreshAccessToken(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value)
  ) {
    return localize(request, true) ?? NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  const url = new URL('/api/auth/session-refresh', request.url);
  url.searchParams.set('next', `${pathname}${search}`);

  return NextResponse.redirect(url);
}

export const config = {
  // Só páginas: fora API, estáticos, imagens e arquivos com extensão.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
