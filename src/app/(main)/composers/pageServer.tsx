// app/main/composers/pageServer.tsx
import ComposersClient from '@/app/(main)/composers/pageClient';
import {
  getComposersCountTranslated,
  getComposersWithPaginationTranslated,
  getEpochsCacheTranslated,
} from '@/app/requests/composers-translated';
import { getServerLanguage } from '@/app/utils/translations/serverTranslation';

const ITEMS_PER_PAGE = 30;

export default async function ComposersPageServer({
  page,
  search,
  epochId,
}: {
  page: number;
  search: string;
  epochId: string;
}) {
  try {
    // Detectar idioma no servidor
    const language = await getServerLanguage();

    // Executar requests com idioma - todas as funções já retornam dados traduzidos
    const [composersData, epochsData, totalCount] = await Promise.all([
      getComposersWithPaginationTranslated(
        {
          page,
          limit: ITEMS_PER_PAGE,
          search,
          epochId,
        },
        language
      ),
      getEpochsCacheTranslated(language),
      getComposersCountTranslated({ search, epochId }),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Transformar dados das épocas para manter compatibilidade
    // (manter o formato original mas exibir nomes traduzidos)
    const epochs = epochsData.map((epoch) => ({
      id: epoch.id,
      name: epoch.name, // Nome original para filtros funcionarem
    }));

    return (
      <ComposersClient
        composers={composersData} // ✅ Dados já vêm com épocas traduzidas
        epochs={epochs} // ✅ Épocas com nomes originais para filtro funcionar
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        searchTerm={search}
        selectedEpoch={epochId}
      />
    );
  } catch (error) {
    console.error('Erro ao carregar dados dos compositores:', error);

    // Fallback em caso de erro
    return (
      <ComposersClient
        composers={[]}
        epochs={[]}
        currentPage={1}
        totalPages={1}
        totalCount={0}
        searchTerm=""
        selectedEpoch=""
      />
    );
  }
}
