// app/libs/type-utils.ts - Utilitários corrigidos para nova lógica de contagem

/**
 * Soma valores de um objeto de contadores de forma type-safe
 */
export function sumObjectValues(obj: Record<string, number>): number {
  return Object.values(obj).reduce(
    (sum: number, count: number) => sum + count,
    0
  );
}

/**
 * Soma loadedCounts de forma type-safe
 */
export function sumLoadedCounts(loadedCounts: Record<string, number>): number {
  return sumObjectValues(loadedCounts);
}

/**
 * Soma totalCounts de forma type-safe
 */
export function sumTotalCounts(totalCounts: Record<string, number>): number {
  return sumObjectValues(totalCounts);
}

/**
 * Verifica se há mais partituras para carregar (apenas IMSLP)
 */
export function hasMoreScores(
  loadedCounts: Record<string, number>,
  totalCounts: Record<string, number>
): boolean {
  const loaded = sumLoadedCounts(loadedCounts);
  const total = sumTotalCounts(totalCounts);
  return loaded < total;
}

/**
 * Verifica se uma tab específica tem mais partituras IMSLP para carregar
 */
export function hasMoreScoresForTab(
  tabType: string,
  loadedCounts: Record<string, number>,
  totalCounts: Record<string, number>
): boolean {
  const loaded = loadedCounts[tabType] || 0;
  const total = totalCounts[tabType] || 0;
  return loaded < total;
}

/**
 * Calcula porcentagem de progresso
 */
export function calculateProgress(
  loadedCounts: Record<string, number>,
  totalCounts: Record<string, number>
): number {
  const loaded = sumLoadedCounts(loadedCounts);
  const total = sumTotalCounts(totalCounts);

  if (total === 0) return 100;
  return Math.round((loaded / total) * 100);
}

/**
 * Calcula progresso de uma tab específica
 */
export function calculateTabProgress(
  tabType: string,
  loadedCounts: Record<string, number>,
  totalCounts: Record<string, number>
): number {
  const loaded = loadedCounts[tabType] || 0;
  const total = totalCounts[tabType] || 0;

  if (total === 0) return 100;
  return Math.round((loaded / total) * 100);
}

/**
 * Interface para estatísticas de tab corrigida
 */
export interface TabStatistics {
  loaded: number; // Total carregado (IMSLP + WorkScores)
  total: number; // Total disponível (IMSLP total + WorkScores carregados)
  remaining: number; // Quantos ainda podem ser carregados (só IMSLP tem "remaining")
  hasMore: boolean; // Se há mais para carregar (só IMSLP)
  progress?: number; // Progresso opcional
}

/**
 * Interface para contagens separadas
 */
export interface SeparatedCounts {
  imslp: {
    loaded: Record<string, number>;
    total: Record<string, number>;
  };
  workScore: Record<string, number>;
}

/**
 * Obtém estatísticas de uma tab específica - VERSÃO CORRIGIDA
 */
export function getTabStatistics(
  tabType: string,
  loadedCounts: Record<string, number>,
  totalCounts: Record<string, number>,
  workScoreCounts?: Record<string, number>
): TabStatistics {
  // Contagem IMSLP
  const imslpLoaded = loadedCounts[tabType] || 0;
  const imslpTotal = totalCounts[tabType] || 0;

  // Contagem WorkScore (sempre = loaded, não há "total" separado)
  const workScoreCount = workScoreCounts?.[tabType] || 0;

  // Totais combinados
  const totalLoaded = imslpLoaded + workScoreCount;
  const totalAvailable = imslpTotal + workScoreCount;

  // Apenas IMSLP pode ter "remaining"
  const remaining = Math.max(0, imslpTotal - imslpLoaded);
  const hasMore = remaining > 0;

  const progress =
    totalAvailable > 0 ? Math.round((totalLoaded / totalAvailable) * 100) : 100;

  return {
    loaded: totalLoaded,
    total: totalAvailable,
    remaining,
    hasMore,
    progress,
  };
}

/**
 * NOVA: Obtém estatísticas combinadas de IMSLP + WorkScores
 */
export function getCombinedTabStatistics(
  tabType: string,
  imslpCounts: {
    loaded: Record<string, number>;
    total: Record<string, number>;
  },
  workScoreCounts: Record<string, number>
): TabStatistics {
  const imslpLoaded = imslpCounts.loaded[tabType] || 0;
  const imslpTotal = imslpCounts.total[tabType] || 0;
  const workScoreCount = workScoreCounts[tabType] || 0;

  const totalLoaded = imslpLoaded + workScoreCount;
  const totalAvailable = imslpTotal + workScoreCount;
  const remaining = Math.max(0, imslpTotal - imslpLoaded);
  const hasMore = remaining > 0;

  return {
    loaded: totalLoaded,
    total: totalAvailable,
    remaining,
    hasMore,
    progress:
      totalAvailable > 0
        ? Math.round((totalLoaded / totalAvailable) * 100)
        : 100,
  };
}

/**
 * Mapeia tipos de tabs para nomes amigáveis
 */
export const TAB_TYPE_LABELS: Record<string, string> = {
  scores: 'Partituras',
  parts: 'Partes',
  arrangements: 'Arranjos',
  librettos: 'Libretos',
  others: 'Outros',
  sources: 'Arquivos Fonte',
};

/**
 * Obtém o label amigável de um tipo de tab
 */
export function getTabLabel(tabType: string): string {
  return TAB_TYPE_LABELS[tabType] || tabType;
}

/**
 * Verifica se um tipo de tab é válido
 */
export function isValidTabType(tabType: string): boolean {
  return tabType in TAB_TYPE_LABELS;
}

/**
 * Type guard para verificar se um valor é número
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Soma array de números de forma segura
 */
export function safeSumArray(arr: unknown[]): number {
  return arr
    .filter(isNumber)
    .reduce((sum: number, num: number) => sum + num, 0);
}

/**
 * Interface para contadores de partituras
 */
export interface ScoreCounts {
  scores: number;
  parts: number;
  arrangements: number;
  librettos: number;
  others: number;
  sources: number;
}

/**
 * Soma contadores de partituras de forma type-safe
 */
export function sumScoreCounts(counts: ScoreCounts): number {
  return (
    counts.scores +
    counts.parts +
    counts.arrangements +
    counts.librettos +
    counts.others +
    counts.sources
  );
}

/**
 * Verifica se há mais partituras em qualquer categoria
 */
export function hasMoreInAnyCounts(
  loadedCounts: ScoreCounts,
  totalCounts: ScoreCounts
): boolean {
  return sumScoreCounts(loadedCounts) < sumScoreCounts(totalCounts);
}

/**
 * NOVA: Combina contadores IMSLP + WorkScore
 */
export function combineScoreCounts(
  imslpCounts: ScoreCounts,
  workScoreCounts: ScoreCounts
): ScoreCounts {
  return {
    scores: imslpCounts.scores + workScoreCounts.scores,
    parts: imslpCounts.parts + workScoreCounts.parts,
    arrangements: imslpCounts.arrangements + workScoreCounts.arrangements,
    librettos: imslpCounts.librettos + workScoreCounts.librettos,
    others: imslpCounts.others + workScoreCounts.others,
    sources: imslpCounts.sources + workScoreCounts.sources,
  };
}

/**
 * NOVA: Converte Record<string, number> para ScoreCounts
 */
export function recordToScoreCounts(
  record: Record<string, number>
): ScoreCounts {
  return {
    scores: record.scores || 0,
    parts: record.parts || 0,
    arrangements: record.arrangements || 0,
    librettos: record.librettos || 0,
    others: record.others || 0,
    sources: record.sources || 0,
  };
}

/**
 * NOVA: Converte ScoreCounts para Record<string, number>
 */
export function scoreCountsToRecord(
  counts: ScoreCounts
): Record<string, number> {
  return {
    scores: counts.scores,
    parts: counts.parts,
    arrangements: counts.arrangements,
    librettos: counts.librettos,
    others: counts.others,
    sources: counts.sources,
  };
}

/**
 * NOVA: Cria estatísticas vazias
 */
export function createEmptyTabStatistics(): TabStatistics {
  return {
    loaded: 0,
    total: 0,
    remaining: 0,
    hasMore: false,
    progress: 100,
  };
}

/**
 * NOVA: Valida se TabStatistics está consistente
 */
export function validateTabStatistics(stats: TabStatistics): boolean {
  return (
    stats.loaded >= 0 &&
    stats.total >= 0 &&
    stats.loaded <= stats.total &&
    stats.remaining >= 0 &&
    stats.remaining === Math.max(0, stats.total - stats.loaded) &&
    stats.hasMore === stats.remaining > 0
  );
}
