// app/hooks/admin/useAds.ts
import { useState, useCallback } from 'react';

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  tagline?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaText?: string;
  targetUrl?: string;
  isExternal: boolean;
  type: string;
  placement: string;
  status: string;
  targetType: string;
  advertiserName: string;
  advertiserEmail?: string;
  advertiserPhone?: string;
  advertiserWebsite?: string;
  priority: number;
  weight: number;
  maxViews?: number;
  maxClicks?: number;
  startDate?: Date;
  endDate?: Date;
  showOnMobile: boolean;
  showOnTablet: boolean;
  showOnDesktop: boolean;
  customCSS?: string;
  customJS?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Targeting
  instrumentTargets?: any[];
  composerTargets?: any[];
  epochTargets?: any[];
  userLevelTargets?: any[];
  geoTargets?: any[];

  // Stats
  totalImpressions?: number;
  totalClicks?: number;
  ctr?: number;

  // Relations
  creator?: any;
  approver?: any;
  mediaFiles?: any[];
}

export interface AdsStats {
  totalAds: number;
  activeAds: number;
  pausedAds: number;
  draftAds: number;
  impressions30d: number;
  clicks30d: number;
  avgCTR: number;
  topPerformers: Advertisement[];
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
  getAdStats: (id: string, period?: string) => Promise<any>;
  uploadMedia: (adId: string, file: File, options?: any) => Promise<any>;
  refreshStats: () => Promise<void>;
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
      console.error('Erro ao buscar publicidades:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAd = useCallback(async (adData: any): Promise<Advertisement> => {
    setLoading(true);
    setError(null);

    console.log('ad', adData);
    try {
      const response = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar publicidade');
      }

      const data = await response.json();

      if (data.success) {
        return data.ad;
      } else {
        throw new Error('Erro ao criar publicidade');
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
          throw new Error(errorData.error || 'Erro ao atualizar publicidade');
        }

        const data = await response.json();

        if (data.success) {
          // Atualizar na lista local
          setAds((prev) => prev.map((ad) => (ad.id === id ? data.ad : ad)));
          return data.ad;
        } else {
          throw new Error('Erro ao atualizar publicidade');
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
        throw new Error(errorData.error || 'Erro ao deletar publicidade');
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
        return data.success ? data.data : null;
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        throw err;
      }
    },
    []
  );

  const uploadMedia = useCallback(
    async (adId: string, file: File, options: any = {}): Promise<any> => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('adId', adId);

        if (options.isMain) formData.append('isMain', 'true');
        if (options.altText) formData.append('altText', options.altText);
        if (options.caption) formData.append('caption', options.caption);

        const response = await fetch('/api/admin/ads/media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao fazer upload');
        }

        const data = await response.json();
        return data.success ? data.media : null;
      } catch (err) {
        console.error('Erro no upload:', err);
        throw err;
      }
    },
    []
  );

  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      // Buscar estatísticas gerais
      const response = await fetch('/api/admin/ads/stats?overview=true', {
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
    getAdStats,
    uploadMedia,
    refreshStats,
  };
};
