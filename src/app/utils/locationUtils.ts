import type { LocationData } from '@/app/components/site/profile/LocationField';

/** The countries people pick most, to recognize a stored name at once. */
const BASIC_COUNTRIES = [
  { isoCode: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { isoCode: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { isoCode: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { isoCode: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { isoCode: 'FR', name: 'França', flag: '🇫🇷' },
  { isoCode: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { isoCode: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { isoCode: 'IT', name: 'Itália', flag: '🇮🇹' },
  { isoCode: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { isoCode: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { isoCode: 'MX', name: 'México', flag: '🇲🇽' },
  { isoCode: 'JP', name: 'Japão', flag: '🇯🇵' },
  { isoCode: 'CN', name: 'China', flag: '🇨🇳' },
  { isoCode: 'IN', name: 'Índia', flag: '🇮🇳' },
  { isoCode: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { isoCode: 'RU', name: 'Rússia', flag: '🇷🇺' },
];

/**
 * The stored names (country, state, city) as the location field's value.
 * Codes the stored names do not carry are recovered by `LocationField`.
 */
export function convertDatabaseToLocationData(data: {
  country?: string | null;
  state?: string | null;
  city?: string | null;
}): LocationData {
  const nome = data.country?.toLowerCase();
  const basico =
    nome &&
    BASIC_COUNTRIES.find(
      (c) =>
        c.name.toLowerCase() === nome ||
        c.name.toLowerCase().includes(nome) ||
        nome.includes(c.name.toLowerCase())
    );
  const country: LocationData['country'] = data.country
    ? basico || { isoCode: '', name: data.country, flag: '🏳️' }
    : undefined;
  const state: LocationData['state'] = data.state
    ? { isoCode: '', name: data.state, countryCode: country?.isoCode || '' }
    : undefined;
  const city: LocationData['city'] = data.city
    ? {
        name: data.city,
        stateCode: state?.isoCode || '',
        countryCode: country?.isoCode || '',
      }
    : undefined;
  return { country, state, city };
}

/** The location field's value as the names the API stores. */
export function convertLocationDataToDatabase(location: LocationData): {
  country?: string;
  state?: string;
  city?: string;
} {
  return {
    country: location.country?.name,
    state: location.state?.name,
    city: location.city?.name,
  };
}
