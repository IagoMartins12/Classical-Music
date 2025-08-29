// app/utils/epochTranslation.ts
import { Language } from '@/app/stores/useLanguageStore';

// Mapeamento de épocas em português para chaves de tradução
const EPOCH_TRANSLATION_MAP: Record<string, string> = {
  Medieval: 'epochs_medieval',
  Renascentista: 'epochs_renascentista',
  Renascimento: 'epochs_renascentista',
  Impressionismo: 'epochs_impressionism',
  Teoria: 'epochs_teory',
  Futuro: 'epochs_future',
  Barroco: 'epochs_barroco',
  Clássico: 'epochs_classico',
  Romântico: 'epochs_romantico',
  Modernismo: 'epochs_modernismo',
  Moderno: 'epochs_moderno',
  Contemporâneo: 'epochs_contemporaneo',
  Desconhecido: 'epochs_desconhecido',
  // Variações possíveis
  Renaissance: 'epochs_renascentista',
  Baroque: 'epochs_barroco',
  Classical: 'epochs_classico',
  Romantic: 'epochs_romantico',
  Modern: 'epochs_moderno',
  Contemporary: 'epochs_contemporaneo',
  Unknown: 'epochs_desconhecido',
};

// Traduções estáticas para fallback (quando useTranslation não está disponível)
const EPOCH_TRANSLATIONS: Record<string, { pt: string; en: string }> = {
  Medieval: { pt: 'Medieval', en: 'Medieval' },
  Renascentista: { pt: 'Renascentista', en: 'Renaissance' },
  Barroco: { pt: 'Barroco', en: 'Baroque' },
  Clássico: { pt: 'Clássico', en: 'Classical' },
  Romântico: { pt: 'Romântico', en: 'Romantic' },
  Modernismo: { pt: 'Modernismo', en: 'Modernism' },
  Moderno: { pt: 'Moderno', en: 'Modern' },
  Contemporâneo: { pt: 'Contemporâneo', en: 'Contemporary' },
  Desconhecido: { pt: 'Desconhecido', en: 'Unknown' },
  // Versões em inglês que podem vir do banco
  Renaissance: { pt: 'Renascentista', en: 'Renaissance' },
  Baroque: { pt: 'Barroco', en: 'Baroque' },
  Classical: { pt: 'Clássico', en: 'Classical' },
  Romantic: { pt: 'Romântico', en: 'Romantic' },
  Modern: { pt: 'Moderno', en: 'Modern' },
  Contemporary: { pt: 'Contemporâneo', en: 'Contemporary' },
  Unknown: { pt: 'Desconhecido', en: 'Unknown' },
};

/**
 * Traduz o nome de uma época usando a função de tradução do hook
 * @param epochName Nome da época em português (como vem do banco)
 * @param t Função de tradução do useTranslation
 * @returns Nome da época traduzido
 */
export function translateEpochWithHook(
  epochName: string,
  t: (key: string) => string
): string {
  const translationKey = EPOCH_TRANSLATION_MAP[epochName];
  if (translationKey) {
    return t(translationKey);
  }
  // Fallback para o nome original se não encontrar tradução
  return epochName;
}

/**
 * Traduz o nome de uma época sem usar hook (para uso em server components)
 * @param epochName Nome da época em português (como vem do banco)
 * @param language Idioma de destino
 * @returns Nome da época traduzido
 */
export function translateEpochStatic(
  epochName: string,
  language: Language
): string {
  const translation = EPOCH_TRANSLATIONS[epochName];
  if (translation) {
    return language === 'en' ? translation.en : translation.pt;
  }
  // Fallback para o nome original se não encontrar tradução
  return epochName;
}

/**
 * Retorna a chave de tradução para uma época
 * @param epochName Nome da época em português
 * @returns Chave de tradução ou null se não encontrar
 */
export function getEpochTranslationKey(epochName: string): string | null {
  return EPOCH_TRANSLATION_MAP[epochName] || null;
}

/**
 * Retorna todas as épocas com suas traduções
 * @param language Idioma de destino
 * @returns Array com épocas traduzidas
 */
export function getAllEpochTranslations(
  language: Language
): Array<{ original: string; translated: string }> {
  return Object.keys(EPOCH_TRANSLATIONS).map((epochName) => ({
    original: epochName,
    translated: translateEpochStatic(epochName, language),
  }));
}
