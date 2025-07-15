// app/components/Ads/AdContainer.tsx - Container para diferentes posicionamentos
'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdDisplay from '../AdDisplay';

interface AdContainerProps {
  placement: string;
  className?: string;
  workId?: string;
  composerId?: string;
  instrumentId?: string;
  epochId?: string;
}

export default function AdContainer({
  placement,
  className = '',
  workId,
  composerId,
  instrumentId,
  epochId,
}: AdContainerProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Determinar targeting baseado na página atual e props
  let targetType = 'GENERAL';
  let instrumentIds: string[] = [];
  let composerIds: string[] = [];
  let epochIds: string[] = [];

  // Targeting inteligente baseado na página
  if (instrumentId) {
    targetType = 'INSTRUMENT';
    instrumentIds = [instrumentId];
  } else if (composerId) {
    targetType = 'COMPOSER';
    composerIds = [composerId];
  } else if (epochId) {
    targetType = 'EPOCH';
    epochIds = [epochId];
  } else if (pathname.includes('/works/') && workId) {
    // Para páginas de obras, buscar o instrumento principal da obra
    targetType = 'INSTRUMENT';
    // Aqui você pode fazer uma consulta para obter o instrumento da obra
    // instrumentIds = [instrumentIdDaObra];
  }

  // Configurações específicas por posicionamento
  const getPlacementConfig = () => {
    switch (placement) {
      case 'HEADER':
        return {
          maxAds: 1,
          showTitle: false,
          showAdvertiserName: false,
          className: 'w-full ',
        };
      case 'SIDEBAR_RIGHT':
      case 'SIDEBAR_LEFT':
        return {
          showTitle: true,
          showAdvertiserName: true,
          className: 'w-full space-y-4',
        };
      case 'CONTENT_TOP':
      case 'CONTENT_BOTTOM':
        return {
          maxAds: 1,
          showTitle: true,
          showAdvertiserName: true,
          className: 'w-full max-w-4xl mx-auto',
        };
      case 'BETWEEN_CONTENT':
        return {
          maxAds: 1,
          showTitle: true,
          showAdvertiserName: false,
          className: 'w-full my-8',
        };
      case 'FOOTER':
        return {
          maxAds: 3,
          showTitle: true,
          showAdvertiserName: true,
          className: 'w-full grid grid-cols-1 md:grid-cols-3 gap-4',
        };
      default:
        return {
          maxAds: 1,
          showTitle: true,
          showAdvertiserName: true,
          className: 'w-full',
        };
    }
  };

  const config = getPlacementConfig();

  return (
    <div className={`ad-container-${placement.toLowerCase()} ${className}`}>
      <AdDisplay
        placement={placement}
        targetType={targetType}
        instrumentIds={instrumentIds}
        composerIds={composerIds}
        epochIds={epochIds}
        maxAds={config.maxAds}
        showTitle={config.showTitle}
        showAdvertiserName={config.showAdvertiserName}
        className={config.className}
      />
    </div>
  );
}
