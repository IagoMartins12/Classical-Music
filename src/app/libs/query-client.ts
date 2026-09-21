import { QueryClient, isServer } from '@tanstack/react-query';
import { ApiError } from './api/client';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        // Erro do cliente (4xx) não melhora tentando de novo.
        retry: (failures, error) =>
          !(error instanceof ApiError && error.status < 500) && failures < 2,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

/**
 * Um cliente por aba no navegador — as funções de sessão (`signOut`, login)
 * precisam do mesmo cache que os hooks — e um por requisição no servidor.
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }

  browserClient ??= makeQueryClient();
  return browserClient;
}
