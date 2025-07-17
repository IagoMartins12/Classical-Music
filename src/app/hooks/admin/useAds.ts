// app/hooks/admin/useAds.ts - Hook admin corrigido para schema atual
import { useState, useCallback } from 'react';

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
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

  // Relations
  creator?: any;
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
    type: 'image' | 'video'
  ) => Promise<any>;
  deleteMedia: (adId: string, type: 'image' | 'video') => Promise<void>;
  refreshStats: () => Promise<void>;
  checkConflict: (
    placement: string,
    targetType: string,
    instrumentId?: string
  ) => Promise<any>;
}

export const useAds = (): UseAdsReturn => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<AdsStats | null>(null);

  const fetchAds = useCallback(async (page = 1, filters: FilterParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) => value !== '' && value !== undefined
          )
        ),
      });

      const response = await fetch(`/api/admin/ads?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setAds(data.ads);
        setPagination(data.pagination);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar anúncios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAd = useCallback(async (adData: any): Promise<Advertisement> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar anúncio');
      }

      const data = await response.json();

      if (data.success) {
        return data.ad;
      } else {
        throw new Error('Erro ao criar anúncio');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAd = useCallback(
    async (id: string, adData: any): Promise<Advertisement> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/ads', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...adData }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao atualizar anúncio');
        }

        const data = await response.json();

        if (data.success) {
          // Atualizar na lista local
          setAds((prev) => prev.map((ad) => (ad.id === id ? data.ad : ad)));
          return data.ad;
        } else {
          throw new Error('Erro ao atualizar anúncio');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateAdStatus = useCallback(
    async (id: string, status: string): Promise<void> => {
      try {
        await updateAd(id, { status });
      } catch (err) {
        throw err;
      }
    },
    [updateAd]
  );

  const deleteAd = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/ads?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar anúncio');
      }

      // Remover da lista local
      setAds((prev) => prev.filter((ad) => ad.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cloneAd = useCallback(
    async (id: string, modifications: any = {}): Promise<Advertisement> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/ads/${id}/clone`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modifications),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao clonar anúncio');
        }

        const data = await response.json();

        if (data.success) {
          // Adicionar à lista local
          setAds((prev) => [data.ad, ...prev]);
          return data.ad;
        } else {
          throw new Error('Erro ao clonar anúncio');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Função getAdStats corrigida para o schema atual
  const getAdStats = useCallback(
    async (id: string, period = 'week'): Promise<any> => {
      try {
        const response = await fetch(
          `/api/admin/ads/stats?adId=${id}&period=${period}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error('Erro ao buscar estatísticas');
        }

        const data = await response.json();

        if (data.success) {
          return data.data;
        } else {
          throw new Error('Erro ao buscar estatísticas');
        }
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        throw err;
      }
    },
    []
  );

  const uploadMedia = useCallback(
    async (adId: string, file: File, type: 'image' | 'video'): Promise<any> => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await fetch(`/api/admin/ads/${adId}/media`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao fazer upload');
        }

        const data = await response.json();
        return data.success ? data : null;
      } catch (err) {
        console.error('Erro no upload:', err);
        throw err;
      }
    },
    []
  );

  const deleteMedia = useCallback(
    async (adId: string, type: 'image' | 'video'): Promise<void> => {
      try {
        const response = await fetch(
          `/api/admin/ads/${adId}/media?type=${type}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao deletar mídia');
        }
      } catch (err) {
        console.error('Erro ao deletar mídia:', err);
        throw err;
      }
    },
    []
  );

  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/ads?overview=true', {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar estatísticas:', err);
    }
  }, []);

  const checkConflict = useCallback(
    async (
      placement: string,
      targetType: string,
      instrumentId?: string
    ): Promise<any> => {
      try {
        const params = new URLSearchParams({
          placement,
          targetType,
        });

        if (instrumentId) {
          params.append('instrumentId', instrumentId);
        }

        const response = await fetch(`/api/admin/ads/check-conflict?${params}`);
        const data = await response.json();

        return data;
      } catch (err) {
        console.error('Erro ao verificar conflito:', err);
        return { hasConflict: false };
      }
    },
    []
  );

  return {
    ads,
    loading,
    error,
    pagination,
    stats,
    fetchAds,
    createAd,
    updateAd,
    updateAdStatus,
    deleteAd,
    cloneAd,
    getAdStats,
    uploadMedia,
    deleteMedia,
    refreshStats,
    checkConflict,
  };
};
