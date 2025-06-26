import {
  getComposersCount,
  getComposersWithPagination,
  getEpochsCache,
} from '../requests/composers';
import ComposersClient from '../components/ComposersClient';
import ComposersLoading from './loading';

const ITEMS_PER_PAGE = 30;

export default async function ComposersServer({
  page,
  search,
  epochId,
}: {
  page: number;
  search: string;
  epochId: string;
}) {
  const [composersData, epochs, totalCount] = await Promise.all([
    getComposersWithPagination({
      page,
      limit: ITEMS_PER_PAGE,
      search,
      epochId,
    }),
    getEpochsCache(),
    getComposersCount({ search, epochId }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <ComposersClient
      composers={composersData}
      epochs={epochs}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      searchTerm={search}
      selectedEpoch={epochId}
    />
  );
}
