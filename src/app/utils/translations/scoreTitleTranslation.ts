// app/utils/scoreTitleTranslation.ts
import { Language } from '@/app/stores/useLanguageStore';

// Mapeamento de títulos/termos comuns em partituras
const SCORE_TITLE_TRANSLATIONS: Record<string, { pt: string; en: string }> = {
  // Tipos de partitura
  'Partitura Completa': { pt: 'Partitura Completa', en: 'Complete Score' },
  'Partitura completa': { pt: 'Partitura completa', en: 'Complete score' },
  Partitura: { pt: 'Partitura', en: 'Score' },
  Partes: { pt: 'Partes', en: 'Parts' },
  Parte: { pt: 'Parte', en: 'Part' },
  'Piano Parte': { pt: 'Piano Parte', en: 'Piano Part' },
  'Parte de Piano': { pt: 'Parte de Piano', en: 'Piano Part' },
  'Parte Solo': { pt: 'Parte Solo', en: 'Solo Part' },
  Grade: { pt: 'Grade', en: 'Score' },
  'Grade Completa': { pt: 'Grade Completa', en: 'Full Score' },

  // Arranjos
  Arranjo: { pt: 'Arranjo', en: 'Arrangement' },
  'Arranjo para Piano': { pt: 'Arranjo para Piano', en: 'Piano Arrangement' },
  'Arranjo para piano': { pt: 'Arranjo para piano', en: 'Piano arrangement' },
  Transcrição: { pt: 'Transcrição', en: 'Transcription' },
  'Transcrição para Piano': {
    pt: 'Transcrição para Piano',
    en: 'Piano Transcription',
  },
  Redução: { pt: 'Redução', en: 'Reduction' },
  'Redução para Piano': { pt: 'Redução para Piano', en: 'Piano Reduction' },

  // Instrumentos específicos
  'para Piano': { pt: 'para Piano', en: 'for Piano' },
  'para piano': { pt: 'para piano', en: 'for piano' },
  'Piano solo': { pt: 'Piano solo', en: 'Piano solo' },
  'Piano Solo': { pt: 'Piano Solo', en: 'Piano Solo' },
  'para Violino': { pt: 'para Violino', en: 'for Violin' },
  'para violino': { pt: 'para violino', en: 'for violin' },
  'para Violoncelo': { pt: 'para Violoncelo', en: 'for Cello' },
  'para violoncelo': { pt: 'para violoncelo', en: 'for cello' },
  'para Orquestra': { pt: 'para Orquestra', en: 'for Orchestra' },
  'para orquestra': { pt: 'para orquestra', en: 'for orchestra' },
  'para Coro': { pt: 'para Coro', en: 'for Choir' },
  'para coro': { pt: 'para coro', en: 'for choir' },

  // Piano múltiplas mãos
  'Piano 4 mãos': { pt: 'Piano 4 mãos', en: 'Piano 4-hands' },
  'Piano a quatro mãos': { pt: 'Piano a quatro mãos', en: 'Piano four-hands' },
  '4 mãos': { pt: '4 mãos', en: '4-hands' },
  'quatro mãos': { pt: 'quatro mãos', en: 'four-hands' },
  '2 Pianos': { pt: '2 Pianos', en: '2 Pianos' },
  'dois pianos': { pt: 'dois pianos', en: 'two pianos' },

  // Movimentos e seções
  Movimento: { pt: 'Movimento', en: 'Movement' },
  movimento: { pt: 'movimento', en: 'movement' },
  Andamento: { pt: 'Andamento', en: 'Movement' },
  andamento: { pt: 'andamento', en: 'movement' },
  Allegro: { pt: 'Allegro', en: 'Allegro' },
  Andante: { pt: 'Andante', en: 'Andante' },
  Adagio: { pt: 'Adagio', en: 'Adagio' },
  Presto: { pt: 'Presto', en: 'Presto' },
  Largo: { pt: 'Largo', en: 'Largo' },
  Moderato: { pt: 'Moderato', en: 'Moderato' },

  // Qualificadores e descrições
  Original: { pt: 'Original', en: 'Original' },
  original: { pt: 'original', en: 'original' },
  Completo: { pt: 'Completo', en: 'Complete' },
  completo: { pt: 'completo', en: 'complete' },
  Integral: { pt: 'Integral', en: 'Complete' },
  integral: { pt: 'integral', en: 'complete' },
  Editado: { pt: 'Editado', en: 'Edited' },
  editado: { pt: 'editado', en: 'edited' },
  Revisado: { pt: 'Revisado', en: 'Revised' },
  revisado: { pt: 'revisado', en: 'revised' },
  Manuscrito: { pt: 'Manuscrito', en: 'Manuscript' },
  manuscrito: { pt: 'manuscrito', en: 'manuscript' },

  // Tipos de edição
  'Primeira Edição': { pt: 'Primeira Edição', en: 'First Edition' },
  'primeira edição': { pt: 'primeira edição', en: 'first edition' },
  'Edição Crítica': { pt: 'Edição Crítica', en: 'Critical Edition' },
  'edição crítica': { pt: 'edição crítica', en: 'critical edition' },
  'Edição Revisada': { pt: 'Edição Revisada', en: 'Revised Edition' },
  'edição revisada': { pt: 'edição revisada', en: 'revised edition' },
  'Fac-símile': { pt: 'Fac-símile', en: 'Facsimile' },
  'fac-símile': { pt: 'fac-símile', en: 'facsimile' },

  // Outros termos comuns
  com: { pt: 'com', en: 'with' },
  e: { pt: 'e', en: 'and' },
  ou: { pt: 'ou', en: 'or' },
  sem: { pt: 'sem', en: 'without' },
  'Sem acompanhamento': { pt: 'Sem acompanhamento', en: 'Unaccompanied' },
  'sem acompanhamento': { pt: 'sem acompanhamento', en: 'unaccompanied' },
  Solo: { pt: 'Solo', en: 'Solo' },
  solo: { pt: 'solo', en: 'solo' },
  Duo: { pt: 'Duo', en: 'Duo' },
  duo: { pt: 'duo', en: 'duo' },
  Trio: { pt: 'Trio', en: 'Trio' },
  trio: { pt: 'trio', en: 'trio' },
  Quarteto: { pt: 'Quarteto', en: 'Quartet' },
  quarteto: { pt: 'quarteto', en: 'quartet' },
  Quinteto: { pt: 'Quinteto', en: 'Quintet' },
  quinteto: { pt: 'quinteto', en: 'quintet' },

  // Numeração
  Número: { pt: 'Número', en: 'Number' },
  número: { pt: 'número', en: 'number' },
  Nº: { pt: 'Nº', en: 'No.' },
  nº: { pt: 'nº', en: 'no.' },
  'Op.': { pt: 'Op.', en: 'Op.' },
  'op.': { pt: 'op.', en: 'op.' },
  BWV: { pt: 'BWV', en: 'BWV' },
  'K.': { pt: 'K.', en: 'K.' },
  'Hob.': { pt: 'Hob.', en: 'Hob.' },
  'D.': { pt: 'D.', en: 'D.' },
};

// Padrões para substituição com regex
const SCORE_TITLE_PATTERNS: Array<{
  pattern: RegExp;
  ptReplacement: string;
  enReplacement: string;
}> = [
  // Padrões para "para [instrumento]"
  {
    pattern: /\bpara\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)/g,
    ptReplacement: 'para $1',
    enReplacement: 'for $1',
  },
  // Padrões para números ordinais
  {
    pattern: /(\d+)º\s+(movimento|andamento)/gi,
    ptReplacement: '$1º $2',
    enReplacement: '$1st movement',
  },
  {
    pattern: /(\d+)ª\s+(parte|seção)/gi,
    ptReplacement: '$1ª $2',
    enReplacement: '$1st part',
  },
  // Padrões para "em [tonalidade]"
  {
    pattern: /\bem\s+([A-Za-z#b]+\s+(?:maior|menor))/gi,
    ptReplacement: 'em $1',
    enReplacement: 'in $1',
  },
];

/**
 * Traduz o título de uma partitura
 * @param title Título da partitura em português
 * @param language Idioma de destino
 * @returns Título traduzido
 */
export function translateScoreTitle(title: string, language: Language): string {
  if (language === 'pt') {
    return title; // Já está em português
  }

  let translatedTitle = title;

  // 1. Aplicar traduções diretas (substituições exatas)
  Object.entries(SCORE_TITLE_TRANSLATIONS).forEach(([pt, translations]) => {
    const regex = new RegExp(
      `\\b${pt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'gi'
    );
    translatedTitle = translatedTitle.replace(regex, translations.en);
  });

  // 2. Aplicar padrões mais complexos
  SCORE_TITLE_PATTERNS.forEach(({ pattern, enReplacement }) => {
    translatedTitle = translatedTitle.replace(pattern, enReplacement);
  });

  // 3. Limpeza final
  translatedTitle = translatedTitle
    .replace(/\s+/g, ' ') // Remover espaços duplos
    .trim(); // Remover espaços nas extremidades

  return translatedTitle;
}

/**
 * Traduz o título de uma partitura com fallback inteligente
 * @param title Título da partitura
 * @param language Idioma de destino
 * @returns Título traduzido com fallback para o original se não conseguir traduzir
 */
export function translateScoreTitleSafe(
  title: string,
  language: Language
): string {
  if (!title || title.trim() === '') {
    return title;
  }

  try {
    const translated = translateScoreTitle(title, language);

    // Se a tradução resultou em algo muito diferente ou vazio, usar o original
    if (translated.trim() === '' || translated.length < title.length * 0.3) {
      return title;
    }

    return translated;
  } catch (error) {
    console.warn('Erro ao traduzir título da partitura:', error);
    return title;
  }
}

/**
 * Verifica se um título provavelmente está em português
 * @param title Título para verificar
 * @returns true se provavelmente está em português
 */
export function isLikelyPortuguese(title: string): boolean {
  const portugueseIndicators = [
    'para',
    'com',
    'sem',
    'movimento',
    'partitura',
    'arranjo',
    'transcrição',
    'maior',
    'menor',
    'completa',
    'original',
    'editado',
    'revisado',
    'primeira',
    'edição',
    'manuscrito',
    'orquestra',
    'piano',
    'violino',
    'violoncelo',
    'coro',
    'mãos',
    'solo',
  ];

  const lowerTitle = title.toLowerCase();
  return portugueseIndicators.some((indicator) =>
    lowerTitle.includes(indicator)
  );
}

/**
 * Traduz o título apenas se detectar que está em português
 * @param title Título da partitura
 * @param language Idioma de destino
 * @returns Título traduzido apenas se necessário
 */
export function smartTranslateScoreTitle(
  title: string,
  language: Language
): string {
  if (language === 'pt') {
    return title;
  }

  // Se não parece estar em português, não traduzir
  if (!isLikelyPortuguese(title)) {
    return title;
  }

  return translateScoreTitleSafe(title, language);
}

/**
 * Obtém termos de busca em ambos os idiomas para um título
 * @param title Título da partitura
 * @returns Array com possíveis traduções para busca
 */
export function getScoreTitleSearchTerms(title: string): string[] {
  const terms = new Set<string>();

  // Adicionar título original
  terms.add(title.toLowerCase().trim());

  // Adicionar tradução para inglês
  const englishTitle = translateScoreTitleSafe(title, 'en');
  if (englishTitle !== title) {
    terms.add(englishTitle.toLowerCase().trim());
  }

  // Adicionar palavras-chave individuais
  const words = title.split(/\s+/);
  words.forEach((word) => {
    if (word.length > 2) {
      terms.add(word.toLowerCase());

      // Traduzir palavra individual se possível
      const translatedWord = SCORE_TITLE_TRANSLATIONS[word];
      if (translatedWord) {
        terms.add(translatedWord.en.toLowerCase());
      }
    }
  });

  return Array.from(terms);
}
