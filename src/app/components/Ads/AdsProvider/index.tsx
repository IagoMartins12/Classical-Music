// app/components/Ads/AdsProvider.tsx - Provider atualizado para gerenciar ads globalmente
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdModal from '../AdModal';

interface AdsContextType {
  showModalAd: (ad: any) => void;
  trackEvent: (adId: string, event: string, data?: any) => Promise<void>;
  dismissAd: (adId: string) => void;
  isDismissed: (adId: string) => boolean;
}

const AdsContext = createContext<AdsContextType | null>(null);

export const useAdsContext = () => {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error('useAdsContext must be used within AdsProvider');
  }
  return context;
};

interface AdsProviderProps {
  children: React.ReactNode;
}

export default function AdsProvider({ children }: AdsProviderProps) {
  const [modalAd, setModalAd] = useState<any>(null);
  const [modalShown, setModalShown] = useState(new Set<string>());
  const [dismissedAds, setDismissedAds] = useState(new Set<string>());
  const { data: session } = useSession();
  const pathname = usePathname();

  // Carregar ads dismissados do localStorage
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('dismissedAds');
      if (dismissed) {
        setDismissedAds(new Set(JSON.parse(dismissed)));
      }
    } catch (error) {
      console.error('Erro ao carregar ads dismissados:', error);
    }
  }, []);

  // Função para mostrar modal ad
  const showModalAd = (ad: any) => {
    // Não mostrar se já foi mostrado nesta sessão
    if (modalShown.has(ad.id)) return;

    // Não mostrar para super admins
    if (session?.user?.role === 2) return;

    // Não mostrar se usuário desabilitou ads

    // Não mostrar se foi dismissado
    if (dismissedAds.has(ad.id)) return;

    setModalAd(ad);
    setModalShown((prev) => new Set([...prev, ad.id]));
  };

  // Função para trackear eventos
  const trackEvent = async (adId: string, event: string, data: any = {}) => {
    try {
      const trackingData = {
        ...data,
        pageUrl: window.location.href,
        pageTitle: document.title,
        timestamp: new Date().toISOString(),
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
    }
  };

  // Função para dismissar ad
  const dismissAd = (adId: string) => {
    const newDismissed = new Set([...dismissedAds, adId]);
    setDismissedAds(newDismissed);

    try {
      localStorage.setItem('dismissedAds', JSON.stringify([...newDismissed]));
    } catch (error) {
      console.error('Erro ao salvar ad dismissado:', error);
    }
  };

  // Função para verificar se ad foi dismissado
  const isDismissed = (adId: string) => {
    return dismissedAds.has(adId);
  };

  // Fechar modal quando rota mudar
  useEffect(() => {
    setModalAd(null);
  }, [pathname]);

  // Buscar e mostrar modal ads automaticamente
  useEffect(() => {
    const checkForModalAds = async () => {
      // Só verificar em certas páginas e com throttling
      if (session?.user?.role === 2) return;

      try {
        const response = await fetch(
          '/api/ads?placement=MODAL&targetType=GENERAL'
        );
        const data = await response.json();

        if (data.success && data.ads.length > 0) {
          const availableAds = data.ads.filter(
            (ad: any) => !modalShown.has(ad.id) && !dismissedAds.has(ad.id)
          );

          if (availableAds.length > 0) {
            // Mostrar com delay para não interferir na experiência
            setTimeout(() => {
              showModalAd(availableAds[0]);
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar modal ads:', error);
      }
    };

    // Só executar em páginas específicas e não muito frequentemente
    if (
      pathname === '/' ||
      pathname.startsWith('/works/') ||
      pathname.startsWith('/composers/') ||
      pathname.startsWith('/instruments/')
    ) {
      // Delay maior para não incomodar o usuário
      const timer = setTimeout(checkForModalAds, 5000);
      return () => clearTimeout(timer);
    }
  }, [pathname, session, modalShown, dismissedAds]);

  // Limpar sessão de modals mostrados periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setModalShown(new Set());
    }, 30 * 60 * 1000); // Limpar a cada 30 minutos

    return () => clearInterval(interval);
  }, []);

  return (
    <AdsContext.Provider
      value={{ showModalAd, trackEvent, dismissAd, isDismissed }}
    >
      {children}

      {/* Modal Ad */}
      {modalAd && (
        <AdModal
          ad={modalAd}
          onClose={() => setModalAd(null)}
          onTrackEvent={(event, data) => trackEvent(modalAd.id, event, data)}
        />
      )}
    </AdsContext.Provider>
  );
}
