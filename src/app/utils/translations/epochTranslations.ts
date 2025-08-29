// ===================================================================
// 2. utils/epochTranslation.ts - Mapeamento das épocas
// ===================================================================

import { Language } from '@/app/stores/useLanguageStore';

// Mapeamento: português (banco) → inglês (interface)
export const EPOCH_TRANSLATION_MAP: Record<string, { pt: string; en: string }> =
  {
    Medieval: { pt: 'Medieval', en: 'Medieval' },
    Renascentista: { pt: 'Renascentista', en: 'Renaissance' },
    Barroco: { pt: 'Barroco', en: 'Baroque' },
    Clássico: { pt: 'Clássico', en: 'Classical' },
    Rômantico: { pt: 'Romântico', en: 'Romantic' },
    Romântico: { pt: 'Romântico', en: 'Romantic' },
    Modernismo: { pt: 'Modernismo', en: 'Modernism' },
    Moderno: { pt: 'Moderno', en: 'Modern' }, // Alias para Modernismo
  };

// Função para traduzir nome da época
export function translateEpochName(
  epochNamePt: string,
  language: Language
): string {
  const translation = EPOCH_TRANSLATION_MAP[epochNamePt];

  if (!translation) {
    console.warn(`Tradução não encontrada para época: ${epochNamePt}`);
    return epochNamePt; // Retorna o original se não encontrar
  }

  return language === 'en' ? translation.en : translation.pt;
}

// Função para traduzir múltiplas épocas
export function translateEpochNames(
  epochNames: string[],
  language: Language
): string[] {
  return epochNames.map((name) => translateEpochName(name, language));
}

// Função reversa: inglês → português (para buscar no banco)
export function getEpochPortugueseName(epochNameEn: string): string {
  const entry = Object.entries(EPOCH_TRANSLATION_MAP).find(
    ([, translation]) => translation.en === epochNameEn
  );

  return entry ? entry[0] : epochNameEn;
}

// Lista de épocas em ordem cronológica (português - como está no banco)
export const EPOCH_CHRONOLOGICAL_ORDER_PT = [
  'Medieval',
  'Renascentista',
  'Barroco',
  'Clássico',
  'Rômantico',
  'Modernismo',
];

// Lista de épocas traduzidas
export function getEpochChronologicalOrder(language: Language): string[] {
  return EPOCH_CHRONOLOGICAL_ORDER_PT.map((epoch) =>
    translateEpochName(epoch, language)
  );
}
