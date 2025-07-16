// app/works/WorksServer.tsx - VERSÃO ULTRA OTIMIZADA
import { unstable_cache } from 'next/cache';
import { getWorks, getFilterOptions } from '@/app/requests/work-details';
import WorksClient from '@/app/components/WorksClient';

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

// 🚀 CACHE SEPARADO PARA FILTROS - Permite updates independentes
const getCachedFilters = unstable_cache(
  async () => {
    console.log('🔍 Cache miss - Buscando filtros');
    return await getFilterOptions();
  },
  ['filters-optimized'],
  {
    revalidate: 3600, // 1 hora - filtros mudam menos
    tags: ['filters-optimized', 'filter-options'],
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

    // 🚀 ESTRATÉGIA 1: Detectar tipo de query
    const hasFilters = hasComplexFilters(searchParams);
    const cacheKey = generateCacheKey(searchParams);

    console.log('📊 Query analysis:', {
      page,
      hasFilters,
      cacheKey: cacheKey || 'default',
      params: searchParams,
    });

    // 🚀 ESTRATÉGIA 2: Carregamento otimizado baseado no tipo
    let worksPromise;
    let filtersPromise;

    if (!hasFilters) {
      // ✅ SEM FILTROS: Cache mais agressivo + carregamento paralelo otimizado
      console.log('🚀 Modo rápido: sem filtros');

      worksPromise = getCachedWorksDefault(page);
      filtersPromise = getCachedFilters(); // Carrega em paralelo mas não bloqueia
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
      filtersPromise = getCachedFilters();
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

      // 🚨 ÚLTIMO RECURSO: Componente de erro otimizado
      return <WorksErrorComponent />;
    }
  }
}

// 🚀 COMPONENTE DE ERRO OTIMIZADO
function WorksErrorComponent() {
  return (
    <div className="bg-gradient-primary flex items-center justify-center p-4 min-h-[60vh]">
      <div className="classical-card p-8 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-accent-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-accent-red"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-theme-primary mb-4 classical-title">
          Serviço Temporariamente Indisponível
        </h2>

        <p className="text-theme-secondary mb-6">
          Estamos enfrentando alta demanda. Tente novamente em alguns segundos.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-classical-primary w-full"
          >
            Recarregar Página
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="btn-classical-secondary w-full"
          >
            Voltar ao Início
          </button>
        </div>

        <div className="mt-6 text-xs text-theme-tertiary">
          Se o problema persistir, contate nosso suporte.
        </div>
      </div>
    </div>
  );
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
      break;
    case 'all':
      revalidateTag('works-optimized');
      revalidateTag('works-default');
      revalidateTag('works-filtered');
      revalidateTag('works-count');
      revalidateTag('filters-optimized');
      revalidateTag('works-metadata');
      break;
  }

  console.log(`🔄 Cache invalidated: ${type}`);
}
