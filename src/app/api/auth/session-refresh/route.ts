import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '@/app/libs/api/client';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_FAILED_COOKIE,
  REFRESH_FAILED_MAX_AGE,
  SESSION_HINT_COOKIE,
  cookieDomains,
} from '@/app/utils/authCookies';

const LEGACY_SESSION_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

/** Só caminho do próprio front — `next` vem da URL. */
function safePath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }
  return value;
}

/**
 * Renova a sessão da API numa navegação de página (Etapa 2).
 *
 * **Mora sob `/api/auth/` de propósito:** o cookie de renovação da API tem
 * `path=/api/auth`, então este é o único caminho do front para onde o
 * navegador o manda. O `middleware.ts` desvia para cá quem tem sessão mas
 * chegou sem token de acesso válido; daqui a renovação vai à API, os cookies
 * novos voltam ao navegador, e ele segue para a página pedida.
 *
 * Sem sessão na API, o espelho no NextAuth sai também — senão o legado
 * mostraria alguém logado que a API não reconhece.
 */
export async function GET(request: NextRequest) {
  const next = safePath(request.nextUrl.searchParams.get('next'));
  const response = NextResponse.redirect(new URL(next, request.nextUrl.origin));

  const upstream = await fetch(apiUrl('/auth/refresh'), {
    method: 'POST',
    headers: {
      cookie: request.headers.get('cookie') ?? '',
      // Mutação com cookie precisa de origem conhecida (`OriginGuard`).
      origin: request.nextUrl.origin,
    },
    cache: 'no-store',
  }).catch(() => null);

  if (upstream?.ok) {
    for (const cookie of upstream.headers.getSetCookie()) {
      response.headers.append('set-cookie', cookie);
    }

    // A sessão voltou: o marcador de falha não tem mais razão de existir.
    response.cookies.delete(REFRESH_FAILED_COOKIE);
    return response;
  }

  /**
   * A renovação falhou — a sessão acabou de verdade. **Apagar a dica de sessão
   * aqui não é limpeza, é o que impede um laço de redirecionamento.** O
   * middleware desvia para cá quem tem a dica sem token de acesso válido; se
   * ela sobrevivesse à falha, a próxima navegação desviaria de novo, e a
   * seguinte também: `ERR_TOO_MANY_REDIRECTS` com o site inteiro inacessível
   * até o cookie vencer sozinho.
   *
   * Quem a gravou foi a API, com um `domain` que este lado não conhece — daí
   * apagar em cada domínio possível. O refresh token fica: mora no domínio da
   * API (`path=/api/auth`) e não é nosso para apagar; sem a dica, ninguém o
   * tenta mais.
   */
  for (const domain of cookieDomains(request.nextUrl.hostname)) {
    for (const name of [SESSION_HINT_COOKIE, ACCESS_TOKEN_COOKIE]) {
      response.cookies.set(name, '', { path: '/', maxAge: 0, domain });
    }
  }

  for (const name of LEGACY_SESSION_COOKIES) {
    response.cookies.delete(name);
  }

  // Cinto de segurança: se alguma dica resistir (gravada num `domain` fora da
  // lista), o middleware ainda assim não devolve a pessoa para cá.
  response.cookies.set(REFRESH_FAILED_COOKIE, '1', {
    path: '/',
    maxAge: REFRESH_FAILED_MAX_AGE,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
  });

  return response;
}
