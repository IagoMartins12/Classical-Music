// app/hooks/admin/useAds.ts - Hook admin atualizado para nova estrutura de pastas
import { useCallback, useState } from 'react';
import {
  adminKeys,
  errorMessage,
  useAdminQuery,
  useInvalidateAdmin,
} from './query';
import {
  checkAdConflict,
  cloneAdRequest,
  createAdRequest,
  deleteAdRequest,
  getAdStatsRequest,
  getAdsOverview,
  listAds,
  removeAdMedia,
  updateAdRequest,
  uploadAdMedia,
} from '@/app/requests/admin/ads';

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;

  // 🆕 Novas estruturas de versões responsivas
  imageVersions?: {
    original?: string;
    desktop?: string;
    tablet?: string;
    mobile?: string;
    thumbnail?: string;
  };
  videoVersions?: {
    original?: string;
    desktop?: string;
    tablet?: string;
    mobile?: string;
    thumbnail?: string;
  };

  // 🆕 Metadados de mídia
  mediaMetadata?: {
    originalFilename?: string;
    fileSize?: number;
    processedAt?: string;
    placement?: string;
    quality?: string;
    adDirectory?: string; // Nome da pasta exclusiva
    originalDimensions?: {
      width: number;
      height: number;
    };
    processingError?: string;
    fallbackUsed?: boolean;
    clonedFrom?: string;
    clonedAt?: string;
    clonedMediaAt?: string;
  };

  // 🆕 Configurações de qualidade
  imageQuality?: string;
  videoQuality?: string;

  ctaText?: string;
  targetUrl?: string;
  linkType: 'url' | 'whatsapp';
  isExternal: boolean;
  type: string;
  placement: string;
  status: string;
  targetType: string;
  targetUserLevel: string;
  instrumentId?: string;
  advertiserName: string;
  advertiserEmail?: string;
  advertiserPhone?: string;
  advertiserWebsite?: string;
  startDate?: Date;
  endDate?: Date;
  showOnMobile: boolean;
  showOnTablet: boolean;
  showOnDesktop: boolean;
  createdAt: Date;
  updatedAt: Date;

  instrument?: any;

  // Stats - APENAS CAMPOS EXISTENTES
  totalImpressions?: number;
  totalClicks?: number;
  ctr?: number;
}

export interface AdsStats {
  totalAds: number;
  activeAds: number;
  pausedAds: number;
  draftAds: number;
  impressions30d: number;
  clicks30d: number;
  avgCTR: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface FilterParams {
  status?: string;
  type?: string;
  placement?: string;
  targetType?: string;
  search?: string;
}

interface UseAdsReturn {
  ads: Advertisement[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  stats: AdsStats | null;
  fetchAds: (page?: number, filters?: FilterParams) => Promise<void>;
  createAd: (adData: any) => Promise<Advertisement>;
  updateAd: (id: string, adData: any) => Promise<Advertisement>;
  updateAdStatus: (id: string, status: string) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  cloneAd: (id: string, modifications?: any) => Promise<Advertisement>;
  getAdStats: (id: string, period?: string) => Promise<any>;
  uploadMedia: (
    adId: string,
    file: File,
    type: 'image' | 'video',
    quality?: string
  ) => Promise<any>;
  deleteMedia: (adId: string, type: 'image' | 'video') => Promise<void>;
  refreshStats: () => Promise<void>;
  checkConflict: (
    type: string,
    placement: string,
    targetType: string,
    instrumentId?: string,
    excludeId?: string
  ) => Promise<any>;
}

/**
 * Anúncios do painel. A lista e os totais são estado de servidor (TanStack
 * Query): criar, editar, clonar ou apagar invalida a área e a lista volta do
 * servidor, em vez de ser remendada na tela.
 */
export const useAds = (): UseAdsReturn => {
  const [request, setRequest] = useState<{
    page: number;
    filters: FilterParams;
  }>({ page: 1, filters: {} });
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const invalidate = useInvalidateAdmin();

  const list = useAdminQuery(adminKeys.list('ads', request), () =>
    listAds(request.page, { ...request.filters })
  );
  const stats = useAdminQuery(adminKeys.area('ads-stats'), getAdsOverview);

  const fetchAds = useCallback(async (page = 1, filters: FilterParams = {}) => {
    setRequest({ page, filters });
  }, []);

  const afterWrite = useCallback(async () => {
    await Promise.all([invalidate('ads'), stats.refetch()]);
  }, [invalidate, stats]);

  const run = useCallback(
    async <T>(action: () => Promise<T>): Promise<T> => {
      setBusy(true);
      setActionError(null);

      try {
        const result = await action();
        await afterWrite();
        return result;
      } catch (error) {
        setActionError(errorMessage(error));
        throw error;
      } finally {
        setBusy(false);
      }
    },
    [afterWrite]
  );

  const createAd = useCallback(
    (adData: any): Promise<Advertisement> => run(() => createAdRequest(adData)),
    [run]
  );

  const updateAd = useCallback(
    (id: string, adData: any): Promise<Advertisement> =>
      run(() => updateAdRequest(id, adData)),
    [run]
  );

  const updateAdStatus = useCallback(
    async (id: string, status: string): Promise<void> => {
      await updateAd(id, { status });
    },
    [updateAd]
  );

  // A mídia sai junto, pelo registro de armazenamento da API.
  const deleteAd = useCallback(
    async (id: string): Promise<void> => {
      await run(() => deleteAdRequest(id));
    },
    [run]
  );

  // O clone nasce como rascunho e sem mídia.
  const cloneAd = useCallback(
    (id: string, modifications: any = {}): Promise<Advertisement> =>
      run(() => cloneAdRequest(id, modifications)),
    [run]
  );

  // A API tem os totais do anúncio, sem série por período.
  const getAdStats = useCallback(async (id: string): Promise<any> => {
    try {
      return await getAdStatsRequest(id);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }, []);

  const uploadMedia = useCallback(
    async (adId: string, file: File, type: 'image' | 'video'): Promise<any> => {
      if (type === 'video') {
        throw new Error('O envio de vídeo de anúncio ainda não passa pela API');
      }

      const result = await uploadAdMedia(adId, file);
      await afterWrite();
      return result;
    },
    [afterWrite]
  );

  const deleteMedia = useCallback(
    async (adId: string, type: 'image' | 'video'): Promise<void> => {
      await removeAdMedia(adId, type);
      await afterWrite();
    },
    [afterWrite]
  );

  const checkConflict = useCallback(
    async (
      type: string,
      placement: string,
      targetType: string,
      instrumentId?: string,
      excludeId?: string
    ): Promise<any> => {
      try {
        return await checkAdConflict({
          type,
          placement,
          targetType,
          instrumentId,
          excludeId,
        });
      } catch (error) {
        console.error('Erro ao verificar conflito:', error);
        return { hasConflict: false };
      }
    },
    []
  );

  return {
    ads: list.data?.ads ?? [],
    loading: list.loading || busy,
    error: list.error ?? actionError,
    pagination: list.data?.pagination ?? null,
    stats: stats.data ?? null,
    fetchAds,
    createAd,
    updateAd,
    updateAdStatus,
    deleteAd,
    cloneAd,
    getAdStats,
    uploadMedia,
    deleteMedia,
    refreshStats: stats.refetch,
    checkConflict,
  };
};
