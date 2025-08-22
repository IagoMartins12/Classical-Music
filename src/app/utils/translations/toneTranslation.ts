// app/utils/toneTranslation.ts
import { Language } from '@/app/stores/useLanguageStore';

// Mapeamento de tonalidades em português para chaves de tradução
const TONE_TRANSLATION_MAP: Record<string, string> = {
  'Do maior': 'tone_do_maior',
  'Do menor': 'tone_do_menor',
  'Do# maior': 'tone_dos_maior',
  'Do# menor': 'tone_dos_menor',
  'Reb maior': 'tone_reb_maior',
  'Reb menor': 'tone_reb_menor',
  'Re maior': 'tone_re_maior',
  'Re menor': 'tone_re_menor',
  'Re# maior': 'tone_res_maior',
  'Re# menor': 'tone_res_menor',
  'Mib maior': 'tone_mib_maior',
  'Mib menor': 'tone_mib_menor',
  'Mi maior': 'tone_mi_maior',
  'Mi menor': 'tone_mi_menor',
  'Fa maior': 'tone_fa_maior',
  'Fa menor': 'tone_fa_menor',
  'Fa# maior': 'tone_fas_maior',
  'Fa# menor': 'tone_fas_menor',
  'Solb maior': 'tone_solb_maior',
  'Solb menor': 'tone_solb_menor',
  'Sol maior': 'tone_sol_maior',
  'Sol menor': 'tone_sol_menor',
  'Sol# maior': 'tone_sols_maior',
  'Sol# menor': 'tone_sols_menor',
  'Lab maior': 'tone_lab_maior',
  'Lab menor': 'tone_lab_menor',
  'La maior': 'tone_la_maior',
  'La menor': 'tone_la_menor',
  'La# maior': 'tone_las_maior',
  'La# menor': 'tone_las_menor',
  'Sib maior': 'tone_sib_maior',
  'Sib menor': 'tone_sib_menor',
  'Si maior': 'tone_si_maior',
  'Si menor': 'tone_si_menor',
  Dórico: 'tone_dorico',
  Frígio: 'tone_frigio',
  Lídio: 'tone_lidio',
  Mixolídio: 'tone_mixolidio',
  Eólio: 'tone_eolio',
  Lócrio: 'tone_locrio',
  Atonal: 'tone_atonal',
  Politonal: 'tone_politonal',
  Modal: 'tone_modal',
  Cromática: 'tone_cromatica',
  Dodecafônica: 'tone_dodecafonica',
  Pentatônica: 'tone_pentatonica',
  'Não especificada': 'tone_nao_especificada',

  // Variações possíveis em inglês
  'C major': 'tone_do_maior',
  'C minor': 'tone_do_menor',
  'C# major': 'tone_dos_maior',
  'C# minor': 'tone_dos_menor',
  'Db major': 'tone_reb_maior',
  'Db minor': 'tone_reb_menor',
  'D major': 'tone_re_maior',
  'D minor': 'tone_re_menor',
  'D# major': 'tone_res_maior',
  'D# minor': 'tone_res_menor',
  'Eb major': 'tone_mib_maior',
  'Eb minor': 'tone_mib_menor',
  'E major': 'tone_mi_maior',
  'E minor': 'tone_mi_menor',
  'F major': 'tone_fa_maior',
  'F minor': 'tone_fa_menor',
  'F# major': 'tone_fas_maior',
  'F# minor': 'tone_fas_menor',
  'Gb major': 'tone_solb_maior',
  'Gb minor': 'tone_solb_menor',
  'G major': 'tone_sol_maior',
  'G minor': 'tone_sol_menor',
  'G# major': 'tone_sols_maior',
  'G# minor': 'tone_sols_menor',
  'Ab major': 'tone_lab_maior',
  'Ab minor': 'tone_lab_menor',
  'A major': 'tone_la_maior',
  'A minor': 'tone_la_menor',
  'A# major': 'tone_las_maior',
  'A# minor': 'tone_las_menor',
  'Bb major': 'tone_sib_maior',
  'Bb minor': 'tone_sib_menor',
  'B major': 'tone_si_maior',
  'B minor': 'tone_si_menor',
  Dorian: 'tone_dorico',
  Phrygian: 'tone_frigio',
  Lydian: 'tone_lidio',
  Mixolydian: 'tone_mixolidio',
  Aeolian: 'tone_eolio',
  Locrian: 'tone_locrio',
  Polytonal: 'tone_politonal',
  Chromatic: 'tone_cromatica',
  'Twelve-tone': 'tone_dodecafonica',
  Pentatonic: 'tone_pentatonica',
  'Not specified': 'tone_nao_especificada',
};

// Traduções estáticas para fallback (quando useTranslation não está disponível)
const TONE_TRANSLATIONS: Record<string, { pt: string; en: string }> = {
  'Do maior': { pt: 'Dó maior', en: 'C major' },
  'Do menor': { pt: 'Dó menor', en: 'C minor' },
  'Do# maior': { pt: 'Dó# maior', en: 'C# major' },
  'Do# menor': { pt: 'Dó# menor', en: 'C# minor' },
  'Reb maior': { pt: 'Réb maior', en: 'Db major' },
  'Reb menor': { pt: 'Réb menor', en: 'Db minor' },
  'Re maior': { pt: 'Ré maior', en: 'D major' },
  'Re menor': { pt: 'Ré menor', en: 'D minor' },
  'Re# maior': { pt: 'Ré# maior', en: 'D# major' },
  'Re# menor': { pt: 'Ré# menor', en: 'D# minor' },
  'Mib maior': { pt: 'Mib maior', en: 'Eb major' },
  'Mib menor': { pt: 'Mib menor', en: 'Eb minor' },
  'Mi maior': { pt: 'Mi maior', en: 'E major' },
  'Mi menor': { pt: 'Mi menor', en: 'E minor' },
  'Fa maior': { pt: 'Fá maior', en: 'F major' },
  'Fa menor': { pt: 'Fá menor', en: 'F minor' },
  'Fa# maior': { pt: 'Fá# maior', en: 'F# major' },
  'Fa# menor': { pt: 'Fá# menor', en: 'F# minor' },
  'Solb maior': { pt: 'Solb maior', en: 'Gb major' },
  'Solb menor': { pt: 'Solb menor', en: 'Gb minor' },
  'Sol maior': { pt: 'Sol maior', en: 'G major' },
  'Sol menor': { pt: 'Sol menor', en: 'G minor' },
  'Sol# maior': { pt: 'Sol# maior', en: 'G# major' },
  'Sol# menor': { pt: 'Sol# menor', en: 'G# minor' },
  'Lab maior': { pt: 'Láb maior', en: 'Ab major' },
  'Lab menor': { pt: 'Láb menor', en: 'Ab minor' },
  'La maior': { pt: 'Lá maior', en: 'A major' },
  'La menor': { pt: 'Lá menor', en: 'A minor' },
  'La# maior': { pt: 'Lá# maior', en: 'A# major' },
  'La# menor': { pt: 'Lá# menor', en: 'A# minor' },
  'Sib maior': { pt: 'Sib maior', en: 'Bb major' },
  'Sib menor': { pt: 'Sib menor', en: 'Bb minor' },
  'Si maior': { pt: 'Si maior', en: 'B major' },
  'Si menor': { pt: 'Si menor', en: 'B minor' },
  Dórico: { pt: 'Dórico', en: 'Dorian' },
  Frígio: { pt: 'Frígio', en: 'Phrygian' },
  Lídio: { pt: 'Lídio', en: 'Lydian' },
  Mixolídio: { pt: 'Mixolídio', en: 'Mixolydian' },
  Eólio: { pt: 'Eólio', en: 'Aeolian' },
  Lócrio: { pt: 'Lócrio', en: 'Locrian' },
  Atonal: { pt: 'Atonal', en: 'Atonal' },
  Politonal: { pt: 'Politonal', en: 'Polytonal' },
  Modal: { pt: 'Modal', en: 'Modal' },
  Cromática: { pt: 'Cromática', en: 'Chromatic' },
  Dodecafônica: { pt: 'Dodecafônica', en: 'Twelve-tone' },
  Pentatônica: { pt: 'Pentatônica', en: 'Pentatonic' },
  'Não especificada': { pt: 'Não especificada', en: 'Not specified' },

  // Versões em inglês que podem vir do banco
  'C major': { pt: 'Dó maior', en: 'C major' },
  'C minor': { pt: 'Dó menor', en: 'C minor' },
  'C# major': { pt: 'Dó# maior', en: 'C# major' },
  'C# minor': { pt: 'Dó# menor', en: 'C# minor' },
  'Db major': { pt: 'Réb maior', en: 'Db major' },
  'Db minor': { pt: 'Réb menor', en: 'Db minor' },
  'D major': { pt: 'Ré maior', en: 'D major' },
  'D minor': { pt: 'Ré menor', en: 'D minor' },
  'D# major': { pt: 'Ré# maior', en: 'D# major' },
  'D# minor': { pt: 'Ré# menor', en: 'D# minor' },
  'Eb major': { pt: 'Mib maior', en: 'Eb major' },
  'Eb minor': { pt: 'Mib menor', en: 'Eb minor' },
  'E major': { pt: 'Mi maior', en: 'E major' },
  'E minor': { pt: 'Mi menor', en: 'E minor' },
  'F major': { pt: 'Fá maior', en: 'F major' },
  'F minor': { pt: 'Fá menor', en: 'F minor' },
  'F# major': { pt: 'Fá# maior', en: 'F# major' },
  'F# minor': { pt: 'Fá# menor', en: 'F# minor' },
  'Gb major': { pt: 'Solb maior', en: 'Gb major' },
  'Gb minor': { pt: 'Solb menor', en: 'Gb minor' },
  'G major': { pt: 'Sol maior', en: 'G major' },
  'G minor': { pt: 'Sol menor', en: 'G minor' },
  'G# major': { pt: 'Sol# maior', en: 'G# major' },
  'G# minor': { pt: 'Sol# menor', en: 'G# minor' },
  'Ab major': { pt: 'Láb maior', en: 'Ab major' },
  'Ab minor': { pt: 'Láb menor', en: 'Ab minor' },
  'A major': { pt: 'Lá maior', en: 'A major' },
  'A minor': { pt: 'Lá menor', en: 'A minor' },
  'A# major': { pt: 'Lá# maior', en: 'A# major' },
  'A# minor': { pt: 'Lá# menor', en: 'A# minor' },
  'Bb major': { pt: 'Sib maior', en: 'Bb major' },
  'Bb minor': { pt: 'Sib menor', en: 'Bb minor' },
  'B major': { pt: 'Si maior', en: 'B major' },
  'B minor': { pt: 'Si menor', en: 'B minor' },
  Dorian: { pt: 'Dórico', en: 'Dorian' },
  Phrygian: { pt: 'Frígio', en: 'Phrygian' },
  Lydian: { pt: 'Lídio', en: 'Lydian' },
  Mixolydian: { pt: 'Mixolídio', en: 'Mixolydian' },
  Aeolian: { pt: 'Eólio', en: 'Aeolian' },
  Locrian: { pt: 'Lócrio', en: 'Locrian' },
  Polytonal: { pt: 'Politonal', en: 'Polytonal' },
  Chromatic: { pt: 'Cromática', en: 'Chromatic' },
  'Twelve-tone': { pt: 'Dodecafônica', en: 'Twelve-tone' },
  Pentatonic: { pt: 'Pentatônica', en: 'Pentatonic' },
  'Not specified': { pt: 'Não especificada', en: 'Not specified' },
};

/**
 * Traduz o nome de uma tonalidade usando a função de tradução do hook
 * @param toneName Nome da tonalidade em português (como vem do banco)
 * @param t Função de tradução do useTranslation
 * @returns Nome da tonalidade traduzido
 */
export function translateToneWithHook(
  toneName: string,
  t: (key: string) => string
): string {
  const translationKey = TONE_TRANSLATION_MAP[toneName];
  if (translationKey) {
    return t(translationKey);
  }
  // Fallback para o nome original se não encontrar tradução
  return toneName;
}

/**
 * Traduz o nome de uma tonalidade sem usar hook (para uso em server components)
 * @param toneName Nome da tonalidade em português (como vem do banco)
 * @param language Idioma de destino
 * @returns Nome da tonalidade traduzido
 */
export function translateToneStatic(
  toneName: string,
  language: Language
): string {
  const translation = TONE_TRANSLATIONS[toneName];
  if (translation) {
    return language === 'en' ? translation.en : translation.pt;
  }
  // Fallback para o nome original se não encontrar tradução
  return toneName;
}

/**
 * Retorna a chave de tradução para uma tonalidade
 * @param toneName Nome da tonalidade
 * @returns Chave de tradução ou null se não encontrar
 */
export function getToneTranslationKey(toneName: string): string | null {
  return TONE_TRANSLATION_MAP[toneName] || null;
}

/**
 * Retorna todas as tonalidades com suas traduções
 * @param language Idioma de destino
 * @returns Array com tonalidades traduzidas
 */
export function getAllToneTranslations(
  language: Language
): Array<{ original: string; translated: string }> {
  return Object.keys(TONE_TRANSLATIONS)
    .filter((key) => !key.includes('C major') && !key.includes('C minor')) // Evitar duplicatas
    .map((toneName) => ({
      original: toneName,
      translated: translateToneStatic(toneName, language),
    }));
}
