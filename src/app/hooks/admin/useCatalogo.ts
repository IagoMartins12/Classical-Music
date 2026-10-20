'use client';

import {
  apagarCompositor,
  apagarObra,
  apagarPartitura,
  atualizarCompositor,
  atualizarObra,
  atualizarPartitura,
  getCompositores,
  getDetalheCompositor,
  getDetalheObra,
  getEpocas,
  getListasDeCadastro,
  getResumoCompositores,
  getResumoObras,
  getResumoPartituras,
  getEnvios,
  getEstatisticasEnvios,
  getObras,
  getPartituras,
  verificarCompositores,
  verificarObras,
  type Compositor,
  type EdicaoObra,
  type Envio,
  type FiltrosCompositores,
  type FiltrosEnvios,
  type FiltrosObras,
  type FiltrosPartituras,
  type Obra,
  type Partitura,
} from '@/app/requests/admin/catalogo';
import {
  adminKeys,
  useAdminInfinite,
  useAdminMutation,
  useAdminQuery,
} from './query';

/**
 * Catálogo no painel redesenhado. As listas paginam por página (a API do
 * catálogo não tem cursor); o número da página faz as vezes de cursor para a
 * lista acumular ao "carregar mais".
 *
 * Toda escrita invalida a lista, as métricas de uso (verificação muda a
 * cobertura) e a auditoria — a ação aparece na trilha na hora.
 */
const TOCA = ['catalogo', 'uso', 'auditoria', 'insights'];

function usePaginado<T>(
  chave: unknown,
  busca: (
    pagina: number
  ) => Promise<{ itens: T[]; total: number; paginas: number }>
) {
  return useAdminInfinite<T>(
    adminKeys.list('catalogo', chave),
    async (cursor) => {
      const pagina = Number(cursor ?? 1);
      const r = await busca(pagina);
      return {
        items: r.itens,
        total: r.total,
        nextCursor: pagina < r.paginas ? String(pagina + 1) : null,
      };
    }
  );
}

export const useObras = (f: FiltrosObras) =>
  usePaginado<Obra>({ obras: f }, async (p) => {
    const r = await getObras(f, p);
    return {
      itens: r.works,
      total: r.pagination.total,
      paginas: r.pagination.totalPages,
    };
  });

export const useCompositores = (f: FiltrosCompositores) =>
  usePaginado<Compositor>({ compositores: f }, async (p) => {
    const r = await getCompositores(f, p);
    return {
      itens: r.composers,
      total: r.pagination.total,
      paginas: r.pagination.totalPages,
    };
  });

export const usePartituras = (f: FiltrosPartituras) =>
  usePaginado<Partitura>({ partituras: f }, async (p) => {
    const r = await getPartituras(f, p);
    return {
      itens: r.scores,
      total: r.pagination.total,
      paginas: r.pagination.totalPages,
    };
  });

export const useResumoObras = () =>
  useAdminQuery(adminKeys.list('catalogo', 'resumo-obras'), getResumoObras);
export const useResumoCompositores = () =>
  useAdminQuery(
    adminKeys.list('catalogo', 'resumo-compositores'),
    getResumoCompositores
  );
export const useResumoPartituras = () =>
  useAdminQuery(
    adminKeys.list('catalogo', 'resumo-partituras'),
    getResumoPartituras
  );
export const useDetalheObra = (id: string | null) =>
  useAdminQuery(
    adminKeys.list('catalogo', { detalheObra: id }),
    () => getDetalheObra(id as string),
    { enabled: !!id }
  );
export const useDetalheCompositor = (id: string | null) =>
  useAdminQuery(
    adminKeys.list('catalogo', { detalheCompositor: id }),
    () => getDetalheCompositor(id as string),
    { enabled: !!id }
  );
export const useListasDeCadastro = () =>
  useAdminQuery(adminKeys.list('apoio', 'cadastro'), getListasDeCadastro, {
    staleTime: 60 * 60_000,
  });
export const useApagarPartitura = () =>
  useAdminMutation((id: string) => apagarPartitura(id), TOCA);

export const useEpocas = () =>
  useAdminQuery(adminKeys.list('apoio', 'epocas'), getEpocas, {
    staleTime: 60 * 60_000,
  });

export const useAtualizarObra = () =>
  useAdminMutation(
    (id: string, dados: EdicaoObra) => atualizarObra(id, dados),
    TOCA
  );
export const useApagarObra = () =>
  useAdminMutation((id: string) => apagarObra(id), TOCA);
export const useVerificarObras = () =>
  useAdminMutation((ids: string[], v: boolean) => verificarObras(ids, v), TOCA);

export const useAtualizarCompositor = () =>
  useAdminMutation(
    (id: string, dados: Parameters<typeof atualizarCompositor>[1]) =>
      atualizarCompositor(id, dados),
    TOCA
  );
export const useApagarCompositor = () =>
  useAdminMutation((id: string) => apagarCompositor(id), TOCA);
export const useVerificarCompositores = () =>
  useAdminMutation(
    (ids: string[], v: boolean, nota?: string) =>
      verificarCompositores(ids, v, nota),
    TOCA
  );

export const useAtualizarPartitura = () =>
  useAdminMutation(
    (id: string, dados: { title?: string; isActive?: boolean }) =>
      atualizarPartitura(id, dados),
    TOCA
  );

export const useEnvios = (f: FiltrosEnvios) =>
  useAdminInfinite<Envio>(
    adminKeys.list('catalogo', { envios: f }),
    async (cursor) => {
      const r = await getEnvios(f, cursor);
      return {
        items: r.entries,
        total: r.pagination.total,
        nextCursor: r.pagination.nextCursor,
      };
    }
  );

export const useEstatisticasEnvios = (janela: {
  de: string | null;
  ate: string | null;
}) =>
  useAdminQuery(adminKeys.list('catalogo', { enviosStats: janela }), () =>
    getEstatisticasEnvios(janela)
  );
