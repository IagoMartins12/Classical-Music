// app/uploads/pageServer.tsx - OTIMIZADO PARA PERFORMANCE
import { TranslationProvider } from '@/app/context/TranslationContext';
import { getEpochsCache, getUserUploads } from '@/app/requests/upload';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import UploadsClient from './pageClient';

const ITEMS_PER_PAGE = 24;

export default async function UploadsPageServer({
  page,
  search,
  type,
  epochId,
  composerId,
  workId,
  userId,
  userRole,
}: {
  page: number;
  search: string;
  type: string;
  epochId: string;
  composerId?: string;
  workId?: string;
  userId: string;
  userRole: number;
}) {
  const isAdmin = userRole === 2;
  const limitPerType = type === 'all';

  const language = await getServerLanguageStatic();

  // 🚀 OTIMIZAÇÃO 1: Queries paralelas otimizadas
  const [uploadsData, epochsData, { translations }] = await Promise.all([
    getUserUploads({
      userId,
      page,
      limit: ITEMS_PER_PAGE,
      search,
      type,
      epochId,
      composerId,
      workId,
      limitPerType,
    }),
    getEpochsCache(), // Só épocas básicas
    loadPageTranslationsWithCommon(language, ['pages/uploads']),
  ]);

  // 🚀 OTIMIZAÇÃO 2: Cálculo de páginas simplificado
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

  // 🚀 OTIMIZAÇÃO 3: Form data vazio - será carregado via lazy loading
  const formData = {
    epochs: [],
    instruments: [],
    roles: [],
    composers: [],
    works: [],
  };

  // 🚀 OTIMIZAÇÃO 4: Filter data vazio - será carregado via lazy loading
  const filterData = {
    composers: [],
    works: [],
  };

  return (
    <TranslationProvider language={language} translations={translations}>
      <UploadsClient
        uploads={uploadsData.items}
        composers={uploadsData.composers}
        works={uploadsData.works}
        scores={uploadsData.scores}
        epochs={epochsData}
        filterComposers={filterData.composers} // Vazio inicialmente
        filterWorks={filterData.works} // Vazio inicialmente
        currentPage={page}
        totalPages={totalPages}
        totalCount={uploadsData.totalCount}
        composerCount={uploadsData.composerCount}
        workCount={uploadsData.workCount}
        scoreCount={uploadsData.scoreCount}
        hasMoreComposers={uploadsData.hasMoreComposers}
        hasMoreWorks={uploadsData.hasMoreWorks}
        hasMoreScores={uploadsData.hasMoreScores}
        searchTerm={search}
        selectedType={type}
        selectedEpoch={epochId}
        selectedComposer={composerId || ''}
        selectedWork={workId || ''}
        isAdmin={isAdmin}
        userId={userId}
        formData={formData} // Vazio inicialmente
      />
    </TranslationProvider>
  );
}
