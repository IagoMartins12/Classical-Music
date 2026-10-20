/**
 * O financeiro do painel (`/admin/finance`): custos, entradas manuais, metas,
 * o resumo do mês e a projeção. Dinheiro em centavos de real; nada de ponto
 * flutuante entre a tela e a API.
 */
import { apiFetch } from '@/app/libs/api/client';
import { downloadFromApi } from './common';

export type Direcao = 'COST' | 'INCOME';
export type Forma = 'ONCE' | 'INSTALLMENTS' | 'RECURRING';
export type Moeda = 'BRL' | 'USD' | 'EUR';
export type MetricaDeMeta = 'MRR' | 'SUBSCRIBERS' | 'TEACHERS';

export const CATEGORIAS_DE_CUSTO = [
  ['infraestrutura', 'Infraestrutura'],
  ['banco', 'Banco de dados'],
  ['ia', 'IA'],
  ['email', 'E-mail'],
  ['armazenamento', 'Armazenamento'],
  ['dominio', 'Domínio'],
  ['software', 'Software'],
  ['marketing', 'Marketing'],
  ['taxas', 'Taxas'],
  ['impostos', 'Impostos'],
  ['outros', 'Outros'],
] as const;

export const CATEGORIAS_DE_ENTRADA = [
  ['patrocinio', 'Patrocínio'],
  ['edital', 'Edital'],
  ['doacao', 'Doação'],
  ['premio', 'Prêmio'],
  ['outros', 'Outros'],
] as const;

export interface Lancamento {
  id: string;
  direction: Direcao;
  name: string;
  counterparty: string | null;
  category: string;
  amountCents: number;
  currency: Moeda;
  fxRate: number;
  kind: Forma;
  startDate: string;
  installments: number | null;
  intervalMonths: number | null;
  endDate: string | null;
  pausedAt: string | null;
  note: string | null;
  receiptUrl: string | null;
  state: 'active' | 'paused' | 'done';
  nextDate: string | null;
  remainingInstallments: number | null;
  monthlyCents: number;
  totalBrlCents: number | null;
}

export interface NovoLancamento {
  direction: Direcao;
  name: string;
  counterparty?: string;
  category: string;
  amountCents: number;
  currency?: Moeda;
  fxRate?: number;
  kind: Forma;
  startDate: string;
  installments?: number;
  intervalMonths?: number;
  endDate?: string;
  note?: string;
}

export interface Meta {
  id: string;
  metric: MetricaDeMeta;
  target: number;
  deadline: string;
  note: string | null;
  current: number;
  progress: number;
  reached: boolean;
  overdue: boolean;
}

export interface ResumoFinanceiro {
  month: string;
  generatedAt: string;
  costs: {
    totalCents: number;
    realizedCents: number;
    plannedCents: number;
    byCategory: { category: string; cents: number }[];
  };
  income: {
    subscriptionCashCents: number;
    manualCents: number;
    grossCents: number;
    netCents: number | null;
  };
  resultCents: number;
  accrual: { mrrCents: number; isCurrentMonth: boolean };
  subscribers: {
    active: number;
    byPlan: Record<string, number>;
    trial: number;
    pastDue: number;
    teachers: number;
  };
  breakEven: {
    mrrNeededCents: number;
    subscribersNeeded: number | null;
    coveredShare: number;
  };
  fixedMonthlyCostCents: number;
  projection: {
    month: string;
    costCents: number;
    manualIncomeCents: number;
    subscriptionCents: number;
    resultCents: number;
  }[];
}

export const getResumo = (month?: string) =>
  apiFetch<ResumoFinanceiro>('/admin/finance/summary', {
    query: { month },
    cache: 'no-store',
  });

export const getLancamentos = (direction: Direcao) =>
  apiFetch<{ items: Lancamento[] }>('/admin/finance/entries', {
    query: { direction },
    cache: 'no-store',
  });

export const criarLancamento = (dados: NovoLancamento) =>
  apiFetch<Lancamento>('/admin/finance/entries', {
    method: 'POST',
    body: dados,
  });

export const corrigirLancamento = (
  id: string,
  dados: Partial<Omit<NovoLancamento, 'direction'>>
) =>
  apiFetch<Lancamento>(`/admin/finance/entries/${id}`, {
    method: 'PATCH',
    body: dados,
  });

export const apagarLancamento = (id: string) =>
  apiFetch<void>(`/admin/finance/entries/${id}`, { method: 'DELETE' });

export const pausarLancamento = (id: string, pausar: boolean) =>
  apiFetch<Lancamento>(
    `/admin/finance/entries/${id}/${pausar ? 'pause' : 'resume'}`,
    { method: 'POST' }
  );

export const getMetas = () =>
  apiFetch<{ items: Meta[] }>('/admin/finance/goals', { cache: 'no-store' });

export const criarMeta = (dados: {
  metric: MetricaDeMeta;
  target: number;
  deadline: string;
  note?: string;
}) => apiFetch<Meta>('/admin/finance/goals', { method: 'POST', body: dados });

export const apagarMeta = (id: string) =>
  apiFetch<void>(`/admin/finance/goals/${id}`, { method: 'DELETE' });

export const exportarFinanceiro = (from: string, to: string) =>
  downloadFromApi(
    '/admin/finance/export',
    { from, to },
    `financeiro-${from}-a-${to}.csv`
  );
