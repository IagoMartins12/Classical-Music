// app/uploads/pageServer.tsx

import UploadsClient from '../components/UploadsPage/UploadsClient';
import {
  getAllUploads,
  getEpochsCache,
  getUserUploads,
} from '../requests/upload';

const ITEMS_PER_PAGE = 24;

export default async function UploadsPageServer({
  page,
  search,
  type,
  epochId,
  userId,
  userRole,
}: {
  page: number;
  search: string;
  type: string;
  epochId: string;
  userId: string;
  userRole: number;
}) {
  const isAdmin = userRole === 2;

  const [uploadsData, epochs] = await Promise.all([
    isAdmin
      ? getAllUploads({ page, limit: ITEMS_PER_PAGE, search, type, epochId })
      : getUserUploads({
          userId,
          page,
          limit: ITEMS_PER_PAGE,
          search,
          type,
          epochId,
        }),
    getEpochsCache(),
  ]);

  const totalPages = Math.ceil(uploadsData.totalCount / ITEMS_PER_PAGE);

  return (
    <UploadsClient
      uploads={uploadsData.items}
      composers={uploadsData.composers}
      works={uploadsData.works}
      scores={uploadsData.scores}
      epochs={epochs}
      currentPage={page}
      totalPages={totalPages}
      totalCount={uploadsData.totalCount}
      searchTerm={search}
      selectedType={type}
      selectedEpoch={epochId}
      isAdmin={isAdmin}
      userId={userId}
    />
  );
}
