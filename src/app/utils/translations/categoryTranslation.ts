// app/utils/categoryTranslation.ts
import { Language } from '@/app/stores/useLanguageStore';

// Mapeamento de categorias baseado no arquivo fornecido
export const CATEGORY_TRANSLATIONS: Record<string, { pt: string; en: string }> =
  {
    // Peças gerais
    Pieces: { pt: 'Peças', en: 'Pieces' },
    Works: { pt: 'Obras', en: 'Works' },
    Compositions: { pt: 'Composições', en: 'Compositions' },

    // Solo piano
    'For piano (arr)': { pt: 'Arranjo para piano', en: 'For piano (arr)' },
    'For piano 3 hands': { pt: 'Para piano 3 mãos', en: 'For piano 3 hands' },
    'For piano 4 hands': { pt: 'Para piano 4 mãos', en: 'For piano 4 hands' },
    'For piano 4 hands (arr)': {
      pt: 'Arranjo para piano 4 mãos',
      en: 'For piano 4 hands (arr)',
    },
    'For 2 pianos': { pt: 'Para 2 pianos', en: 'For 2 pianos' },
    'For 2 pianos (arr)': {
      pt: 'Arranjo para 2 pianos',
      en: 'For 2 pianos (arr)',
    },

    // Piano e orquestra
    'For piano, orchestra': {
      pt: 'Para piano e orquestra',
      en: 'For piano, orchestra',
    },
    'For piano, orchestra (arr)': {
      pt: 'Arranjo para piano e orquestra',
      en: 'For piano, orchestra (arr)',
    },
    'For 2 pianos, orchestra': {
      pt: 'Para 2 pianos e orquestra',
      en: 'For 2 pianos, orchestra',
    },

    // Número de players/instrumentistas
    'For 1 player': { pt: 'Para 1 instrumentista', en: 'For 1 player' },
    'For 2 players': { pt: 'Para 2 instrumentistas', en: 'For 2 players' },
    'For 3 players': { pt: 'Para 3 instrumentistas', en: 'For 3 players' },
    'For 4 players': { pt: 'Para 4 instrumentistas', en: 'For 4 players' },
    'For 5 players': { pt: 'Para 5 instrumentistas', en: 'For 5 players' },
    'For 6 players': { pt: 'Para 6 instrumentistas', en: 'For 6 players' },
    'For 7 players': { pt: 'Para 7 instrumentistas', en: 'For 7 players' },
    'For 8 players': { pt: 'Para 8 instrumentistas', en: 'For 8 players' },
    'For 9 players': { pt: 'Para 9 instrumentistas', en: 'For 9 players' },
    'For 10 players': { pt: 'Para 10 instrumentistas', en: 'For 10 players' },

    // Arranjos por número de players
    'For 1 player (arr)': {
      pt: 'Arranjo para 1 instrumentista',
      en: 'For 1 player (arr)',
    },
    'For 2 players (arr)': {
      pt: 'Arranjo para 2 instrumentistas',
      en: 'For 2 players (arr)',
    },
    'For 3 players (arr)': {
      pt: 'Arranjo para 3 instrumentistas',
      en: 'For 3 players (arr)',
    },
    'For 4 players (arr)': {
      pt: 'Arranjo para 4 instrumentistas',
      en: 'For 4 players (arr)',
    },
    'For 5 players (arr)': {
      pt: 'Arranjo para 5 instrumentistas',
      en: 'For 5 players (arr)',
    },
    'For 6 players (arr)': {
      pt: 'Arranjo para 6 instrumentistas',
      en: 'For 6 players (arr)',
    },
    'For 7 players (arr)': {
      pt: 'Arranjo para 7 instrumentistas',
      en: 'For 7 players (arr)',
    },
    'For 8 players (arr)': {
      pt: 'Arranjo para 8 instrumentistas',
      en: 'For 8 players (arr)',
    },

    // Versões em português que podem vir do banco
    Peças: { pt: 'Peças', en: 'Pieces' },
    Obras: { pt: 'Obras', en: 'Works' },
    Composições: { pt: 'Composições', en: 'Compositions' },
    'Arranjo para piano': { pt: 'Arranjo para piano', en: 'For piano (arr)' },
    'Para piano 3 mãos': { pt: 'Para piano 3 mãos', en: 'For piano 3 hands' },
    'Para piano 4 mãos': { pt: 'Para piano 4 mãos', en: 'For piano 4 hands' },
    'Arranjo para piano 4 mãos': {
      pt: 'Arranjo para piano 4 mãos',
      en: 'For piano 4 hands (arr)',
    },
    'Para 2 pianos': { pt: 'Para 2 pianos', en: 'For 2 pianos' },
    'Arranjo para 2 pianos': {
      pt: 'Arranjo para 2 pianos',
      en: 'For 2 pianos (arr)',
    },
    'Para piano e orquestra': {
      pt: 'Para piano e orquestra',
      en: 'For piano, orchestra',
    },
    'Arranjo para piano e orquestra': {
      pt: 'Arranjo para piano e orquestra',
      en: 'For piano, orchestra (arr)',
    },
    'Para 2 pianos e orquestra': {
      pt: 'Para 2 pianos e orquestra',
      en: 'For 2 pianos, orchestra',
    },
    'Para 1 instrumentista': {
      pt: 'Para 1 instrumentista',
      en: 'For 1 player',
    },
    'Para 2 instrumentistas': {
      pt: 'Para 2 instrumentistas',
      en: 'For 2 players',
    },
    'Para 3 instrumentistas': {
      pt: 'Para 3 instrumentistas',
      en: 'For 3 players',
    },
    'Para 4 instrumentistas': {
      pt: 'Para 4 instrumentistas',
      en: 'For 4 players',
    },
    'Para 5 instrumentistas': {
      pt: 'Para 5 instrumentistas',
      en: 'For 5 players',
    },
    'Para 6 instrumentistas': {
      pt: 'Para 6 instrumentistas',
      en: 'For 6 players',
    },
    'Para 7 instrumentistas': {
      pt: 'Para 7 instrumentistas',
      en: 'For 7 players',
    },
    'Para 8 instrumentistas': {
      pt: 'Para 8 instrumentistas',
      en: 'For 8 players',
    },
    'Para 9 instrumentistas': {
      pt: 'Para 9 instrumentistas',
      en: 'For 9 players',
    },
    'Para 10 instrumentistas': {
      pt: 'Para 10 instrumentistas',
      en: 'For 10 players',
    },
    'Arranjo para 1 instrumentista': {
      pt: 'Arranjo para 1 instrumentista',
      en: 'For 1 player (arr)',
    },
    'Arranjo para 2 instrumentistas': {
      pt: 'Arranjo para 2 instrumentistas',
      en: 'For 2 players (arr)',
    },
    'Arranjo para 3 instrumentistas': {
      pt: 'Arranjo para 3 instrumentistas',
      en: 'For 3 players (arr)',
    },
    'Arranjo para 4 instrumentistas': {
      pt: 'Arranjo para 4 instrumentistas',
      en: 'For 4 players (arr)',
    },
    'Arranjo para 5 instrumentistas': {
      pt: 'Arranjo para 5 instrumentistas',
      en: 'For 5 players (arr)',
    },
    'Arranjo para 6 instrumentistas': {
      pt: 'Arranjo para 6 instrumentistas',
      en: 'For 6 players (arr)',
    },
    'Arranjo para 7 instrumentistas': {
      pt: 'Arranjo para 7 instrumentistas',
      en: 'For 7 players (arr)',
    },
    'Arranjo para 8 instrumentistas': {
      pt: 'Arranjo para 8 instrumentistas',
      en: 'For 8 players (arr)',
    },
  };

/**
 * Traduz o nome de uma categoria sem usar hook (para uso em server components)
 * @param categoryName Nome da categoria (como vem do banco)
 * @param language Idioma de destino
 * @returns Nome da categoria traduzido
 */
export function translateCategoryStatic(
  categoryName: string,
  language: Language
): string {
  const translation = CATEGORY_TRANSLATIONS[categoryName];
  if (translation) {
    return language === 'en' ? translation.en : translation.pt;
  }
  // Fallback para o nome original se não encontrar tradução
  return categoryName;
}

/**
 * Traduz o nome de uma categoria usando uma função de tradução personalizada
 * @param categoryName Nome da categoria
 * @param language Idioma de destino
 * @returns Nome da categoria traduzido
 */
export function translateCategory(
  categoryName: string,
  language: Language
): string {
  return translateCategoryStatic(categoryName, language);
}

/**
 * Busca categorias que correspondem ao termo de busca em qualquer idioma
 * @param categoryName Nome da categoria
 * @param searchTerm Termo de busca
 * @param language Idioma atual
 * @returns true se há correspondência
 */
export function matchesCategorySearch(
  categoryName: string,
  searchTerm: string,
  language: Language
): boolean {
  const lowerCategoryName = categoryName.toLowerCase().trim();
  const lowerSearchTerm = searchTerm.toLowerCase().trim();

  // Verificar correspondência direta
  if (lowerCategoryName.includes(lowerSearchTerm)) {
    return true;
  }

  // Verificar correspondência na tradução
  const translated = translateCategory(categoryName, language);
  if (translated.toLowerCase().includes(lowerSearchTerm)) {
    return true;
  }

  // Verificar correspondência reversa
  const reverseLanguage = language === 'pt' ? 'en' : 'pt';
  const reverseTranslated = translateCategory(categoryName, reverseLanguage);
  if (reverseTranslated.toLowerCase().includes(lowerSearchTerm)) {
    return true;
  }

  return false;
}

/**
 * Retorna todas as categorias com suas traduções
 * @param language Idioma de destino
 * @returns Array com categorias traduzidas
 */
export function getAllCategoryTranslations(
  language: Language
): Array<{ original: string; translated: string }> {
  return Object.keys(CATEGORY_TRANSLATIONS)
    .filter((key) => !key.startsWith('Para ') && !key.startsWith('Arranjo ')) // Evitar duplicatas em português
    .map((categoryName) => ({
      original: categoryName,
      translated: translateCategoryStatic(categoryName, language),
    }));
}

/**
 * Busca o nome original de uma categoria a partir da tradução
 * @param translatedName Nome traduzido da categoria
 * @param language Idioma da tradução
 * @returns Nome original
 */
export function getOriginalCategoryName(
  translatedName: string,
  language: Language
): string {
  const lowerTranslatedName = translatedName.toLowerCase().trim();

  if (language === 'pt') {
    return translatedName; // Já está em português
  }

  // Buscar o nome original em português
  const originalName = Object.keys(CATEGORY_TRANSLATIONS).find(
    (key) => CATEGORY_TRANSLATIONS[key].en.toLowerCase() === lowerTranslatedName
  );

  return originalName || translatedName;
}
