import { NextRequest, NextResponse } from 'next/server';
import { apiUrl } from '@/app/libs/api/client';

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
    return response;
  }

  for (const name of LEGACY_SESSION_COOKIES) {
    response.cookies.delete(name);
  }

  return response;
}
