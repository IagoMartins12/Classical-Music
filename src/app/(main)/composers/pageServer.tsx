import ComposersClient from '@/app/(main)/composers/pageClient';
import {
  getComposersCount,
  getComposersWithPagination,
  getEpochsCache,
} from '@/app/requests/composers';

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
