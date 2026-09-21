/**
 * Sessão da API no servidor do Next (páginas e server actions).
 *
 * O servidor não tem os cookies do navegador para mandar à API por conta
 * própria: lê o token de acesso do cookie da requisição e o repassa como
 * `Bearer` (`apiFetch(path, { token })`). Com `Bearer`, a API não exige
 * `Origin` (o `OriginGuard` só vale para mutação por cookie).
 *
 * Token vencido numa navegação de página já foi renovado pelo `middleware.ts`
 * antes de a página rodar; sem token, a página trata como visitante.
 */
import { cookies } from 'next/headers';
import { ApiError, apiFetch } from './client';
import { ACCESS_TOKEN_COOKIE } from '@/app/utils/authCookies';
import type { ProfileAccount } from './profile';

export { ACCESS_TOKEN_COOKIE };

export async function getServerAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

/**
 * A sessão no servidor, pela API — o substituto de `getServerSession` do
 * NextAuth.
 *
 * **Por que existe.** As páginas por pessoa liam a sessão com
 * `getServerSession(authOptions)`, e o `authOptions` traz o `PrismaAdapter`:
 * uma consulta ao MongoDB feita pelo processo do Next a cada render. Com o
 * front escalando em réplicas, era um pool de conexões por réplica para
 * descobrir quem está logado — coisa que a API já responde.
 *
 * Devolve `null` quando não há token ou ele não vale mais, que é o que as
 * páginas já tratavam (`if (!session?.user)` → redireciona).
 *
 * O formato imita o do NextAuth de propósito (`{ user: { id, ... } }`), para a
 * troca nas páginas não passar de uma linha.
 */
export async function getServerSession(): Promise<ServerSession | null> {
  const token = await getServerAccessToken();

  if (!token) {
    return null;
  }

  try {
    const { account } = await apiFetch<{ account: ProfileAccount }>(
      '/profile',
      { query: { include: 'account' }, token, cache: 'no-store' }
    );

    return { user: account };
  } catch (error) {
    // 401 é sessão vencida, não erro: a página redireciona para o login.
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export interface ServerSession {
  user: ProfileAccount;
}
