// utils/locationUtils.ts - Funções utilitárias para conversão entre formatos de localização
import { Country, State, City } from 'country-state-city';
import { LocationData } from '@/app/components/Common/LocationSelector';

/**
 * Converte strings simples do banco de dados para objetos completos do LocationSelector
 * Resolve isoCode e flag usando a biblioteca country-state-city
 */
export function convertDatabaseToLocationData(data: {
  country?: string | null;
  state?: string | null;
  city?: string | null;
}): LocationData {
  console.log('🔄 Convertendo dados do banco para LocationData:', data);

  let countryData: LocationData['country'] = undefined;
  let stateData: LocationData['state'] = undefined;
  let cityData: LocationData['city'] = undefined;

  // 🌍 Resolver país
  if (data.country) {
    // Buscar país por nome (pode ser em português ou inglês)
    const countries = Country.getAllCountries();
    const foundCountry = countries.find(
      (c) =>
        c.name.toLowerCase() === data.country!.toLowerCase() ||
        c.name.toLowerCase().includes(data.country!.toLowerCase()) ||
        data.country!.toLowerCase().includes(c.name.toLowerCase())
    );

    if (foundCountry) {
      countryData = {
        isoCode: foundCountry.isoCode,
        name: foundCountry.name,
        flag: foundCountry.flag,
      };
      console.log('✅ País resolvido:', countryData);
    } else {
      // Fallback se não encontrar o país exato
      countryData = {
        isoCode: '',
        name: data.country,
        flag: '🏳️',
      };
      console.warn('⚠️ País não encontrado, usando fallback:', countryData);
    }
  }

  // 🗺️ Resolver estado (apenas se país foi encontrado)
  if (data.state && countryData?.isoCode) {
    const states = State.getStatesOfCountry(countryData.isoCode);
    const foundState = states.find(
      (s) =>
        s.name.toLowerCase() === data.state!.toLowerCase() ||
        s.name.toLowerCase().includes(data.state!.toLowerCase()) ||
        data.state!.toLowerCase().includes(s.name.toLowerCase())
    );

    if (foundState) {
      stateData = {
        isoCode: foundState.isoCode,
        name: foundState.name,
        countryCode: foundState.countryCode,
      };
      console.log('✅ Estado resolvido:', stateData);
    } else {
      // Fallback se não encontrar o estado exato
      stateData = {
        isoCode: '',
        name: data.state,
        countryCode: countryData.isoCode,
      };
      console.warn('⚠️ Estado não encontrado, usando fallback:', stateData);
    }
  }

  // 🏙️ Resolver cidade (apenas se estado foi encontrado)
  if (data.city && countryData?.isoCode && stateData?.isoCode) {
    const cities = City.getCitiesOfState(
      countryData.isoCode,
      stateData.isoCode
    );
    const foundCity = cities.find(
      (c) =>
        c.name.toLowerCase() === data.city!.toLowerCase() ||
        c.name.toLowerCase().includes(data.city!.toLowerCase()) ||
        data.city!.toLowerCase().includes(c.name.toLowerCase())
    );

    if (foundCity) {
      cityData = {
        name: foundCity.name,
        stateCode: foundCity.stateCode,
        countryCode: foundCity.countryCode,
      };
      console.log('✅ Cidade resolvida:', cityData);
    } else {
      // Fallback se não encontrar a cidade exata
      cityData = {
        name: data.city,
        stateCode: stateData.isoCode,
        countryCode: countryData.isoCode,
      };
      console.warn('⚠️ Cidade não encontrada, usando fallback:', cityData);
    }
  }

  const result: LocationData = {
    country: countryData,
    state: stateData,
    city: cityData,
  };

  console.log('✅ Conversão finalizada:', result);
  return result;
}

/**
 * Converte objetos completos do LocationSelector para strings simples do banco
 */
export function convertLocationDataToDatabase(location: LocationData): {
  country?: string;
  state?: string;
  city?: string;
} {
  console.log('🔄 Convertendo LocationData para banco:', location);

  const result = {
    country: location.country?.name,
    state: location.state?.name,
    city: location.city?.name,
  };

  console.log('✅ Conversão para banco finalizada:', result);
  return result;
}

/**
 * Verifica se os dados de localização estão completos (têm isoCode)
 */
export function isLocationDataComplete(location: LocationData): boolean {
  const countryComplete = !location.country || !!location.country.isoCode;
  const stateComplete = !location.state || !!location.state.isoCode;
  const cityComplete = !location.city; // Cidade não precisa de isoCode obrigatório

  return countryComplete && stateComplete && cityComplete;
}

/**
 * Mapeamento de países comuns para casos onde a biblioteca não encontra
 */
const COMMON_COUNTRY_MAPPINGS: Record<
  string,
  { isoCode: string; flag: string }
> = {
  brasil: { isoCode: 'BR', flag: '🇧🇷' },
  brazil: { isoCode: 'BR', flag: '🇧🇷' },
  'estados unidos': { isoCode: 'US', flag: '🇺🇸' },
  'united states': { isoCode: 'US', flag: '🇺🇸' },
  portugal: { isoCode: 'PT', flag: '🇵🇹' },
  argentina: { isoCode: 'AR', flag: '🇦🇷' },
  frança: { isoCode: 'FR', flag: '🇫🇷' },
  france: { isoCode: 'FR', flag: '🇫🇷' },
  alemanha: { isoCode: 'DE', flag: '🇩🇪' },
  germany: { isoCode: 'DE', flag: '🇩🇪' },
  espanha: { isoCode: 'ES', flag: '🇪🇸' },
  spain: { isoCode: 'ES', flag: '🇪🇸' },
  itália: { isoCode: 'IT', flag: '🇮🇹' },
  italy: { isoCode: 'IT', flag: '🇮🇹' },
  'reino unido': { isoCode: 'GB', flag: '🇬🇧' },
  'united kingdom': { isoCode: 'GB', flag: '🇬🇧' },
  canadá: { isoCode: 'CA', flag: '🇨🇦' },
  canada: { isoCode: 'CA', flag: '🇨🇦' },
  japão: { isoCode: 'JP', flag: '🇯🇵' },
  japan: { isoCode: 'JP', flag: '🇯🇵' },
  china: { isoCode: 'CN', flag: '🇨🇳' },
  índia: { isoCode: 'IN', flag: '🇮🇳' },
  india: { isoCode: 'IN', flag: '🇮🇳' },
  austrália: { isoCode: 'AU', flag: '🇦🇺' },
  australia: { isoCode: 'AU', flag: '🇦🇺' },
  méxico: { isoCode: 'MX', flag: '🇲🇽' },
  mexico: { isoCode: 'MX', flag: '🇲🇽' },
  rússia: { isoCode: 'RU', flag: '🇷🇺' },
  russia: { isoCode: 'RU', flag: '🇷🇺' },
};

/**
 * Busca melhorada de país com fallbacks e mapeamentos
 */
export function findCountryByName(countryName: string) {
  if (!countryName) return null;

  const normalizedName = countryName.toLowerCase().trim();

  // 1. Tentar busca exata na biblioteca
  const countries = Country.getAllCountries();
  let found = countries.find((c) => c.name.toLowerCase() === normalizedName);

  if (found) return found;

  // 2. Tentar busca parcial na biblioteca
  found = countries.find(
    (c) =>
      c.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(c.name.toLowerCase())
  );

  if (found) return found;

  // 3. Verificar mapeamentos customizados
  const mapping = COMMON_COUNTRY_MAPPINGS[normalizedName];
  if (mapping) {
    const mappedCountry = countries.find((c) => c.isoCode === mapping.isoCode);
    if (mappedCountry) return mappedCountry;
  }

  return null;
}
