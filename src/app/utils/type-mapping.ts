// app/utils/type-mapping.ts - Utilitários para mapeamento de tipos

/**
 * Mapeamento de tipos entre frontend (minúsculas) e banco (maiúsculas)
 */
export const SCORE_TYPE_MAPPING = {
  // Frontend -> Banco (Prisma enum)
  scores: 'SCORES',
  parts: 'PARTS',
  arrangements: 'ARRANGEMENTS',
  librettos: 'LIBRETTOS',
  others: 'OTHERS',
  sources: 'SOURCES',
} as const;

/**
 * Mapeamento reverso: banco -> frontend
 */
export const REVERSE_SCORE_TYPE_MAPPING = {
  SCORES: 'scores',
  PARTS: 'parts',
  ARRANGEMENTS: 'arrangements',
  LIBRETTOS: 'librettos',
  OTHERS: 'others',
  SOURCES: 'sources',
} as const;

/**
 * Tipos TypeScript
 */
export type FrontendScoreType = keyof typeof SCORE_TYPE_MAPPING;
export type DatabaseScoreType = keyof typeof REVERSE_SCORE_TYPE_MAPPING;

/**
 * Converter tipo do frontend para banco
 */
export function frontendToDatabase(type: string): DatabaseScoreType | null {
  return SCORE_TYPE_MAPPING[type as FrontendScoreType] || null;
}

/**
 * Converter tipo do banco para frontend
 */
export function databaseToFrontend(type: string): FrontendScoreType | null {
  return REVERSE_SCORE_TYPE_MAPPING[type as DatabaseScoreType] || null;
}

/**
 * Verificar se um tipo é válido para o frontend
 */
export function isValidFrontendType(type: string): type is FrontendScoreType {
  return type in SCORE_TYPE_MAPPING;
}

/**
 * Verificar se um tipo é válido para o banco
 */
export function isValidDatabaseType(type: string): type is DatabaseScoreType {
  return type in REVERSE_SCORE_TYPE_MAPPING;
}

/**
 * Converter array de tipos do frontend para banco
 */
export function frontendTypesToDatabase(types: string[]): DatabaseScoreType[] {
  return types
    .map((type) => frontendToDatabase(type))
    .filter((type): type is DatabaseScoreType => type !== null);
}

/**
 * Converter array de tipos do banco para frontend
 */
export function databaseTypesToFrontend(types: string[]): FrontendScoreType[] {
  return types
    .map((type) => databaseToFrontend(type))
    .filter((type): type is FrontendScoreType => type !== null);
}

/**
 * Mapear objeto de contadores do frontend para banco
 */
export function mapCountersToDatabase(
  frontendCounts: Record<string, number>
): Record<string, number> {
  const databaseCounts: Record<string, number> = {};

  for (const [frontendType, count] of Object.entries(frontendCounts)) {
    const dbType = frontendToDatabase(frontendType);
    if (dbType) {
      databaseCounts[dbType] = count;
    }
  }

  return databaseCounts;
}

/**
 * Mapear objeto de contadores do banco para frontend
 */
export function mapCountersToFrontend(
  databaseCounts: Record<string, number>
): Record<string, number> {
  const frontendCounts: Record<string, number> = {};

  for (const [dbType, count] of Object.entries(databaseCounts)) {
    const frontendType = databaseToFrontend(dbType);
    if (frontendType) {
      frontendCounts[frontendType] = count;
    }
  }

  return frontendCounts;
}

/**
 * Validar e sanitizar tipo de partitura
 */
export function sanitizeScoreType(type: unknown): FrontendScoreType {
  if (typeof type === 'string') {
    const lowerType = type.toLowerCase();
    if (isValidFrontendType(lowerType)) {
      return lowerType;
    }

    // Tentar converter do formato do banco
    const frontendType = databaseToFrontend(type.toUpperCase());
    if (frontendType) {
      return frontendType;
    }
  }

  // Default para 'scores' se não conseguir determinar
  return 'scores';
}

/**
 * Labels amigáveis para tipos de partitura
 */
export const SCORE_TYPE_LABELS: Record<FrontendScoreType, string> = {
  scores: 'Partituras Completas',
  parts: 'Partes Individuais',
  arrangements: 'Arranjos',
  librettos: 'Libretos',
  others: 'Outros',
  sources: 'Arquivos Fonte',
};

/**
 * Obter label amigável para tipo
 */
export function getScoreTypeLabel(type: string): string {
  const sanitizedType = sanitizeScoreType(type);
  return SCORE_TYPE_LABELS[sanitizedType] || type;
}

/**
 * Cores para tipos de partitura (para UI)
 */
export const SCORE_TYPE_COLORS: Record<FrontendScoreType, string> = {
  scores: 'from-brand-primary to-brand-secondary',
  parts: 'from-accent-blue to-accent-purple',
  arrangements: 'from-accent-green to-accent-blue',
  librettos: 'from-accent-purple to-accent-red',
  others: 'from-accent-red to-accent-purple',
  sources: 'from-accent-purple to-accent-blue',
};

/**
 * Obter cor para tipo
 */
export function getScoreTypeColor(type: string): string {
  const sanitizedType = sanitizeScoreType(type);
  return SCORE_TYPE_COLORS[sanitizedType] || SCORE_TYPE_COLORS.scores;
}

/**
 * Ícones para tipos de partitura
 */
export const SCORE_TYPE_ICONS: Record<FrontendScoreType, string> = {
  scores: 'FiMusic',
  parts: 'FiFileText',
  arrangements: 'GiMusicalNotes',
  librettos: 'FiFileText',
  others: 'FiFileText',
  sources: 'FiFileText',
};

/**
 * Obter ícone para tipo
 */
export function getScoreTypeIcon(type: string): string {
  const sanitizedType = sanitizeScoreType(type);
  return SCORE_TYPE_ICONS[sanitizedType] || SCORE_TYPE_ICONS.scores;
}

/**
 * Prioridade de tipos para ordenação
 */
export const SCORE_TYPE_PRIORITY: Record<FrontendScoreType, number> = {
  scores: 1,
  parts: 2,
  arrangements: 3,
  librettos: 4,
  others: 5,
  sources: 6,
};

/**
 * Ordenar tipos por prioridade
 */
export function sortTypesByPriority(types: string[]): FrontendScoreType[] {
  return types
    .map((type) => sanitizeScoreType(type))
    .sort((a, b) => SCORE_TYPE_PRIORITY[a] - SCORE_TYPE_PRIORITY[b]);
}
