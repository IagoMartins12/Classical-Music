// app/libs/media-search/simplified-media-search.ts

export interface SearchQuery {
  query: string;
  strategy: string;
  priority: number;
}

export interface WorkWithRelations {
  id: string;
  title: string;
  composer: {
    fullName: string;
  };
  instrument?: {
    name: string;
  } | null;
  workType: string;
  movementNumber?: number | null;
  opOrCatalog?: string | null;
}

/**
 * Gera queries de busca SIMPLES e EFICAZES
 * Máximo 3 queries para não sobrecarregar as APIs
 */
export function generateSimpleSearchQueries(
  work: WorkWithRelations
): SearchQuery[] {
  const queries: SearchQuery[] = [];
  const title = cleanTitle(work.title);
  const composer = work.composer.fullName;

  // QUERY 1: Básica - Título + Compositor (mais provável de funcionar)
  queries.push({
    query: `${title} ${composer}`,
    strategy: 'basic',
    priority: 100,
  });

  // QUERY 2: Com opus (se disponível)
  if (work.opOrCatalog) {
    const opus = cleanOpus(work.opOrCatalog);
    queries.push({
      query: `${title} ${opus} ${composer}`,
      strategy: 'with-opus',
      priority: 90,
    });
  }

  // QUERY 3: Apenas para obras individuais, adicionar instrumento
  if (work.workType === 'INDIVIDUAL' && work.instrument) {
    queries.push({
      query: `${title} ${composer} ${work.instrument.name}`,
      strategy: 'with-instrument',
      priority: 80,
    });
  }

  return queries;
}

/**
 * Limpa o título removendo informações desnecessárias
 */
function cleanTitle(title: string): string {
  return title
    .replace(/,\s*(Op\.|BWV|K\.|Hob\.|D\.|CD|L\.)\s*[\d\w\-\/\.]+/gi, '') // Remove catálogos inline
    .replace(/\s*\([^)]*\)/g, '') // Remove parênteses
    .replace(/\s*\[[^\]]*\]/g, '') // Remove colchetes
    .replace(/["'"]/g, '') // Remove aspas
    .replace(/[,;:]/g, ' ') // Substitui pontuação por espaço
    .replace(/\s+/g, ' ') // Remove espaços duplos
    .trim();
}

/**
 * Limpa e padroniza opus/catálogo
 */
function cleanOpus(opus: string): string {
  return opus
    .replace(/[,;]/g, '') // Remove vírgulas e ponto-vírgula
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calcula score de qualidade SIMPLIFICADO
 * Foca na similaridade de título e compositor
 */
export function calculateSimpleQualityScore(
  originalTitle: string,
  originalComposer: string,
  foundTitle: string,
  foundArtist: string
): number {
  let score = 0;

  // Normalizar strings para comparação
  const origTitle = normalizeString(originalTitle);
  const origComposer = normalizeString(originalComposer);
  const foundTitleNorm = normalizeString(foundTitle);
  const foundArtistNorm = normalizeString(foundArtist);

  // 40 pontos: Compositor deve estar presente (ESSENCIAL)
  if (
    foundArtistNorm.includes(origComposer) ||
    foundTitleNorm.includes(origComposer)
  ) {
    score += 40;
  } else {
    // Se não tem o compositor, score baixo
    return score;
  }

  // 30 pontos: Similaridade do título
  const titleWords = origTitle.split(' ').filter((word) => word.length > 2);
  const matchedWords = titleWords.filter(
    (word) => foundTitleNorm.includes(word) || foundArtistNorm.includes(word)
  );
  score += (matchedWords.length / titleWords.length) * 30;

  // 20 pontos: Palavras-chave clássicas
  const classicalKeywords = [
    'classical',
    'piano',
    'violin',
    'orchestra',
    'symphony',
    'sonata',
    'concerto',
    'quartet',
    'chamber',
    'philharmonic',
  ];

  if (
    classicalKeywords.some(
      (keyword) =>
        foundTitleNorm.includes(keyword) || foundArtistNorm.includes(keyword)
    )
  ) {
    score += 20;
  }

  // 10 pontos: Não é remix/cover/versão alternativa
  const excludeKeywords = [
    'remix',
    'cover',
    'version',
    'electronic',
    'jazz',
    'rock',
  ];
  if (
    !excludeKeywords.some(
      (keyword) =>
        foundTitleNorm.includes(keyword) || foundArtistNorm.includes(keyword)
    )
  ) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Normaliza string para comparação
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifica se uma obra é muito complexa para busca automática
 */
export function isWorkTooComplexForAutoSearch(
  work: WorkWithRelations
): boolean {
  // Coleções com muitos movimentos são complexas
  if (
    work.workType === 'COLLECTED_WORKS' &&
    work.movementNumber &&
    work.movementNumber > 10
  ) {
    return true;
  }

  // Títulos muito genéricos
  const genericTitles = ['collection', 'complete works', 'anthology', 'album'];
  if (
    genericTitles.some((generic) => work.title.toLowerCase().includes(generic))
  ) {
    return true;
  }

  return false;
}
