// app/hooks/useFrontAds.ts - Hook para usar publicidades no frontend
import { useState, useEffect, useCallback } from 'react';

export interface AdData {
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
  targetType: string;
  advertiserName: string;
  advertiserWebsite?: string;
  priority: number;
  weight: number;
  showOnMobile: boolean;
  showOnTablet: boolean;
  showOnDesktop: boolean;
  customCSS?: string;
  mediaFiles?: any[];
  instrumentTargets?: any[];
  composerTargets?: any[];
  epochTargets?: any[];
}

interface UseAdsParams {
  placement?: string;
  targetType?: string;
  instrumentIds?: string[];
  composerIds?: string[];
  epochIds?: string[];
  enabled?: boolean;
}

interface UseAdsReturn {
  ads: AdData[];
  loading: boolean;
  error: string | null;
  trackEvent: (adId: string, event: string, data?: any) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useFrontAds = (params: UseAdsParams = {}): UseAdsReturn => {
  const [ads, setAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    placement,
    targetType,
    instrumentIds,
    composerIds,
    epochIds,
    enabled = true,
  } = params;

  const fetchAds = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      if (placement) searchParams.append('placement', placement);
      if (targetType) searchParams.append('targetType', targetType);
      if (instrumentIds?.length)
        searchParams.append('instruments', instrumentIds.join(','));
      if (composerIds?.length)
        searchParams.append('composers', composerIds.join(','));
      if (epochIds?.length) searchParams.append('epochs', epochIds.join(','));

      const response = await fetch(`/api/ads?${searchParams}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar publicidades');
      }

      const data = await response.json();

      if (data.success) {
        setAds(data.ads);
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
  }, [placement, targetType, instrumentIds, composerIds, epochIds, enabled]);

  const trackEvent = useCallback(
    async (adId: string, event: string, data: any = {}) => {
      try {
        // Adicionar dados da página atual
        const trackingData = {
          ...data,
          pageUrl: window.location.href,
          pageTitle: document.title,
          placement,
          timestamp: new Date().toISOString(),
        };

        // Tentar obter localização do usuário (se permitido)
        if (!trackingData.country && 'geolocation' in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  timeout: 5000,
                });
              }
            );

            // Usar um serviço de geocoding reverso (simplificado)
            const response = await fetch(
              `https://api.ipapi.com/api/check?access_key=YOUR_API_KEY`
            );
            const locationData = await response.json();
            trackingData.country = locationData.country_name;
          } catch (geoError) {
            // Ignorar erro de geolocalização
          }
        }

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
        // Não mostrar erro ao usuário para não quebrar a experiência
      }
    },
    [placement]
  );

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return {
    ads,
    loading,
    error,
    trackEvent,
    refetch: fetchAds,
  };
};
