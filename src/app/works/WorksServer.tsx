// app/works/WorksServer.tsx - VERSÃO OTIMIZADA
import { getWorks, getFilterOptions } from '@/app/requests/work-details';
import WorksClient from '../components/WorksClient';

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

export default async function WorksServer({ searchParams }: WorksServerProps) {
  try {
    const page = parseInt(searchParams.page || '1');
    const limit = 32; // 32 obras por página

    // Construir filtros de forma mais limpa
    const filters = {
      ...(searchParams.composer && { composerId: searchParams.composer }),
      ...(searchParams.instrument && { instrumentId: searchParams.instrument }),
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

    // OTIMIZAÇÃO PRINCIPAL: Buscar tudo em paralelo com uma única chamada para filtros
    const [worksData, filterOptions] = await Promise.all([
      getWorks(
        page,
        limit,
        Object.keys(filters).length > 0 ? filters : undefined
      ),
      getFilterOptions(), // Uma única função que retorna todos os filtros
    ]);

    return (
      <WorksClient
        worksData={worksData}
        currentPage={page}
        searchParams={searchParams}
        filterOptions={filterOptions} // Passa todos os filtros de uma vez
      />
    );
  } catch (error) {
    console.error('Erro ao carregar obras:', error);

    // Componente de erro mais informativo
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
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
            Erro ao Carregar Obras
          </h2>

          <p className="text-theme-secondary mb-6">
            Ocorreu um erro inesperado ao carregar as obras. Nossa equipe foi
            notificada.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="btn-classical-primary w-full"
            >
              Tentar Novamente
            </button>

            <button
              onClick={() => window.history.back()}
              className="btn-classical-secondary w-full"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
