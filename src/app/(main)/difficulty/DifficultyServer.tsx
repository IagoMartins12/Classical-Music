// app/difficulty/DifficultyServer.tsx - Servidor

import DifficultyClient from '@/app/components/DifficultyClient';
import {
  getDifficultyWorks,
  getDifficultyStats,
} from '@/app/requests/difficulty-details';

interface DifficultyServerProps {
  searchParams: {
    instrument?: string;
    level?: string;
    system?: string;
    search?: string;
    page?: string;
  };
}

export default async function DifficultyServer({
  searchParams,
}: DifficultyServerProps) {
  try {
    const page = parseInt(searchParams.page || '1');
    const filters = {
      instrumentId: searchParams.instrument || 'all',
      difficultyLevel: searchParams.level || 'all',
      difficultySystem: searchParams.system || 'IMSLP',
      search: searchParams.search,
      page,
      limit: 50,
    };

    // Buscar dados em paralelo
    const [difficultyData, stats] = await Promise.all([
      getDifficultyWorks(filters),
      getDifficultyStats(),
    ]);

    return (
      <DifficultyClient
        difficultyData={difficultyData}
        stats={stats}
        currentPage={page}
        searchParams={searchParams}
      />
    );
  } catch (error) {
    console.error('❌ Erro no DifficultyServer:', error);

    // Fallback
    return (
      <DifficultyClient
        difficultyData={{
          works: [],
          totalCount: 0,
          instruments: [],
          difficultyLevels: [],
          systems: [],
        }}
        stats={{
          totalWorks: 0,
          totalInstruments: 0,
          averageLevel: 0,
          mostCommonLevel: 'N/A',
          systemDistribution: [],
        }}
        currentPage={1}
        searchParams={{}}
      />
    );
  }
}

// ============================================================================
