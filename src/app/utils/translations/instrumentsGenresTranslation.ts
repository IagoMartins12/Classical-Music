// app/utils/translations/instrumentsGenresTranslation.ts
import { Language } from '@/app/stores/useLanguageStore';
import { WORK_GENRE_TRANSLATIONS } from '../../../../scripts/imslp-works-scraper-util';

// Mapeamento de instrumentos (português -> inglês)
const INSTRUMENT_TRANSLATIONS: Record<string, { pt: string; en: string }> = {
  // Instrumentos de cordas
  Violino: { pt: 'Violino', en: 'Violin' },
  Viola: { pt: 'Viola', en: 'Viola' },
  Violoncelo: { pt: 'Violoncelo', en: 'Cello' },
  Contrabaixo: { pt: 'Contrabaixo', en: 'Double Bass' },
  Violão: { pt: 'Violão', en: 'Guitar' },
  Harpa: { pt: 'Harpa', en: 'Harp' },
  Bandolim: { pt: 'Bandolim', en: 'Mandolin' },
  Banjo: { pt: 'Banjo', en: 'Banjo' },
  Alaúde: { pt: 'Alaúde', en: 'Lute' },
  'Quarteto de Cordas': { pt: 'Quarteto de Cordas', en: 'String Quartet' },
  'Orquestra de Cordas': { pt: 'Orquestra de Cordas', en: 'String Orchestra' },
  Cordas: { pt: 'Cordas', en: 'Strings' },

  // Piano e teclados
  Piano: { pt: 'Piano', en: 'Piano' },
  'Piano 4-mãos': { pt: 'Piano 4-mãos', en: 'Piano 4-hands' },
  'Piano a Quatro Mãos': { pt: 'Piano a Quatro Mãos', en: 'Piano Duet' },
  'Piano Duo': { pt: 'Piano Duo', en: 'Piano Duo' },
  '2 Pianos': { pt: '2 Pianos', en: '2 Pianos' },
  Cravo: { pt: 'Cravo', en: 'Harpsichord' },
  Órgão: { pt: 'Órgão', en: 'Organ' },
  Harmônio: { pt: 'Harmônio', en: 'Harmonium' },
  Celesta: { pt: 'Celesta', en: 'Celesta' },
  Teclado: { pt: 'Teclado', en: 'Keyboard' },

  // Instrumentos de sopro - madeiras
  Flauta: { pt: 'Flauta', en: 'Flute' },
  Flautim: { pt: 'Flautim', en: 'Piccolo' },
  Oboé: { pt: 'Oboé', en: 'Oboe' },
  'Corne Inglês': { pt: 'Corne Inglês', en: 'English Horn' },
  Clarinete: { pt: 'Clarinete', en: 'Clarinet' },
  'Clarinete Baixo': { pt: 'Clarinete Baixo', en: 'Bass Clarinet' },
  Fagote: { pt: 'Fagote', en: 'Bassoon' },
  Contrafagote: { pt: 'Contrafagote', en: 'Contrabassoon' },
  Saxofone: { pt: 'Saxofone', en: 'Saxophone' },
  'Flauta Doce': { pt: 'Flauta Doce', en: 'Recorder' },
  Madeiras: { pt: 'Madeiras', en: 'Woodwinds' },

  // Instrumentos de sopro - metais
  Trompete: { pt: 'Trompete', en: 'Trumpet' },
  Trompa: { pt: 'Trompa', en: 'Horn' },
  'Trompa Francesa': { pt: 'Trompa Francesa', en: 'French Horn' },
  Trombone: { pt: 'Trombone', en: 'Trombone' },
  Tuba: { pt: 'Tuba', en: 'Tuba' },
  Corneta: { pt: 'Corneta', en: 'Cornet' },
  Fliscorne: { pt: 'Fliscorne', en: 'Flugelhorn' },
  Eufônio: { pt: 'Eufônio', en: 'Euphonium' },
  Metais: { pt: 'Metais', en: 'Brass' },

  // Percussão
  Tímpanos: { pt: 'Tímpanos', en: 'Timpani' },
  Bateria: { pt: 'Bateria', en: 'Drums' },
  Percussão: { pt: 'Percussão', en: 'Percussion' },
  Xilofone: { pt: 'Xilofone', en: 'Xylophone' },
  Marimba: { pt: 'Marimba', en: 'Marimba' },
  Vibrafone: { pt: 'Vibrafone', en: 'Vibraphone' },
  Triângulo: { pt: 'Triângulo', en: 'Triangle' },
  Pratos: { pt: 'Pratos', en: 'Cymbals' },
  Pandeiro: { pt: 'Pandeiro', en: 'Tambourine' },
  Caixa: { pt: 'Caixa', en: 'Snare Drum' },
  Bumbo: { pt: 'Bumbo', en: 'Bass Drum' },
  Sinos: { pt: 'Sinos', en: 'Bells' },
  Carrilhão: { pt: 'Carrilhão', en: 'Chimes' },
  Gongo: { pt: 'Gongo', en: 'Gong' },

  // Vozes
  Voz: { pt: 'Voz', en: 'Voice' },
  Soprano: { pt: 'Soprano', en: 'Soprano' },
  Contralto: { pt: 'Contralto', en: 'Alto' },
  Tenor: { pt: 'Tenor', en: 'Tenor' },
  Barítono: { pt: 'Barítono', en: 'Baritone' },
  'Meio-soprano': { pt: 'Meio-soprano', en: 'Mezzo-soprano' },
  Coro: { pt: 'Coro', en: 'Choir' },
  Vocal: { pt: 'Vocal', en: 'Vocal' },
  'Coro Misto': { pt: 'Coro Misto', en: 'Mixed Choir' },
  'Coro Masculino': { pt: 'Coro Masculino', en: 'Male Choir' },
  'Coro Feminino': { pt: 'Coro Feminino', en: 'Female Choir' },
  'Coro Infantil': { pt: 'Coro Infantil', en: "Children's Choir" },

  // Conjuntos
  Orquestra: { pt: 'Orquestra', en: 'Orchestra' },
  'Orquestra de Câmara': { pt: 'Orquestra de Câmara', en: 'Chamber Orchestra' },
  'Orquestra Sinfônica': {
    pt: 'Orquestra Sinfônica',
    en: 'Symphony Orchestra',
  },
  'Orquestra Filarmônica': {
    pt: 'Orquestra Filarmônica',
    en: 'Philharmonic Orchestra',
  },
  Banda: { pt: 'Banda', en: 'Band' },
  'Banda de Sopros': { pt: 'Banda de Sopros', en: 'Wind Band' },
  'Banda de Metais': { pt: 'Banda de Metais', en: 'Brass Band' },
  'Banda de Jazz': { pt: 'Banda de Jazz', en: 'Jazz Band' },
  Conjunto: { pt: 'Conjunto', en: 'Ensemble' },
  'Conjunto de Câmara': { pt: 'Conjunto de Câmara', en: 'Chamber Ensemble' },
  'Conjunto de Sopros': { pt: 'Conjunto de Sopros', en: 'Wind Ensemble' },

  // Música de câmara
  Solo: { pt: 'Solo', en: 'Solo' },
  Duo: { pt: 'Duo', en: 'Duet' },
  Trio: { pt: 'Trio', en: 'Trio' },
  Quarteto: { pt: 'Quarteto', en: 'Quartet' },
  Quinteto: { pt: 'Quinteto', en: 'Quintet' },
  Sexteto: { pt: 'Sexteto', en: 'Sextet' },
  Septeto: { pt: 'Septeto', en: 'Septet' },
  Octeto: { pt: 'Octeto', en: 'Octet' },
  Noneto: { pt: 'Noneto', en: 'Nonet' },
  Deceto: { pt: 'Deceto', en: 'Decet' },

  // Instrumentos tradicionais/folclóricos
  'Gaita de Foles': { pt: 'Gaita de Foles', en: 'Bagpipes' },
  Acordeão: { pt: 'Acordeão', en: 'Accordion' },
  Gaita: { pt: 'Gaita', en: 'Harmonica' },
  Concertina: { pt: 'Concertina', en: 'Concertina' },
  Saltério: { pt: 'Saltério', en: 'Dulcimer' },
  Cítara: { pt: 'Cítara', en: 'Zither' },
  'Cítara Indiana': { pt: 'Cítara Indiana', en: 'Sitar' },
  Tabla: { pt: 'Tabla', en: 'Tabla' },
};

/**
 * Traduz o nome de um instrumento
 * @param instrumentName Nome do instrumento em português
 * @param language Idioma de destino
 * @returns Nome do instrumento traduzido
 */
export function translateInstrument(
  instrumentName: string,
  language: Language
): string {
  const translation = INSTRUMENT_TRANSLATIONS[instrumentName];
  if (translation) {
    return language === 'en' ? translation.en : translation.pt;
  }
  // Fallback para o nome original se não encontrar tradução
  return instrumentName;
}

/**
 * Traduz o nome de um gênero - VERSÃO MELHORADA COM BUSCA BIDIRECIONAL
 * @param genreName Nome do gênero em português ou inglês
 * @param language Idioma de destino
 * @returns Nome do gênero traduzido
 */
export function translateGenre(genreName: string, language: Language): string {
  const lowerGenreName = genreName.toLowerCase().trim();

  if (language === 'en') {
    // Português -> Inglês: buscar na tabela de traduções
    const englishKey = Object.keys(WORK_GENRE_TRANSLATIONS).find(
      (key) => WORK_GENRE_TRANSLATIONS[key].toLowerCase() === lowerGenreName
    );
    return englishKey || genreName;
  } else {
    // Inglês -> Português: verificar se é uma chave válida
    const translation = WORK_GENRE_TRANSLATIONS[lowerGenreName];
    if (translation) {
      return translation;
    }

    // Se não encontrou como chave, pode já estar em português
    return genreName;
  }
}

/**
 * Busca bidirecional de gênero - encontra correspondências em ambos os idiomas
 * @param searchTerm Termo de busca
 * @param language Idioma atual
 * @returns Array com termos de busca possíveis
 */
export function getGenreSearchTerms(
  searchTerm: string,
  language: Language
): string[] {
  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  const searchTerms = new Set<string>();

  // Adicionar o termo original
  searchTerms.add(lowerSearchTerm);

  // Buscar traduções diretas
  if (language === 'pt') {
    // Se está em português, buscar equivalente em inglês
    const englishKey = Object.keys(WORK_GENRE_TRANSLATIONS).find(
      (key) =>
        key.toLowerCase().includes(lowerSearchTerm) ||
        WORK_GENRE_TRANSLATIONS[key].toLowerCase().includes(lowerSearchTerm)
    );
    if (englishKey) {
      searchTerms.add(englishKey.toLowerCase());
      searchTerms.add(WORK_GENRE_TRANSLATIONS[englishKey].toLowerCase());
    }
  } else {
    // Se está em inglês, buscar equivalente em português
    Object.entries(WORK_GENRE_TRANSLATIONS).forEach(
      ([englishKey, portugueseValue]) => {
        if (
          englishKey.toLowerCase().includes(lowerSearchTerm) ||
          portugueseValue.toLowerCase().includes(lowerSearchTerm)
        ) {
          searchTerms.add(englishKey.toLowerCase());
          searchTerms.add(portugueseValue.toLowerCase());
        }
      }
    );
  }

  return Array.from(searchTerms);
}

/**
 * Verifica se um gênero corresponde ao termo de busca em qualquer idioma
 * @param genreName Nome do gênero
 * @param searchTerm Termo de busca
 * @param language Idioma atual
 * @returns true se há correspondência
 */
export function matchesGenreSearch(
  genreName: string,
  searchTerm: string,
  language: Language
): boolean {
  const lowerGenreName = genreName.toLowerCase().trim();
  const lowerSearchTerm = searchTerm.toLowerCase().trim();

  // Verificar correspondência direta
  if (lowerGenreName.includes(lowerSearchTerm)) {
    return true;
  }

  // Verificar correspondência na tradução
  const translated = translateGenre(genreName, language);
  if (translated.toLowerCase().includes(lowerSearchTerm)) {
    return true;
  }

  // Verificar correspondência reversa
  const reverseLanguage = language === 'pt' ? 'en' : 'pt';
  const reverseTranslated = translateGenre(genreName, reverseLanguage);
  if (reverseTranslated.toLowerCase().includes(lowerSearchTerm)) {
    return true;
  }

  return false;
}

/**
 * Traduz lista de instrumentos
 * @param instruments Array de instrumentos
 * @param language Idioma de destino
 * @returns Array de instrumentos traduzidos
 */
export function translateInstruments(
  instruments: Array<{ id: string; name: string }>,
  language: Language
): Array<{ id: string; name: string; originalName: string }> {
  return instruments.map((instrument) => ({
    id: instrument.id,
    name: translateInstrument(instrument.name, language),
    originalName: instrument.name,
  }));
}

/**
 * Traduz lista de gêneros
 * @param genres Array de gêneros
 * @param language Idioma de destino
 * @returns Array de gêneros traduzidos
 */
export function translateGenres(
  genres: Array<{ id: string; name: string }>,
  language: Language
): Array<{ id: string; name: string; originalName: string }> {
  return genres.map((genre) => ({
    id: genre.id,
    name: translateGenre(genre.name, language),
    originalName: genre.name,
  }));
}

/**
 * Busca o nome original de um instrumento a partir da tradução
 * @param translatedName Nome traduzido do instrumento
 * @param language Idioma da tradução
 * @returns Nome original em português
 */
export function getOriginalInstrumentName(
  translatedName: string,
  language: Language
): string {
  if (language === 'pt') {
    return translatedName; // Já está em português
  }

  // Buscar o nome original em português
  const originalName = Object.keys(INSTRUMENT_TRANSLATIONS).find(
    (key) =>
      INSTRUMENT_TRANSLATIONS[key].en.toLowerCase() ===
      translatedName.toLowerCase()
  );

  return originalName || translatedName;
}

/**
 * Busca o nome original de um gênero a partir da tradução - VERSÃO MELHORADA
 * @param translatedName Nome traduzido do gênero
 * @param language Idioma da tradução
 * @returns Nome original em português
 */
export function getOriginalGenreName(
  translatedName: string,
  language: Language
): string {
  const lowerTranslatedName = translatedName.toLowerCase().trim();

  if (language === 'pt') {
    // Se já está em português, retornar como está
    return translatedName;
  }

  // Buscar o nome original em português
  const originalName = WORK_GENRE_TRANSLATIONS[lowerTranslatedName];
  if (originalName) {
    return originalName;
  }

  // Se não encontrou tradução exata, buscar por correspondência parcial
  const partialMatch = Object.entries(WORK_GENRE_TRANSLATIONS).find(
    ([englishKey, _portugueseValue]) =>
      englishKey.toLowerCase().includes(lowerTranslatedName) ||
      lowerTranslatedName.includes(englishKey.toLowerCase())
  );

  if (partialMatch) {
    return partialMatch[1]; // Retorna o valor em português
  }

  // Se não encontrou nada, retornar o original
  return translatedName;
}
