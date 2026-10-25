'use client';

import {
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ReactNode, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useLanguageStore } from '@/app/stores/useLanguageStore';
import { authApi, RegisterInput } from '../api/auth';
import {
  ApiError,
  connectionError,
  refreshSession,
  SESSION_EXPIRED_EVENT,
} from '../api/client';
import { ProfileAccount, profileApi } from '../api/profile';
import { getQueryClient } from '../query-client';
import { lembrarConta, limparCachesPessoais } from '../pwa/limpar';
import { esquecerConta, garantirDono } from './dadosDaConta';
import { SESSION_HINT_COOKIE } from '@/app/utils/authCookies';

/**
 * Sessão do front, vinda da API (Etapa 2).
 *
 * **Quem autentica é a API**; a sessão é `GET /profile?include=account`, lida
 * pelo TanStack Query. `useSession` devolve o mesmo formato do NextAuth
 * (`data`, `status`, `update`), para as telas não mudarem.
 *
 * **O espelho no NextAuth saiu** (Etapa 7). Ele existia porque as rotas
 * `src/app/api/**` e as páginas liam `getServerSession`; nenhuma das duas
 * coisas existe mais, então manter um segundo cookie de sessão em dia só
 * acrescentaria uma chamada a cada login e um jeito de as duas divergirem.
 */

/** O formato de sessão que as telas consomem — o mesmo que o NextAuth tinha. */
export interface Session {
  user: Omit<ProfileAccount, 'name'> & { name: string | null };
  /** Só para compatibilidade com quem lia `session.expires`. */
  expires: string;
}

export const SESSION_QUERY_KEY = ['session'] as const;

/** A cada 10 minutos, com a aba visível, o token de acesso (15 min) é renovado. */
const REFRESH_EVERY_MS = 10 * 60 * 1000;

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthResult =
  | { ok: true }
  | { ok: false; status: number; message: string; key: string };

/**
 * Há sessão para perguntar? O marcador (`<prefixo>_session`) é gravado pela
 * API junto com o refresh token e apagado no logout; não é `httpOnly`
 * justamente para o front poder ler.
 *
 * Sem ele, todo visitante anônimo fazia `GET /profile` (401) e, em seguida, a
 * tentativa de renovar (`/auth/refresh`, 401 de novo): duas chamadas inúteis
 * por visita e dois erros no console, que o Lighthouse cobra em "boas
 * práticas".
 */
function temMarcadorDeSessao(): boolean {
  if (typeof document === 'undefined') return true;
  return document.cookie
    .split(';')
    .some((par) => par.trim().startsWith(`${SESSION_HINT_COOKIE}=`));
}

async function fetchAccount(): Promise<ProfileAccount | null> {
  if (!temMarcadorDeSessao()) return null;

  try {
    const { account } = await profileApi.me();
    return account;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

function toSession(account: ProfileAccount): Session {
  return {
    // `emailVerified` era convertido para `Date` porque o tipo do NextAuth o
    // exigia. Sem ele, fica como a API manda: uma data em texto.
    user: { ...account, name: account.name || null },
    expires: new Date(Date.now() + REFRESH_EVERY_MS).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Mesmo formato do `useSession` do NextAuth. `update()` relê a sessão da API —
 * o argumento que o NextAuth aceitava é ignorado: a fonte é a API.
 */
export function useSession(): {
  data: Session | null;
  status: SessionStatus;
  update: (_ignored?: unknown) => Promise<Session | null>;
} {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchAccount,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });

  const data = useMemo(
    () => (query.data ? toSession(query.data) : null),
    [query.data]
  );

  const update = useCallback(async () => {
    const account = await queryClient.fetchQuery({
      queryKey: SESSION_QUERY_KEY,
      queryFn: fetchAccount,
      staleTime: 0,
    });
    return account ? toSession(account) : null;
  }, [queryClient]);

  const status: SessionStatus = query.isPending
    ? 'loading'
    : data
      ? 'authenticated'
      : 'unauthenticated';

  return { data, status, update };
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------

function failure(error: unknown): AuthResult {
  return error instanceof ApiError
    ? {
        ok: false,
        status: error.status,
        message: error.message,
        key: error.key,
      }
    : { ok: false, status: 0, message: connectionError(), key: '' };
}

/** Relê a sessão da API. */
export async function refreshSessionData(): Promise<Session | null> {
  const account = await getQueryClient().fetchQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchAccount,
    staleTime: 0,
  });

  return account ? toSession(account) : null;
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    await authApi.login(email.trim(), password);
  } catch (error) {
    return failure(error);
  }

  await refreshSessionData();
  return { ok: true };
}

export async function registerWithPassword(
  input: RegisterInput
): Promise<AuthResult> {
  try {
    await authApi.register({
      language: useLanguageStore.getState().language,
      ...input,
      email: input.email.trim(),
    });
  } catch (error) {
    return failure(error);
  }

  await refreshSessionData();
  return { ok: true };
}

/**
 * Leva ao login com o Google. É navegação: o navegador sai do site e volta em
 * `redirectPath` (caminho do próprio front), já com a sessão gravada.
 */
export function signInWithGoogle(redirectPath?: string): void {
  const back =
    redirectPath ?? `${window.location.pathname}${window.location.search}`;

  window.location.assign(authApi.googleSignInUrl(back));
}

/** Mesmo formato do `signOut` do NextAuth. */
export async function signOut(
  options: { redirect?: boolean; callbackUrl?: string } = {}
): Promise<void> {
  await authApi.logout().catch(() => undefined);
  // What the app kept offline for this account goes with the session.
  await lembrarConta(null);
  await limparCachesPessoais();
  // Studies, favorites and annotations kept in the browser go too.
  esquecerConta();

  const client = getQueryClient();
  client.clear();
  client.setQueryData(SESSION_QUERY_KEY, null);

  if (options.redirect) {
    window.location.assign(options.callbackUrl ?? '/');
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const AUTH_ERROR_MESSAGES: Record<string, { pt: string; en: string }> = {
  google_cancelled: {
    pt: 'Login com o Google cancelado.',
    en: 'Google sign-in was cancelled.',
  },
  google_unverified: {
    pt: 'O Google não confirmou este e-mail. Use outra conta ou entre com e-mail e senha.',
    en: 'Google did not verify this email. Use another account or sign in with email and password.',
  },
  google_unavailable: {
    pt: 'O login com o Google está indisponível no momento.',
    en: 'Google sign-in is unavailable right now.',
  },
  google_state: {
    pt: 'O login com o Google expirou. Tente de novo.',
    en: 'Google sign-in expired. Please try again.',
  },
  google_failed: {
    pt: 'Erro ao entrar com o Google. Tente de novo.',
    en: 'Error signing in with Google. Please try again.',
  },
};

export function ApiSessionProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <SessionEffects />
      {children}
    </QueryClientProvider>
  );
}

function SessionEffects() {
  const queryClient = useQueryClient();
  const language = useLanguageStore((state) => state.language);
  const chosen = useLanguageStore((state) => state.hasUserPreference);
  const { data: account } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchAccount,
    staleTime: 5 * 60_000,
  });

  // Enquanto a aba está aberta, o cookie de acesso não chega a vencer — é o
  // que deixa o servidor do Next ler a sessão sem desvio.
  useEffect(() => {
    if (!account) {
      return;
    }

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshSession();
      }
    }, REFRESH_EVERY_MS);

    return () => window.clearInterval(timer);
  }, [account]);

  // The language of the site goes to the account, so emails follow it. A
  // choice (a switch while signed in, or one made before signing in) always
  // goes; an account with no language yet gets the one the site is showing,
  // which is the browser's when nobody chose — Google sign-ups and older
  // accounts would otherwise get every email in Portuguese.
  useEffect(() => {
    if (!account || account.language === language) return;
    if (!chosen && account.language) return;
    profileApi
      .setLanguage(language)
      .then(() =>
        queryClient.setQueryData<ProfileAccount | null>(
          SESSION_QUERY_KEY,
          (current) => (current ? { ...current, language } : current)
        )
      )
      .catch(() => undefined);
  }, [account, chosen, language, queryClient]);

  // Another account on this device: its offline copies are not this one's.
  useEffect(() => {
    if (account) void lembrarConta(account.id);
  }, [account]);

  // The session answered (an account, or none): data the browser kept for
  // anyone else is erased before it shows (`dadosDaConta`). While it is
  // still loading (`undefined`), nothing kept is shown.
  useEffect(() => {
    if (account === undefined) return;
    if (garantirDono(account?.id ?? null))
      // Another account's answers too (lists, profile), all but the session.
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== SESSION_QUERY_KEY[0],
      });
  }, [account, queryClient]);

  // A renovação falhou numa chamada qualquer: a sessão acabou.
  useEffect(() => {
    const onExpired = () => queryClient.setQueryData(SESSION_QUERY_KEY, null);

    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [queryClient]);

  // O login com Google volta com `?authError=` quando não deu certo.
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('authError');

    if (!code) {
      return;
    }

    const message =
      AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.google_failed;
    toast.error(message[language === 'en' ? 'en' : 'pt']);

    url.searchParams.delete('authError');
    window.history.replaceState({}, '', url.toString());
  }, [language]);

  return null;
}
