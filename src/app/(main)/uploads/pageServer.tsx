// app/uploads/pageServer.tsx - ATUALIZADO COM NOVOS FILTROS E LIMITAÇÃO

import UploadsClient from '@/app/(main)/uploads/pageClient';
import {
  getEpochsCache,
  getFilterData,
  getFormDataPage,
  getUserUploads,
} from '@/app/requests/upload';

const ITEMS_PER_PAGE = 24;

export default async function UploadsPageServer({
  page,
  search,
  type,
  epochId,
  composerId, // 🆕 Novo parâmetro
  workId, // 🆕 Novo parâmetro
  userId,
  userRole,
}: {
  page: number;
  search: string;
  type: string;
  epochId: string;
  composerId?: string; // 🆕
  workId?: string; // 🆕
  userId: string;
  userRole: number;
}) {
  const isAdmin = userRole === 2;

  // 🆕 Determinar se deve limitar por tipo (apenas na aba "all")
  const limitPerType = type === 'all';

  const [uploadsData, filterData, epochsData, formData] = await Promise.all([
    getUserUploads({
      userId,
      page,
      limit: ITEMS_PER_PAGE,
      search,
      type,
      epochId,
      composerId, // 🆕 Passar novo filtro
      workId, // 🆕 Passar novo filtro
      limitPerType, // 🆕 Passar flag de limitação
    }),
    getFilterData(userId), // 🆕 Buscar dados para filtros
    getEpochsCache(),
    getFormDataPage(), // 🆕 Buscar dados para formulários
  ]);

  // Calcular totalPages baseado no tipo selecionado
  let totalPages = 1;
  if (type === 'all') {
    totalPages = Math.ceil(uploadsData.totalCount / ITEMS_PER_PAGE);
  } else if (type === 'composer') {
    totalPages = Math.ceil(uploadsData.composerCount / ITEMS_PER_PAGE);
  } else if (type === 'work') {
    totalPages = Math.ceil(uploadsData.workCount / ITEMS_PER_PAGE);
  } else if (type === 'score') {
    totalPages = Math.ceil(uploadsData.scoreCount / ITEMS_PER_PAGE);
  }

  return (
    <UploadsClient
      uploads={uploadsData.items}
      composers={uploadsData.composers}
      works={uploadsData.works}
      scores={uploadsData.scores}
      epochs={epochsData} // 🆕 Usar épocas filtradas
      filterComposers={filterData.composers} // 🆕 Dados para filtros
      filterWorks={filterData.works} // 🆕 Dados para filtros
      currentPage={page}
      totalPages={totalPages}
      totalCount={uploadsData.totalCount}
      composerCount={uploadsData.composerCount} // 🆕 Contadores específicos
      workCount={uploadsData.workCount} // 🆕
      scoreCount={uploadsData.scoreCount} // 🆕
      hasMoreComposers={uploadsData.hasMoreComposers} // 🆕 Indicadores "ver mais"
      hasMoreWorks={uploadsData.hasMoreWorks} // 🆕
      hasMoreScores={uploadsData.hasMoreScores} // 🆕
      searchTerm={search}
      selectedType={type}
      selectedEpoch={epochId}
      selectedComposer={composerId || ''} // 🆕 Estado do filtro
      selectedWork={workId || ''} // 🆕 Estado do filtro
      isAdmin={isAdmin}
      userId={userId}
      formData={formData}
    />
  );
}
