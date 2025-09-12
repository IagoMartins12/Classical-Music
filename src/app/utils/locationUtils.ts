// utils/locationUtils.ts - VERSÃO OTIMIZADA COM LAZY LOADING
import { LocationData } from '@/app/components/Common/LocationSelector';

// 🚀 DADOS BÁSICOS ESTÁTICOS (mesmos do LocationSelector)
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

// 🚀 LAZY LOADER PARA BIBLIOTECA
let libraryCache: any = null;
let isLoadingLibrary = false;

const loadLocationLibrary = async () => {
  if (libraryCache) return libraryCache;
  if (isLoadingLibrary) {
    // Esperar se já está carregando
    while (isLoadingLibrary) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return libraryCache;
  }

  isLoadingLibrary = true;
  try {
    console.log('🚀 [Utils] Carregando biblioteca country-state-city...');
    const { Country, State, City } = await import('country-state-city');
    libraryCache = { Country, State, City };
    console.log('✅ [Utils] Biblioteca carregada com sucesso');
    return libraryCache;
  } catch (error) {
    console.error('❌ [Utils] Erro ao carregar biblioteca:', error);
    return null;
  } finally {
    isLoadingLibrary = false;
  }
};

/**
 * 🚀 VERSÃO SÍNCRONA BÁSICA - Compatibilidade total com código existente
 * Usa apenas dados básicos, sem carregar biblioteca pesada
 */
export function convertDatabaseToLocationData(data: {
  country?: string | null;
  state?: string | null;
  city?: string | null;
}): LocationData {
  console.log('🔄 [Utils] Convertendo dados do banco (versão básica):', data);

  let countryData: LocationData['country'] = undefined;
  let stateData: LocationData['state'] = undefined;
  let cityData: LocationData['city'] = undefined;

  // 🌍 Tentar resolver país com dados básicos
  if (data.country) {
    const basicCountry = BASIC_COUNTRIES.find(
      (c) =>
        c.name.toLowerCase() === data.country!.toLowerCase() ||
        c.name.toLowerCase().includes(data.country!.toLowerCase()) ||
        data.country!.toLowerCase().includes(c.name.toLowerCase())
    );

    if (basicCountry) {
      countryData = {
        isoCode: basicCountry.isoCode,
        name: basicCountry.name,
        flag: basicCountry.flag,
      };
      console.log('✅ [Utils] País resolvido com dados básicos:', countryData);
    } else {
      // Fallback se não encontrar
      countryData = {
        isoCode: '',
        name: data.country,
        flag: '🏳️',
      };
      console.warn(
        '⚠️ [Utils] País não encontrado nos dados básicos, usando fallback:',
        countryData
      );
    }
  }

  // 🗺️ Para estado/cidade, usar apenas os dados que vieram do banco
  // (não tenta resolver com biblioteca para manter performance)
  if (data.state) {
    stateData = {
      isoCode: '',
      name: data.state,
      countryCode: countryData?.isoCode || '',
    };
    console.log('✅ [Utils] Estado resolvido (modo básico):', stateData);
  }

  if (data.city) {
    cityData = {
      name: data.city,
      stateCode: stateData?.isoCode || '',
      countryCode: countryData?.isoCode || '',
    };
    console.log('✅ [Utils] Cidade resolvida (modo básico):', cityData);
  }

  const result: LocationData = {
    country: countryData,
    state: stateData,
    city: cityData,
  };

  console.log('✅ [Utils] Conversão finalizada (modo básico):', result);
  return result;
}

/**
 * 🚀 NOVA - Versão assíncrona para casos que precisam da biblioteca completa
 * Use esta quando precisar de resolução completa de estados/cidades
 */
export async function convertDatabaseToLocationDataComplete(data: {
  country?: string | null;
  state?: string | null;
  city?: string | null;
}): Promise<LocationData> {
  console.log('🔄 [Utils] Convertendo dados do banco (versão completa):', data);

  // Primeiro tentar versão básica
  const basicResult = convertDatabaseToLocationData(data);

  // Se país não foi resolvido ou precisa de resolução completa de estado/cidade
  if (
    !basicResult.country?.isoCode ||
    (data.state && !basicResult.state?.isoCode)
  ) {
    console.log('🚀 [Utils] Carregando biblioteca completa para resolução...');

    const library = await loadLocationLibrary();
    if (!library) {
      console.warn(
        '❌ [Utils] Não foi possível carregar biblioteca, retornando resultado básico'
      );
      return basicResult;
    }

    let countryData = basicResult.country;
    let stateData = basicResult.state;
    let cityData = basicResult.city;

    // Re-resolver país se necessário
    if (data.country && !basicResult.country?.isoCode) {
      const countries = library.Country.getAllCountries();
      const foundCountry = countries.find(
        (c: any) =>
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
        console.log(
          '✅ [Utils] País resolvido com biblioteca completa:',
          countryData
        );
      }
    }

    // Resolver estado se temos país com isoCode
    if (data.state && countryData?.isoCode) {
      const states = library.State.getStatesOfCountry(countryData.isoCode);
      const foundState = states.find(
        (s: any) =>
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
        console.log(
          '✅ [Utils] Estado resolvido com biblioteca completa:',
          stateData
        );
      }
    }

    // Resolver cidade se temos país e estado com isoCode
    if (data.city && countryData?.isoCode && stateData?.isoCode) {
      const cities = library.City.getCitiesOfState(
        countryData.isoCode,
        stateData.isoCode
      );
      const foundCity = cities.find(
        (c: any) =>
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
        console.log(
          '✅ [Utils] Cidade resolvida com biblioteca completa:',
          cityData
        );
      }
    }

    const result: LocationData = {
      country: countryData,
      state: stateData,
      city: cityData,
    };

    console.log('✅ [Utils] Conversão completa finalizada:', result);
    return result;
  }

  return basicResult;
}

/**
 * Converte LocationData para dados do banco (sem mudanças)
 */
export function convertLocationDataToDatabase(location: LocationData): {
  country?: string;
  state?: string;
  city?: string;
} {
  console.log('🔄 [Utils] Convertendo LocationData para banco:', location);

  const result = {
    country: location.country?.name,
    state: location.state?.name,
    city: location.city?.name,
  };

  console.log('✅ [Utils] Conversão para banco finalizada:', result);
  return result;
}

/**
 * Verifica se os dados de localização estão completos
 */
export function isLocationDataComplete(location: LocationData): boolean {
  const countryComplete = !location.country || !!location.country.isoCode;
  const stateComplete = !location.state || !!location.state.isoCode;
  const cityComplete = !location.city; // Cidade não precisa de isoCode obrigatório

  return countryComplete && stateComplete && cityComplete;
}

/**
 * 🚀 NOVA - Busca melhorada de país (primeiro básicos, depois completos)
 */
export async function findCountryByName(countryName: string) {
  if (!countryName) return null;

  const normalizedName = countryName.toLowerCase().trim();

  // 1. Tentar busca nos dados básicos primeiro
  let found = BASIC_COUNTRIES.find(
    (c) =>
      c.name.toLowerCase() === normalizedName ||
      c.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(c.name.toLowerCase())
  );

  if (found) {
    console.log('✅ [Utils] País encontrado nos dados básicos:', found);
    return {
      isoCode: found.isoCode,
      name: found.name,
      flag: found.flag,
    };
  }

  // 2. Se não encontrar, carregar biblioteca completa
  console.log(
    '🔍 [Utils] País não encontrado nos dados básicos, carregando biblioteca...'
  );
  const library = await loadLocationLibrary();

  if (library) {
    const countries = library.Country.getAllCountries();

    // Busca exata
    found = countries.find((c: any) => c.name.toLowerCase() === normalizedName);
    if (found) return found;

    // Busca parcial
    found = countries.find(
      (c: any) =>
        c.name.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(c.name.toLowerCase())
    );
    if (found) return found;
  }

  return null;
}

/**
 * 🚀 NOVA - Limpar cache da biblioteca (útil para testes)
 */
export function clearLocationLibraryCache() {
  libraryCache = null;
  console.log('🧹 [Utils] Cache da biblioteca limpo');
}

/**
 * 🚀 NOVA - Verificar se biblioteca está carregada
 */
export function isLocationLibraryLoaded(): boolean {
  return !!libraryCache;
}
