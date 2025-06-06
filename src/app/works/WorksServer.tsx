// app/works/WorksServer.tsx
import { getWorks, getInstruments } from '@/app/requests/work-details';
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
    const limit = 24; // 24 obras por página

    // Construir filtros
    const filters = {
      composerId: searchParams.composer,
      genreId: searchParams.genre,
      instrumentId: searchParams.instrument,
      epochId: searchParams.epoch,
      search: searchParams.search,
      categoryNames: searchParams.categoryNames,
      workGenresArr: searchParams.workGenresArr,
      workGenres: searchParams.workGenres,
    };

    // Remover filtros vazios
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value)
    );

    console.log('cleanFilters', cleanFilters);
    // Buscar obras e instrumentos em paralelo
    const [worksData, instruments] = await Promise.all([
      getWorks(page, limit, cleanFilters),
      getInstruments(),
    ]);

    return (
      <WorksClient
        worksData={worksData}
        currentPage={page}
        searchParams={searchParams}
        instruments={instruments}
      />
    );
  } catch (error) {
    console.error('Erro ao carregar obras:', error);
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Erro ao carregar obras
          </h2>
          <p className="text-red-600">
            Ocorreu um erro ao carregar as obras. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }
}
