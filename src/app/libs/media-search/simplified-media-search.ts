// app/libs/media-search/ultra-simple-search.ts

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
 * Verifica se uma obra é válida para busca automática
 * Exclui coletâneas, livros e obras muito genéricas
 */
export function isValidForAutoSearch(work: WorkWithRelations): boolean {
  const title = work.title.toLowerCase();

  // Palavras que indicam coletâneas/livros/obras complexas
  const excludeKeywords = [
    'complete works',
    'collected works',
    'anthology',
    'collection',
    'album',
    'book',
    'volume',
    'vol.',
    'études',
    'etudes',
    'studies',
    'exercises',
    'method',
    'school',
    'tutorial',
    'course',
    'manuscript',
    'autograph',
    'sketches',
    'fragments',
  ];

  // Se contém palavras excluídas, não é válida
  if (excludeKeywords.some((keyword) => title.includes(keyword))) {
    return false;
  }

  // Se é uma obra coletada com muitos movimentos, não é válida
  if (
    work.workType === 'COLLECTED_WORKS' &&
    work.movementNumber &&
    work.movementNumber > 8
  ) {
    return false;
  }

  // Títulos muito curtos ou genéricos
  if (work.title.trim().length < 3) {
    return false;
  }

  return true;
}

/**
 * Gera query simples: "título - compositor"
 */
export function generateSimpleQuery(work: WorkWithRelations): string {
  const title = cleanTitle(work.title);
  const composer = work.composer.fullName;

  return `${title} - ${composer}`;
}

/**
 * Limpa o título removendo informações desnecessárias
 */
function cleanTitle(title: string): string {
  return (
    title
      // Remove números de catálogo inline
      .replace(/,?\s*(Op\.|BWV|K\.|Hob\.|D\.|CD|L\.)\s*[\d\w\-\/\.]+/gi, '')
      // Remove informações entre parênteses e colchetes
      .replace(/\s*[\(\[\{][^\)\]\}]*[\)\]\}]/g, '')
      // Remove aspas e pontuação desnecessária
      .replace(/["'"]/g, '')
      .replace(/[,;:]/g, ' ')
      // Remove múltiplos espaços
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Verifica se um resultado é música clássica válida
 */
export function isValidClassicalResult(title: string, artist: string): boolean {
  const combined = `${title} ${artist}`.toLowerCase();

  // Palavras que indicam que NÃO é música clássica
  const excludeKeywords = [
    'remix',
    'electronic',
    'jazz version',
    'rock version',
    'pop version',
    'hip hop',
    'rap',
    'disco',
    'funk',
    'metal',
    'karaoke',
    'backing track',
    'play along',
    'tutorial',
    'lesson',
    'how to',
    'reaction',
    'review',
  ];

  // Se contém palavras não-clássicas, rejeitar
  if (excludeKeywords.some((keyword) => combined.includes(keyword))) {
    return false;
  }

  // Palavras que indicam música clássica
  const classicalKeywords = [
    'classical',
    'piano',
    'violin',
    'orchestra',
    'symphony',
    'philharmonic',
    'chamber',
    'quartet',
    'sonata',
    'concerto',
    'opus',
    'op.',
    'bwv',
    'ensemble',
    'conservatory',
    'recital',
  ];

  // Deve conter pelo menos uma palavra clássica
  return classicalKeywords.some((keyword) => combined.includes(keyword));
}
