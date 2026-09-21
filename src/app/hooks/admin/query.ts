// app/hooks/admin/query.ts — estado de servidor do painel (Etapa 5)
//
// Os hooks do painel guardavam a resposta em `useState` e controlavam "já
// estou buscando" com `useRef`. Aqui quem guarda é o TanStack Query, que já
// está de pé no front (a sessão usa o mesmo cliente): ele deduplica chamadas
// iguais, guarda por chave, revalida quando a aba volta ao foco e invalida
// depois das escritas. A interface de cada hook não muda — as telas seguem
// lendo `loading`, `error` e as listas como antes.
'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

/** Chaves por área do painel: invalidar uma área não mexe nas outras. */
export const adminKeys = {
  all: ['admin'] as const,
  area: (area: string) => ['admin', area] as const,
  list: (area: string, params?: unknown) =>
    ['admin', area, params ?? {}] as const,
};

/** O dado do painel muda a toda hora: meio minuto de frescor é o bastante. */
const DEFAULT_STALE_TIME = 30_000;

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Erro desconhecido';

export interface AdminQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
}

export interface AdminQueryResult<T> {
  data: T | undefined;
  loading: boolean;
  /** Buscando de novo com dado velho na tela (paginação, foco, intervalo). */
  fetching: boolean;
  error: string | null;
  /** Quando o dado que está na tela chegou do servidor. */
  updatedAt: Date | null;
  refetch: () => Promise<void>;
}

export function useAdminQuery<T>(
  key: QueryKey,
  queryFn: () => Promise<T>,
  options: AdminQueryOptions = {}
): AdminQueryResult<T> {
  const query = useQuery({
    queryKey: key,
    queryFn,
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? DEFAULT_STALE_TIME,
    refetchInterval: options.refetchInterval ?? false,
    retry: false,
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return useMemo(
    () => ({
      data: query.data,
      loading: query.isPending && query.fetchStatus !== 'idle',
      fetching: query.isFetching,
      error: query.error ? errorMessage(query.error) : null,
      updatedAt: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
      refetch,
    }),
    [
      query.data,
      query.isPending,
      query.fetchStatus,
      query.isFetching,
      query.error,
      refetch,
    ]
  );
}

/** Uma fatia das listas grandes, como a API devolve. */
export interface AdminPage<T> {
  items: T[];
  /** Só vem na primeira fatia: com cursor a API não conta a base de novo. */
  total: number | null;
  /** Id do último item; `null` quando acabou. */
  nextCursor: string | null;
}

export interface AdminInfiniteResult<T> {
  items: T[];
  total: number | null;
  loading: boolean;
  fetching: boolean;
  /** Buscando a fatia seguinte (a lista já está na tela). */
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refetch: () => Promise<void>;
}

/**
 * Listas grandes do painel, por cursor.
 *
 * Com `page`, o banco relê e descarta tudo o que veio antes, e um cadastro
 * novo entre duas buscas empurra um registro para a página seguinte — quem
 * rola vê a mesma linha duas vezes, ou não vê nenhuma. O cursor é o id do
 * último item que a tela recebeu: a API continua exatamente dali.
 *
 * O acúmulo das fatias é do próprio TanStack Query, não de um `useState` ao
 * lado: trocar o filtro troca a chave, e a lista recomeça sozinha, sem o
 * `useEffect` que antes limpava o acumulado na mão.
 */
export function useAdminInfinite<T>(
  key: QueryKey,
  queryFn: (cursor?: string) => Promise<AdminPage<T>>,
  options: AdminQueryOptions = {}
): AdminInfiniteResult<T> {
  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => queryFn(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: AdminPage<T>) => last.nextCursor ?? undefined,
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? DEFAULT_STALE_TIME,
    refetchInterval: options.refetchInterval ?? false,
    retry: false,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  }, [query]);

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return useMemo(
    () => ({
      items,
      // O total vem da primeira fatia, a única que a API conta.
      total: query.data?.pages[0]?.total ?? null,
      loading: query.isPending && query.fetchStatus !== 'idle',
      fetching: query.isFetching,
      loadingMore: query.isFetchingNextPage,
      hasMore: query.hasNextPage,
      error: query.error ? errorMessage(query.error) : null,
      loadMore,
      refetch,
    }),
    [
      items,
      query.data,
      query.isPending,
      query.fetchStatus,
      query.isFetching,
      query.isFetchingNextPage,
      query.hasNextPage,
      query.error,
      loadMore,
      refetch,
    ]
  );
}

/**
 * Escrita do painel. `invalidate` são as áreas que a escrita torna velhas —
 * a lista volta do servidor em vez de ser remendada na mão.
 */
export function useAdminMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
  invalidate: string[] = []
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (args: TArgs) => mutationFn(...args),
    onSuccess: async () => {
      await Promise.all(
        invalidate.map((area) =>
          client.invalidateQueries({ queryKey: adminKeys.area(area) })
        )
      );
    },
  });
}

/**
 * Busca imperativa que passa pelo cache: para telas que chamam "carregar" e
 * usam o valor retornado. O que vier abastece a mesma chave que o `useQuery`
 * da tela lê, então as duas mostram a mesma coisa.
 */
export function useAdminFetch() {
  const client = useQueryClient();

  return useCallback(
    <T>(
      key: QueryKey,
      queryFn: () => Promise<T>,
      staleTime = DEFAULT_STALE_TIME
    ) => client.fetchQuery({ queryKey: key, queryFn, staleTime }),
    [client]
  );
}

/** Invalida uma área do painel sem passar por uma escrita. */
export function useInvalidateAdmin() {
  const client = useQueryClient();

  return useCallback(
    (area: string) =>
      client.invalidateQueries({ queryKey: adminKeys.area(area) }),
    [client]
  );
}
