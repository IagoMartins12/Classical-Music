// app/libs/media-search-utils.ts
import { Work, Composer, Instrument } from '@prisma/client';

export interface SearchQuery {
  query: string;
  strategy: string;
  priority: number;
}

export interface WorkWithRelations extends Work {
  composer: Composer;
  instrument: Instrument | null;
}

/**
 * Gera múltiplas queries de busca inteligentes baseadas no tipo e conteúdo da obra
 */
export function generateSearchQueries(work: WorkWithRelations): SearchQuery[] {
  const queries: SearchQuery[] = [];
  const composerName = work.composer.fullName;
  const title = work.title;
  const opCatalog = work.opOrCatalog;

  // Limpar título de informações extras
  const cleanTitle = cleanWorkTitle(title);

  console.log(`🧠 [SEARCH-UTILS] Analisando obra: ${title} (${work.workType})`);

  // ESTRATÉGIA 1: Busca básica (título + compositor)
  queries.push({
    query: `${cleanTitle} ${composerName}`,
    strategy: 'basic',
    priority: 100,
  });

  // ESTRATÉGIA 2: Com opus/catálogo se disponível
  if (opCatalog) {
    queries.push({
      query: `${cleanTitle} ${opCatalog} ${composerName}`,
      strategy: 'with-opus',
      priority: 90,
    });
  }

  // ESTRATÉGIA 3: Estratégias específicas por tipo de obra
  if (work.workType === 'COLLECTED_WORKS' || (work.movementNumber ?? 0) > 1) {
    // Para coleções, buscar pela obra completa
    queries.push({
      query: `${title} ${composerName} complete`,
      strategy: 'collection-complete',
      priority: 85,
    });

    // Também tentar buscar movimentos individuais se especificados
    if (work.moviment) {
      const movements = parseMovements(work.moviment);
      movements.slice(0, 3).forEach((movement, index) => {
        // Máximo 3 movimentos
        queries.push({
          query: `${movement} ${composerName}`,
          strategy: `movement-${index + 1}`,
          priority: 70 - index * 5,
        });
      });
    }
  }

  // ESTRATÉGIA 4: Busca por gênero específico
  if (work.workGenresArr && work.workGenresArr.length > 0) {
    const primaryGenre = work.workGenresArr[0];
    queries.push({
      query: `${composerName} ${primaryGenre} ${extractKeyFromTitle(title)}`,
      strategy: 'by-genre',
      priority: 80,
    });
  }

  // ESTRATÉGIA 5: Busca com instrumento
  if (work.instrument) {
    queries.push({
      query: `${cleanTitle} ${composerName} ${work.instrument.name}`,
      strategy: 'with-instrument',
      priority: 75,
    });
  }

  // ESTRATÉGIA 6: Busca alternativa sem números/detalhes
  const simplifiedTitle = simplifyTitle(title);
  if (simplifiedTitle !== cleanTitle) {
    queries.push({
      query: `${simplifiedTitle} ${composerName}`,
      strategy: 'simplified',
      priority: 70,
    });
  }

  // ESTRATÉGIA 7: Busca por tom se disponível
  if (work.tone && work.tone !== 'see below' && work.tone.length < 20) {
    queries.push({
      query: `${cleanTitle} ${work.tone} ${composerName}`,
      strategy: 'with-key',
      priority: 65,
    });
  }

  // ESTRATÉGIA 8: Para obras famosas, buscar apenas pelo nome comum
  const famousTitle = getFamousTitle(title);
  if (famousTitle !== title) {
    queries.push({
      query: `${famousTitle} ${composerName}`,
      strategy: 'famous-name',
      priority: 95,
    });
  }

  // Ordenar por prioridade e limitar a 8 queries
  return queries.sort((a, b) => b.priority - a.priority).slice(0, 8);
}

/**
 * Limpa o título removendo informações extras mas mantendo o essencial
 */
function cleanWorkTitle(title: string): string {
  return title
    .replace(/,\s*(Op\.|BWV|K\.|Hob\.|D\.|CD|L\.)\s*[\d\w\-\/\.]+/gi, '') // Remove catálogos inline
    .replace(/\s*\([^)]*\)/g, '') // Remove parênteses
    .replace(/\s*\[[^\]]*\]/g, '') // Remove colchetes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Simplifica ainda mais o título para buscas alternativas
 */
function simplifyTitle(title: string): string {
  return title
    .replace(/No\.\s*\d+/gi, '') // Remove "No. 1", etc.
    .replace(/\b\d+\s*/g, '') // Remove números soltos
    .replace(/Op\.\s*\d+/gi, '') // Remove opus
    .replace(/[,\-:;]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrai informações chave do título (números, opus, etc.)
 */
function extractKeyFromTitle(title: string): string {
  const opusMatch = title.match(
    /(Op\.|BWV|K\.|Hob\.|D\.|CD|L\.)\s*([\d\w\-\/\.]+)/i
  );
  const numberMatch = title.match(/No\.\s*(\d+)/i);

  if (opusMatch) return opusMatch[0];
  if (numberMatch) return `No. ${numberMatch[1]}`;

  return '';
}

/**
 * Mapeia títulos para nomes mais famosos/comuns
 */
function getFamousTitle(title: string): string {
  const famousMapping: Record<string, string> = {
    '2 Arabesques': 'Arabesque',
    'Ballade No.1, Op.23': 'Ballade No. 1',
    '11 Bagatelles, Op.119': 'Bagatelles Op. 119',
    'Sonata No.14, Op.27 No.2': 'Moonlight Sonata',
    'Sonata No.8, Op.13': 'Pathétique Sonata',
    'Für Elise, WoO 59': 'Für Elise',
    // Adicione mais mapeamentos conforme necessário
  };

  for (const [key, value] of Object.entries(famousMapping)) {
    if (title.includes(key)) {
      return value;
    }
  }

  return title;
}

/**
 * Extrai movimentos individuais da string de movimentos
 */
function parseMovements(movementText?: string): string[] {
  if (!movementText) return [];

  const movements: string[] = [];

  // Dividir por linhas e números
  const lines = movementText.split(/\n|;\s*/);

  for (const line of lines) {
    const cleaned = line
      .trim()
      .replace(/^\d+\.\s*/, '') // Remove numeração
      .replace(/^\w+\s+/, '') // Remove indicações como "Andante"
      .replace(/\([^)]*\)/, '') // Remove parênteses com tonalidades
      .trim();

    if (cleaned && cleaned.length > 3) {
      movements.push(cleaned);
    }
  }

  return movements.slice(0, 5); // Máximo 5 movimentos
}

/**
 * Calcula score de qualidade do match baseado em similaridade de strings
 */
export function calculateQualityScore(
  originalTitle: string,
  originalComposer: string,
  foundTitle: string,
  foundArtist: string,
  strategy: string
): number {
  let score = 0;

  // Score base por estratégia
  const strategyScores: Record<string, number> = {
    basic: 50,
    'with-opus': 40,
    'famous-name': 45,
    'with-instrument': 35,
    'collection-complete': 30,
    'by-genre': 25,
    simplified: 20,
    'with-key': 20,
  };

  score += strategyScores[strategy] || 20;

  // Similaridade do compositor/artista (peso alto)
  const composerSimilarity = calculateStringSimilarity(
    normalizeString(originalComposer),
    normalizeString(foundArtist)
  );
  score += composerSimilarity * 30;

  // Similaridade do título (peso alto)
  const titleSimilarity = calculateStringSimilarity(
    normalizeString(originalTitle),
    normalizeString(foundTitle)
  );
  score += titleSimilarity * 40;

  // Bonus por palavras-chave exatas
  const originalWords = normalizeString(originalTitle).split(' ');
  const foundWords = normalizeString(foundTitle).split(' ');
  const exactMatches = originalWords.filter(
    (word) => word.length > 2 && foundWords.includes(word)
  ).length;
  score += exactMatches * 5;

  // Bonus se contém o nome do compositor
  if (normalizeString(foundTitle).includes(normalizeString(originalComposer))) {
    score += 10;
  }

  // Penalty para títulos muito diferentes em tamanho
  const lengthDiff = Math.abs(originalTitle.length - foundTitle.length);
  if (lengthDiff > originalTitle.length * 0.5) {
    score -= 10;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calcula similaridade entre duas strings usando algoritmo de Levenshtein simplificado
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Algoritmo de Levenshtein para calcular distância entre strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Normaliza string para comparação
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Valida se um resultado é relevante para música clássica
 */
export function isClassicalMusicRelevant(
  title: string,
  artist: string
): boolean {
  const classicalKeywords = [
    'symphony',
    'concerto',
    'sonata',
    'quartet',
    'trio',
    'quintet',
    'prelude',
    'fugue',
    'etude',
    'nocturne',
    'waltz',
    'mazurka',
    'ballade',
    'scherzo',
    'rondo',
    'variation',
    'fantasia',
    'orchestral',
    'chamber',
    'classical',
    'romantic',
    'baroque',
  ];

  const nonClassicalKeywords = [
    'cover',
    'remix',
    'electronic',
    'jazz',
    'rock',
    'pop',
    'hip hop',
    'rap',
    'disco',
    'funk',
    'metal',
    'punk',
  ];

  const titleLower = title.toLowerCase();
  const artistLower = artist.toLowerCase();
  const combined = `${titleLower} ${artistLower}`;

  // Se contém palavras não-clássicas, penalizar
  if (nonClassicalKeywords.some((keyword) => combined.includes(keyword))) {
    return false;
  }

  // Se contém palavras clássicas, é relevante
  if (classicalKeywords.some((keyword) => combined.includes(keyword))) {
    return true;
  }

  // Se contém "orchestra", "philharmonic", "ensemble", etc., é relevante
  const classicalArtistKeywords = [
    'orchestra',
    'philharmonic',
    'ensemble',
    'quartet',
    'trio',
    'conservatory',
    'symphony',
    'chamber',
    'classical',
  ];

  return classicalArtistKeywords.some((keyword) =>
    artistLower.includes(keyword)
  );
}
