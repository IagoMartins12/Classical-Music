// app/hooks/useFrontAds.ts - Hook atualizado para buscar anúncios
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UseFrontAdsParams {
  placement: string;
  targetType?: string;
  instrumentId?: string;
  userLevel?: string;
}

interface Advertisement {
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
  targetType: string;
  targetUserLevel: string;
  advertiserName: string;
  advertiserEmail?: string;
  advertiserPhone?: string;
  advertiserWebsite?: string;
  showOnMobile: boolean;
  showOnTablet: boolean;
  showOnDesktop: boolean;
  instrumentId?: string;
  instrument?: {
    id: string;
    name: string;
  };
}

interface UseFrontAdsReturn {
  ads: Advertisement[];
  loading: boolean;
  error: string | null;
  trackEvent: (adId: string, event: string, data?: any) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useFrontAds = ({
  placement,
  targetType = 'GENERAL',
  instrumentId,
  userLevel = 'ALL',
}: UseFrontAdsParams): UseFrontAdsReturn => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Construir parâmetros da query
      const params = new URLSearchParams({
        placement,
        targetType,
      });

      if (instrumentId) {
        params.append('instrumentId', instrumentId);
      }

      if (userLevel !== 'ALL') {
        params.append('userLevel', userLevel);
      }

      // Adicionar info do usuário se logado
      if (session?.user) {
        const userRole = session.user.role;
        if (userRole === 1) {
          params.append('userLevel', 'TEACHER');
        } else if (userRole === 0) {
          params.append('userLevel', 'STUDENT');
        }
      }

      const response = await fetch(`/api/ads?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setAds(data.ads || []);
      } else {
        throw new Error(data.error || 'Erro ao buscar anúncios');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar anúncios:', err);
      setAds([]); // Limpar ads em caso de erro
    } finally {
      setLoading(false);
    }
  }, [placement, targetType, instrumentId, userLevel, session]);

  const trackEvent = useCallback(
    async (adId: string, event: string, data: any = {}) => {
      try {
        const trackingData = {
          ...data,
          pageUrl: window.location.href,
          pageTitle: document.title,
          timestamp: new Date().toISOString(),
          placement,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        };

        await fetch('/api/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adId,
            event,
            data: trackingData,
          }),
        });
      } catch (error) {
        console.error('Erro ao registrar evento:', error);
        // Não propagar o erro para não quebrar a UX
      }
    },
    [placement]
  );

  useEffect(() => {
    // Não mostrar ads para super admins
    if (session?.user?.role === 2) {
      return;
    }

    fetchAds();
  }, [fetchAds, session]);

  return {
    ads,
    loading,
    error,
    trackEvent,
    refetch: fetchAds,
  };
};
