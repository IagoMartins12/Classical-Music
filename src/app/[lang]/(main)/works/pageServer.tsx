// app/works/pageServer.tsx - VERSÃO ULTRA OTIMIZADA COM TRADUÇÕES - CORRIGIDA
import { getWorks, getFilterOptions } from '@/app/requests/work-details';
import WorksClient from '@/app/[lang]/(main)/works/pageClient';
import {
  translateInstruments,
  translateGenres,
} from '@/app/utils/translations/instrumentsGenresTranslation';
import { translateEpochStatic } from '@/app/utils/translations/epochTranslationComposer';
import {
  loadPageTranslationsWithCommon,
  type Language,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

interface WorksServerProps {
  /** Vem do segmento `[lang]` — ver `routeLanguage`. */
  language: Language;
  searchParams: {
    page?: string;
    composer?: string;
    genre?: string;
    instrument?: string;
    epoch?: string;
    search?: string;
    categoryNames?: string;
    workGenresArr?: string;
    workGenres?: string;
  };
}

/**
 * Filtros traduzidos. **Sem `unstable_cache`:** quem guarda a resposta é o
 * cache do `fetch`, com as tags que a API revalida (`works`, `instruments`,
 * `epochs`, `composers`); a tradução é feita sobre o que ele devolve.
 */
const getCachedFiltersTranslated = async (language: string) => {
  const filterOptions = await getFilterOptions();

  // Traduzir filtros baseado no idioma
  const translatedInstruments = translateInstruments(
    filterOptions.instruments,
    language as any
  ).map((instrument) => ({
    id: instrument.id,
    name: instrument.name, // Nome traduzido
    originalName: instrument.originalName, // Nome original em português
  }));

  const translatedGenres = translateGenres(
    filterOptions.workGenres,
    language as any
  ).map((genre) => ({
    id: genre.id,
    name: genre.name, // Nome traduzido
    originalName: genre.originalName, // Nome original em português
  }));

  const translatedEpochs = filterOptions.epochs.map((epoch) => ({
    id: epoch.id,
    name: epoch.name, // Nome original
    translatedName: translateEpochStatic(epoch.name, language as any),
    originalName: epoch.name,
  }));

  return {
    ...filterOptions,
    instruments: translatedInstruments,
    workGenres: translatedGenres,
    epochs: translatedEpochs,
  };
};

// 🚀 HELPER: Detectar se query tem filtros complexos
function hasComplexFilters(searchParams: any): boolean {
  return !!(
    searchParams.search ||
    searchParams.composer ||
    searchParams.instrument ||
    searchParams.epoch ||
    searchParams.genre ||
    searchParams.workGenresArr ||
    searchParams.categoryNames
  );
}

// 🚀 HELPER: Gerar chave de cache baseada nos filtros
function generateCacheKey(searchParams: any): string {
  const sortedParams = Object.keys(searchParams)
    .filter((key) => searchParams[key] && key !== 'page')
    .sort()
    .map((key) => `${key}:${searchParams[key]}`)
    .join('|');

  return sortedParams || 'default';
}

// A lista de obras vem da API com cache de `fetch` e a tag `works`: a página
// não guarda uma segunda cópia.
const getCachedWorksDefault = (page: number) => getWorks(page, 32);

const getCachedWorksFiltered = (page: number, filters: any) =>
  getWorks(page, 32, filters);

// 🚀 COMPONENTE OTIMIZADO PRINCIPAL
/**
 * O idioma chega de cima (do segmento `[lang]`), não do cookie: ler cookie
 * aqui tornaria a página dinâmica e desligaria o cache — ver
 * `utils/translations/routeLanguage.ts`.
 */
export default async function WorksServer({
  searchParams,
  language,
}: WorksServerProps) {
  /**
   * **Sem `catch` que devolve o catálogo vazio, de propósito.**
   *
   * Esta página é guardada em cache. O caminho anterior tentava um "fallback"
   * — a primeira página sem filtro — e, se ele também falhasse, devolvia
   * `undefined`: nos dois casos o visitante recebia HTTP 200, e o Next
   * guardava. Pior que a lista vazia era o fallback silencioso: quem pedia
   * `?search=chopin` recebia o catálogo inteiro, em cache, sem saber.
   *
   * Deixando o erro subir, o Next devolve 500 e **não guarda nada**: o pedido
   * seguinte tenta de novo.
   */
  const page = parseInt(searchParams.page || '1');

  // Detectar idioma no servidor
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/works',
  ]);
  // 🚀 ESTRATÉGIA 1: Detectar tipo de query
  const hasFilters = hasComplexFilters(searchParams);
  const cacheKey = generateCacheKey(searchParams);

  // 🚀 ESTRATÉGIA 2: Carregamento otimizado baseado no tipo
  let worksPromise;
  let filtersPromise;

  if (!hasFilters) {
    // ✅ SEM FILTROS: Cache mais agressivo + carregamento paralelo otimizado
    console.log('🚀 Modo rápido: sem filtros');

    worksPromise = getCachedWorksDefault(page);
    filtersPromise = getCachedFiltersTranslated(language); // Carrega em paralelo mas não bloqueia
  } else {
    // 🔍 COM FILTROS: Cache específico + otimizações
    console.log('🔍 Modo filtrado:', cacheKey);

    // 🔧 CORREÇÃO: Mapear corretamente os filtros
    const filters = {
      ...(searchParams.composer && { composerId: searchParams.composer }),
      // ✅ USAR ID para instrument corretamente
      ...(searchParams.instrument && {
        instrumentId: searchParams.instrument, // Agora recebe o ID
      }),
      ...(searchParams.epoch && { epochId: searchParams.epoch }),
      ...(searchParams.genre && { workGenreId: searchParams.genre }),
      ...(searchParams.search && { search: searchParams.search }),
      ...(searchParams.categoryNames && {
        categoryNames: searchParams.categoryNames,
      }),
      ...(searchParams.workGenresArr && {
        workGenresArr: searchParams.workGenresArr,
      }),
    };

    worksPromise = getCachedWorksFiltered(page, filters);
    filtersPromise = getCachedFiltersTranslated(language);
  }

  // 🚀 ESTRATÉGIA 3: Execução paralela com timeout de proteção
  const results = await Promise.allSettled([worksPromise, filtersPromise]);

  // Verificar resultados
  const worksResult = results[0];
  const filtersResult = results[1];

  if (worksResult.status === 'rejected') {
    console.error('❌ Erro ao buscar obras:', worksResult.reason);
    throw new Error('Falha ao carregar obras');
  }

  if (filtersResult.status === 'rejected') {
    console.error('❌ Erro ao buscar filtros:', filtersResult.reason);
    // Filtros são menos críticos, pode continuar com filtros vazios
  }

  const worksData = worksResult.value;
  const filterOptions =
    filtersResult.status === 'fulfilled'
      ? filtersResult.value
      : {
          instruments: [],
          epochs: [],
          workGenres: [],
          popularComposers: [],
          difficultyLevels: [],
        };

  console.log('✅ Dados carregados:', {
    worksCount: worksData.works.length,
    totalCount: worksData.totalCount,
    hasFilters: Object.keys(filterOptions).length > 0,
    language: language,
  });

  return (
    <TranslationProvider language={language} translations={translations}>
      <WorksClient
        worksData={worksData}
        currentPage={page}
        searchParams={searchParams}
        filterOptions={filterOptions}
      />
    </TranslationProvider>
  );
}
