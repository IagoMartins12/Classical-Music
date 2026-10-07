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
  Japonês: { pt: 'Japão', en: 'Japan' },
  Japanese: { pt: 'Japão', en: 'Japan' },
};

export const countryOf = (
  nationality: string | null | undefined,
  language: Idioma
) => (nationality ? (COUNTRIES[nationality]?.[language] ?? nationality) : null);
