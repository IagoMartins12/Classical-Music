// app/components/Ads/AdsProvider.tsx - Provider para gerenciar ads globalmente
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdModal from '../AdModal';

interface AdsContextType {
  showModalAd: (ad: any) => void;
  trackEvent: (adId: string, event: string, data?: any) => Promise<void>;
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
  const { data: session } = useSession();
  const pathname = usePathname();

  // Função para mostrar modal ad
  const showModalAd = (ad: any) => {
    // Não mostrar se já foi mostrado nesta sessão
    if (modalShown.has(ad.id)) return;

    // Não mostrar para admins
    if (session?.user?.role === 2) return;

    // Não mostrar se usuário desabilitou ads
    if (session?.user) return;

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

  // Fechar modal quando rota mudar
  useEffect(() => {
    setModalAd(null);
  }, [pathname]);

  // Buscar e mostrar modal ads automaticamente
  useEffect(() => {
    const checkForModalAds = async () => {
      // Só verificar em certas páginas e com throttling
      if (session?.user?.role === 2) return;
      if (session?.user) return;

      try {
        const response = await fetch(
          '/api/ads?placement=MODAL&targetType=GENERAL'
        );
        const data = await response.json();

        if (data.success && data.ads.length > 0) {
          const availableAds = data.ads.filter(
            (ad: any) => !modalShown.has(ad.id)
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

    // Só executar em certas páginas
    if (
      pathname === '/' ||
      pathname.startsWith('/works/') ||
      pathname.startsWith('/composers/')
    ) {
      checkForModalAds();
    }
  }, [pathname, session, modalShown]);

  return (
    <AdsContext.Provider value={{ showModalAd, trackEvent }}>
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
