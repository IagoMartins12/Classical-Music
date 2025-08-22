// app/utils/workTypeTranslation.ts
import { Language } from '@/app/stores/useLanguageStore';

// Mapeamento de tipos de obra em português para chaves de tradução
const WORK_TYPE_TRANSLATION_MAP: Record<string, string> = {
  INDIVIDUAL: 'work_types_individual',
  COMPLETE_WORK: 'work_types_complete_work',
  ARRANGEMENT: 'work_types_arrangement',
  COLLECTION: 'work_types_collection',
  COLLABORATION: 'work_types_collaboration',
  COMPOSITION: 'work_types_composition',
  COLLECTED_WORKS: 'work_types_collected_works',
  COLLECTIONS_WITH: 'work_types_collections_with',

  // Variações possíveis em inglês/português
  Individual: 'work_types_individual',
  'Complete Work': 'work_types_complete_work',
  Arrangement: 'work_types_arrangement',
  Collection: 'work_types_collection',
  Collaboration: 'work_types_collaboration',
  Composition: 'work_types_composition',
  'Collected Works': 'work_types_collected_works',
  'Collections with others': 'work_types_collections_with',

  'Obra Individual': 'work_types_individual',
  'Obra Completa': 'work_types_complete_work',
  Arranjo: 'work_types_arrangement',
  Coleção: 'work_types_collection',
  Colaboração: 'work_types_collaboration',
  Composição: 'work_types_composition',
  'Obras Coletadas': 'work_types_collected_works',
  'Coleção com outros': 'work_types_collections_with',
};

// Traduções estáticas para fallback
const WORK_TYPE_TRANSLATIONS: Record<string, { pt: string; en: string }> = {
  INDIVIDUAL: { pt: 'Obra Individual', en: 'Individual Work' },
  COMPLETE_WORK: { pt: 'Obra Completa', en: 'Complete Work' },
  ARRANGEMENT: { pt: 'Arranjo', en: 'Arrangement' },
  COLLECTION: { pt: 'Coleção de peças', en: 'Collection of pieces' },
  COLLABORATION: { pt: 'Colaboração', en: 'Collaboration' },
  COMPOSITION: { pt: 'Composição Original', en: 'Original Composition' },
  COLLECTED_WORKS: { pt: 'Coleção de peças', en: 'Collected Works' },
  COLLECTIONS_WITH: { pt: 'Coleção com outros', en: 'Collection with others' },

  // Variações em inglês
  Individual: { pt: 'Obra Individual', en: 'Individual Work' },
  'Complete Work': { pt: 'Obra Completa', en: 'Complete Work' },
  Arrangement: { pt: 'Arranjo', en: 'Arrangement' },
  Collection: { pt: 'Coleção de peças', en: 'Collection of pieces' },
  Collaboration: { pt: 'Colaboração', en: 'Collaboration' },
  Composition: { pt: 'Composição Original', en: 'Original Composition' },
  'Collected Works': { pt: 'Coleção de peças', en: 'Collected Works' },
  'Collections with others': {
    pt: 'Coleção com outros',
    en: 'Collection with others',
  },

  // Variações em português
  'Obra Individual': { pt: 'Obra Individual', en: 'Individual Work' },
  'Obra Completa': { pt: 'Obra Completa', en: 'Complete Work' },
  Arranjo: { pt: 'Arranjo', en: 'Arrangement' },
  Coleção: { pt: 'Coleção de peças', en: 'Collection of pieces' },
  Colaboração: { pt: 'Colaboração', en: 'Collaboration' },
  Composição: { pt: 'Composição Original', en: 'Original Composition' },
  'Obras Coletadas': { pt: 'Coleção de peças', en: 'Collected Works' },
  'Coleção com outros': {
    pt: 'Coleção com outros',
    en: 'Collection with others',
  },
};

/**
 * Traduz o tipo de obra usando a função de tradução do hook
 * @param workType Tipo da obra (como vem do banco)
 * @param t Função de tradução do useTranslation
 * @returns Tipo da obra traduzido
 */
export function translateWorkTypeWithHook(
  workType: string,
  t: (key: string) => string
): string {
  const translationKey = WORK_TYPE_TRANSLATION_MAP[workType];
  if (translationKey) {
    return t(translationKey);
  }
  // Fallback para o nome original se não encontrar tradução
  return workType;
}

/**
 * Traduz o tipo de obra sem usar hook (para uso em server components)
 * @param workType Tipo da obra (como vem do banco)
 * @param language Idioma de destino
 * @returns Tipo da obra traduzido
 */
export function translateWorkTypeStatic(
  workType: string,
  language: Language
): string {
  const translation = WORK_TYPE_TRANSLATIONS[workType];
  if (translation) {
    return language === 'en' ? translation.en : translation.pt;
  }
  // Fallback para o nome original se não encontrar tradução
  return workType;
}

/**
 * Retorna a chave de tradução para um tipo de obra
 * @param workType Tipo da obra
 * @returns Chave de tradução ou null se não encontrar
 */
export function getWorkTypeTranslationKey(workType: string): string | null {
  return WORK_TYPE_TRANSLATION_MAP[workType] || null;
}

/**
 * Retorna todos os tipos de obra com suas traduções
 * @param language Idioma de destino
 * @returns Array com tipos de obra traduzidos
 */
export function getAllWorkTypeTranslations(
  language: Language
): Array<{ original: string; translated: string }> {
  return Object.keys(WORK_TYPE_TRANSLATIONS)
    .filter((key) => key.toUpperCase() === key) // Pegar apenas as chaves principais (UPPERCASE)
    .map((workType) => ({
      original: workType,
      translated: translateWorkTypeStatic(workType, language),
    }));
}
