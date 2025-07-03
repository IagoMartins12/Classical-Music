// app/libs/type-utils.ts - Utilitários corrigidos para tipagem adequada

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
 * Verifica se há mais partituras para carregar
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
 * Verifica se uma tab específica tem mais partituras para carregar
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
 * Interface para estatísticas de tab
 */
export interface TabStatistics {
  loaded: number;
  total: number;
  remaining: number; // 🆕 Adicionada propriedade missing
  hasMore: boolean;
  progress: number;
}

/**
 * Obtém estatísticas de uma tab específica
 */
export function getTabStatistics(
  tabType: string,
  loadedCounts: Record<string, number>,
  totalCounts: Record<string, number>
): TabStatistics {
  const loaded = loadedCounts[tabType] || 0;
  const total = totalCounts[tabType] || 0;
  const remaining = Math.max(0, total - loaded);
  const hasMore = loaded < total;
  const progress = total > 0 ? Math.round((loaded / total) * 100) : 100;

  return {
    loaded,
    total,
    remaining, // 🆕 Incluída propriedade remaining
    hasMore,
    progress,
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
