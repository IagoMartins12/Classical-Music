'use client';

import {
  apagarLancamento,
  apagarMeta,
  corrigirLancamento,
  criarLancamento,
  criarMeta,
  getLancamentos,
  getMetas,
  getMrr,
  getResumo,
  pausarLancamento,
  sincronizarTaxas,
  type Direcao,
} from '@/app/requests/admin/financeiro';
import { adminKeys, useAdminMutation, useAdminQuery } from './query';

/** O mês escolhido: custos, receita, resultado, equilíbrio e projeção. */
export const useResumoFinanceiro = (month: string) =>
  useAdminQuery(adminKeys.list('financeiro', { resumo: month }), () =>
    getResumo(month)
  );

export const useLancamentos = (direction: Direcao) =>
  useAdminQuery(adminKeys.list('financeiro', { lancamentos: direction }), () =>
    getLancamentos(direction)
  );

/** O MRR mês a mês, do retrato diário. */
export const useMrr = () =>
  useAdminQuery(adminKeys.list('financeiro', { mrr: 12 }), () => getMrr(12));

export const useMetas = () =>
  useAdminQuery(adminKeys.list('financeiro', { metas: true }), getMetas);

/** Toda escrita muda o resumo, as listas e a trilha de auditoria. */
const AFETA = ['financeiro', 'auditoria'];

export const useCriarLancamento = () =>
  useAdminMutation(criarLancamento, AFETA);
export const useCorrigirLancamento = () =>
  useAdminMutation(corrigirLancamento, AFETA);
export const useApagarLancamento = () =>
  useAdminMutation(apagarLancamento, AFETA);
export const usePausarLancamento = () =>
  useAdminMutation(pausarLancamento, AFETA);
export const useCriarMeta = () => useAdminMutation(criarMeta, AFETA);
export const useApagarMeta = () => useAdminMutation(apagarMeta, AFETA);

/** A leitura das taxas muda o líquido do resumo. */
export const useSincronizarTaxas = () =>
  useAdminMutation(sincronizarTaxas, ['financeiro']);
