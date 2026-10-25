import type { Idioma } from '../legal/tipos';

/**
 * `Composer.nationality` is stored as an English demonym ("German") — and a
 * few Portuguese ones from manual uploads. The page shows the country.
 */
const COUNTRIES: Record<string, Record<Idioma, string>> = {
  German: { pt: 'Alemanha', en: 'Germany' },
  Alemão: { pt: 'Alemanha', en: 'Germany' },
  American: { pt: 'Estados Unidos', en: 'United States' },
  French: { pt: 'França', en: 'France' },
  Francês: { pt: 'França', en: 'France' },
  English: { pt: 'Inglaterra', en: 'England' },
  Italian: { pt: 'Itália', en: 'Italy' },
  Austrian: { pt: 'Áustria', en: 'Austria' },
  Russian: { pt: 'Rússia', en: 'Russia' },
  Brazilian: { pt: 'Brasil', en: 'Brazil' },
  Polish: { pt: 'Polônia', en: 'Poland' },
  Spanish: { pt: 'Espanha', en: 'Spain' },
  Belgian: { pt: 'Bélgica', en: 'Belgium' },
  Danish: { pt: 'Dinamarca', en: 'Denmark' },
  Czech: { pt: 'Tchéquia', en: 'Czechia' },
  Dutch: { pt: 'Países Baixos', en: 'Netherlands' },
  Hungarian: { pt: 'Hungria', en: 'Hungary' },
  Swedish: { pt: 'Suécia', en: 'Sweden' },
  Swiss: { pt: 'Suíça', en: 'Switzerland' },
  Norwegian: { pt: 'Noruega', en: 'Norway' },
  Finnish: { pt: 'Finlândia', en: 'Finland' },
  Japanese: { pt: 'Japão', en: 'Japan' },
  Japonês: { pt: 'Japão', en: 'Japan' },
  Argentine: { pt: 'Argentina', en: 'Argentina' },
  Australian: { pt: 'Austrália', en: 'Australia' },
  Bulgarian: { pt: 'Bulgária', en: 'Bulgaria' },
  Canadian: { pt: 'Canadá', en: 'Canada' },
  Chilean: { pt: 'Chile', en: 'Chile' },
  Chinese: { pt: 'China', en: 'China' },
  Colombian: { pt: 'Colômbia', en: 'Colombia' },
  Croatian: { pt: 'Croácia', en: 'Croatia' },
  Cuban: { pt: 'Cuba', en: 'Cuba' },
  Ecuadorian: { pt: 'Equador', en: 'Ecuador' },
  Estonian: { pt: 'Estônia', en: 'Estonia' },
  Filipino: { pt: 'Filipinas', en: 'Philippines' },
  Greek: { pt: 'Grécia', en: 'Greece' },
  Haitian: { pt: 'Haiti', en: 'Haiti' },
  Icelandic: { pt: 'Islândia', en: 'Iceland' },
  Indian: { pt: 'Índia', en: 'India' },
  Irish: { pt: 'Irlanda', en: 'Ireland' },
  Israeli: { pt: 'Israel', en: 'Israel' },
  Korean: { pt: 'Coreia do Sul', en: 'South Korea' },
  Latvian: { pt: 'Letônia', en: 'Latvia' },
  Lithuanian: { pt: 'Lituânia', en: 'Lithuania' },
  Luxembourgish: { pt: 'Luxemburgo', en: 'Luxembourg' },
  Mexican: { pt: 'México', en: 'Mexico' },
  'New Zealander': { pt: 'Nova Zelândia', en: 'New Zealand' },
  Paraguayan: { pt: 'Paraguai', en: 'Paraguay' },
  Peruvian: { pt: 'Peru', en: 'Peru' },
  Portuguese: { pt: 'Portugal', en: 'Portugal' },
  Romanian: { pt: 'Romênia', en: 'Romania' },
  Scottish: { pt: 'Escócia', en: 'Scotland' },
  Serbian: { pt: 'Sérvia', en: 'Serbia' },
  Slovak: { pt: 'Eslováquia', en: 'Slovakia' },
  Slovenian: { pt: 'Eslovênia', en: 'Slovenia' },
  Taiwanese: { pt: 'Taiwan', en: 'Taiwan' },
  Turkish: { pt: 'Turquia', en: 'Turkey' },
  Ukrainian: { pt: 'Ucrânia', en: 'Ukraine' },
  Uruguayan: { pt: 'Uruguai', en: 'Uruguay' },
  Venezuelan: { pt: 'Venezuela', en: 'Venezuela' },
  Welsh: { pt: 'País de Gales', en: 'Wales' },
};

export const countryOf = (
  nationality: string | null | undefined,
  language: Idioma
) => (nationality ? (COUNTRIES[nationality]?.[language] ?? nationality) : null);

/**
 * The stored demonym the select uses for `nationality` ("Alemão" →
 * "German"): the first spelling of its country. Unknown values come back as
 * they are, so the select can still show them.
 */
export function canonicalNationality(nationality: string | null | undefined) {
  if (!nationality) return '';
  const country = COUNTRIES[nationality]?.en;
  if (!country) return nationality;
  return (
    Object.entries(COUNTRIES).find(([, names]) => names.en === country)?.[0] ??
    nationality
  );
}

/**
 * Countries for the list filter: one entry per country, with every stored
 * spelling of its demonym (`German`, `Alemão`). The URL carries the first.
 */
export function countryFilters(language: Idioma) {
  const byCountry = new Map<
    string,
    { value: string; label: string; demonyms: string[] }
  >();
  for (const [demonym, names] of Object.entries(COUNTRIES)) {
    const entry = byCountry.get(names.en);
    if (entry) entry.demonyms.push(demonym);
    else
      byCountry.set(names.en, {
        value: demonym,
        label: names[language],
        demonyms: [demonym],
      });
  }
  return [...byCountry.values()].sort((a, b) =>
    a.label.localeCompare(b.label, language)
  );
}

/**
 * Countries for the nationality select: the stored demonym as value
 * ("German"), the country in the page's language as label. A stored value
 * the list does not know stays as an option, so the field never shows empty.
 */
export function nationalityOptions(language: Idioma, current: string) {
  const options = countryFilters(language).map((c) => ({
    value: c.value,
    label: c.label,
  }));
  return current && !options.some((o) => o.value === current)
    ? [{ value: current, label: current }, ...options]
    : options;
}
