// app/components/Ads/AdContainer.tsx - Container atualizado para diferentes posicionamentos
'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdDisplay from '../AdDisplay';

interface AdContainerProps {
  placement:
    | 'HEADER'
    | 'SIDEBAR_LEFT'
    | 'SIDEBAR_RIGHT'
    | 'CONTENT_TOP'
    | 'CONTENT_BOTTOM'
    | 'BETWEEN_CONTENT'
    | 'FOOTER'
    | 'MODAL';
  className?: string;
  workId?: string;
  composerId?: string | null;
  instrumentId?: string | null;
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

  // Não mostrar ads para super admins
  if (session?.user?.role === 2) {
    return null;
  }

  // Determinar targeting baseado na página atual e props
  let targetType = 'GENERAL';
  let selectedInstrumentId: string | undefined;
  let userLevel = 'ALL';

  // Determinar nível do usuário
  if (session?.user?.role === 1) {
    userLevel = 'TEACHER';
  } else if (session?.user?.role === 0) {
    userLevel = 'STUDENT';
  }

  // Targeting inteligente baseado na página e props
  if (instrumentId) {
    targetType = 'INSTRUMENT';
    selectedInstrumentId = instrumentId;
  } else if (pathname.includes('/works/') && workId) {
    // Para páginas de obras, pode tentar buscar o instrumento da obra
    // Isso requereria uma consulta adicional ou passagem via props
    targetType = 'GENERAL';
  } else if (pathname.includes('/instruments/')) {
    // Se estiver numa página de instrumento específico
    const instrumentFromPath = pathname
      .split('/instruments/')[1]
      ?.split('/')[0];
    if (instrumentFromPath) {
      targetType = 'INSTRUMENT';
      selectedInstrumentId = instrumentFromPath;
    }
  }

  // Configurações específicas por posicionamento
  const getPlacementConfig = () => {
    switch (placement) {
      case 'HEADER':
        return {
          maxAds: 1,
          showTitle: false,
          showAdvertiserName: false,
          className: 'w-full',
        };
      case 'SIDEBAR_RIGHT':
      case 'SIDEBAR_LEFT':
        return {
          maxAds: 1, // Apenas 1 ad por sidebar
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
          maxAds: 1, // Simplificado para apenas 1 ad
          showTitle: true,
          showAdvertiserName: true,
          className: 'w-full',
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
        instrumentId={selectedInstrumentId}
        userLevel={userLevel}
        maxAds={config.maxAds}
        showTitle={config.showTitle}
        showAdvertiserName={config.showAdvertiserName}
        className={config.className}
      />
    </div>
  );
}
