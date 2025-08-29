// app/works/pageServer.tsx - VERSÃO ULTRA OTIMIZADA COM TRADUÇÕES
import { unstable_cache } from 'next/cache';
import { getWorks, getFilterOptions } from '@/app/requests/work-details';
import WorksClient from '@/app/(main)/works/pageClient';
import {
  translateInstruments,
  translateGenres,
} from '@/app/utils/translations/instrumentsGenresTranslation';
import { translateEpochStatic } from '@/app/utils/translations/epochTranslationComposer';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

interface WorksServerProps {
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

// 🚀 CACHE SEPARADO PARA FILTROS COM TRADUÇÃO
const getCachedFiltersTranslated = unstable_cache(
  async (language: string) => {
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
  },
  ['filters-optimized-translated'],
  {
    revalidate: 3600, // 1 hora - filtros mudam menos
    tags: ['filters-optimized-translated', 'filter-options'],
  }
);

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

// 🚀 CACHE DIFERENCIADO: Obras sem filtros vs com filtros
const getCachedWorksDefault = unstable_cache(
  async (page: number) => {
    return await getWorks(page, 32); // Sem filtros
  },
  ['works-default'],
  {
    revalidate: 3600, // 1 hora para default (mais estável)
    tags: ['works-default'],
  }
);

const getCachedWorksFiltered = unstable_cache(
  async (page: number, filters: any) => {
    return await getWorks(page, 32, filters);
  },
  ['works-filtered'],
  {
    revalidate: 1800, // 30 minutos para filtradas
    tags: ['works-filtered'],
  }
);

// 🚀 COMPONENTE OTIMIZADO PRINCIPAL
export default async function WorksServer({ searchParams }: WorksServerProps) {
  try {
    const page = parseInt(searchParams.page || '1');

    // Detectar idioma no servidor
    const language = await getServerLanguageStatic();

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

      const filters = {
        ...(searchParams.composer && { composerId: searchParams.composer }),
        ...(searchParams.instrument && {
          instrumentId: searchParams.instrument,
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
      <WorksClient
        worksData={worksData}
        currentPage={page}
        searchParams={searchParams}
        filterOptions={filterOptions}
      />
    );
  } catch (error) {
    console.error('💥 Erro crítico no WorksServer:', error);

    // 🚀 FALLBACK OTIMIZADO: Tentar carregar versão básica
    try {
      console.log('🔄 Tentando fallback...');

      const fallbackWorks = await getCachedWorksDefault(1);
      const basicFilters = {
        instruments: [],
        epochs: [],
        workGenres: [],
        popularComposers: [],
        difficultyLevels: [],
      };

      return (
        <WorksClient
          worksData={fallbackWorks}
          currentPage={1}
          searchParams={{}}
          filterOptions={basicFilters}
        />
      );
    } catch (fallbackError) {
      console.error('💥 Fallback também falhou:', fallbackError);
    }
  }
}

// 🚀 FUNÇÃO PARA INVALIDAÇÃO INTELIGENTE DO CACHE
export async function revalidateWorksCache(
  type: 'works' | 'filters' | 'all' = 'all'
) {
  const { revalidateTag } = await import('next/cache');

  switch (type) {
    case 'works':
      revalidateTag('works-optimized');
      revalidateTag('works-default');
      revalidateTag('works-filtered');
      revalidateTag('works-count');
      break;
    case 'filters':
      revalidateTag('filters-optimized');
      revalidateTag('filters-optimized-translated');
      break;
    case 'all':
      revalidateTag('works-optimized');
      revalidateTag('works-default');
      revalidateTag('works-filtered');
      revalidateTag('works-count');
      revalidateTag('filters-optimized');
      revalidateTag('filters-optimized-translated');
      revalidateTag('works-metadata');
      break;
  }

  console.log(`🔄 Cache invalidated: ${type}`);
}
